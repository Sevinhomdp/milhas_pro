import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Metas from '@/src/components/features/Metas'

export default async function MetasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: metas }, { data: operations }] = await Promise.all([
    supabase.from('metas').select('*').eq('user_id', user.id).order('mes', { ascending: false }),
    supabase.from('operations').select('*').eq('user_id', user.id),
  ])

  const db = {
    metas: metas || [],
    operacoes: operations || [],
    profile: null,
    programs: [],
    saldos: [],
    faturas: [],
    cartoes: [],
    market_prices: [],
    market_news: [],
    user_alerts: []
  }

  return <Metas db={db as any} toast={() => { }} theme="dark" />
}
