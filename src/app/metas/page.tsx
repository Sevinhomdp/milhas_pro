import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Metas from '@/src/components/features/Metas'

export default async function MetasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: metas }, { data: operacoes }] = await Promise.all([
    supabase.from('metas').select('*').eq('user_id', user.id).order('mes', { ascending: false }),
    supabase.from('operacoes').select('*').eq('user_id', user.id),
  ])

  const db = {
    metas: metas || [],
    operacoes: operacoes || [],
    profile: null,
    programs: [],
    saldos: [],
    faturas: [],
    cartoes: []
  }

  return <Metas db={db as any} toast={() => { }} theme="dark" />
}
