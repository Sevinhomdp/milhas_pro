'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { format } from 'date-fns'

async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')
  return { supabase, user }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPRA
// ─────────────────────────────────────────────────────────────────────────────
export async function executarCompra(data: {
  programa: string
  quantidade: number
  valor_total: number
  cartao_id?: string | null
  parcelas: number
  data: string
  observacao?: string
}) {
  const { supabase, user } = await getUser()
  const cpm = data.quantidade > 0 ? (data.valor_total / data.quantidade) * 1000 : 0

  const { data: op, error } = await supabase
    .from('operacoes')
    .insert({
      user_id: user.id,
      tipo: 'COMPRA',
      data: data.data,
      programa: data.programa,
      quantidade: data.quantidade,
      valor_total: data.valor_total,
      cpm,
      status_recebimento: 'recebido',
      cartao_id: data.cartao_id || null,
      observacao: data.observacao || null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)

  // Atualizar saldo com custo médio ponderado
  const { data: saldoAtual } = await supabase
    .from('programas_saldos')
    .select('*')
    .eq('user_id', user.id)
    .eq('nome_programa', data.programa)
    .maybeSingle()

  const saldoExistente = Number(saldoAtual?.saldo_atual) || 0
  const custoExistente = Number(saldoAtual?.custo_medio) || 0
  const novoSaldo = saldoExistente + data.quantidade
  const novoCusto = novoSaldo > 0 ? ((saldoExistente * custoExistente) + data.valor_total) / novoSaldo : 0

  await supabase.from('programas_saldos').upsert({
    user_id: user.id,
    nome_programa: data.programa,
    saldo_atual: novoSaldo,
    custo_medio: novoCusto,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,nome_programa' })

  // Gerar parcelas
  if (data.cartao_id && data.parcelas >= 1) {
    const { data: cartao } = await supabase.from('cartoes').select('*').eq('id', data.cartao_id).single()
    if (cartao) {
      const dataCompra = new Date(data.data + 'T12:00:00')
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
          valor: data.valor_total / data.parcelas,
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

// ─────────────────────────────────────────────────────────────────────────────
// VENDA
// ─────────────────────────────────────────────────────────────────────────────
export async function executarVenda(data: {
  programa: string
  quantidade: number
  valor_total: number
  data: string
  data_recebimento?: string
  status_recebimento: 'pendente' | 'recebido'
  observacao?: string
}) {
  const { supabase, user } = await getUser()

  const { data: saldoAtual } = await supabase
    .from('programas_saldos')
    .select('*')
    .eq('user_id', user.id)
    .eq('nome_programa', data.programa)
    .maybeSingle()

  const custoMedio = Number(saldoAtual?.custo_medio) || 0
  const custoTotal = (data.quantidade * custoMedio) / 1000
  const roi = custoTotal > 0 ? ((data.valor_total - custoTotal) / custoTotal) * 100 : 0
  const cpm = data.quantidade > 0 ? (data.valor_total / data.quantidade) * 1000 : 0

  const { error } = await supabase.from('operacoes').insert({
    user_id: user.id,
    tipo: 'VENDA',
    data: data.data,
    programa: data.programa,
    quantidade: data.quantidade,
    valor_total: data.valor_total,
    cpm,
    roi,
    status_recebimento: data.status_recebimento,
    data_recebimento: data.data_recebimento || null,
    observacao: data.observacao || null,
  })
  if (error) throw new Error(error.message)

  await supabase.from('programas_saldos').upsert({
    user_id: user.id,
    nome_programa: data.programa,
    saldo_atual: Math.max(0, (Number(saldoAtual?.saldo_atual) || 0) - data.quantidade),
    custo_medio: custoMedio,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,nome_programa' })

  revalidatePath('/', 'layout')
}

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFERÊNCIA
// ─────────────────────────────────────────────────────────────────────────────
export async function executarTransf(data: {
  programa_origem: string
  programa_destino: string
  quantidade: number
  bonus: number
  taxa: number
  cartao_id?: string | null
  data: string
}) {
  const { supabase, user } = await getUser()
  if (data.programa_origem === data.programa_destino) throw new Error('Origem e destino não podem ser iguais')

  const milhas_destino = data.quantidade * (1 + data.bonus / 100)

  const { error } = await supabase.from('operacoes').insert({
    user_id: user.id,
    tipo: 'TRANSF',
    data: data.data,
    programa: `${data.programa_origem}→${data.programa_destino}`,
    quantidade: milhas_destino,
    valor_total: data.taxa,
    cartao_id: data.cartao_id || null,
    status_recebimento: 'recebido',
    observacao: `Bônus ${data.bonus}%`,
  })
  if (error) throw new Error(error.message)

  const { data: sO } = await supabase.from('programas_saldos').select('*').eq('user_id', user.id).eq('nome_programa', data.programa_origem).maybeSingle()
  await supabase.from('programas_saldos').upsert({
    user_id: user.id,
    nome_programa: data.programa_origem,
    saldo_atual: Math.max(0, (Number(sO?.saldo_atual) || 0) - data.quantidade),
    custo_medio: Number(sO?.custo_medio) || 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,nome_programa' })

  const { data: sD } = await supabase.from('programas_saldos').select('*').eq('user_id', user.id).eq('nome_programa', data.programa_destino).maybeSingle()
  const saldoD = Number(sD?.saldo_atual) || 0
  const custoD = Number(sD?.custo_medio) || 0
  const custoTransf = ((data.quantidade * (Number(sO?.custo_medio) || 0)) / 1000) + data.taxa
  const novoCustoD = (saldoD + milhas_destino) > 0 ? ((saldoD * custoD) + custoTransf) / (saldoD + milhas_destino) : 0

  await supabase.from('programas_saldos').upsert({
    user_id: user.id,
    nome_programa: data.programa_destino,
    saldo_atual: saldoD + milhas_destino,
    custo_medio: novoCustoD,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,nome_programa' })

  revalidatePath('/', 'layout')
}

// ─────────────────────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────────────────────
export async function excluirOperacao(id: string) {
  const { supabase, user } = await getUser()
  const { error } = await supabase.from('operacoes').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function marcarRecebido(ids: string[]) {
  const { supabase, user } = await getUser()
  const { error } = await supabase
    .from('operacoes')
    .update({ status_recebimento: 'recebido' })
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

export async function atualizarSaldo(programa: string, novoSaldo: number) {
  const { supabase, user } = await getUser()
  const { data: atual } = await supabase
    .from('programas_saldos')
    .select('custo_medio')
    .eq('user_id', user.id)
    .eq('nome_programa', programa)
    .maybeSingle()

  await supabase.from('programas_saldos').upsert({
    user_id: user.id,
    nome_programa: programa,
    saldo_atual: novoSaldo,
    custo_medio: Number(atual?.custo_medio) || 0,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,nome_programa' })

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

export async function salvarMeta(mes: string, metaLucro: number, metaVolume: number) {
  const { supabase, user } = await getUser()
  const { error } = await supabase.from('metas').upsert({
    user_id: user.id,
    mes,
    meta_lucro: metaLucro,
    meta_volume_milhas: metaVolume,
  }, { onConflict: 'user_id,mes' })
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function alterarSenha(novaSenha: string) {
  const { supabase } = await getUser()
  const { error } = await supabase.auth.updateUser({ password: novaSenha })
  if (error) throw new Error(error.message)
}

// Legacy alias for backward compatibility — FormData version removed
// These are now typed parameter functions above
