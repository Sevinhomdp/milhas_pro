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
    { data: historico },
    { data: promocoes },
    { data: alertas }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('programs').select('*'),
    supabase.from('programas_saldos').select('*').eq('user_id', user.id),
    supabase.from('operacoes').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('faturas_parcelas').select('*').eq('user_id', user.id),
    supabase.from('cartoes').select('*').eq('user_id', user.id),
    supabase.from('metas').select('*').eq('user_id', user.id),
    supabase.from('historico_precos').select('*').order('created_at', { ascending: true }),
    supabase.from('promocoes_radar').select('*').eq('ativa', true).order('data_validade', { ascending: true }),
    supabase.from('alertas_config').select('*').eq('user_id', user.id)
  ])

  const initialDb: Database = {
    profile: profile || null,
    programs: programs || [],
    saldos: saldos || [],
    operacoes: operacoes || [],
    faturas: faturas || [],
    cartoes: cartoes || [],
    metas: metas || [],
    historico_precos: historico || [],
    promocoes_radar: promocoes || [],
    alertas_config: alertas || []
  }



  return (
    <DashboardClient
      initialDb={initialDb}
      user={user}
    />
  )
}
