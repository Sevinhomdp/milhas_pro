import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Operacoes from '@/src/components/features/Operacoes'

export default async function OperacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: operations },
    { data: cartoes },
    { data: programs }
  ] = await Promise.all([
    supabase.from('operacoes').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
    supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name', { ascending: true })
  ])

  const db = {
    operacoes: operations || [],
    cartoes: cartoes || [],
    programs: programs || [],
    profile: null,
    saldos: [],
    faturas: [],
    metas: []
  }

  return <Operacoes db={db as any} toast={() => { }} theme="dark" />
}
