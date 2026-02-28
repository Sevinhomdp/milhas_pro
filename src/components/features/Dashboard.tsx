'use client'

import * as React from 'react'
import { ProgramaSaldo, Operacao, FaturaParcela, Cartao, Meta } from '@/src/types'
import { MetricCard } from '../ui/MetricCard'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
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

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const fmtNum = (v: number) => Math.floor(v).toLocaleString('pt-BR')

export function Dashboard({ saldos, operacoes, faturas, cartoes, metas }: DashboardProps) {
  const [paying, setPaying] = React.useState<string | null>(null)

  const totalMilhas = saldos.reduce((acc, s) => acc + Number(s.saldo_atual), 0)
  const patrimonioEstimado = saldos.reduce((acc, s) => acc + (Number(s.saldo_atual) * Number(s.custo_medio)) / 1000, 0)

  const vendas = operacoes.filter(op => op.tipo === 'VENDA')
  const vendasRecebidas = vendas.filter(op => op.status_recebimento === 'recebido').reduce((a, op) => a + Number(op.valor_total), 0)
  const faturasPagas = faturas.filter(f => f.pago).reduce((a, f) => a + Number(f.valor), 0)
  const comprasAVista = operacoes.filter(op => (op.tipo === 'COMPRA' || op.tipo === 'TRANSF') && !op.cartao_id).reduce((a, op) => a + Number(op.valor_total), 0)
  const lucroRealizado = vendasRecebidas - (faturasPagas + comprasAVista)

  const aReceber = operacoes.filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'pendente').reduce((a, op) => a + Number(op.valor_total), 0)
  const aPagarFaturas = faturas.filter(f => !f.pago).reduce((a, f) => a + Number(f.valor), 0)

  const vendasComRoi = operacoes.filter(op => op.tipo === 'VENDA' && op.roi != null)
  const roiMedio = vendasComRoi.length > 0 ? vendasComRoi.reduce((a, op) => a + (Number(op.roi) || 0), 0) / vendasComRoi.length : 0

  const mesAtual = format(new Date(), 'yyyy-MM')
  const comprasMes = operacoes.filter(op => op.tipo === 'COMPRA' && op.data?.startsWith(mesAtual))
  const cpmMedio = comprasMes.length > 0 ? comprasMes.reduce((a, op) => a + (Number(op.cpm) || 0), 0) / comprasMes.length : 0

  const metaAtual = metas.find(m => m.mes === mesAtual)
  const metaLucro = metaAtual?.meta_lucro || 0
  const receitaMes = operacoes.filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'recebido' && (op.data_recebimento?.startsWith(mesAtual) || op.data?.startsWith(mesAtual))).reduce((a, op) => a + Number(op.valor_total), 0)
  const faturasMesPagas = faturas.filter(f => f.pago && f.mes_referencia === mesAtual).reduce((a, f) => a + Number(f.valor), 0)
  const comprasAVistaMes = operacoes.filter(op => (op.tipo === 'COMPRA' || op.tipo === 'TRANSF') && !op.cartao_id && op.data?.startsWith(mesAtual)).reduce((a, op) => a + Number(op.valor_total), 0)
  const lucroMes = receitaMes - (faturasMesPagas + comprasAVistaMes)
  const progressoMeta = metaLucro > 0 ? Math.min(100, Math.max(0, (lucroMes / metaLucro) * 100)) : 0

  const hoje = new Date()
  const vencimentos = cartoes.map(c => {
    let prox = new Date(hoje.getFullYear(), hoje.getMonth(), c.dia_vencimento)
    if (prox <= hoje) prox = addMonths(prox, 1)
    const proxMes = format(prox, 'yyyy-MM')
    const dias = differenceInDays(prox, hoje)
    const valorFatura = faturas.filter(f => !f.pago && f.cartao_id === c.id && f.mes_referencia === proxMes).reduce((a, f) => a + Number(f.valor), 0)
    return { ...c, prox, proxMes, dias, valorFatura }
  }).filter(v => v.valorFatura > 0).sort((a, b) => a.dias - b.dias)

  const alertas = vencimentos.filter(v => v.dias <= 3)

  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = addMonths(new Date(), -(5 - i))
    const mes = format(d, 'yyyy-MM')
    const label = format(d, 'MMM', { locale: ptBR }).slice(0, 3)
    const receitas = operacoes.filter(op => op.tipo === 'VENDA' && op.data?.startsWith(mes)).reduce((a, op) => a + Number(op.valor_total), 0)
    const custos = operacoes.filter(op => op.tipo === 'COMPRA' && op.data?.startsWith(mes)).reduce((a, op) => a + Number(op.valor_total), 0)
    return { label, receitas, custos, lucro: receitas - custos }
  })

  const handlePagar = async (cartaoId: string, mes: string) => {
    setPaying(`${cartaoId}-${mes}`)
    try { await pagarParcelas(cartaoId, mes) } catch (e) { console.error(e) } finally { setPaying(null) }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="field-label mb-1">Dashboard</p>
          <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">
            Portfólio de Milhas
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            Atualizado agora · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </p>
        </div>
      </div>

      {/* Alert */}
      {alertas.length > 0 && (
        <div className="card border-l-4 border-l-red-500 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-danger mt-0.5 shrink-0" />
          <div>
            <p className="text-danger font-bold text-sm">Faturas vencendo em breve</p>
            {alertas.map(v => (
              <p key={v.id} className="text-danger/80 text-xs mt-0.5">
                {v.nome}: {fmtCur(v.valorFatura)} vence {v.dias === 0 ? 'hoje' : `em ${v.dias} dias`} ({format(v.prox, 'dd/MM')})
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 stagger-children">
        <MetricCard title="Total de Milhas" value={fmtNum(totalMilhas)} suffix="mi" accentColor="blue" animationDelay={0} icon={<Wallet className="h-4 w-4" />} />
        <MetricCard title="Lucro Realizado" value={fmtCur(lucroRealizado)} accentColor={lucroRealizado >= 0 ? "green" : "red"} trend={lucroRealizado >= 0 ? "up" : "down"} animationDelay={60} icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard title="A Receber" value={fmtCur(aReceber)} accentColor="orange" animationDelay={120} icon={<CalendarDays className="h-4 w-4" />} />
        <MetricCard title="Faturas Abertas" value={fmtCur(aPagarFaturas)} accentColor="red" animationDelay={180} icon={<CreditCard className="h-4 w-4" />} />
        <MetricCard title="ROI Médio" value={`${roiMedio.toFixed(1)}%`} accentColor={roiMedio >= 20 ? "green" : "orange"} trend={roiMedio >= 20 ? "up" : "down"} animationDelay={240} icon={<BarChart3 className="h-4 w-4" />} />
        <MetricCard title="CPM Médio" value={cpmMedio > 0 ? `R$${cpmMedio.toFixed(2)}` : '—'} suffix={cpmMedio > 0 ? "/mil" : ""} accentColor={cpmMedio < 18 ? "green" : cpmMedio < 25 ? "orange" : "red"} animationDelay={300} icon={<Target className="h-4 w-4" />} />
      </div>

      {/* Meta Progress */}
      {metaAtual && (
        <div className="card p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="field-label mb-0">🎯 Meta — {format(new Date(mesAtual + '-01'), 'MMMM yyyy', { locale: ptBR })}</span>
            <span className="text-sm font-black text-accent tabular">{progressoMeta.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5">
            <div className={`h-2.5 rounded-full transition-all duration-500 ${progressoMeta >= 100 ? 'bg-success' : progressoMeta >= 50 ? 'bg-accent' : 'bg-warning'}`} style={{ width: `${progressoMeta}%` }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-gray-500 tabular">Atual: {fmtCur(lucroMes)}</span>
            <span className="text-[11px] text-gray-500 tabular">Meta: {fmtCur(metaLucro)}</span>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="field-label mb-4">Lucro por Mês (últimos 6)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0c1425', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }} formatter={(v) => [fmtCur(Number(v)), '']} labelStyle={{ color: '#d4af37' }} />
              <Bar dataKey="lucro" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.lucro >= 0 ? '#16a34a' : '#dc2626'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-6">
          <h3 className="field-label mb-4">Receitas vs Custos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ background: '#0c1425', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }} formatter={(v) => [fmtCur(Number(v)), '']} labelStyle={{ color: '#d4af37' }} />
              <Line type="monotone" dataKey="receitas" stroke="#16a34a" strokeWidth={2} dot={false} name="Receitas" />
              <Line type="monotone" dataKey="custos" stroke="#dc2626" strokeWidth={2} dot={false} name="Custos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vencimentos */}
      {vencimentos.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-borderDark">
            <h3 className="field-label mb-0">📅 Vencimentos Próximos</h3>
          </div>
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-surfaceDark to-transparent z-10 sm:hidden" />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-borderDark">
                    <th className="field-label px-5 py-3 text-left font-bold mb-0">Cartão</th>
                    <th className="field-label px-5 py-3 text-left font-bold mb-0">Vencimento</th>
                    <th className="field-label px-5 py-3 text-left font-bold mb-0">Dias</th>
                    <th className="field-label px-5 py-3 text-right font-bold mb-0">Valor</th>
                    <th className="field-label px-5 py-3 text-right font-bold mb-0">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {vencimentos.map(v => {
                    const key = `${v.id}-${v.proxMes}`
                    return (
                      <tr key={v.id} className="border-b border-gray-50 dark:border-borderDark/50 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors duration-100">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{v.nome}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-300">{format(v.prox, 'dd/MM/yyyy')}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={v.dias <= 3 ? 'danger' : 'warning'}>{v.dias === 0 ? 'HOJE' : `${v.dias}d`}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right font-black text-sm text-gray-900 dark:text-white tabular">{fmtCur(v.valorFatura)}</td>
                        <td className="px-5 py-3.5 text-right">
                          <Button variant="success" size="sm" loading={paying === key} onClick={() => handlePagar(v.id, v.proxMes)} icon={<CheckCircle className="w-3 h-3" />}>
                            Pagar
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 text-sm">
          <h3 className="field-label mb-4 pb-2 border-b border-gray-100 dark:border-borderDark">Status do Mês Atual</h3>
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-white/5">
            <span className="text-gray-500">Receitas Recebidas</span>
            <span className="font-bold text-success tabular">{fmtCur(receitaMes)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-white/5">
            <span className="text-gray-500">Saídas (Faturas + Compras)</span>
            <span className="font-bold text-danger tabular">({fmtCur(faturasMesPagas + comprasAVistaMes)})</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300 font-bold">Resultado do Mês</span>
            <span className={`font-black tabular ${lucroMes >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(lucroMes)}</span>
          </div>
        </div>
        <div className="card p-5 text-sm">
          <h3 className="field-label mb-4 pb-2 border-b border-gray-100 dark:border-borderDark">Projeção Global</h3>
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-white/5">
            <span className="text-gray-500">Total a Receber</span>
            <span className="font-bold text-blue-400 tabular">{fmtCur(aReceber)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50 dark:border-white/5">
            <span className="text-gray-500">Total a Pagar (Faturas)</span>
            <span className="font-bold text-danger tabular">({fmtCur(aPagarFaturas)})</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300 font-bold">Patrimônio Estimado</span>
            <span className="font-black text-accent tabular">{fmtCur(patrimonioEstimado)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
