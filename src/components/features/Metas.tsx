'use client'

import * as React from 'react'
import { Meta, Operacao } from '@/src/types'
import { salvarMeta } from '@/src/app/actions'
import { format, getDaysInMonth, getDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Target } from 'lucide-react'
import { Button } from '../ui/Button'

interface MetasProps { metas: Meta[]; operacoes: Operacao[] }
const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

function calcLucroMes(mes: string, ops: Operacao[]): number {
    const v = ops.filter(o => o.tipo === 'VENDA' && o.status_recebimento === 'recebido' && o.data?.startsWith(mes)).reduce((a, o) => a + Number(o.valor_total), 0)
    const c = ops.filter(o => (o.tipo === 'COMPRA' || o.tipo === 'TRANSF') && o.data?.startsWith(mes)).reduce((a, o) => a + Number(o.valor_total), 0)
    return v - c
}
function calcVolMes(mes: string, ops: Operacao[]): number {
    return ops.filter(o => (o.tipo === 'COMPRA' || o.tipo === 'VENDA') && o.data?.startsWith(mes)).reduce((a, o) => a + Number(o.quantidade), 0)
}

export function Metas({ metas, operacoes }: MetasProps) {
    const mesAt = format(new Date(), 'yyyy-MM')
    const [mes, setMes] = React.useState(mesAt)
    const [mL, setML] = React.useState('')
    const [mV, setMV] = React.useState('')
    const [ld, setLd] = React.useState(false)
    const me = metas.find(m => m.mes === mes)

    React.useEffect(() => {
        if (me) { setML(String(me.meta_lucro)); setMV(String(me.meta_volume_milhas)) } else { setML(''); setMV('') }
    }, [mes, me?.id])

    const save = async (e: React.FormEvent) => { e.preventDefault(); setLd(true); try { await salvarMeta(mes, parseFloat(mL) || 0, parseFloat(mV) || 0) } catch (err) { console.error(err) } finally { setLd(false) } }

    const hist = metas.map(m => {
        const lr = calcLucroMes(m.mes, operacoes), vr = calcVolMes(m.mes, operacoes)
        return { ...m, lr, vr, pl: m.meta_lucro > 0 ? (lr / m.meta_lucro) * 100 : 0, pv: m.meta_volume_milhas > 0 ? (vr / m.meta_volume_milhas) * 100 : 0 }
    }).sort((a, b) => b.mes.localeCompare(a.mes))

    const lucroAt = calcLucroMes(mesAt, operacoes)
    const dp = getDate(new Date()), dm = getDaysInMonth(new Date())
    const proj = dp > 0 ? (lucroAt / dp) * dm : 0
    const mAt = metas.find(m => m.mes === mesAt)
    const pAt = mAt?.meta_lucro ? Math.min(100, Math.max(0, (lucroAt / mAt.meta_lucro) * 100)) : 0
    const iCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div><p className="field-label mb-1">Planejamento</p><h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2"><Target className="text-accent w-7 h-7" /> Metas</h1></div>

            {mAt && (
                <div className="card p-5 animate-fadeInUp">
                    <h2 className="field-label mb-3">📊 Progresso — {format(new Date(mesAt + '-01'), 'MMMM yyyy', { locale: ptBR })}</h2>
                    <div className="flex justify-between text-sm mb-1.5"><span className="text-gray-500">Lucro</span><span className={`font-black tabular ${lucroAt >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(lucroAt)} / {fmtCur(mAt.meta_lucro)}</span></div>
                    <div className="w-full bg-gray-100 dark:bg-white/5 rounded-full h-2.5"><div className={`h-2.5 rounded-full transition-all ${pAt >= 100 ? 'bg-success' : pAt >= 50 ? 'bg-accent' : 'bg-warning'}`} style={{ width: `${pAt}%` }} /></div>
                    <p className="text-[11px] text-gray-500 mt-2">💡 Ritmo: encerrará com <span className={proj >= mAt.meta_lucro ? 'text-success font-black' : 'text-warning font-black'}>{fmtCur(proj)}</span></p>
                </div>
            )}

            <div className="card p-6"><h2 className="field-label mb-4">Definir Meta</h2>
                <form onSubmit={save}><div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="field-label">Mês</label><input type="month" value={mes} onChange={e => setMes(e.target.value)} className={iCls} /></div>
                    <div><label className="field-label">Meta Lucro (R$)</label><input type="number" value={mL} onChange={e => setML(e.target.value)} className={iCls} placeholder="0.00" step="0.01" /></div>
                    <div><label className="field-label">Meta Volume</label><input type="number" value={mV} onChange={e => setMV(e.target.value)} className={iCls} placeholder="0" /></div>
                </div><div className="mt-5"><Button variant="primary" size="lg" loading={ld} type="submit">💾 Salvar</Button></div></form>
            </div>

            {hist.length > 0 && (
                <div className="card overflow-hidden"><div className="px-6 py-4 border-b border-gray-100 dark:border-borderDark"><h2 className="field-label mb-0">Histórico</h2></div>
                    <div className="overflow-x-auto"><table className="w-full min-w-[600px]"><thead><tr className="border-b border-gray-100 dark:border-borderDark">
                        {['Mês', 'Meta', 'Real', '%', 'Vol Meta', 'Vol Real', '%'].map(h => <th key={h} className="field-label px-4 py-3 font-bold mb-0 text-right first:text-left">{h}</th>)}
                    </tr></thead><tbody>{hist.map(m => (
                        <tr key={m.id} className="border-b border-gray-50 dark:border-borderDark/50 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white capitalize">{format(new Date(m.mes + '-01'), 'MMM/yy', { locale: ptBR })}</td>
                            <td className="px-4 py-3.5 text-right text-sm text-gray-500 tabular">{fmtCur(m.meta_lucro)}</td>
                            <td className={`px-4 py-3.5 text-right text-sm font-black tabular ${m.lr >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(m.lr)}</td>
                            <td className={`px-4 py-3.5 text-right text-xs font-black tabular ${m.pl >= 100 ? 'text-success' : 'text-danger'}`}>{m.pl.toFixed(0)}%</td>
                            <td className="px-4 py-3.5 text-right text-sm text-gray-500 tabular">{Math.floor(m.meta_volume_milhas).toLocaleString('pt-BR')}</td>
                            <td className="px-4 py-3.5 text-right text-sm text-gray-500 tabular">{Math.floor(m.vr).toLocaleString('pt-BR')}</td>
                            <td className={`px-4 py-3.5 text-right text-xs font-black tabular ${m.pv >= 100 ? 'text-success' : 'text-danger'}`}>{m.pv.toFixed(0)}%</td>
                        </tr>
                    ))}</tbody></table></div></div>
            )}
        </div>
    )
}
