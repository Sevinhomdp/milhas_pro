'use client'

import * as React from 'react'
import { Operacao, Meta } from '@/src/types'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

interface DREProps {
    operacoes: Operacao[]
    metas: Meta[]
}

function groupByMonth(ops: Operacao[]) {
    const map: Record<string, { receitas: number; custos: number; taxas: number; milhasCompradas: number; milhasVendidas: number }> = {}
    ops.forEach(op => {
        const mes = op.data?.substring(0, 7) ?? ''
        if (!mes) return
        if (!map[mes]) map[mes] = { receitas: 0, custos: 0, taxas: 0, milhasCompradas: 0, milhasVendidas: 0 }
        if (op.tipo === 'VENDA') {
            map[mes].receitas += Number(op.valor_total)
            map[mes].milhasVendidas += Number(op.quantidade)
        } else if (op.tipo === 'COMPRA') {
            map[mes].custos += Number(op.valor_total)
            map[mes].milhasCompradas += Number(op.quantidade)
        } else if (op.tipo === 'TRANSF') {
            map[mes].taxas += Number(op.valor_total)
        }
    })
    return map
}

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function DRE({ operacoes, metas }: DREProps) {
    const byMonthMap = React.useMemo(() => groupByMonth(operacoes), [operacoes])
    const meses = Object.keys(byMonthMap).sort().reverse()
    const [mesSel, setMesSel] = React.useState(meses[0] ?? '')

    const sel = byMonthMap[mesSel] ?? { receitas: 0, custos: 0, taxas: 0, milhasCompradas: 0, milhasVendidas: 0 }
    const lucro = sel.receitas - sel.custos - sel.taxas
    const margem = sel.receitas > 0 ? (lucro / sel.receitas) * 100 : 0
    const cpmMedio = sel.milhasCompradas > 0 ? (sel.custos / sel.milhasCompradas) * 1000 : 0
    const cpvMedio = sel.milhasVendidas > 0 ? (sel.receitas / sel.milhasVendidas) * 1000 : 0

    const metaMes = metas.find(m => m.mes === mesSel)
    const progressoMeta = metaMes?.meta_lucro ? Math.min(100, Math.max(0, (lucro / metaMes.meta_lucro) * 100)) : 0

    const chartData = Array.from({ length: 6 }, (_, i) => {
        const d = addMonths(new Date(), -(5 - i))
        const mes = format(d, 'yyyy-MM')
        const label = format(d, 'MMM', { locale: ptBR }).slice(0, 3)
        const m = byMonthMap[mes] ?? { receitas: 0, custos: 0, taxas: 0 }
        return { label, lucro: m.receitas - m.custos - m.taxas }
    })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">DRE Mensal</h1>
                <p className="text-sm text-gray-400">Demonstração de Resultados por mês.</p>
            </div>

            {meses.length === 0 ? (
                <div className="bg-surfaceDark rounded-2xl border border-borderDark p-10 text-center text-gray-500">Nenhuma operação lançada ainda.</div>
            ) : (
                <>
                    {/* Month Tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {meses.map(m => (
                            <button key={m} onClick={() => setMesSel(m)} className={`px-4 py-2 text-xs font-bold rounded-full transition-all ${mesSel === m ? 'bg-accent text-primary' : 'bg-surfaceDark border border-borderDark text-gray-400 hover:text-white'}`}>
                                {format(new Date(m + '-01'), 'MMM/yy', { locale: ptBR })}
                            </button>
                        ))}
                    </div>

                    {/* DRE Vertical */}
                    <div className="bg-surfaceDark rounded-2xl border border-borderDark overflow-hidden">
                        <div className="p-5 border-b border-borderDark flex items-center justify-between">
                            <h2 className="text-white font-bold">DRE – {format(new Date(mesSel + '-01'), 'MMMM yyyy', { locale: ptBR })}</h2>
                            <button onClick={() => window.print()} className="text-xs text-gray-400 hover:text-white px-3 py-1.5 border border-borderDark rounded-md transition">📄 Exportar PDF</button>
                        </div>
                        <div className="divide-y divide-borderDark">
                            {[
                                { label: '(+) Receitas de Venda', value: sel.receitas, positive: true },
                                { label: '(-) Custos de Compra', value: -sel.custos, positive: false },
                                { label: '(-) Taxas de Transferência', value: -sel.taxas, positive: false },
                            ].map(row => (
                                <div key={row.label} className="flex justify-between px-5 py-3.5">
                                    <span className="text-sm text-gray-400">{row.label}</span>
                                    <span className={`text-sm font-semibold ${row.positive ? 'text-success' : 'text-danger'}`}>{fmtCur(row.value)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between px-5 py-4 bg-bgDark/50">
                                <span className="text-sm font-bold text-white uppercase tracking-wide">══ Lucro Líquido</span>
                                <span className={`text-lg font-black ${lucro >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(lucro)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Mini-cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-surfaceDark rounded-xl border border-borderDark p-4 text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Margem Líquida</p>
                            <p className={`text-2xl font-black ${margem >= 20 ? 'text-success' : margem >= 10 ? 'text-warning' : 'text-danger'}`}>{margem.toFixed(1)}%</p>
                        </div>
                        <div className="bg-surfaceDark rounded-xl border border-borderDark p-4 text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CPM Médio (Compra)</p>
                            <p className={`text-2xl font-black ${cpmMedio < 18 ? 'text-success' : cpmMedio < 25 ? 'text-warning' : 'text-danger'}`}>R${cpmMedio.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">por mil milhas</p>
                        </div>
                        <div className="bg-surfaceDark rounded-xl border border-borderDark p-4 text-center">
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">CPV Médio (Venda)</p>
                            <p className={`text-2xl font-black ${cpvMedio > 30 ? 'text-success' : cpvMedio > 20 ? 'text-warning' : 'text-danger'}`}>R${cpvMedio.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">por mil milhas</p>
                        </div>
                    </div>

                    {/* Meta Progress */}
                    {metaMes && (
                        <div className="bg-surfaceDark rounded-xl border border-borderDark p-5">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-300">🎯 Meta do mês: {fmtCur(metaMes.meta_lucro)}</span>
                                <span className="text-accent font-bold text-sm">{progressoMeta.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-bgDark rounded-full h-2.5">
                                <div className={`h-2.5 rounded-full ${progressoMeta >= 100 ? 'bg-success' : 'bg-accent'}`} style={{ width: `${progressoMeta}%` }} />
                            </div>
                        </div>
                    )}

                    {/* Chart */}
                    <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                        <h3 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Evolução do Lucro (últimos 6 meses)</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={chartData} barCategoryGap="30%">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} />
                                <Tooltip
                                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}
                                    formatter={(v) => [fmtCur(Number(v)), 'Lucro']}
                                    labelStyle={{ color: '#d4af37' }}
                                />
                                <Bar dataKey="lucro" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, i) => <Cell key={i} fill={entry.lucro >= 0 ? '#16a34a' : '#dc2626'} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </>
            )}
        </div>
    )
}
