'use client'

import * as React from 'react'
import { Meta, Operation } from '@/src/types'
import { salvarMeta } from '@/src/app/actions'
import { format, getDaysInMonth, getDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Target, TrendingUp, BarChart3, Info } from 'lucide-react'
import { Button } from '../ui/Button'

interface MetasProps { metas: Meta[]; operacoes: Operation[] }
const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtNum = (v: number) => Math.floor(v).toLocaleString('pt-BR')

export function Metas({ metas, operacoes }: MetasProps) {
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
        } catch (err) {
            console.error(err)
        } finally {
            setLd(false)
        }
    }

    const calcLucroMes = (m: string) => {
        const v = operacoes.filter(o => o.type === 'venda' && o.status === 'recebido' && o.date?.startsWith(m)).reduce((a, o) => a + (Number(o.value) - Number(o.fees)), 0)
        // Note: This is an approximation. Real profit needs cost basis.
        // For the meta progress, we'll use the user's defined "Lucro" target.
        return v
    }

    const mAt = metas.find(m => m.mes === mesAt)
    const lucroAt = calcLucroMes(mesAt)
    const pAt = mAt?.meta_lucro ? Math.min(100, Math.max(0, (lucroAt / mAt.meta_lucro) * 100)) : 0

    const iCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="field-label mb-1">Planejamento</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Target className="text-accent w-7 h-7" /> Metas de Performance
                    </h1>
                </div>

                {/* Dica Cloud Box */}
                <div className="hidden lg:flex items-start gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10 max-w-sm animate-fadeInUp">
                    <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-accent">Dica de Estratégia</p>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            Definir um CPM Alvo de compra abaixo de R$15,00 e uma margem mínima de 20% é o padrão ouro para uma operação saudável e lucrativa.
                        </p>
                    </div>
                </div>
            </div>

            {mAt && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeInUp">
                    <div className="card p-5 border-l-4 border-l-success">
                        <p className="field-label mb-0">Lucro Atual (Mês)</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white tabular mt-1">{fmtCur(lucroAt)}</p>
                        <div className="mt-3 w-full bg-gray-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div className="h-full bg-success transition-all duration-500" style={{ width: `${pAt}%` }} />
                        </div>
                    </div>
                    <div className="card p-5 border-l-4 border-l-accent">
                        <p className="field-label mb-0">CPM Alvo Compra</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white tabular mt-1">
                            {mAt.cpm_compra_alvo ? `R$ ${mAt.cpm_compra_alvo.toFixed(2)}` : 'N/A'}
                        </p>
                    </div>
                    <div className="card p-5 border-l-4 border-l-blue-500">
                        <p className="field-label mb-0">Margem Desejada</p>
                        <p className="text-2xl font-black text-gray-900 dark:text-white tabular mt-1">
                            {mAt.margem_desejada ? `${mAt.margem_desejada}%` : 'N/A'}
                        </p>
                    </div>
                </div>
            )}

            <div className="card p-6">
                <h2 className="field-label mb-4">Configurar Metas do Mês</h2>
                <form onSubmit={save}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                        <div>
                            <label className="field-label">Mês</label>
                            <input type="month" value={mes} onChange={e => setMes(e.target.value)} className={iCls} />
                        </div>
                        <div>
                            <label className="field-label">Meta Lucro (R$)</label>
                            <input type="number" value={mL} onChange={e => setML(e.target.value)} className={iCls} placeholder="Ex: 2000" />
                        </div>
                        <div>
                            <label className="field-label">Meta Volume (milhas)</label>
                            <input type="number" value={mV} onChange={e => setMV(e.target.value)} className={iCls} placeholder="Ex: 100000" />
                        </div>
                        <div>
                            <label className="field-label">CPM Compra (R$)</label>
                            <input type="number" value={cpmC} onChange={e => setCpmC(e.target.value)} className={iCls} placeholder="Ex: 14.50" step="0.01" />
                        </div>
                        <div>
                            <label className="field-label">Margem (%)</label>
                            <input type="number" value={margem} onChange={e => setMargem(e.target.value)} className={iCls} placeholder="Ex: 25" />
                        </div>
                    </div>
                    <div className="mt-5">
                        <Button variant="primary" size="lg" loading={ld} type="submit">Atualizar Planejamento</Button>
                    </div>
                </form>
            </div>

            {metas.length > 0 && (
                <div className="card overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-borderDark">
                        <h2 className="field-label mb-0">Histórico de Performance</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-borderDark">
                                    <th className="field-label px-5 py-3 text-left font-bold mb-0">Mês</th>
                                    <th className="field-label px-5 py-3 text-right font-bold mb-0">Meta Lucro</th>
                                    <th className="field-label px-5 py-3 text-right font-bold mb-0">CPM Alvo</th>
                                    <th className="field-label px-5 py-3 text-right font-bold mb-0">Margem</th>
                                    <th className="field-label px-5 py-3 text-right font-bold mb-0">Volume</th>
                                </tr>
                            </thead>
                            <tbody>
                                {metas.sort((a, b) => b.mes.localeCompare(a.mes)).map(m => (
                                    <tr key={m.id} className="border-b border-gray-50 dark:border-borderDark/50 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-3.5 text-sm font-medium text-gray-900 dark:text-white capitalize">
                                            {format(new Date(m.mes + '-01T12:00:00'), 'MMMM yyyy', { locale: ptBR })}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm font-black text-success tabular">
                                            {fmtCur(m.meta_lucro)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm text-gray-500 tabular">
                                            {m.cpm_compra_alvo ? `R$ ${m.cpm_compra_alvo.toFixed(2)}` : '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm text-gray-500 tabular">
                                            {m.margem_desejada ? `${m.margem_desejada}%` : '—'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right text-sm text-gray-500 tabular">
                                            {fmtNum(m.meta_volume_milhas)}
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
