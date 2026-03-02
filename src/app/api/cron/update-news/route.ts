import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

const FEEDS = ['https://www.melhoresdestinos.com.br/feed', 'https://www.passageirodeprimeira.com.br/feed']
const KEYWORDS = ['milhas', 'transferência', 'bonus', 'bônus', 'promoção', 'smiles', 'multiplus', 'tudoazul', 'compra de milhas']

function parseItems(xml: string) {
  const blocks = xml.match(/<item[\s\S]*?<\/item>/g) || []
  return blocks.map((item) => ({
    title: (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || item.match(/<title>(.*?)<\/title>/)?.[1] || '').trim(),
    link: (item.match(/<link>(.*?)<\/link>/)?.[1] || '').trim(),
    description: (item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/)?.[1] || '').replace(/<[^>]+>/g, '').trim(),
    pubDate: (item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || '').trim(),
  }))
}

async function summarize(ai: GoogleGenAI, title: string, content: string) {
  try {
    const prompt = `Analise essa notícia do mundo de milhas aéreas e retorne APENAS um JSON:\n{\n  resumo: string (máximo 150 caracteres, direto ao ponto),\n  tipo: 'promocao_transferencia' | 'promocao_compra' | 'noticia' | 'alerta',\n  bonus_percentage: number | null (percentual de bônus se houver),\n  expires_at: string | null (data ISO se mencionar prazo, senão null)\n}\nTítulo: ${title}\nConteúdo: ${content.slice(0, 500)}`
    const result = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt })
    const text = result.text || '{}'
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    return json
  } catch (error) {
    console.error('Gemini summarize error', error)
    return { resumo: content.slice(0, 140), tipo: 'noticia', bonus_percentage: null, expires_at: null }
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const supabase = await createClient()
    let inserted = 0

    for (const url of FEEDS) {
      const response = await fetch(url, { cache: 'no-store' })
      const xml = await response.text()
      const sourceName = new URL(url).hostname
      const items = parseItems(xml)

      for (const item of items) {
        const haystack = `${item.title} ${item.description}`.toLowerCase()
        if (!KEYWORDS.some((k) => haystack.includes(k))) continue

        const { data: exists } = await supabase.from('market_news').select('id').eq('source_url', item.link).maybeSingle()
        if (exists) continue

        const analysis = await summarize(ai, item.title, item.description)
        const { error } = await supabase.from('market_news').insert({
          title: item.title,
          summary: analysis.resumo,
          source_url: item.link,
          source_name: sourceName,
          type: analysis.tipo,
          bonus_percentage: analysis.bonus_percentage,
          expires_at: analysis.expires_at,
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          is_active: true,
        })
        if (!error) inserted += 1
      }
    }

    await supabase.from('market_news').update({ is_active: false }).lt('expires_at', new Date().toISOString())

    return NextResponse.json({ success: true, updated_at: new Date().toISOString(), records_count: inserted })
  } catch (error) {
    console.error('update-news cron error', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
