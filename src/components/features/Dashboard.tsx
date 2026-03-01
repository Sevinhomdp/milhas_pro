'use client'

import * as React from 'react'
import { ProgramaSaldo, Operation, FaturaParcela, Cartao, Meta } from '@/src/types'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { format, addMonths, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Wallet, TrendingUp, CalendarDays, Target, CreditCard, BarChart3, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { pagarParcelas } from '@/src/app/actions'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell
} from 'recharts'

interface DashboardProps {
  saldos: ProgramaSaldo[]
  operacoes: Operation[]
  faturas: FaturaParcela[]
  cartoes: Cartao[]
  metas: Meta[]
}

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtNum = (v: number) => Math.floor(v).toLocaleString('pt-BR')

export function Dashboard({ saldos, operacoes, faturas, cartoes, metas }: DashboardProps) {
  const [paying, setPaying] = React.useState<string | null>(null)

  // System calculations
  const totalMilhas = saldos.reduce((acc: number, s: ProgramaSaldo) => {
    const saldo = s.usar_ajuste_manual && s.ajuste_manual !== null ? s.ajuste_manual : s.saldo_atual
    return acc + Number(saldo)
  }, 0)

  const vendas = operacoes.filter(op => op.type === 'venda')
  const vendasRecebidasVal = vendas.filter(op => op.status === 'recebido').reduce((a: number, op: Operation) => a + (Number(op.value) - Number(op.fees)), 0)

  const faturasPagasVal = faturas.filter(f => f.pago).reduce((a: number, f: FaturaParcela) => a + Number(f.valor), 0)
  const comprasEViasTaxas = operacoes.filter(op => (op.type === 'compra' || op.type === 'transferencia') && !op.cartao_id).reduce((a: number, op: Operation) => a + (Number(op.value) + Number(op.fees)), 0)

  const lucroRealizado = vendasRecebidasVal - (faturasPagasVal + comprasEViasTaxas)

  const aReceber = operacoes.filter(op => op.type === 'venda' && op.status === 'pendente').reduce((a: number, op: Operation) => a + (Number(op.value) - Number(op.fees)), 0)
  const aPagarFaturas = faturas.filter(f => !f.pago).reduce((a: number, f: FaturaParcela) => a + Number(f.valor), 0)

  // ROI real: para cada venda recebida, calcula (receita líquida - custo) / custo * 100
  // O custo é estimado via custo_medio do programa correspondente ao volume vendido.
  const vendasRecebidas = vendas.filter(op => op.status === 'recebido')
  const roiMedio = (() => {
    if (vendasRecebidas.length === 0) return 0
    let totalRoi = 0
    let count = 0
    vendasRecebidas.forEach(op => {
      const saldo = saldos.find(s => s.program_id === op.program_id)
      const custoMedio = saldo?.custo_medio ?? 0
      if (custoMedio > 0 && Number(op.quantity) > 0) {
        const custoTotal = (Number(op.quantity) / 1000) * custoMedio
        const receitaLiquida = Number(op.value) - Number(op.fees)
        const roi = ((receitaLiquida - custoTotal) / custoTotal) * 100
        totalRoi += roi
        count++
      }
    })
    return count > 0 ? totalRoi / count : 0
  })()

  const mesAtual = format(new Date(), 'yyyy-MM')
  const comprasMes = operacoes.filter(op => op.type === 'compra' && op.date?.startsWith(mesAtual))
  const cpmMedio = comprasMes.length > 0 ? comprasMes.reduce((a: number, op: Operation) => a + ((Number(op.value) + Number(op.fees)) / Number(op.quantity) * 1000), 0) / comprasMes.length : 0

  const metaAtual = metas.find(m => m.mes === mesAtual)
  const metaLucro = metaAtual?.meta_lucro || 0
  const receitaMes = operacoes.filter(op => op.type === 'venda' && op.status === 'recebido' && op.date?.startsWith(mesAtual)).reduce((a: number, op: Operation) => a + (Number(op.value) - Number(op.fees)), 0)
  const faturasMesPagas = faturas.filter(f => f.pago && f.mes_referencia === mesAtual).reduce((a: number, f: FaturaParcela) => a + Number(f.valor), 0)
  const comprasAVistaMes = operacoes.filter(op => (op.type === 'compra' || op.type === 'transferencia') && !op.cartao_id && op.date?.startsWith(mesAtual)).reduce((a: number, op: Operation) => a + (Number(op.value) + Number(op.fees)), 0)
  const lucroMes = receitaMes - (faturasMesPagas + comprasAVistaMes)
  const progressoMeta = metaLucro > 0 ? Math.min(100, Math.max(0, (lucroMes / metaLucro) * 100)) : 0

  const hoje = new Date()
  const vencimentos = cartoes.map(c => {
    let prox = new Date(hoje.getFullYear(), hoje.getMonth(), c.dia_vencimento)
    if (prox <= hoje) prox = addMonths(prox, 1)
    const proxMes = format(prox, 'yyyy-MM')
    const dias = differenceInDays(prox, hoje)
    const valorFatura = faturas.filter(f => !f.pago && f.cartao_id === c.id && f.mes_referencia === proxMes).reduce((a: number, f: FaturaParcela) => a + Number(f.valor), 0)
    return { ...c, prox, proxMes, dias, valorFatura }
  }).filter(v => v.valorFatura > 0).sort((a, b) => a.dias - b.dias)

  const alertas = vencimentos.filter(v => v.dias <= 3)

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = addMonths(new Date(), -(5 - i))
    const mes = format(d, 'yyyy-MM')
    const label = format(d, 'MMM', { locale: ptBR }).slice(0, 3)
    const receitas = operacoes.filter(op => op.type === 'venda' && op.date?.startsWith(mes)).reduce((a: number, op: Operation) => a + (Number(op.value) - Number(op.fees)), 0)
    const custos = operacoes.filter(op => (op.type === 'compra' || op.type === 'transferencia') && op.date?.startsWith(mes)).reduce((a: number, op: Operation) => a + (Number(op.value) + Number(op.fees)), 0)
    return { label, receitas, custos, lucro: receitas - custos }
  })

  const handlePagar = async (cartaoId: string, mes: string) => {
    const key = `${cartaoId}-${mes}`
    setPaying(key)
    try { await pagarParcelas(cartaoId, mes) } catch (e) { console.error(e) } finally { setPaying(null) }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-1.5">Visão Geral</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
            Dashboard Financeiro
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Dados consolidados de {operacoes.length} operações.
          </p>
        </div>

        {/* Dica Cloud Box */}
        <div className="hidden lg:flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 max-w-sm animate-fadeInUp">
          <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-500">Dica de Gestão</p>
            <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
              O lucro exibido considera o fluxo de caixa (Vendas Recebidas - Faturas Pagas - Compras à Vista). Acompanhe o ROI por operação na aba Lançamentos.
            </p>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alertas.length > 0 && (
        <div className="rounded-2xl bg-red-500/5 border border-red-500/10 border-l-4 border-l-red-500 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-red-500 font-bold text-sm">Atenção: Contas a pagar</p>
            {alertas.map(v => (
              <p key={v.id} className="text-red-500/80 text-xs mt-0.5">
                {v.nome}: {fmtCur(v.valorFatura)} vence {v.dias === 0 ? 'hoje' : `em ${v.dias} dias`} ({format(v.prox, 'dd/MM')})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
        <MetricCard title="Saldo Total" value={fmtNum(totalMilhas)} suffix="mil" accentColor="blue" animationDelay={0} icon={<Wallet className="h-4 w-4" />} />
        <MetricCard title="Lucro Líquido" value={fmtCur(lucroRealizado)} accentColor={lucroRealizado >= 0 ? "green" : "red"} trend={lucroRealizado >= 0 ? "up" : "down"} animationDelay={60} icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard title="A Receber" value={fmtCur(aReceber)} accentColor="orange" animationDelay={120} icon={<CalendarDays className="h-4 w-4" />} />
        <MetricCard title="Faturas" value={fmtCur(aPagarFaturas)} accentColor="red" animationDelay={180} icon={<CreditCard className="h-4 w-4" />} />
        <MetricCard title="ROI Médio" value={`${roiMedio.toFixed(1)}%`} accentColor={roiMedio >= 20 ? "green" : "orange"} trend={roiMedio >= 20 ? "up" : "down"} animationDelay={240} icon={<BarChart3 className="h-4 w-4" />} />
        <MetricCard title="CPM Compra" value={cpmMedio > 0 ? `R$${cpmMedio.toFixed(2)}` : '—'} suffix={cpmMedio > 0 ? "/mil" : ""} accentColor={cpmMedio < 18 ? "green" : cpmMedio < 25 ? "orange" : "red"} animationDelay={300} icon={<Target className="h-4 w-4" />} />
      </div>

      {/* Meta Progress */}
      {metaAtual && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500">🎯 Meta de Lucro — {format(new Date(mesAtual + '-01T12:00:00'), 'MMMM yyyy', { locale: ptBR })}</span>
            <span className="text-sm font-black text-amber-500 tabular">{progressoMeta.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5 overflow-hidden">
            <div className={`h-2.5 rounded-full transition-all duration-1000 ${progressoMeta >= 100 ? 'bg-green-500' : progressoMeta >= 50 ? 'bg-amber-500' : 'bg-orange-500'}`} style={{ width: `${progressoMeta}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[11px] text-gray-500 tabular">Faturado: {fmtCur(lucroMes)}</span>
            <span className="text-[11px] text-gray-500 tabular">Objetivo: {fmtCur(metaLucro)}</span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
          <h3 className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-4">Evolução Mensal (Receita Líquida)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }} formatter={(v) => [fmtCur(Number(v)), '']} labelStyle={{ color: '#d4af37' }} />
              <Bar dataKey="lucro" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.lucro >= 0 ? '#10b981' : '#ef4444'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-6">
          <h3 className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-4">Receitas vs Custos (Com Taxas)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }} formatter={(v) => [fmtCur(Number(v)), '']} labelStyle={{ color: '#d4af37' }} />
              <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={3} dot={false} name="Receita Líquida" />
              <Line type="monotone" dataKey="custos" stroke="#ef4444" strokeWidth={3} dot={false} name="Custo Total" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vencimentos */}
      {vencimentos.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-0">📅 Próximos Pagamentos</h3>
            <Badge variant="warning">{vencimentos.length} faturas abertas</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-3 text-left block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-0">Cartão</th>
                <th className="px-6 py-3 text-left block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-0">Vencimento</th>
                <th className="px-6 py-3 text-left block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-0">Dias</th>
                <th className="px-6 py-3 text-right block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-0">Valor</th>
                <th className="px-6 py-3 text-right block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-0">Ação</th>
              </tr></thead>
              <tbody>
                {vencimentos.map(v => {
                  const key = `${v.id}-${v.proxMes}`
                  return (
                    <tr key={v.id} className="border-b border-gray-50 dark:border-white/[0.02] hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">{v.nome}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{format(v.prox, 'dd/MM/yyyy')}</td>
                      <td className="px-6 py-4">
                        <Badge variant={v.dias <= 3 ? 'danger' : 'warning'}>{v.dias === 0 ? 'HOJE' : `em ${v.dias} dias`}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-sm text-gray-900 dark:text-white tabular">{fmtCur(v.valorFatura)}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="success" size="sm" loading={paying === key} onClick={() => handlePagar(v.id, v.proxMes)} icon={<CheckCircle className="w-3 h-3" />}>Pagar</Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
