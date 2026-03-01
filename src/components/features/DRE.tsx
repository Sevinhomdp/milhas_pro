'use client'

import * as React from 'react'
import { Operation, Meta, Database } from '@/src/types'
import { format, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { BarChart3, Info } from 'lucide-react'

interface DREProps {
    db: Database
    theme?: 'light' | 'dark'
}

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function DRE({ db }: DREProps) {
    const { operacoes, metas } = db

    const ultimosMeses = Array.from({ length: 6 }, (_, i) => format(subMonths(new Date(), i), 'yyyy-MM')).reverse()

    const calcMes = (m: string) => {
        const ops = operacoes.filter(op => op.date?.startsWith(m))
        const compras = ops.filter(op => op.type === 'compra').reduce((acc, op) => acc + (op.value + (op.fees || 0)), 0)
        const vendas = ops.filter(op => op.type === 'venda').reduce((acc, op) => acc + (op.value - (op.fees || 0)), 0)
        const meta = metas.find(mt => mt.mes === m)

        const lucro = vendas - compras
        const margem = vendas > 0 ? (lucro / vendas) * 100 : 0
        const volume = ops.filter(op => op.type === 'venda').reduce((acc, op) => acc + op.quantity, 0)

        // ROI de 20% sobre as compras do mês (exemplo simplificado)
        const imposto = lucro > 0 ? lucro * 0.15 : 0 // 15% sobre lucro (exemplo)

        return { mes: m, compras, vendas, lucro, margem, volume, meta, imposto }
    }

    const report = ultimosMeses.map(m => calcMes(m))
    const totalLucro = report.reduce((acc, r) => acc + r.lucro, 0)
    const totalVendas = report.reduce((acc, r) => acc + r.vendas, 0)

    const chartData = report.map(r => ({
        name: format(new Date(r.mes + '-01T12:00:00'), 'MMM/yy', { locale: ptBR }),
        Lucro: r.lucro,
        Margem: r.margem
    }))

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Resultado Financeiro</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                        DRE Consolidado
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">Visão de competência dos últimos 6 meses de operação.</p>
                </div>

                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-3xl shadow-sm">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Lucro Acumulado (6m)</p>
                        <p className="text-xl font-black text-green-500 tabular">{fmtCur(totalLucro)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 size={16} className="text-amber-500" /> Evolução Mensal
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888822" />
                                <XAxis dataKey="name" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                <YAxis fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} tickFormatter={v => `R$${v / 1000}k`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(212,175,55,0.05)' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="Lucro" radius={[6, 6, 0, 0]}>
                                    {chartData.map((e, i) => (
                                        <Cell key={i} fill={e.Lucro > 0 ? '#10b981' : '#ef4444'} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Saúde da Operação</h3>
                    <div className="space-y-6 flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400">Volume de Vendas</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{totalVendas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400">Margem Média</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{(totalVendas > 0 ? (totalLucro / totalVendas) * 100 : 0).toFixed(1)}%</span>
                        </div>
                        <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10 mt-auto">
                            <div className="flex items-center gap-2 text-amber-500 mb-2">
                                <Info size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Atenção Fiscal</span>
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                                Operações acima de <span className="text-slate-900 dark:text-white font-black">R$ 35.000,00</span> por CPF podem estar sujeitas à tributação de ganho de capital. Consulte as regras vigentes da RFB.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Mês</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Vendas</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Compras</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Resultado</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Margem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
                        {report.map(r => (
                            <tr key={r.mes} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white uppercase">
                                    {format(new Date(r.mes + '-01T12:00:00'), 'MMMM yyyy', { locale: ptBR })}
                                </td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-500 tabular">{fmtCur(r.vendas)}</td>
                                <td className="px-6 py-4 text-xs font-bold text-slate-500 tabular">{fmtCur(r.compras)}</td>
                                <td className={`px-6 py-4 text-sm font-black text-right tabular ${r.lucro >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {fmtCur(r.lucro)}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${r.margem >= 15 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                        {r.margem.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
