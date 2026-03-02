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

  const totalEmAbertoPorCartao = (faturasAtivas || []).reduce((acc, fatura) => {
    if (!fatura.cartao_id) return acc

    const atual = acc.get(fatura.cartao_id) || 0
    acc.set(fatura.cartao_id, atual + Number(fatura.valor || 0))
    return acc
  }, new Map<string, number>())

  const cartoesComLimiteDisponivel = (cartoes || []).map((cartao) => {
    const totalEmAberto = totalEmAbertoPorCartao.get(cartao.id) || 0
    return {
      ...cartao,
      total_em_aberto: totalEmAberto,
      limite_disponivel: Number(cartao.limite || 0) - totalEmAberto,
    }
  })

  const db = {
    cartoes: cartoesComLimiteDisponivel,
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
