'use client'

import * as React from 'react'
import { Meta, Operation, Database } from '@/src/types'
import { salvarMeta } from '@/src/app/actions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Target, TrendingUp, Info } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatCurrency, formatNumber, cn } from '@/src/lib/utils'

interface MetasProps {
    db: Database
    toast: (msg: string, type?: any) => void
    theme?: 'light' | 'dark'
}

export default function Metas({ db, toast }: MetasProps) {
    const { metas, operacoes } = db
    const mesAt = format(new Date(), 'yyyy-MM')
    const [mes, setMes] = React.useState(mesAt)
    const [mL, setML] = React.useState('')
    const [mV, setMV] = React.useState('')
    const [cpmC, setCpmC] = React.useState('')
    const [cpmV, setCpmV] = React.useState('')
    const [margem, setMargem] = React.useState('')
    const [ld, setLd] = React.useState(false)

    const me = metas.find(m => m.mes === mes)

    React.useEffect(() => {
        if (me) {
            setML(String(me.meta_lucro))
            setMV(String(me.meta_volume_milhas))
            setCpmC(me.cpm_compra_alvo ? String(me.cpm_compra_alvo) : '')
            setCpmV(me.cpm_venda_alvo ? String(me.cpm_venda_alvo) : '')
            setMargem(me.margem_desejada ? String(me.margem_desejada) : '')
        } else {
            setML(''); setMV(''); setCpmC(''); setCpmV(''); setMargem('')
        }
    }, [mes, me?.id])

    const save = async (e: React.FormEvent) => {
        e.preventDefault()
        setLd(true)
        try {
            await salvarMeta({
                mes,
                metaLucro: parseFloat(mL) || 0,
                metaVolume: parseFloat(mV) || 0,
                cpmCompra: parseFloat(cpmC) || undefined,
                cpmVenda: parseFloat(cpmV) || undefined,
                margem: parseFloat(margem) || undefined
            })
            toast('Metas salvas para ' + mes, 'success')
        } catch (err: any) {
            toast(err.message, 'error')
        } finally {
            setLd(false)
        }
    }

    const calcLucroMes = (m: string) => {
        // Simulação básica: vendas recebidas no mês
        return operacoes
            .filter(o => o.type === 'venda' && o.status === 'recebido' && o.date?.startsWith(m))
            .reduce((a, o) => a + (Number(o.value) - Number(o.fees)), 0)
    }

    const mAt = metas.find(m => m.mes === mesAt)
    const lucroAt = calcLucroMes(mesAt)
    const pAt = mAt?.meta_lucro ? Math.min(100, Math.max(0, (lucroAt / mAt.meta_lucro) * 100)) : 0

    const iCls = "w-full rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Planejamento Estratégico</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                        Performance & Metas
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">Defina seus objetivos e acompanhe sua evolução mensal.</p>
                </div>

                <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-3xl max-w-sm">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest leading-none mb-1">Dica Estratégica</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-bold">
                                CPM Alvo abaixo de R$15,00 e margem mínima de 20% é o padrão ouro.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {mAt && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm border-l-4 border-l-emerald-500">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lucro Atual (Mês)</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tabular mt-2">{formatCurrency(lucroAt)}</p>
                        <div className="mt-4 w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${pAt}%` }} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm border-l-4 border-l-amber-500">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">CPM Alvo Compra</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tabular mt-2">
                            {mAt.cpm_compra_alvo ? `R$ ${mAt.cpm_compra_alvo.toFixed(2)}` : 'N/A'}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm border-l-4 border-l-blue-500">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Margem Desejada</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tabular mt-2">
                            {mAt.margem_desejada ? `${mAt.margem_desejada}%` : 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm">
                <h2 className="text-sm font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Configurar Planejamento</h2>
                <form onSubmit={save}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Mês</label>
                            <input type="month" value={mes} onChange={e => setMes(e.target.value)} className={iCls} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Meta Lucro (R$)</label>
                            <input type="number" value={mL} onChange={e => setML(e.target.value)} className={iCls} placeholder="Ex: 2000" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Meta Vol. (mil)</label>
                            <input type="number" value={mV} onChange={e => setMV(e.target.value)} className={iCls} placeholder="Ex: 100" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">CPM Alvo (R$)</label>
                            <input type="number" value={cpmC} onChange={e => setCpmC(e.target.value)} className={iCls} placeholder="Ex: 14.50" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Margem (%)</label>
                            <input type="number" value={margem} onChange={e => setMargem(e.target.value)} className={iCls} placeholder="Ex: 25" />
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end">
                        <Button loading={ld} type="submit" size="lg" className="px-12 h-12 uppercase tracking-widest font-black text-xs">
                            Salvar Planejamento
                        </Button>
                    </div>
                </form>
            </div>

            {metas.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                    <div className="px-8 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.01]">
                        <h2 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Histórico de Performance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5">
                                    <th className="px-8 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Mês</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Meta Lucro</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">CPM Alvo</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Margem</th>
                                    <th className="px-8 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Volume (mil)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-white/[0.02]">
                                {metas.sort((a, b) => b.mes.localeCompare(a.mes)).map(m => (
                                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-4 text-xs font-black text-slate-900 dark:text-white uppercase">
                                            {format(new Date(m.mes + '-01T12:00:00'), 'MMMM yyyy', { locale: ptBR })}
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs font-bold text-emerald-500 tabular">
                                            {formatCurrency(m.meta_lucro)}
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs text-slate-500 font-bold tabular">
                                            {m.cpm_compra_alvo ? `R$ ${m.cpm_compra_alvo.toFixed(2)}` : '—'}
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs text-slate-500 font-bold tabular">
                                            {m.margem_desejada ? `${m.margem_desejada}%` : '—'}
                                        </td>
                                        <td className="px-8 py-4 text-right text-xs text-slate-500 font-bold tabular">
                                            {formatNumber(m.meta_volume_milhas)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
