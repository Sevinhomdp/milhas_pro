import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Operacoes } from '@/src/components/features/Operacoes'

export default async function OperacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: operacoes }, { data: cartoes }] = await Promise.all([
    supabase.from('operacoes').select('*').eq('user_id', user.id).order('data', { ascending: false }),
    supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
  ])

  return <Operacoes operacoes={operacoes || []} cartoes={cartoes || []} />
}
