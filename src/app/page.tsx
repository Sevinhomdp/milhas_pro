import { createClient } from '@/src/lib/supabase/server'
import DashboardClient from '@/src/components/DashboardClient'
import { Database } from '@/src/types'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all necessary data for the dashboard
  const [
    { data: profile },
    { data: programs },
    { data: saldos },
    { data: operacoes },
    { data: faturas },
    { data: cartoes },
    { data: metas },
    { data: marketPrices },
    { data: marketNews },
    { data: userAlerts }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('programs').select('*'),
    supabase.from('balances').select('*, program:programs(*)').eq('user_id', user.id),
    supabase.from('operations').select('*, program:programs(*)').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('faturas_parcelas').select('*').eq('user_id', user.id),
    supabase.from('cartoes').select('*').eq('user_id', user.id),
    supabase.from('metas').select('*').eq('user_id', user.id),
    supabase.from('market_prices').select('*').order('timestamp', { ascending: true }),
    supabase.from('market_news').select('*').eq('ativa', true).order('data_publicacao', { ascending: true }),
    supabase.from('user_alerts').select('*').eq('user_id', user.id)
  ])

  const initialDb: Database = {
    profile: profile || null,
    programs: programs || [],
    saldos: (saldos || []).map((s: any) => ({
      program_id: s.program_id,
      nome_programa: s.program?.name || '?',
      saldo_atual: Number(s.calculated_balance) || 0,
      ajuste_manual: s.manual_adjustment,
      usar_ajuste_manual: (s.manual_adjustment !== null && s.manual_adjustment !== 0),
      custo_medio: Number(s.custo_medio) || 0,
    })),
    operacoes: (operacoes || []).map((o: any) => ({
      ...o,
      programa: o.program?.name || '?'
    })),
    faturas: faturas || [],
    cartoes: cartoes || [],
    metas: metas || [],
    market_prices: marketPrices || [],
    market_news: marketNews || [],
    user_alerts: userAlerts || []
  }



  return (
    <DashboardClient
      initialDb={initialDb}
      user={user}
    />
  )
}
