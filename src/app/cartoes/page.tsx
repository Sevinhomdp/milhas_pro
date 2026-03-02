import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CartoesRoute } from '@/src/components/routes/CartoesRoute'

export default async function CartoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: cartoes }, { data: faturasAbertas }] = await Promise.all([
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
    cartoes: (cartoes || []).map((c: any) => ({
      id: String(c.id),
      user_id: String(c.user_id),
      nome: String(c.nome),
      dia_fechamento: Number(c.dia_fechamento),
      dia_vencimento: Number(c.dia_vencimento),
      limite: Number(c.limite) || 0,
      created_at: String(c.created_at),
    })),
    profile: null,
    programs: [],
    saldos: [],
    operacoes: [],
    faturas: (faturasAbertas || []).map((f: any) => ({
      id: String(f.id),
      user_id: String(f.user_id),
      operacao_id: String(f.operacao_id),
      cartao_id: String(f.cartao_id),
      valor: Number(f.valor) || 0,
      mes_referencia: String(f.mes_referencia),
      parc_num: Number(f.parc_num) || 0,
      total_parc: Number(f.total_parc) || 0,
      pago: Boolean(f.pago),
      data_pagamento: f.data_pagamento ?? null,
      created_at: String(f.created_at),
    })),
    metas: [],
    market_prices: [],
    market_news: [],
    user_alerts: []
  }

  return <CartoesRoute db={db as any} />
}

