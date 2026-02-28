'use server'

import { createClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { addMonths, format } from 'date-fns'
import { cookies } from 'next/headers'

export async function executarAcao(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const tipo = formData.get('tipo') as 'COMPRA' | 'VENDA' | 'TRANSF'
  const data = formData.get('data') as string
  const programa = formData.get('programa') as string
  const observacao = formData.get('observacao') as string | null

  if (tipo === 'COMPRA') {
    const quantidade = Number(formData.get('quantidade'))
    const valor_total = Number(formData.get('valor_total'))
    const cartao_id = formData.get('cartao_id') as string
    const parcelas = Number(formData.get('parcelas'))
    const cpm = (valor_total / quantidade) * 1000

    // 1. Inserir operação
    const { data: op, error: opError } = await supabase
      .from('operacoes')
      .insert({
        user_id: user.id,
        tipo,
        data,
        programa,
        quantidade,
        valor_total,
        cpm,
        cartao_id,
        observacao
      })
      .select()
      .single()

    if (opError) throw opError

    // 2. Atualizar saldo e custo médio
    const { data: saldoAtual } = await supabase
      .from('programas_saldos')
      .select('*')
      .eq('user_id', user.id)
      .eq('nome_programa', programa)
      .single()

    const saldo = saldoAtual?.saldo_atual || 0
    const custoMedio = saldoAtual?.custo_medio || 0
    const novoSaldo = saldo + quantidade
    const novoCustoMedio = ((saldo * custoMedio) + valor_total) / novoSaldo

    await supabase
      .from('programas_saldos')
      .upsert({
        user_id: user.id,
        nome_programa: programa,
        saldo_atual: novoSaldo,
        custo_medio: novoCustoMedio,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, nome_programa' })

    // 3. Gerar parcelas
    const { data: cartao } = await supabase
      .from('cartoes')
      .select('*')
      .eq('id', cartao_id)
      .single()

    if (cartao && parcelas > 0) {
      const valorParcela = valor_total / parcelas
      const dataCompra = new Date(data)
      const faturas = []

      for (let i = 0; i < parcelas; i++) {
        const deslocamento = (dataCompra.getDate() >= cartao.dia_fechamento) ? i + 1 : i
        const dtVenc = new Date(dataCompra.getFullYear(), dataCompra.getMonth() + deslocamento, cartao.dia_vencimento)
        const mes_referencia = format(dtVenc, 'yyyy-MM')

        faturas.push({
          user_id: user.id,
          operacao_id: op.id,
          cartao_id: cartao.id,
          valor: valorParcela,
          mes_referencia,
          parc_num: i + 1,
          total_parc: parcelas,
          pago: false
        })
      }

      await supabase.from('faturas_parcelas').insert(faturas)
    }

  } else if (tipo === 'VENDA') {
    const quantidade = Number(formData.get('quantidade'))
    const valor_total = Number(formData.get('valor_total'))
    const data_recebimento = formData.get('data_recebimento') as string
    const status_recebimento = formData.get('status_recebimento') as 'pendente' | 'recebido'

    // 1. Obter custo médio para calcular ROI
    const { data: saldoAtual } = await supabase
      .from('programas_saldos')
      .select('*')
      .eq('user_id', user.id)
      .eq('nome_programa', programa)
      .single()

    const custoMedio = saldoAtual?.custo_medio || 0
    const custoTotal = (quantidade * custoMedio) / 1000
    const roi = custoTotal > 0 ? ((valor_total - custoTotal) / custoTotal) * 100 : 0
    const cpm = (valor_total / quantidade) * 1000 // CPV

    // 2. Inserir operação
    const { error: opError } = await supabase
      .from('operacoes')
      .insert({
        user_id: user.id,
        tipo,
        data,
        programa,
        quantidade,
        valor_total,
        cpm,
        roi,
        status_recebimento,
        data_recebimento: data_recebimento || null,
        observacao
      })

    if (opError) throw opError

    // 3. Debitar saldo
    const saldo = saldoAtual?.saldo_atual || 0
    const novoSaldo = Math.max(0, saldo - quantidade)

    await supabase
      .from('programas_saldos')
      .upsert({
        user_id: user.id,
        nome_programa: programa,
        saldo_atual: novoSaldo,
        custo_medio: custoMedio, // mantém o custo médio na venda
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, nome_programa' })

  } else if (tipo === 'TRANSF') {
    const programa_destino = formData.get('programa_destino') as string
    const quantidade = Number(formData.get('quantidade'))
    const bonus = Number(formData.get('bonus')) || 0
    const valor_total = Number(formData.get('valor_total')) || 0 // Taxa
    const cartao_id = formData.get('cartao_id') as string | null

    const milhas_destino = quantidade * (1 + bonus / 100)

    // 1. Inserir operação
    const { error: opError } = await supabase
      .from('operacoes')
      .insert({
        user_id: user.id,
        tipo,
        data,
        programa,
        quantidade,
        valor_total,
        cartao_id: cartao_id || null,
        observacao: observacao || `Transferência para ${programa_destino} com ${bonus}% de bônus`
      })

    if (opError) throw opError

    // 2. Debitar origem
    const { data: saldoOrigem } = await supabase
      .from('programas_saldos')
      .select('*')
      .eq('user_id', user.id)
      .eq('nome_programa', programa)
      .single()

    const saldoO = saldoOrigem?.saldo_atual || 0
    const custoMedioO = saldoOrigem?.custo_medio || 0
    const novoSaldoO = Math.max(0, saldoO - quantidade)

    await supabase
      .from('programas_saldos')
      .upsert({
        user_id: user.id,
        nome_programa: programa,
        saldo_atual: novoSaldoO,
        custo_medio: custoMedioO,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, nome_programa' })

    // 3. Creditar destino
    const { data: saldoDestino } = await supabase
      .from('programas_saldos')
      .select('*')
      .eq('user_id', user.id)
      .eq('nome_programa', programa_destino)
      .single()

    const saldoD = saldoDestino?.saldo_atual || 0
    const custoMedioD = saldoDestino?.custo_medio || 0
    const novoSaldoD = saldoD + milhas_destino

    // Custo das milhas transferidas = (custo das milhas na origem) + taxas
    const custoTransferido = (quantidade * custoMedioO / 1000) + valor_total
    const novoCustoMedioD = ((saldoD * custoMedioD) + custoTransferido) / novoSaldoD

    await supabase
      .from('programas_saldos')
      .upsert({
        user_id: user.id,
        nome_programa: programa_destino,
        saldo_atual: novoSaldoD,
        custo_medio: novoCustoMedioD,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id, nome_programa' })
  }

  revalidatePath('/')
  revalidatePath('/operacoes')
  revalidatePath('/saldos')
  revalidatePath('/dre')
  revalidatePath('/projecao')
}

export async function excluirOperacao(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('operacoes').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/operacoes')
  revalidatePath('/dre')
  revalidatePath('/projecao')
}

export async function marcarRecebido(ids: string[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('operacoes')
    .update({ status_recebimento: 'recebido' })
    .in('id', ids)
  if (error) throw error
  revalidatePath('/')
  revalidatePath('/operacoes')
  revalidatePath('/dre')
  revalidatePath('/projecao')
}

export async function adicionarCartao(nome: string, diaFechamento: number, diaVencimento: number, limite: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase.from('cartoes').insert({
    user_id: user.id,
    nome,
    dia_fechamento: diaFechamento,
    dia_vencimento: diaVencimento,
    limite
  })
  if (error) throw error
  revalidatePath('/cartoes')
  revalidatePath('/operacoes')
}

export async function removerCartao(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('cartoes').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/cartoes')
}

export async function atualizarSaldo(programa: string, novoSaldo: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: atual } = await supabase
    .from('programas_saldos')
    .select('custo_medio')
    .eq('user_id', user.id)
    .eq('nome_programa', programa)
    .single()

  const { error } = await supabase
    .from('programas_saldos')
    .upsert({
      user_id: user.id,
      nome_programa: programa,
      saldo_atual: novoSaldo,
      custo_medio: atual?.custo_medio || 0,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, nome_programa' })

  if (error) throw error
  revalidatePath('/saldos')
  revalidatePath('/')
}

export async function pagarParcelas(cartaoId: string, mesReferencia: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('faturas_parcelas')
    .update({ pago: true, data_pagamento: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('cartao_id', cartaoId)
    .eq('mes_referencia', mesReferencia)

  if (error) throw error
  revalidatePath('/')
  revalidatePath('/projecao')
}

export async function salvarMeta(mes: string, metaLucro: number, metaVolume: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .from('metas')
    .upsert({
      user_id: user.id,
      mes,
      meta_lucro: metaLucro,
      meta_volume_milhas: metaVolume
    }, { onConflict: 'user_id, mes' })

  if (error) throw error
  revalidatePath('/metas')
  revalidatePath('/')
}

export async function setThemeCookie(theme: 'light' | 'dark') {
  const cookieStore = await cookies()
  cookieStore.set('theme', theme, { path: '/', maxAge: 60 * 60 * 24 * 365 })
}
