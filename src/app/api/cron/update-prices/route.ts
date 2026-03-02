import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PROGRAMS = ['SMILES', 'MULTIPLUS', 'TUDOAZUL', 'MILES&GO']
const BUYERS = ['HOTMILHAS', 'MAXMILHAS', 'ASAPMILHAS', 'MAISMILHAS', 'BANKMILHAS']

function mockPrice(program: string, buyer: string) {
  const baseByProgram: Record<string, number> = { SMILES: 18.5, MULTIPLUS: 25.2, TUDOAZUL: 16.9, 'MILES&GO': 13.4 }
  const buyerSpread: Record<string, number> = { HOTMILHAS: 1.2, MAXMILHAS: 0.8, ASAPMILHAS: 0.4, MAISMILHAS: 0.5, BANKMILHAS: 0.3 }
  const hourFactor = (new Date().getHours() % 6) * 0.1
  return Number((baseByProgram[program] + buyerSpread[buyer] + hourFactor).toFixed(2))
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date().toISOString()
    const records = PROGRAMS.flatMap((program) =>
      BUYERS.map((plataforma) => ({
        programa: program,
        plataforma,
        valor: mockPrice(program, plataforma), // TODO: integrar API/scraping real dos compradores
        prazo_recebimento: 'D+30',
        tendencia: 'STABLE',
        timestamp: now,
      }))
    )

    const { error: insertError } = await supabase.from('market_prices').insert(records)
    if (insertError) throw insertError

    const { data: users } = await supabase.from('balances').select('user_id').not('user_id', 'is', null)
    const uniqueUsers = [...new Set((users || []).map((entry: any) => entry.user_id))]

    for (const userId of uniqueUsers) {
      for (const program of PROGRAMS) {
        const dayStart = new Date(); dayStart.setHours(0, 0, 0, 0)
        const { data: prices } = await supabase
          .from('market_prices')
          .select('valor')
          .eq('programa', program)
          .gte('timestamp', dayStart.toISOString())

        const avg = (prices || []).reduce((acc: number, item: any) => acc + Number(item.valor), 0) / Math.max((prices || []).length, 1)

        const { data: prog } = await supabase.from('programs').select('id').eq('name', program).maybeSingle()
        if (prog?.id) {
          await supabase.from('balances').update({ custo_medio: Number(avg.toFixed(4)), updated_at: now }).eq('user_id', userId).eq('program_id', prog.id)
        }
      }
    }

    return NextResponse.json({ success: true, updated_at: now, records_count: records.length })
  } catch (error) {
    console.error('update-prices cron error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update prices' }, { status: 500 })
  }
}
