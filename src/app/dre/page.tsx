import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import DRE from '@/src/components/features/DRE'

export default async function DrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: operacoes }, { data: metas }] = await Promise.all([
    supabase.from('operacoes').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('metas').select('*').eq('user_id', user.id),
  ])

  const db = {
    operacoes: operacoes || [],
    metas: metas || [],
    profile: null,
    programs: [],
    saldos: [],
    faturas: [],
    cartoes: []
  }

  return <DRE db={db as any} theme="dark" />
}
