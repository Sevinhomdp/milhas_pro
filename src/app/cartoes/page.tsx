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

  const totalEmAbertoPorCartao = new Map<string, number>()
  for (const fatura of faturasAtivas || []) {
    if (!fatura.cartao_id || fatura.pago) continue
    const atual = totalEmAbertoPorCartao.get(fatura.cartao_id) || 0
    totalEmAbertoPorCartao.set(fatura.cartao_id, atual + Number(fatura.valor || 0))
  }

  const cartoesComLimite = (cartoes || []).map((cartao: any) => {
    const totalEmAberto = totalEmAbertoPorCartao.get(cartao.id) || 0
    return {
      ...cartao,
      total_em_aberto: totalEmAberto,
      limite_disponivel: Number(cartao.limite || 0) - totalEmAberto,
    }
  })

  const db = {
    cartoes: cartoesComLimite,
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
