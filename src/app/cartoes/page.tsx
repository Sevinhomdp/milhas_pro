import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CartoesRoute } from '@/src/components/routes/CartoesRoute'

export default async function CartoesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: cartoes }, { data: faturas }] = await Promise.all([
    supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
    supabase.from('faturas_parcelas').select('*').eq('user_id', user.id).eq('pago', false),
  ])

  const db = {
    cartoes: cartoes || [],
    faturas: faturas || [],
    profile: null,
    programs: [],
    saldos: [],
    operacoes: [],
    metas: [],
    market_prices: [],
    market_news: [],
    user_alerts: [],
  }

  return <CartoesRoute db={db as any} />
}
