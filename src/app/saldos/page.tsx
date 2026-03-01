import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Saldos from '@/src/components/features/Saldos'

export default async function SaldosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: programs },
    { data: saldos }
  ] = await Promise.all([
    supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name'),
    supabase.from('programas_saldos').select('*').eq('user_id', user.id)
  ])

  const db = {
    programs: programs || [],
    saldos: saldos || [],
    profile: null,
    operacoes: [],
    faturas: [],
    cartoes: [],
    metas: []
  }

  return <Saldos db={db as any} toast={() => { }} theme="dark" />
}
