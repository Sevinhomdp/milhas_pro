import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { InteligenciaRoute } from '@/src/components/routes/InteligenciaRoute'
import { Database } from '@/src/types'

export default async function InteligenciaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [balancesRes, pricesRes, newsRes, userAlertsRes, alertasConfigRes] = await Promise.all([
    supabase.from('balances').select('*, programs(*)').eq('user_id', user.id),
    supabase.from('market_prices').select('*').order('timestamp', { ascending: true }),
    supabase.from('market_news').select('*').order('created_at', { ascending: false }),
    supabase.from('user_alerts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('alertas_config').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
  ])

  const formattedSaldos = (balancesRes.data || []).map((s: any) => ({
    program_id: s.program_id,
    nome_programa: s.programs?.name || '?',
    saldo_atual: Number(s.calculated_balance) || 0,
    ajuste_manual: Number(s.manual_adjustment) || 0,
    usar_ajuste_manual: Boolean(s.manual_adjustment),
    custo_medio: Number(s.custo_medio) || 0,
  }))

  const db: Database = {
    profile: null,
    programs: [],
    saldos: formattedSaldos,
    operacoes: [],
    faturas: [],
    cartoes: [],
    metas: [],
    market_prices: (pricesRes.data as any) || [],
    market_news: (newsRes.data as any) || [],
    user_alerts: (userAlertsRes.data as any) || [],
  }

  return (
    <div className="p-4 md:p-8">
      <InteligenciaRoute db={db} userEmail={user.email ?? ''} alertasConfig={(alertasConfigRes.data as any) || []} />
    </div>
  )
}
