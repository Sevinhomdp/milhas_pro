'use client'

import * as React from "react"
import { ProgramaSaldo, Operacao, FaturaParcela, Cartao, Meta } from "@/src/types"
import { MetricCard } from "../ui/MetricCard"
import { formatCurrency, formatNumber } from "@/src/lib/utils"
import { Wallet, TrendingUp, CalendarDays, Target } from "lucide-react"

interface DashboardProps {
  saldos: ProgramaSaldo[];
  operacoes: Operacao[];
  faturas: FaturaParcela[];
  cartoes: Cartao[];
  metas: Meta[];
}

export function Dashboard({ saldos, operacoes, faturas, cartoes, metas }: DashboardProps) {
  // 1. Saldo Total: soma de saldos_atual de todos os programas
  const totalMilhas = saldos.reduce((acc, curr) => acc + (Number(curr.saldo_atual) || 0), 0)

  // 2. DRE (Lucro Realizado Histórico)
  // Receitas = Vendas já recebidas
  const receitasRealizadas = operacoes
    .filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'recebido')
    .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0)

  // Custos Pagos = Operações à vista (sem cartão cadastrado) + Faturas Pagas
  const custosAVista = operacoes
    .filter(op => (op.tipo === 'COMPRA' || op.tipo === 'TRANSF') && !op.cartao_id)
    .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0)

  const faturasPagas = faturas
    .filter(f => f.pago)
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0)

  const custosReais = custosAVista + faturasPagas
  const lucroRealizado = receitasRealizadas - custosReais

  // 3. Projeção de Caixa (Futuro Pendente)
  const aReceber = operacoes
    .filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'pendente')
    .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0)

  const aPagarFaturas = faturas
    .filter(f => !f.pago)
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0)

  const caixaProjetado = aReceber - aPagarFaturas

  // 4. Metas (Desempenho do Mês Atual)
  const mesAtual = new Date().toISOString().substring(0, 7)
  const metaAtual = metas.find(m => m.mes === mesAtual)
  const metaLucroDesejado = metaAtual?.meta_lucro || 0

  // Calcula lucro mensal: vendas do mes - (custos à vista do mês + faturas deste mês, ou simplificando, o ROI gravado)
  // Para ser exato em fluxo financeiro do mês (entradas - saídas do mês atual):
  const receitasMes = operacoes
    .filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'recebido' && op.data_recebimento?.startsWith(mesAtual))
    .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0)

  const faturasMesPagas = faturas
    .filter(f => f.pago && f.mes_referencia === mesAtual)
    .reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0)

  const custosAVistaMes = operacoes
    .filter(op => (op.tipo === 'COMPRA' || op.tipo === 'TRANSF') && !op.cartao_id && op.data?.startsWith(mesAtual))
    .reduce((acc, curr) => acc + (Number(curr.valor_total) || 0), 0)

  const resultadoMesFinanceiro = receitasMes - (faturasMesPagas + custosAVistaMes)

  // Como alternativa para o painel principal, caso a Meta não exista, mostra 0%. Senao a % do Lucro financeiro atingida
  const porcentagemMeta = metaLucroDesejado > 0
    ? Math.min(100, Math.max(0, (resultadoMesFinanceiro / metaLucroDesejado) * 100))
    : 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400">Visão geral do seu portfólio de milhas considerando caixa real e projeções.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Saldo Total */}
        <MetricCard
          title="Saldo Total em Contas"
          value={`${formatNumber(totalMilhas)} mi`}
          icon={<Wallet className="h-5 w-5 text-accent" />}
          borderColor="border-l-accent"
        />

        {/* Card 2: DRE / Fluxo Realizado */}
        <MetricCard
          title="Resultado Acumulado (Caixa)"
          value={formatCurrency(lucroRealizado)}
          icon={<TrendingUp className={`h-5 w-5 ${lucroRealizado >= 0 ? 'text-success' : 'text-danger'}`} />}
          borderColor={lucroRealizado >= 0 ? "border-l-success" : "border-l-danger"}
          trend={lucroRealizado >= 0 ? 'up' : 'down'}
        />

        {/* Card 3: Projeção Futura */}
        <MetricCard
          title="Projeção de Caixa Futuro"
          value={formatCurrency(caixaProjetado)}
          icon={<CalendarDays className={`h-5 w-5 ${caixaProjetado >= 0 ? 'text-blue-400' : 'text-danger'}`} />}
          borderColor={caixaProjetado >= 0 ? "border-l-blue-400" : "border-l-danger"}
          trend={caixaProjetado >= 0 ? 'up' : 'down'}
        />

        {/* Card 4: Meta do Mês */}
        <MetricCard
          title={`Progresso da Meta (${mesAtual})`}
          value={`${porcentagemMeta.toFixed(1)}%`}
          icon={<Target className="h-5 w-5 text-purple-400" />}
          borderColor="border-l-purple-400"
          trend="up"
        />
      </div>

      {/* Detalhamentos visuais extras podem vir aqui sob demanda */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surfaceDark p-6 rounded-2xl border border-borderDark text-sm">
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs border-b border-borderDark pb-2">Status do Mês Atual</h3>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Receitas Adquiridas (Vendas Recebidas)</span>
            <span className="font-semibold text-success">{formatCurrency(receitasMes)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Saídas (Faturas + Compras à Vista)</span>
            <span className="font-semibold text-danger">({formatCurrency(faturasMesPagas + custosAVistaMes)})</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-300 font-bold">Fluxo Financeiro do Mês</span>
            <span className={`font-bold ${resultadoMesFinanceiro >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(resultadoMesFinanceiro)}</span>
          </div>
        </div>

        <div className="bg-surfaceDark p-6 rounded-2xl border border-borderDark text-sm">
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs border-b border-borderDark pb-2">Resumo de Projeção Globais</h3>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Total a Receber (Vendas Pendentes)</span>
            <span className="font-semibold text-blue-400">{formatCurrency(aReceber)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Total a Pagar (Faturas Abertas)</span>
            <span className="font-semibold text-danger">({formatCurrency(aPagarFaturas)})</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-300 font-bold">Saldo Pendente Garantido</span>
            <span className={`font-bold ${caixaProjetado >= 0 ? 'text-blue-400' : 'text-danger'}`}>{formatCurrency(caixaProjetado)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
