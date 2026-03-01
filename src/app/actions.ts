'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

import { Profile, Program, Operation, Balance, Meta } from '@/src/types'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return { supabase, user }
}

export async function getProfile() {
  const { supabase, user } = await getUser()
  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error) return null
  return data as Profile
}

export async function getPrograms() {
  const { supabase, user } = await getUser()
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('name')
  if (error) return []
  return data as Program[]
}

export async function getProgramById(id: string) {
  const { supabase } = await getUser()
  const { data } = await supabase.from('programs').select('*').eq('id', id).single()
  return data as Program
}

// ─────────────────────────────────────────────────────────────────────────────
// OPERAÇÕES
// ─────────────────────────────────────────────────────────────────────────────
export async function executarCompra(data: {
  program_id: string
  quantity: number
  value: number
  fees?: number
  cartao_id?: string | null
  parcelas: number
  date: string
  observacao?: string
}) {
  const { supabase, user } = await getUser()

  const { data: op, error } = await supabase
    .from('operations')
    .insert({
      user_id: user.id,
      type: 'compra',
      date: data.date,
      program_id: data.program_id,
      quantity: data.quantity,
      value: data.value,
      fees: data.fees || 0,
      status: 'concluido',
      observacao: data.observacao || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  // Gerar parcelas
  if (data.cartao_id && data.parcelas >= 1) {
    const { data: cartao } = await supabase.from('cartoes').select('*').eq('id', data.cartao_id).single()
    if (cartao) {
      const dataCompra = new Date(data.date + 'T12:00:00')
      const faturas = Array.from({ length: data.parcelas }, (_, i) => {
        const deslocamento = dataCompra.getDate() >= cartao.dia_fechamento ? i + 1 : i
        const dtVenc = new Date(
          dataCompra.getFullYear(),
          dataCompra.getMonth() + deslocamento,
          cartao.dia_vencimento
        )
        return {
          user_id: user.id,
          operacao_id: op.id,
          cartao_id: data.cartao_id,
          valor: (data.value + (data.fees || 0)) / data.parcelas,
          mes_referencia: format(dtVenc, 'yyyy-MM'),
          parc_num: i + 1,
          total_parc: data.parcelas,
          pago: false,
        }
      })
      await supabase.from('faturas_parcelas').insert(faturas)
    }
  }

  revalidatePath('/', 'layout')
}

export async function executarVenda(data: {
  program_id: string
  quantity: number
  value: number
  fees?: number
  date: string
  data_recebimento?: string
  status_recebimento: 'pendente' | 'recebido'
  observacao?: string
}) {
  const { supabase, user } = await getUser()

  const { error } = await supabase.from('operations').insert({
    user_id: user.id,
    type: 'venda',
    date: data.date,
    program_id: data.program_id,
    quantity: data.quantity,
    value: data.value,
    fees: data.fees || 0,
    status: 'concluido',
    observacao: data.observacao || null,
  })
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
}

export async function executarTransf(data: {
  program_id_origem: string
  program_id_destino: string
  quantity: number
  bonus: number
  taxa: number
  cartao_id?: string | null
  date: string
}) {
  const { supabase, user } = await getUser()
  if (data.program_id_origem === data.program_id_destino) throw new Error('Origem e destino não podem ser iguais')

  const milhas_destino = data.quantity * (1 + data.bonus / 100)

  // Registrar a saída (origem) e entrada (destino) como uma operação de transferência
  // No novo schema, podemos representar isso como uma operação única ou duas. 
  // O prompt original sugeria uma operação 'transferencia'.
  const { error } = await supabase.from('operations').insert({
    user_id: user.id,
    type: 'transferencia',
    date: data.date,
    program_id: data.program_id_origem, // Referência inicial
    quantity: data.quantity,
    value: data.taxa,
    fees: 0,
    status: 'concluido',
    observacao: `Para programa destino ID: ${data.program_id_destino}. Bônus ${data.bonus}%`,
  })
  if (error) throw new Error(error.message)

  // Também precisamos registrar a entrada no destino se quisermos que o saldo calculado funcione
  await supabase.from('operations').insert({
    user_id: user.id,
    type: 'compra', // Entrada de milhas via bônus
    date: data.date,
    program_id: data.program_id_destino,
    quantity: milhas_destino,
    value: 0,
    fees: 0,
    status: 'concluido',
    observacao: `Bônus transferência de ID: ${data.program_id_origem}`,
  })

  revalidatePath('/', 'layout')
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────
export async function excluirOperacao(id: string) {
  const { supabase, user } = await getUser()
  const { error } = await supabase.from('operations').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function marcarRecebido(ids: string[]) {
  const { supabase, user } = await getUser()
  const { error } = await supabase
    .from('operations')
    .update({ status: 'recebido' })
    .in('id', ids)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function adicionarCartao(nome: string, diaFechamento: number, diaVencimento: number, limite: number) {
  const { supabase, user } = await getUser()
  const { error } = await supabase.from('cartoes').insert({
    user_id: user.id,
    nome,
    dia_fechamento: diaFechamento,
    dia_vencimento: diaVencimento,
    limite,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function removerCartao(id: string) {
  const { supabase, user } = await getUser()
  const { error } = await supabase.from('cartoes').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function pagarParcelas(cartaoId: string, mesReferencia: string) {
  const { supabase, user } = await getUser()
  const { error } = await supabase
    .from('faturas_parcelas')
    .update({ pago: true, data_pagamento: new Date().toISOString().split('T')[0] })
    .eq('user_id', user.id)
    .eq('cartao_id', cartaoId)
    .eq('mes_referencia', mesReferencia)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function registrarPrograma(name: string, currency_name?: string) {
  const { supabase, user } = await getUser()
  const { data, error } = await supabase.from('programs').insert({
    user_id: user.id,
    name,
    currency_name: currency_name || null
  }).select().single()
  if (error) throw new Error(error.message)
  return data as Program
}

export async function ajustarSaldoManual(program_id: string, manual_adjustment: number) {
  const { supabase, user } = await getUser()
  const { error } = await supabase.from('balances').upsert({
    user_id: user.id,
    program_id,
    manual_adjustment,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,program_id' })
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function salvarMeta(data: {
  mes: string,
  metaLucro: number,
  metaVolume: number,
  cpmCompra?: number,
  cpmVenda?: number,
  margem?: number
}) {
  const { supabase, user } = await getUser()
  const { error } = await supabase.from('metas').upsert({
    user_id: user.id,
    mes: data.mes,
    meta_lucro: data.metaLucro,
    meta_volume_milhas: data.metaVolume,
    cpm_compra_alvo: data.cpmCompra,
    cpm_venda_alvo: data.cpmVenda,
    margem_desejada: data.margem,
  }, { onConflict: 'user_id,mes' })
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function alterarSenha(novaSenha: string) {
  const { supabase } = await getUser()
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) throw new Error(error.message)
}

export async function getMarketPrices() {
  const { supabase } = await getUser()
  const { data } = await supabase.from('market_prices').select('*').order('timestamp', { ascending: false }).limit(50)
  return data || []
}

export async function getMarketNews() {
  const { supabase } = await getUser()
  const { data } = await supabase.from('market_news').select('*').eq('ativa', true).order('data_publicacao', { ascending: false }).limit(20)
  return data || []
}

export async function getUserAlerts() {
  const { supabase, user } = await getUser()
  const { data } = await supabase.from('user_alerts').select('*').eq('user_id', user.id)
  return data || []
}
