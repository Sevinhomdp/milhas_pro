import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import DRE from '@/src/components/features/DRE'

export default async function DrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: operations }, { data: metas }] = await Promise.all([
    supabase.from('operations').select('*').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('metas').select('*').eq('user_id', user.id),
  ])

  const db = {
    operacoes: operations || [],
    metas: metas || [],
    profile: null,
    programs: [],
    saldos: [],
    faturas: [],
    cartoes: [],
    market_prices: [],
    market_news: [],
    user_alerts: []
  }

  return <DRE db={db as any} theme="dark" />
}
