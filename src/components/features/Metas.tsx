'use client'

import * as React from 'react'
import { Meta, Operacao } from '@/src/types'
import { salvarMeta } from '@/src/app/actions'
import { format, getDaysInMonth, getDate } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Target, Loader2 } from 'lucide-react'

interface MetasProps {
    metas: Meta[]
    operacoes: Operacao[]
}

function calcLucroMes(mes: string, ops: Operacao[]): number {
    const vendas = ops.filter(o => o.tipo === 'VENDA' && o.status_recebimento === 'recebido' && o.data?.startsWith(mes))
        .reduce((a, o) => a + Number(o.valor_total), 0)
    const compras = ops.filter(o => (o.tipo === 'COMPRA' || o.tipo === 'TRANSF') && o.data?.startsWith(mes))
        .reduce((a, o) => a + Number(o.valor_total), 0)
    return vendas - compras
}

function calcVolumeMes(mes: string, ops: Operacao[]): number {
    return ops.filter(o => (o.tipo === 'COMPRA' || o.tipo === 'VENDA') && o.data?.startsWith(mes))
        .reduce((a, o) => a + Number(o.quantidade), 0)
}

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Metas({ metas, operacoes }: MetasProps) {
    const mesAtual = format(new Date(), 'yyyy-MM')
    const [mes, setMes] = React.useState(mesAtual)
    const [metaLucro, setMetaLucro] = React.useState('')
    const [metaVolume, setMetaVolume] = React.useState('')
    const [loading, setLoading] = React.useState(false)

    const metaExistente = metas.find(m => m.mes === mes)
    React.useEffect(() => {
        if (metaExistente) {
            setMetaLucro(String(metaExistente.meta_lucro))
            setMetaVolume(String(metaExistente.meta_volume_milhas))
        } else {
            setMetaLucro('')
            setMetaVolume('')
        }
    }, [mes, metaExistente?.id])

    const handleSalvar = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await salvarMeta(mes, parseFloat(metaLucro) || 0, parseFloat(metaVolume) || 0)
        } catch (err) { console.error(err) } finally { setLoading(false) }
    }

    // Metas + realizados para tabela
    const mesesComMeta = metas.map(m => {
        const lucroReal = calcLucroMes(m.mes, operacoes)
        const volReal = calcVolumeMes(m.mes, operacoes)
        const pctLucro = m.meta_lucro > 0 ? (lucroReal / m.meta_lucro) * 100 : 0
        const pctVol = m.meta_volume_milhas > 0 ? (volReal / m.meta_volume_milhas) * 100 : 0
        return { ...m, lucroReal, volReal, pctLucro, pctVol }
    }).sort((a, b) => b.mes.localeCompare(a.mes))

    // Ritmo atual (mês selecionado)
    const lucroMesAtual = calcLucroMes(mesAtual, operacoes)
    const diasPassados = getDate(new Date())
    const diasDoMes = getDaysInMonth(new Date())
    const projecaoRitmo = diasPassados > 0 ? (lucroMesAtual / diasPassados) * diasDoMes : 0
    const metaAtual = metas.find(m => m.mes === mesAtual)
    const progressoAtual = metaAtual?.meta_lucro ? Math.min(100, Math.max(0, (lucroMesAtual / metaAtual.meta_lucro) * 100)) : 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2"><Target className="text-accent w-6 h-6" /> Metas</h1>
                <p className="text-sm text-gray-400">Defina e acompanhe suas metas mensais de lucro e volume.</p>
            </div>

            {/* Progresso mês atual */}
            {metaAtual && (
                <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                    <h2 className="text-white font-bold mb-4">📊 Progresso — {format(new Date(mesAtual + '-01'), 'MMMM yyyy', { locale: ptBR })}</h2>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-400">Lucro Realizado</span>
                                <span className={`font-bold ${lucroMesAtual >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(lucroMesAtual)} / {fmtCur(metaAtual.meta_lucro)}</span>
                            </div>
                            <div className="w-full bg-bgDark rounded-full h-3">
                                <div className={`h-3 rounded-full transition-all ${progressoAtual >= 100 ? 'bg-success' : progressoAtual >= 50 ? 'bg-accent' : 'bg-warning'}`} style={{ width: `${progressoAtual}%` }} />
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{progressoAtual.toFixed(1)}%</div>
                        </div>
                        <div className="p-3 bg-bgDark rounded-xl text-sm border border-borderDark">
                            💡 <strong className="text-accent">Ritmo atual:</strong>{' '}
                            <span className="text-gray-300">
                                No ritmo de {diasPassados} dias passados, você encerrará o mês com{' '}
                                <span className={projecaoRitmo >= metaAtual.meta_lucro ? 'text-success font-bold' : 'text-warning font-bold'}>
                                    {fmtCur(projecaoRitmo)}
                                </span>{' '}
                                ({metaAtual.meta_lucro > 0 ? ((projecaoRitmo / metaAtual.meta_lucro) * 100).toFixed(0) : 0}% da meta)
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Formulário */}
            <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                <h2 className="text-accent font-semibold text-sm mb-4 uppercase tracking-widest">Definir Meta</h2>
                <form onSubmit={handleSalvar}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Mês</label>
                            <input type="month" value={mes} onChange={e => setMes(e.target.value)} className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Meta de Lucro (R$)</label>
                            <input type="number" value={metaLucro} onChange={e => setMetaLucro(e.target.value)} className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" placeholder="0.00" step="0.01" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Meta de Volume (milhas)</label>
                            <input type="number" value={metaVolume} onChange={e => setMetaVolume(e.target.value)} className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" placeholder="0" />
                        </div>
                    </div>
                    <button disabled={loading} type="submit" className="mt-4 bg-accent text-primary font-bold px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '💾 Salvar Meta'}
                    </button>
                </form>
            </div>

            {/* Histórico */}
            {mesesComMeta.length > 0 && (
                <div className="bg-surfaceDark rounded-2xl border border-borderDark overflow-hidden">
                    <div className="p-5 border-b border-borderDark">
                        <h2 className="text-white font-semibold">Histórico de Metas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-bgDark/50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderDark">
                                    <th className="px-5 py-3 text-left">Mês</th>
                                    <th className="px-5 py-3 text-right">Meta Lucro</th>
                                    <th className="px-5 py-3 text-right">Realizado</th>
                                    <th className="px-5 py-3 text-right">%</th>
                                    <th className="px-5 py-3 text-right">Meta Volume</th>
                                    <th className="px-5 py-3 text-right">Realizado</th>
                                    <th className="px-5 py-3 text-right">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mesesComMeta.map(m => (
                                    <tr key={m.id} className="border-b border-borderDark/50 hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 font-medium text-white capitalize">
                                            {format(new Date(m.mes + '-01'), 'MMM/yy', { locale: ptBR })}
                                        </td>
                                        <td className="px-5 py-4 text-right text-gray-300">{fmtCur(m.meta_lucro)}</td>
                                        <td className={`px-5 py-4 text-right font-semibold ${m.lucroReal >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(m.lucroReal)}</td>
                                        <td className={`px-5 py-4 text-right font-bold ${m.pctLucro >= 100 ? 'text-success' : 'text-danger'}`}>{m.pctLucro.toFixed(0)}%</td>
                                        <td className="px-5 py-4 text-right text-gray-300">{Math.floor(m.meta_volume_milhas).toLocaleString('pt-BR')}</td>
                                        <td className="px-5 py-4 text-right text-gray-300">{Math.floor(m.volReal).toLocaleString('pt-BR')}</td>
                                        <td className={`px-5 py-4 text-right font-bold ${m.pctVol >= 100 ? 'text-success' : 'text-danger'}`}>{m.pctVol.toFixed(0)}%</td>
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
