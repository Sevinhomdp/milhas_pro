import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SaldosRoute } from '@/src/components/routes/SaldosRoute'

export default async function SaldosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: programs },
    { data: balances }
  ] = await Promise.all([
    supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name'),
    supabase.from('balances').select('*, programs(*)').eq('user_id', user.id)
  ])

  const formattedSaldos = (balances || []).map((s: any) => ({
    program_id: s.program_id,
    nome_programa: s.programs?.name || '?',
    saldo_atual: Number(s.calculated_balance) || 0,
    ajuste_manual: s.manual_adjustment,
    usar_ajuste_manual: (s.manual_adjustment !== null && s.manual_adjustment !== 0),
    custo_medio: Number(s.custo_medio) || 0,
  }))

  const db = {
    programs: programs || [],
    saldos: formattedSaldos,
    profile: null,
    operacoes: [],
    faturas: [],
    cartoes: [],
    metas: [],
    market_prices: [],
    market_news: [],
    user_alerts: []
  }

  return <SaldosRoute db={db as any} />
}
