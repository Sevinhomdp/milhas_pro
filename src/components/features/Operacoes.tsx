'use client'

import * as React from 'react'
import { Operacao, Cartao } from '@/src/types'
import { executarCompra, executarVenda, executarTransf, excluirOperacao, marcarRecebido } from '@/src/app/actions'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { PlusCircle, Download, Check, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface OperacoesProps { operacoes: Operacao[]; cartoes: Cartao[] }
type TipoOp = 'COMPRA' | 'VENDA' | 'TRANSF'
type Score = { label: string; color: 'green' | 'yellow' | 'red' } | null
const PROGS = ['Livelo', 'Esfera', 'Átomos', 'Smiles', 'Azul', 'LATAM', 'Inter', 'Itaú']

export function Operacoes({ operacoes, cartoes }: OperacoesProps) {
    const [tipo, setTipo] = React.useState<TipoOp>('COMPRA')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [score, setScore] = React.useState<Score>(null)
    const [qtd, setQtd] = React.useState('')
    const [valor, setValor] = React.useState('')
    const [bonus, setBonus] = React.useState('100')
    const [filtroTipo, setFiltroTipo] = React.useState<'' | TipoOp>('')
    const [filtroMes, setFiltroMes] = React.useState('')
    const [page, setPage] = React.useState(1)
    const PAGE_SIZE = 20
    const today = new Date().toISOString().split('T')[0]
    const [fd, setFdState] = React.useState<Record<string, string>>({ programa: PROGS[0], programa_origem: PROGS[0], programa_destino: PROGS[1], cartao_id: '', parcelas: '1', data: today, data_recebimento: '', status_recebimento: 'pendente', observacao: '' })
    const gf = (k: string) => fd[k] ?? ''
    const sf = (k: string, v: string) => setFdState(p => ({ ...p, [k]: v }))

    React.useEffect(() => {
        const q = parseFloat(qtd) || 0, v = parseFloat(valor) || 0
        if (!q || !v) { setScore(null); return }
        if (tipo === 'COMPRA') {
            const cpm = (v / q) * 1000
            setScore(cpm < 18 ? { label: `✔ CPM excelente: R$${cpm.toFixed(2)}/mil`, color: 'green' } : cpm < 25 ? { label: `⚡ CPM aceitável: R$${cpm.toFixed(2)}/mil`, color: 'yellow' } : { label: `⚠ CPM alto (${cpm.toFixed(2)}/mil)`, color: 'red' })
        } else if (tipo === 'VENDA') {
            const cpv = (v / q) * 1000
            setScore(cpv > 30 ? { label: `🚀 CPV excelente: R$${cpv.toFixed(2)}/mil`, color: 'green' } : cpv > 20 ? { label: `✔ CPV bom: R$${cpv.toFixed(2)}/mil`, color: 'yellow' } : { label: `⚠ CPV fraco: R$${cpv.toFixed(2)}/mil`, color: 'red' })
        } else setScore(null)
    }, [qtd, valor, tipo])

    const milhasDestino = tipo === 'TRANSF' ? Math.floor((parseFloat(qtd) || 0) * (1 + (parseFloat(bonus) || 0) / 100)) : 0

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setLoading(true); setError(null)
        try {
            if (tipo === 'COMPRA') await executarCompra({ programa: gf('programa'), quantidade: parseFloat(qtd) || 0, valor_total: parseFloat(valor) || 0, cartao_id: gf('cartao_id') || null, parcelas: parseInt(gf('parcelas')) || 1, data: gf('data'), observacao: gf('observacao') || undefined })
            else if (tipo === 'VENDA') await executarVenda({ programa: gf('programa'), quantidade: parseFloat(qtd) || 0, valor_total: parseFloat(valor) || 0, data: gf('data'), data_recebimento: gf('data_recebimento') || undefined, status_recebimento: gf('status_recebimento') as 'pendente' | 'recebido', observacao: gf('observacao') || undefined })
            else await executarTransf({ programa_origem: gf('programa_origem'), programa_destino: gf('programa_destino'), quantidade: parseFloat(qtd) || 0, bonus: parseFloat(bonus) || 0, taxa: parseFloat(valor) || 0, data: gf('data') })
            setQtd(''); setValor(''); setBonus('100'); setScore(null)
        } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro ao salvar operação') }
        finally { setLoading(false) }
    }

    const exportarCSV = () => {
        const header = 'Data,Programa,Tipo,Qtd Milhas,Valor (R$),CPM,ROI,Status'
        const rows = filteredOps.map(o => `"${o.data}","${o.programa}","${o.tipo}","${Math.floor(Number(o.quantidade))}","${Number(o.valor_total).toFixed(2)}","${(Number(o.cpm) || 0).toFixed(2)}","${(Number(o.roi) || 0).toFixed(2)}","${o.status_recebimento || ''}"`)
        const csv = '\uFEFF' + [header, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a'); a.href = url; a.download = `milhas-pro-${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click(); URL.revokeObjectURL(url)
    }

    const mesesDisp = [...new Set(operacoes.map(o => o.data?.substring(0, 7)).filter(Boolean))].sort().reverse()
    const filteredOps = operacoes.filter(o => { if (filtroTipo && o.tipo !== filtroTipo) return false; if (filtroMes && !o.data?.startsWith(filtroMes)) return false; return true })
    const pagedOps = filteredOps.slice(0, page * PAGE_SIZE)

    const inputCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div><p className="field-label mb-1">Operações</p><h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Lançamentos</h1><p className="text-sm text-gray-400 mt-1">Registre compras, vendas e transferências.</p></div>

            {/* Form */}
            <div className="card p-6">
                <h2 className="field-label mb-4 flex items-center gap-2"><PlusCircle className="w-3.5 h-3.5 text-accent" /> Nova Operação</h2>
                <div className="flex gap-2 mb-5">
                    {(['COMPRA', 'TRANSF', 'VENDA'] as TipoOp[]).map(t => (
                        <button key={t} type="button" onClick={() => { setTipo(t); setScore(null); setQtd(''); setValor('') }}
                            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-150 active:scale-95 ${tipo === t ? 'bg-accent text-primary shadow-[0_0_16px_rgba(212,175,55,0.25)]' : 'bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-borderDark'}`}>
                            {t === 'COMPRA' ? '🛒 Compra' : t === 'TRANSF' ? '🔄 Transferência' : '💰 Venda'}
                        </button>
                    ))}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tipo === 'COMPRA' && (<>
                            <div><label className="field-label">Programa</label><select value={gf('programa')} onChange={e => sf('programa', e.target.value)} className={inputCls + ' appearance-none'} required>{PROGS.map(p => <option key={p}>{p}</option>)}</select></div>
                            <div><label className="field-label">Qtd Milhas</label><input type="number" value={qtd} onChange={e => setQtd(e.target.value)} className={inputCls} placeholder="50000" required min="1" /></div>
                            <div><label className="field-label">Custo Total (R$)</label><input type="number" value={valor} onChange={e => setValor(e.target.value)} className={inputCls} placeholder="0.00" step="0.01" required min="0" /></div>
                            <div><label className="field-label">Cartão</label><select value={gf('cartao_id')} onChange={e => sf('cartao_id', e.target.value)} className={inputCls + ' appearance-none'}><option value="">Nenhum (à vista)</option>{cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}</select></div>
                            <div><label className="field-label">Parcelas</label><input type="number" value={gf('parcelas')} onChange={e => sf('parcelas', e.target.value)} className={inputCls} min="1" max="24" /></div>
                            <div><label className="field-label">Data</label><input type="date" value={gf('data')} onChange={e => sf('data', e.target.value)} className={inputCls} required /></div>
                            <div className="sm:col-span-2"><label className="field-label">Observação</label><input value={gf('observacao')} onChange={e => sf('observacao', e.target.value)} className={inputCls} placeholder="Opcional" /></div>
                        </>)}
                        {tipo === 'TRANSF' && (<>
                            <div><label className="field-label">Programa Origem</label><select value={gf('programa_origem')} onChange={e => sf('programa_origem', e.target.value)} className={inputCls + ' appearance-none'} required>{PROGS.map(p => <option key={p}>{p}</option>)}</select></div>
                            <div><label className="field-label">Programa Destino</label><select value={gf('programa_destino')} onChange={e => sf('programa_destino', e.target.value)} className={inputCls + ' appearance-none'} required>{PROGS.map(p => <option key={p}>{p}</option>)}</select></div>
                            <div><label className="field-label">Qtd Enviada</label><input type="number" value={qtd} onChange={e => setQtd(e.target.value)} className={inputCls} required min="1" /></div>
                            <div><label className="field-label">Bônus (%)</label><input type="number" value={bonus} onChange={e => setBonus(e.target.value)} className={inputCls} min="0" max="1000" /></div>
                            <div><label className="field-label">Taxa (R$)</label><input type="number" value={valor} onChange={e => setValor(e.target.value)} className={inputCls} step="0.01" min="0" placeholder="0.00" /></div>
                            <div><label className="field-label">Data</label><input type="date" value={gf('data')} onChange={e => sf('data', e.target.value)} className={inputCls} required /></div>
                            {milhasDestino > 0 && (<div className="sm:col-span-2 card p-4 border-accent/30"><p className="field-label mb-0">Você receberá</p><p className="text-accent font-black text-lg tabular">{milhasDestino.toLocaleString('pt-BR')} milhas</p><p className="text-[11px] text-gray-500">em {gf('programa_destino')}</p></div>)}
                        </>)}
                        {tipo === 'VENDA' && (<>
                            <div><label className="field-label">Programa</label><select value={gf('programa')} onChange={e => sf('programa', e.target.value)} className={inputCls + ' appearance-none'} required>{PROGS.map(p => <option key={p}>{p}</option>)}</select></div>
                            <div><label className="field-label">Qtd Vendida</label><input type="number" value={qtd} onChange={e => setQtd(e.target.value)} className={inputCls} required min="1" /></div>
                            <div><label className="field-label">Valor (R$)</label><input type="number" value={valor} onChange={e => setValor(e.target.value)} className={inputCls} step="0.01" required min="0" /></div>
                            <div><label className="field-label">Data</label><input type="date" value={gf('data')} onChange={e => sf('data', e.target.value)} className={inputCls} required /></div>
                            <div><label className="field-label">Dt Recebimento</label><input type="date" value={gf('data_recebimento')} onChange={e => sf('data_recebimento', e.target.value)} className={inputCls} /></div>
                            <div><label className="field-label">Status</label><select value={gf('status_recebimento')} onChange={e => sf('status_recebimento', e.target.value)} className={inputCls + ' appearance-none'}><option value="pendente">⏳ Pendente</option><option value="recebido">✅ Recebido</option></select></div>
                            <div className="sm:col-span-2"><label className="field-label">Observação</label><input value={gf('observacao')} onChange={e => sf('observacao', e.target.value)} className={inputCls} placeholder="Opcional" /></div>
                        </>)}
                    </div>

                    {score && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold ring-1 ${score.color === 'green' ? 'bg-green-500/10 text-green-400 ring-green-500/20' : score.color === 'yellow' ? 'bg-amber-500/10 text-amber-400 ring-amber-500/20' : 'bg-red-500/10 text-red-400 ring-red-500/20'}`}>
                            {score.label}
                        </div>
                    )}
                    {error && <div className="mt-3 text-danger text-sm">{error}</div>}
                    <div className="mt-5"><Button variant="primary" size="lg" loading={loading} type="submit">Lançar Operação</Button></div>
                </form>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-borderDark flex flex-wrap gap-3 justify-between items-center">
                    <h2 className="field-label mb-0">Histórico</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as TipoOp | '')} className="text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-700 dark:text-white rounded-xl px-3 py-2 focus:border-accent appearance-none"><option value="">Todos</option><option value="COMPRA">Compra</option><option value="VENDA">Venda</option><option value="TRANSF">Transferência</option></select>
                        <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="text-xs bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-700 dark:text-white rounded-xl px-3 py-2 focus:border-accent appearance-none"><option value="">Todos meses</option>{mesesDisp.map(m => <option key={m}>{m}</option>)}</select>
                        <Button variant="ghost" size="sm" onClick={exportarCSV} icon={<Download className="w-3 h-3" />}>CSV</Button>
                    </div>
                </div>
                <div className="relative overflow-hidden">
                    <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-surfaceDark to-transparent z-10 sm:hidden" />
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead><tr className="border-b border-gray-100 dark:border-borderDark">
                                {['Data', 'Programa', 'Qtd', 'Tipo', 'Valor', 'CPM/CPV', 'ROI', 'Ações'].map(h => <th key={h} className={`field-label px-4 py-3 font-bold mb-0 ${h === 'Ações' ? 'text-right' : 'text-left'}`}>{h}</th>)}
                            </tr></thead>
                            <tbody>
                                {filteredOps.length === 0 ? <tr><td colSpan={8} className="p-8 text-center text-gray-500">Nenhuma operação.</td></tr> :
                                    pagedOps.map(o => (
                                        <tr key={o.id} className="border-b border-gray-50 dark:border-borderDark/50 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors duration-100">
                                            <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 tabular">{new Date(o.data + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                                            <td className="px-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white">{o.programa}</td>
                                            <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-300 tabular">{Number(o.quantidade).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                                            <td className="px-4 py-3.5">
                                                <Badge variant={o.tipo}>{o.tipo}</Badge>
                                                {o.tipo === 'VENDA' && o.status_recebimento === 'pendente' && <div className="mt-0.5"><Badge variant="pendente">Pendente</Badge></div>}
                                            </td>
                                            <td className="px-4 py-3.5 text-sm font-bold text-gray-900 dark:text-white tabular">{Number(o.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                            <td className="px-4 py-3.5 text-xs text-gray-500 tabular">{o.cpm ? `R$${Number(o.cpm).toFixed(2)}/mi` : '—'}</td>
                                            <td className="px-4 py-3.5 text-xs tabular">{o.roi != null ? <span className={Number(o.roi) >= 20 ? 'text-success font-bold' : Number(o.roi) >= 10 ? 'text-warning font-bold' : 'text-danger font-bold'}>{Number(o.roi).toFixed(1)}%</span> : '—'}</td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    {o.tipo === 'VENDA' && o.status_recebimento === 'pendente' && <Button variant="success" size="sm" onClick={() => marcarRecebido([o.id])} icon={<Check className="w-3 h-3" />} />}
                                                    <Button variant="danger" size="sm" onClick={() => { if (window.confirm('Excluir?')) excluirOperacao(o.id) }} icon={<Trash2 className="w-3 h-3" />} />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {filteredOps.length > pagedOps.length && (
                    <div className="p-4 text-center border-t border-gray-100 dark:border-borderDark">
                        <button onClick={() => setPage(p => p + 1)} className="text-sm text-accent hover:underline font-medium">Ver mais ({filteredOps.length - pagedOps.length} restantes)</button>
                    </div>
                )}
            </div>
        </div>
    )
}
