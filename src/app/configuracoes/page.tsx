import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesRoute } from '@/src/components/routes/ConfiguracoesRoute'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const db = {
    profile: null,
    programs: [],
    saldos: [],
    operacoes: [],
    faturas: [],
    cartoes: [],
    metas: [],
    market_prices: [],
    market_news: [],
    user_alerts: []
  }

  return <ConfiguracoesRoute db={db as any} userEmail={user.email} userName={profile?.full_name || ''} />
}
