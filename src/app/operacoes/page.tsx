import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OperacoesRoute } from '@/src/components/routes/OperacoesRoute'

export default async function OperacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: operations },
    { data: cartoes },
    { data: programs }
  ] = await Promise.all([
    supabase.from('operations').select('*, program:programs(*)').eq('user_id', user.id).order('date', { ascending: false }),
    supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
    supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name', { ascending: true })
  ])

  const db = {
    operacoes: (operations || []).map((o: any) => ({
      ...o,
      programa: o.program?.name || '?'
    })),
    cartoes: cartoes || [],
    programs: programs || [],
    profile: null,
    saldos: [],
    faturas: [],
    metas: [],
    market_prices: [],
    market_news: [],
    user_alerts: []
  }

  return <OperacoesRoute db={db as any} />
}
