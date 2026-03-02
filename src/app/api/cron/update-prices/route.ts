import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/server'

const PROGRAMS = ['SMILES', 'MULTIPLUS', 'TUDOAZUL', 'MILES&GO']
const BUYERS = ['Hotmilhas', 'Maxmilhas', 'ASAPMilhas', 'MaisMilhas', 'BankMilhas']

function getMockPrice(programa: string, plataforma: string) {
  const base = { SMILES: 17.4, MULTIPLUS: 20.1, TUDOAZUL: 18.2, 'MILES&GO': 16.8 }[programa] || 16
  const seed = (new Date().getHours() + plataforma.length + programa.length) % 7
  return Number((base + seed * 0.15).toFixed(2))
}

export async function GET(request: NextRequest) {
  try {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const payload: any[] = []

    for (const programa of PROGRAMS) {
      for (const plataforma of BUYERS) {
        // TODO: integrar API real/scraping dos compradores.
        const valor = getMockPrice(programa, plataforma)
        payload.push({ programa, valor, plataforma, tendencia: 'STABLE', timestamp: new Date().toISOString() })
      }
    }

    const { error } = await supabase.from('market_prices').insert(payload)
    if (error) throw error

    const today = new Date(); today.setHours(0, 0, 0, 0)
    const { data: averages } = await supabase
      .from('market_prices')
      .select('programa, valor')
      .gte('timestamp', today.toISOString())

    const grouped = (averages || []).reduce((acc: Record<string, number[]>, row: any) => {
      acc[row.programa] = acc[row.programa] || []
      acc[row.programa].push(Number(row.valor))
      return acc
    }, {})

    const { data: programs } = await supabase.from('programs').select('id,name')

    for (const [programa, valores] of Object.entries(grouped)) {
      const avg = valores.reduce((s, v) => s + v, 0) / valores.length
      const program = (programs || []).find((p: any) => p.name?.toUpperCase() === programa)
      if (!program) continue
      await supabase.from('balances').update({ custo_medio: Number(avg.toFixed(4)), updated_at: new Date().toISOString() }).eq('program_id', program.id)
    }

    return NextResponse.json({ success: true, updated_at: new Date().toISOString(), records_count: payload.length })
  } catch (error) {
    console.error('update-prices cron error', error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}
