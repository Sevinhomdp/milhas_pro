import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesRoute } from '@/src/components/routes/ConfiguracoesRoute'
import { Database } from '@/src/types'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db: Database = {
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

  return <ConfiguracoesRoute db={db} userEmail={user.email} />
}
