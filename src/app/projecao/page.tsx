import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Projecao from '@/src/components/features/Projecao'

export default async function ProjecaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: operacoes }, { data: faturas }, { data: cartoes }] = await Promise.all([
    supabase.from('operacoes').select('*').eq('user_id', user.id).eq('type', 'venda'),
    supabase.from('faturas_parcelas').select('*').eq('user_id', user.id),
    supabase.from('cartoes').select('*').eq('user_id', user.id),
  ])

  const db = {
    operacoes: operacoes || [],
    faturas: faturas || [],
    cartoes: cartoes || [],
    profile: null,
    programs: [],
    saldos: [],
    metas: []
  }

  return <Projecao db={db as any} toast={() => { }} theme="dark" />
}
