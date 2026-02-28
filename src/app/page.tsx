import { createClient } from '@/src/lib/supabase/server'
import { Dashboard } from '@/src/components/features/Dashboard'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch all necessary data for the dashboard
  const [
    { data: saldos },
    { data: operacoes },
    { data: faturas },
    { data: cartoes },
    { data: metas }
  ] = await Promise.all([
    supabase.from('programas_saldos').select('*').eq('user_id', user.id),
    supabase.from('operacoes').select('*').eq('user_id', user.id).order('data', { ascending: false }),
    supabase.from('faturas_parcelas').select('*').eq('user_id', user.id),
    supabase.from('cartoes').select('*').eq('user_id', user.id),
    supabase.from('metas').select('*').eq('user_id', user.id)
  ])

  return (
    <Dashboard
      saldos={saldos || []}
      operacoes={operacoes || []}
      faturas={faturas || []}
      cartoes={cartoes || []}
      metas={metas || []}
    />
  )
}
