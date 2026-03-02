diff --git a/src/app/api/cron/update-news/route.ts b/src/app/api/cron/update-news/route.ts
new file mode 100644
index 0000000000000000000000000000000000000000..28d737d25500b39789a4e89bc39b8a5c7b47e6c9
--- /dev/null
+++ b/src/app/api/cron/update-news/route.ts
@@ -0,0 +1,77 @@
+import { NextRequest, NextResponse } from 'next/server'
+import { createClient } from '@/lib/supabase/server'
+import { GoogleGenAI } from '@google/genai'
+
+const FEEDS = ['https://www.melhoresdestinos.com.br/feed', 'https://www.passageirodeprimeira.com.br/feed']
+const KEYWORDS = ['milhas', 'transferência', 'bonus', 'bônus', 'promoção', 'smiles', 'multiplus', 'tudoazul', 'compra de milhas']
+
+function parseItems(xml: string) {
+  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => {
+    const item = match[1]
+    const title = item.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1]?.trim() || ''
+    const link = item.match(/<link>(.*?)<\/link>/i)?.[1]?.trim() || ''
+    const description = item.match(/<description>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1]?.trim() || ''
+    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/i)?.[1]?.trim() || ''
+    return { title, link, description, pubDate }
+  })
+}
+
+export async function GET(request: NextRequest) {
+  try {
+    if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
+      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
+    }
+
+    const supabase = await createClient()
+    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
+    let inserted = 0
+
+    for (const feed of FEEDS) {
+      const response = await fetch(feed, { cache: 'no-store' })
+      const xml = await response.text()
+      const items = parseItems(xml)
+
+      for (const item of items) {
+        const haystack = `${item.title} ${item.description}`.toLowerCase()
+        if (!KEYWORDS.some((word) => haystack.includes(word))) continue
+
+        const { data: exists } = await supabase.from('market_news').select('id').eq('source_url', item.link).maybeSingle()
+        if (exists) continue
+
+        const prompt = `Analise essa notícia do mundo de milhas aéreas e retorne APENAS um JSON:\n{\n  resumo: string (máximo 150 caracteres, direto ao ponto),\n  tipo: 'promocao_transferencia' | 'promocao_compra' | 'noticia' | 'alerta',\n  bonus_percentage: number | null (percentual de bônus se houver),\n  expires_at: string | null (data ISO se mencionar prazo, senão null)\n}\nTítulo: ${item.title}\nConteúdo: ${(item.description || '').slice(0, 500)}`
+
+        let parsed: any = { resumo: item.title.slice(0, 150), tipo: 'noticia', bonus_percentage: null, expires_at: null }
+        try {
+          const result = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: [{ role: 'user', parts: [{ text: prompt }] }] })
+          const text = result.text || '{}'
+          const match = text.match(/\{[\s\S]*\}/)
+          if (match) parsed = JSON.parse(match[0])
+        } catch (error) {
+          console.error('Gemini parse error:', error)
+        }
+
+        const { error } = await supabase.from('market_news').insert({
+          title: item.title,
+          summary: parsed.resumo,
+          source_url: item.link,
+          source_name: new URL(feed).hostname,
+          type: parsed.tipo,
+          bonus_percentage: parsed.bonus_percentage,
+          expires_at: parsed.expires_at,
+          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
+          is_active: true,
+        })
+
+        if (error) throw error
+        inserted += 1
+      }
+    }
+
+    await supabase.from('market_news').update({ is_active: false }).lt('expires_at', new Date().toISOString())
+
+    return NextResponse.json({ success: true, inserted })
+  } catch (error) {
+    console.error('update-news cron error:', error)
+    return NextResponse.json({ success: false, error: 'Failed to update news' }, { status: 500 })
+  }
+}
