'use client'

import * as React from 'react'
import { ProgramaSaldo, Operacao, FaturaParcela, Cartao, Meta } from '@/src/types'
import { MetricCard } from '../ui/MetricCard'
import { format, addMonths, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Wallet, TrendingUp, CalendarDays, Target, CreditCard, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react'
import { pagarParcelas } from '@/src/app/actions'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell
} from 'recharts'

interface DashboardProps {
  saldos: ProgramaSaldo[]
  operacoes: Operacao[]
  faturas: FaturaParcela[]
  cartoes: Cartao[]
  metas: Meta[]
}

const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const formatNumber = (v: number) => Math.floor(v).toLocaleString('pt-BR')

export function Dashboard({ saldos, operacoes, faturas, cartoes, metas }: DashboardProps) {
  const [paying, setPaying] = React.useState<string | null>(null)

  // ── 1. Saldo Total ──────────────────────────────────────────────────────────
  const totalMilhas = saldos.reduce((acc, s) => acc + Number(s.saldo_atual), 0)
  const patrimonioEstimado = saldos.reduce((acc, s) => acc + (Number(s.saldo_atual) * Number(s.custo_medio)) / 1000, 0)

  // ── 2. Lucro Realizado (caixa: vendas recebidas - compras pagas) ───────────
  const vendas = operacoes.filter(op => op.tipo === 'VENDA')
  const vendasRecebidas = vendas.filter(op => op.status_recebimento === 'recebido')
    .reduce((a, op) => a + Number(op.valor_total), 0)
  const faturasPagas = faturas.filter(f => f.pago).reduce((a, f) => a + Number(f.valor), 0)
  const comprasAVista = operacoes
    .filter(op => (op.tipo === 'COMPRA' || op.tipo === 'TRANSF') && !op.cartao_id)
    .reduce((a, op) => a + Number(op.valor_total), 0)
  const lucroRealizado = vendasRecebidas - (faturasPagas + comprasAVista)

  // ── 3. A Receber (projeção futura) ─────────────────────────────────────────
  const aReceber = operacoes
    .filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'pendente')
    .reduce((a, op) => a + Number(op.valor_total), 0)
  const aPagarFaturas = faturas.filter(f => !f.pago).reduce((a, f) => a + Number(f.valor), 0)

  // ── 4. ROI médio ponderado das vendas ──────────────────────────────────────
  const vendasComRoi = operacoes.filter(op => op.tipo === 'VENDA' && op.roi != null)
  const roiMedio = vendasComRoi.length > 0
    ? vendasComRoi.reduce((a, op) => a + (Number(op.roi) || 0), 0) / vendasComRoi.length
    : 0

  // ── 5. CPM médio do mês atual ──────────────────────────────────────────────
  const mesAtual = format(new Date(), 'yyyy-MM')
  const comprasMes = operacoes.filter(op => op.tipo === 'COMPRA' && op.data?.startsWith(mesAtual))
  const cpmMedio = comprasMes.length > 0
    ? comprasMes.reduce((a, op) => a + (Number(op.cpm) || 0), 0) / comprasMes.length
    : 0

  // ── 6. Meta do mês ─────────────────────────────────────────────────────────
  const metaAtual = metas.find(m => m.mes === mesAtual)
  const metaLucro = metaAtual?.meta_lucro || 0

  const receitaMes = operacoes
    .filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'recebido' &&
      (op.data_recebimento?.startsWith(mesAtual) || op.data?.startsWith(mesAtual)))
    .reduce((a, op) => a + Number(op.valor_total), 0)
  const faturasMesPagas = faturas
    .filter(f => f.pago && f.mes_referencia === mesAtual)
    .reduce((a, f) => a + Number(f.valor), 0)
  const comprasAVistaMes = operacoes
    .filter(op => (op.tipo === 'COMPRA' || op.tipo === 'TRANSF') && !op.cartao_id && op.data?.startsWith(mesAtual))
    .reduce((a, op) => a + Number(op.valor_total), 0)
  const lucroMes = receitaMes - (faturasMesPagas + comprasAVistaMes)
  const progressoMeta = metaLucro > 0 ? Math.min(100, Math.max(0, (lucroMes / metaLucro) * 100)) : 0

  // ── Vencimentos próximos ───────────────────────────────────────────────────
  const hoje = new Date()
  const vencimentos = cartoes.map(c => {
    let prox = new Date(hoje.getFullYear(), hoje.getMonth(), c.dia_vencimento)
    if (prox <= hoje) prox = addMonths(prox, 1)
    const proxMes = format(prox, 'yyyy-MM')
    const dias = differenceInDays(prox, hoje)
    const valorFatura = faturas
      .filter(f => !f.pago && f.cartao_id === c.id && f.mes_referencia === proxMes)
      .reduce((a, f) => a + Number(f.valor), 0)
    return { ...c, prox, proxMes, dias, valorFatura }
  }).filter(v => v.valorFatura > 0).sort((a, b) => a.dias - b.dias)

  // ── Alertas ─────────────────────────────────────────────────────────────────
  const alertas = vencimentos.filter(v => v.dias <= 3)

  // ── Chart data: últimos 6 meses ────────────────────────────────────────────
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = addMonths(new Date(), -(5 - i))
    const mes = format(d, 'yyyy-MM')
    const label = format(d, 'MMM', { locale: ptBR }).slice(0, 3)
    const receitas = operacoes
      .filter(op => op.tipo === 'VENDA' && op.data?.startsWith(mes))
      .reduce((a, op) => a + Number(op.valor_total), 0)
    const custos = operacoes
      .filter(op => op.tipo === 'COMPRA' && op.data?.startsWith(mes))
      .reduce((a, op) => a + Number(op.valor_total), 0)
    const lucro = receitas - custos
    return { label, receitas, custos, lucro }
  })

  const handlePagar = async (cartaoId: string, mes: string, cartaoNome: string) => {
    const key = `${cartaoId}-${mes}`
    setPaying(key)
    try {
      await pagarParcelas(cartaoId, mes)
    } catch (e) {
      console.error(e)
    } finally {
      setPaying(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
        <p className="text-sm text-gray-400">Visão geral do seu portfólio de milhas em tempo real.</p>
      </div>

      {/* Alert banner */}
      {alertas.length > 0 && (
        <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-danger font-semibold text-sm">⚠ Faturas vencendo em breve!</p>
            {alertas.map(v => (
              <p key={v.id} className="text-danger/80 text-xs mt-0.5">
                {v.nome}: {formatCurrency(v.valorFatura)} vence em {v.dias === 0 ? 'hoje' : `${v.dias} dias`} ({format(v.prox, 'dd/MM')})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total de Milhas"
          value={`${formatNumber(totalMilhas)} mi`}
          icon={<Wallet className="h-5 w-5 text-accent" />}
          borderColor="border-l-accent"
        />
        <MetricCard
          title="Lucro Realizado"
          value={formatCurrency(lucroRealizado)}
          icon={<TrendingUp className={`h-5 w-5 ${lucroRealizado >= 0 ? 'text-success' : 'text-danger'}`} />}
          borderColor={lucroRealizado >= 0 ? 'border-l-success' : 'border-l-danger'}
          trend={lucroRealizado >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="A Receber (Pendente)"
          value={formatCurrency(aReceber)}
          icon={<CalendarDays className="h-5 w-5 text-blue-400" />}
          borderColor="border-l-blue-400"
        />
        <MetricCard
          title="Faturas Abertas"
          value={formatCurrency(aPagarFaturas)}
          icon={<CreditCard className="h-5 w-5 text-danger" />}
          borderColor="border-l-danger"
        />
        <MetricCard
          title="ROI Médio"
          value={`${roiMedio.toFixed(1)}%`}
          icon={<BarChart3 className={`h-5 w-5 ${roiMedio >= 20 ? 'text-success' : 'text-warning'}`} />}
          borderColor={roiMedio >= 20 ? 'border-l-success' : 'border-l-warning'}
          trend={roiMedio >= 20 ? 'up' : 'down'}
        />
        <MetricCard
          title="CPM Médio (mês)"
          value={cpmMedio > 0 ? `R$${cpmMedio.toFixed(2)}/mil` : '—'}
          icon={<Target className={`h-5 w-5 ${cpmMedio < 18 ? 'text-success' : cpmMedio < 25 ? 'text-warning' : 'text-danger'}`} />}
          borderColor={cpmMedio < 18 ? 'border-l-success' : cpmMedio < 25 ? 'border-l-warning' : 'border-l-danger'}
        />
      </div>

      {/* Meta Progress */}
      {metaAtual && (
        <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-300 font-medium">🎯 Meta — {format(new Date(mesAtual + '-01'), 'MMMM yyyy', { locale: ptBR })}</span>
            <span className="text-sm font-bold text-accent">{progressoMeta.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-bgDark rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${progressoMeta >= 100 ? 'bg-success' : progressoMeta >= 50 ? 'bg-accent' : 'bg-warning'}`}
              style={{ width: `${progressoMeta}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-500">Lucro atual: {formatCurrency(lucroMes)}</span>
            <span className="text-xs text-gray-500">Meta: {formatCurrency(metaLucro)}</span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BarChart */}
        <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
          <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Lucro por Mês (últimos 6)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}
                formatter={(v) => [formatCurrency(Number(v)), '']}
                labelStyle={{ color: '#d4af37' }}
              />
              <Bar dataKey="lucro" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.lucro >= 0 ? '#16a34a' : '#dc2626'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* LineChart */}
        <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
          <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Receitas vs Custos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}
                formatter={(v) => [formatCurrency(Number(v)), '']}
                labelStyle={{ color: '#d4af37' }}
              />
              <Line type="monotone" dataKey="receitas" stroke="#16a34a" strokeWidth={2} dot={false} name="Receitas" />
              <Line type="monotone" dataKey="custos" stroke="#dc2626" strokeWidth={2} dot={false} name="Custos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vencimentos Próximos */}
      {vencimentos.length > 0 && (
        <div className="bg-surfaceDark rounded-2xl border border-borderDark overflow-hidden">
          <div className="p-5 border-b border-borderDark">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">📅 Vencimentos Próximos</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderDark bg-bgDark/50">
                  <th className="px-5 py-3 text-left">Cartão</th>
                  <th className="px-5 py-3 text-left">Vencimento</th>
                  <th className="px-5 py-3 text-left">Dias</th>
                  <th className="px-5 py-3 text-right">Valor</th>
                  <th className="px-5 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                {vencimentos.map(v => {
                  const key = `${v.id}-${v.proxMes}`
                  const isPaying = paying === key
                  const urgente = v.dias <= 3
                  return (
                    <tr key={v.id} className="border-b border-borderDark/50 hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{v.nome}</td>
                      <td className="px-5 py-4 text-gray-300">{format(v.prox, 'dd/MM/yyyy')}</td>
                      <td className="px-5 py-4">
                        <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${urgente ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                          {v.dias === 0 ? 'HOJE' : `${v.dias}d`}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-white">{formatCurrency(v.valorFatura)}</td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handlePagar(v.id, v.proxMes, v.nome)}
                          disabled={isPaying}
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {isPaying ? 'Pagando...' : 'Pagar'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark text-sm">
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs border-b border-borderDark pb-2">Status do Mês Atual</h3>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Receitas Recebidas</span>
            <span className="font-semibold text-success">{formatCurrency(receitaMes)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Saídas (Faturas + Compras)</span>
            <span className="font-semibold text-danger">({formatCurrency(faturasMesPagas + comprasAVistaMes)})</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-300 font-bold">Resultado do Mês</span>
            <span className={`font-bold ${lucroMes >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(lucroMes)}</span>
          </div>
        </div>
        <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark text-sm">
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-xs border-b border-borderDark pb-2">Projeção Global</h3>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Total a Receber (Pendente)</span>
            <span className="font-semibold text-blue-400">{formatCurrency(aReceber)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-white/5">
            <span className="text-gray-400">Total a Pagar (Faturas)</span>
            <span className="font-semibold text-danger">({formatCurrency(aPagarFaturas)})</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-300 font-bold">Patrimônio Estimado</span>
            <span className="font-bold text-accent">{formatCurrency(patrimonioEstimado)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
