import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CartoesRoute } from '@/src/components/routes/CartoesRoute'

export default async function CartoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: cartoes }, { data: faturasAtivas }] = await Promise.all([
    supabase
      .from('cartoes')
      .select('*')
      .eq('user_id', user.id)
      .order('nome', { ascending: true }),
    supabase
      .from('faturas_parcelas')
      .select('*')
      .eq('user_id', user.id)
      .eq('pago', false),
  ])

  const db = {
    cartoes: (cartoes || []).map((cartao: any) => {
      const totalEmAberto = (faturasAtivas || [])
        .filter((fatura: any) => fatura.cartao_id === cartao.id && !fatura.pago)
        .reduce((acc: number, fatura: any) => acc + Number(fatura.valor || 0), 0)

      return {
        ...cartao,
        total_em_aberto: totalEmAberto,
        limite_disponivel: Number(cartao.limite || 0) - totalEmAberto,
      }
    }),
    profile: null,
    programs: [],
    saldos: [],
    operacoes: [],
    faturas: faturasAtivas || [],
    metas: [],
    market_prices: [],
    market_news: [],
    user_alerts: []
  }

  return <CartoesRoute db={db as any} />
}
