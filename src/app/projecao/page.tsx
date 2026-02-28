import { createClient } from '@/src/lib/supabase/server'
import { Projecao } from '@/src/components/features/Projecao'

export default async function ProjecaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: operacoes },
    { data: faturas },
    { data: cartoes }
  ] = await Promise.all([
    supabase.from('operacoes').select('*').eq('user_id', user.id).eq('tipo', 'VENDA').order('data_recebimento', { ascending: false }),
    supabase.from('faturas_parcelas').select('*').eq('user_id', user.id),
    supabase.from('cartoes').select('*').eq('user_id', user.id)
  ])

  return <Projecao operacoes={operacoes || []} faturas={faturas || []} cartoes={cartoes || []} />
}
