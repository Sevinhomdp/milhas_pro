'use client'

import * as React from 'react'
import { Operacao, Meta } from '@/src/types'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { BarChart3 } from 'lucide-react'

interface DREProps { operacoes: Operacao[]; metas: Meta[] }
const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function DRE({ operacoes, metas }: DREProps) {
    const meses = Array.from({ length: 12 }, (_, i) => format(subMonths(new Date(), 11 - i), 'yyyy-MM'))
    const mesAtual = format(new Date(), 'yyyy-MM')
    const [mesSel, setMesSel] = React.useState(mesAtual)

    const calcMes = (m: string) => {
        const opsM = operacoes.filter(o => o.data?.startsWith(m))
        const receita = opsM.filter(o => o.tipo === 'VENDA').reduce((a, o) => a + Number(o.valor_total), 0)
        const custo = opsM.filter(o => o.tipo === 'COMPRA' || o.tipo === 'TRANSF').reduce((a, o) => a + Number(o.valor_total), 0)
        const lucro = receita - custo
        const margem = receita > 0 ? (lucro / receita) * 100 : 0
        const compras = opsM.filter(o => o.tipo === 'COMPRA')
        const cpm = compras.length > 0 ? compras.reduce((a, o) => a + (Number(o.cpm) || 0), 0) / compras.length : 0
        const vendas = opsM.filter(o => o.tipo === 'VENDA')
        const cpv = vendas.length > 0 ? vendas.reduce((a, o) => a + ((Number(o.valor_total) / Number(o.quantidade)) * 1000 || 0), 0) / vendas.length : 0
        return { receita, custo, lucro, margem, cpm, cpv }
    }
    const sel = calcMes(mesSel)
    const meta = metas.find(m => m.mes === mesSel)
    const pctMeta = meta?.meta_lucro ? Math.min(100, Math.max(0, (sel.lucro / meta.meta_lucro) * 100)) : 0
    const chartData = meses.map(m => ({ label: format(new Date(m + '-01'), 'MMM', { locale: ptBR }), lucro: calcMes(m).lucro }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div><p className="field-label mb-1">Financeiro</p><h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 className="text-accent w-7 h-7" /> DRE Mensal</h1></div>
                <div className="flex gap-1 flex-wrap">
                    {meses.slice(-6).map(m => (
                        <button key={m} onClick={() => setMesSel(m)}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all duration-150 active:scale-95 capitalize ${mesSel === m ? 'bg-accent text-primary shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5'}`}>
                            {format(new Date(m + '-01'), 'MMM', { locale: ptBR })}
                        </button>
                    ))}
                </div>
            </div>

            {/* Mini-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
                <div className="card card-hover p-5 border-l-4 border-l-accent animate-fadeInUp"><p className="field-label mb-0">Margem</p><p className="text-2xl font-black mt-1 tabular text-gray-900 dark:text-white">{sel.margem.toFixed(1)}%</p></div>
                <div className="card card-hover p-5 border-l-4 border-l-blue-500 animate-fadeInUp" style={{ animationDelay: '60ms' }}><p className="field-label mb-0">CPM Médio</p><p className="text-2xl font-black mt-1 tabular text-gray-900 dark:text-white">R${sel.cpm.toFixed(2)}</p></div>
                <div className="card card-hover p-5 border-l-4 border-l-green-500 animate-fadeInUp" style={{ animationDelay: '120ms' }}><p className="field-label mb-0">CPV Médio</p><p className="text-2xl font-black mt-1 tabular text-gray-900 dark:text-white">R${sel.cpv.toFixed(2)}</p></div>
            </div>

            {/* DRE Table */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-borderDark"><h3 className="field-label mb-0">Demonstrativo — {format(new Date(mesSel + '-01'), 'MMMM yyyy', { locale: ptBR })}</h3></div>
                <div className="divide-y divide-gray-50 dark:divide-borderDark/50">
                    <div className="flex justify-between px-6 py-3.5"><span className="text-sm text-gray-600 dark:text-gray-300">📈 Receita (Vendas)</span><span className="text-sm font-black text-success tabular">{fmtCur(sel.receita)}</span></div>
                    <div className="flex justify-between px-6 py-3.5"><span className="text-sm text-gray-600 dark:text-gray-300">📉 Custo (Compras/Transf)</span><span className="text-sm font-black text-danger tabular">({fmtCur(sel.custo)})</span></div>
                    <div className="flex justify-between px-6 py-3.5 bg-gray-50/50 dark:bg-white/[0.02]"><span className="text-sm font-bold text-gray-900 dark:text-white">💰 Lucro Bruto</span><span className={`text-sm font-black tabular ${sel.lucro >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(sel.lucro)}</span></div>
                </div>
            </div>

            {/* Meta */}
            {meta && (
                <div className="card p-5">
                    <div className="flex justify-between items-center mb-2"><span className="field-label mb-0">🎯 Progresso da Meta</span><span className="text-sm font-black text-accent tabular">{pctMeta.toFixed(1)}%</span></div>
                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5"><div className={`h-2.5 rounded-full transition-all duration-500 ${pctMeta >= 100 ? 'bg-success' : pctMeta >= 50 ? 'bg-accent' : 'bg-warning'}`} style={{ width: `${pctMeta}%` }} /></div>
                    <div className="flex justify-between mt-1.5"><span className="text-[11px] text-gray-500 tabular">{fmtCur(sel.lucro)}</span><span className="text-[11px] text-gray-500 tabular">{fmtCur(meta.meta_lucro)}</span></div>
                </div>
            )}

            {/* Chart */}
            <div className="card p-6">
                <h3 className="field-label mb-4">Evolução do Lucro (12 meses)</h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip contentStyle={{ background: '#0c1425', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }} formatter={(v) => [fmtCur(Number(v)), 'Lucro']} labelStyle={{ color: '#d4af37' }} />
                        <Bar dataKey="lucro" radius={[4, 4, 0, 0]}>{chartData.map((e, i) => <Cell key={i} fill={e.lucro >= 0 ? '#16a34a' : '#dc2626'} />)}</Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
