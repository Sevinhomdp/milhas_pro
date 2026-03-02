import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OperacoesRoute } from '@/src/components/routes/OperacoesRoute'

export default async function OperacoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: operations }, { data: cartoes }, { data: programs }, { data: balancesPrograms }] = await Promise.all([
    supabase.from('operations').select('*, program:programs(*)').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
    supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name', { ascending: true }),
    supabase.from('balances').select('programs(*)').eq('user_id', user.id),
  ])

  const map = new Map<string, any>()

  for (const p of programs || []) {
    map.set(String(p.id), {
      id: String(p.id),
      name: String(p.name),
      currency_name: p.currency_name ?? null,
      user_id: p.user_id ?? null,
      created_at: String(p.created_at),
    })
  }

  for (const row of balancesPrograms || []) {
    const program = (row as any).programs
    if (!program?.id) continue

    if (!map.has(String(program.id))) {
      map.set(String(program.id), {
        id: String(program.id),
        name: String(program.name),
        currency_name: program.currency_name ?? null,
        user_id: program.user_id ?? null,
        created_at: String(program.created_at),
      })
    }
  }

  const db = {
    operacoes: (operations || []).map((o: any) => ({
      ...o,
      programa: o.program?.name || '?',
    })),
    cartoes: cartoes || [],
    programs: Array.from(map.values()),
    profile: null,
    saldos: [],
    faturas: [],
    metas: [],
    market_prices: [],
    market_news: [],
    user_alerts: [],
  }

  return <OperacoesRoute db={db as any} />
}
