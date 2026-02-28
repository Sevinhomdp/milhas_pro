'use client'

import * as React from 'react'
import { Operacao, Cartao } from '@/src/types'
import { executarCompra, executarVenda, executarTransf, excluirOperacao, marcarRecebido } from '@/src/app/actions'
import { PlusCircle, Loader2, Download, Check, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

interface OperacoesProps {
    operacoes: Operacao[]
    cartoes: Cartao[]
}

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
    const [formData, setFormData] = React.useState<Record<string, string>>({
        programa: PROGS[0],
        programa_origem: PROGS[0],
        programa_destino: PROGS[1],
        cartao_id: '',
        parcelas: '1',
        data: today,
        data_recebimento: '',
        status_recebimento: 'pendente',
        observacao: '',
    })

    const fd = (k: string) => formData[k] ?? ''
    const setFd = (k: string, v: string) => setFormData(prev => ({ ...prev, [k]: v }))

    // CPM Score em tempo real
    React.useEffect(() => {
        const q = parseFloat(qtd) || 0
        const v = parseFloat(valor) || 0
        if (!q || !v) { setScore(null); return }
        if (tipo === 'COMPRA') {
            const cpm = (v / q) * 1000
            if (cpm < 18) setScore({ label: `✔ CPM excelente: R$${cpm.toFixed(2)}/mil`, color: 'green' })
            else if (cpm < 25) setScore({ label: `⚡ CPM aceitável: R$${cpm.toFixed(2)}/mil`, color: 'yellow' })
            else setScore({ label: `⚠ CPM alto (${cpm.toFixed(2)}/mil) — considere evitar`, color: 'red' })
        } else if (tipo === 'VENDA') {
            const cpv = (v / q) * 1000
            if (cpv > 30) setScore({ label: `🚀 CPV excelente: R$${cpv.toFixed(2)}/mil`, color: 'green' })
            else if (cpv > 20) setScore({ label: `✔ CPV bom: R$${cpv.toFixed(2)}/mil`, color: 'yellow' })
            else setScore({ label: `⚠ CPV fraco: R$${cpv.toFixed(2)}/mil`, color: 'red' })
        } else {
            setScore(null)
        }
    }, [qtd, valor, tipo])

    // Preview transf
    const milhasDestino = tipo === 'TRANSF'
        ? Math.floor((parseFloat(qtd) || 0) * (1 + (parseFloat(bonus) || 0) / 100))
        : 0

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            if (tipo === 'COMPRA') {
                await executarCompra({
                    programa: fd('programa'),
                    quantidade: parseFloat(qtd) || 0,
                    valor_total: parseFloat(valor) || 0,
                    cartao_id: fd('cartao_id') || null,
                    parcelas: parseInt(fd('parcelas')) || 1,
                    data: fd('data'),
                    observacao: fd('observacao') || undefined,
                })
            } else if (tipo === 'VENDA') {
                await executarVenda({
                    programa: fd('programa'),
                    quantidade: parseFloat(qtd) || 0,
                    valor_total: parseFloat(valor) || 0,
                    data: fd('data'),
                    data_recebimento: fd('data_recebimento') || undefined,
                    status_recebimento: fd('status_recebimento') as 'pendente' | 'recebido',
                    observacao: fd('observacao') || undefined,
                })
            } else {
                await executarTransf({
                    programa_origem: fd('programa_origem'),
                    programa_destino: fd('programa_destino'),
                    quantidade: parseFloat(qtd) || 0,
                    bonus: parseFloat(bonus) || 0,
                    taxa: parseFloat(valor) || 0,
                    data: fd('data'),
                })
            }
            setQtd('')
            setValor('')
            setBonus('100')
            setScore(null)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao salvar operação')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Excluir esta operação permanentemente?')) return
        await excluirOperacao(id)
    }
    const handleRecebido = async (id: string) => { await marcarRecebido([id]) }

    const exportarCSV = () => {
        const header = 'Data,Programa,Tipo,Qtd Milhas,Valor (R$),CPM,ROI,Status'
        const rows = filteredOps.map(o =>
            `"${o.data}","${o.programa}","${o.tipo}","${Math.floor(Number(o.quantidade))}","${Number(o.valor_total).toFixed(2)}","${(Number(o.cpm) || 0).toFixed(2)}","${(Number(o.roi) || 0).toFixed(2)}","${o.status_recebimento || ''}"`
        )
        const csv = '\uFEFF' + [header, ...rows].join('\n')
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `milhas-pro-${format(new Date(), 'yyyy-MM-dd')}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const mesesDisponiveis = [...new Set(operacoes.map(o => o.data?.substring(0, 7)).filter(Boolean))].sort().reverse()
    const filteredOps = operacoes.filter(o => {
        if (filtroTipo && o.tipo !== filtroTipo) return false
        if (filtroMes && !o.data?.startsWith(filtroMes)) return false
        return true
    })
    const pagedOps = filteredOps.slice(0, page * PAGE_SIZE)

    const inputClass = 'w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:outline-none focus:border-accent'
    const labelClass = 'block text-xs font-semibold text-gray-400 mb-1'

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">Lançamentos</h1>
                <p className="text-sm text-gray-400">Registre suas compras, vendas e transferências de milhas.</p>
            </div>

            {/* Form */}
            <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark">
                <h2 className="text-accent font-semibold text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Nova Operação
                </h2>

                {/* Tabs */}
                <div className="flex gap-2 mb-5">
                    {(['COMPRA', 'TRANSF', 'VENDA'] as TipoOp[]).map(t => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => { setTipo(t); setScore(null); setQtd(''); setValor('') }}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${tipo === t ? 'bg-accent text-primary' : 'bg-bgDark text-gray-400 hover:text-white border border-borderDark'}`}
                        >
                            {t === 'COMPRA' ? '🛒 Compra' : t === 'TRANSF' ? '🔄 Transferência' : '💰 Venda'}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {tipo === 'COMPRA' && (<>
                            <div>
                                <label className={labelClass}>Programa *</label>
                                <select value={fd('programa')} onChange={e => setFd('programa', e.target.value)} className={inputClass} required>
                                    {PROGS.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Qtd Milhas *</label>
                                <input type="number" value={qtd} onChange={e => setQtd(e.target.value)} className={inputClass} placeholder="Ex: 50000" required min="1" />
                            </div>
                            <div>
                                <label className={labelClass}>Custo Total (R$) *</label>
                                <input type="number" value={valor} onChange={e => setValor(e.target.value)} className={inputClass} placeholder="0.00" step="0.01" required min="0" />
                            </div>
                            <div>
                                <label className={labelClass}>Cartão Utilizado</label>
                                <select value={fd('cartao_id')} onChange={e => setFd('cartao_id', e.target.value)} className={inputClass}>
                                    <option value="">— Nenhum (à vista) —</option>
                                    {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Parcelas</label>
                                <input type="number" value={fd('parcelas')} onChange={e => setFd('parcelas', e.target.value)} className={inputClass} min="1" max="24" />
                            </div>
                            <div>
                                <label className={labelClass}>Data *</label>
                                <input type="date" value={fd('data')} onChange={e => setFd('data', e.target.value)} className={inputClass} required />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Observação</label>
                                <input value={fd('observacao')} onChange={e => setFd('observacao', e.target.value)} className={inputClass} placeholder="Opcional" />
                            </div>
                        </>)}

                        {tipo === 'TRANSF' && (<>
                            <div>
                                <label className={labelClass}>Programa Origem *</label>
                                <select value={fd('programa_origem')} onChange={e => setFd('programa_origem', e.target.value)} className={inputClass} required>
                                    {PROGS.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Programa Destino *</label>
                                <select value={fd('programa_destino')} onChange={e => setFd('programa_destino', e.target.value)} className={inputClass} required>
                                    {PROGS.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Qtd Enviada *</label>
                                <input type="number" value={qtd} onChange={e => setQtd(e.target.value)} className={inputClass} required min="1" />
                            </div>
                            <div>
                                <label className={labelClass}>Bônus (%)</label>
                                <input type="number" value={bonus} onChange={e => setBonus(e.target.value)} className={inputClass} min="0" max="1000" />
                            </div>
                            <div>
                                <label className={labelClass}>Taxa de Transferência (R$)</label>
                                <input type="number" value={valor} onChange={e => setValor(e.target.value)} className={inputClass} step="0.01" min="0" placeholder="0.00" />
                            </div>
                            <div>
                                <label className={labelClass}>Data *</label>
                                <input type="date" value={fd('data')} onChange={e => setFd('data', e.target.value)} className={inputClass} required />
                            </div>
                            {milhasDestino > 0 && (
                                <div className="sm:col-span-2 p-3 bg-bgDark rounded-lg border border-accent/30">
                                    <p className="text-xs text-gray-400">Você receberá</p>
                                    <p className="text-accent font-bold text-lg">{milhasDestino.toLocaleString('pt-BR')} milhas</p>
                                    <p className="text-xs text-gray-500">em {fd('programa_destino')}</p>
                                </div>
                            )}
                        </>)}

                        {tipo === 'VENDA' && (<>
                            <div>
                                <label className={labelClass}>Programa *</label>
                                <select value={fd('programa')} onChange={e => setFd('programa', e.target.value)} className={inputClass} required>
                                    {PROGS.map(p => <option key={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Qtd Vendida *</label>
                                <input type="number" value={qtd} onChange={e => setQtd(e.target.value)} className={inputClass} required min="1" />
                            </div>
                            <div>
                                <label className={labelClass}>Valor Recebido (R$) *</label>
                                <input type="number" value={valor} onChange={e => setValor(e.target.value)} className={inputClass} step="0.01" required min="0" />
                            </div>
                            <div>
                                <label className={labelClass}>Data Venda *</label>
                                <input type="date" value={fd('data')} onChange={e => setFd('data', e.target.value)} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Data Prevista Recebimento</label>
                                <input type="date" value={fd('data_recebimento')} onChange={e => setFd('data_recebimento', e.target.value)} className={inputClass} />
                            </div>
                            <div>
                                <label className={labelClass}>Status</label>
                                <select value={fd('status_recebimento')} onChange={e => setFd('status_recebimento', e.target.value)} className={inputClass}>
                                    <option value="pendente">⏳ Pendente</option>
                                    <option value="recebido">✅ Já Recebido</option>
                                </select>
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Observação</label>
                                <input value={fd('observacao')} onChange={e => setFd('observacao', e.target.value)} className={inputClass} placeholder="Opcional" />
                            </div>
                        </>)}
                    </div>

                    {/* CPM Score Badge */}
                    {score && (
                        <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${score.color === 'green' ? 'bg-success/10 text-success' : score.color === 'yellow' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>
                            {score.label}
                        </div>
                    )}

                    {error && <div className="mt-3 text-danger text-sm">{error}</div>}

                    <button disabled={loading} type="submit" className="mt-5 w-full sm:w-auto bg-accent text-primary font-bold px-6 py-3 rounded-lg transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lançar Operação'}
                    </button>
                </form>
            </div>

            {/* Filters + Table */}
            <div className="bg-surfaceDark rounded-2xl border border-borderDark overflow-hidden">
                <div className="p-5 border-b border-borderDark flex flex-wrap gap-3 justify-between items-center">
                    <h2 className="text-white font-semibold">Histórico de Operações</h2>
                    <div className="flex items-center gap-2 flex-wrap">
                        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value as any)} className="text-xs bg-bgDark border border-borderDark text-white rounded-lg px-3 py-1.5 focus:border-accent">
                            <option value="">Todos os tipos</option>
                            <option value="COMPRA">Compra</option>
                            <option value="VENDA">Venda</option>
                            <option value="TRANSF">Transferência</option>
                        </select>
                        <select value={filtroMes} onChange={e => setFiltroMes(e.target.value)} className="text-xs bg-bgDark border border-borderDark text-white rounded-lg px-3 py-1.5 focus:border-accent">
                            <option value="">Todos os meses</option>
                            {mesesDisponiveis.map(m => <option key={m}>{m}</option>)}
                        </select>
                        <button onClick={exportarCSV} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white px-3 py-1.5 border border-borderDark rounded-md hover:bg-bgDark transition">
                            <Download className="w-3 h-3" /> CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-bgDark/50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderDark">
                                <th className="p-4">Data</th>
                                <th className="p-4">Programa</th>
                                <th className="p-4">Qtd</th>
                                <th className="p-4">Tipo</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">CPM/CPV</th>
                                <th className="p-4">ROI</th>
                                <th className="p-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOps.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-gray-500">Nenhuma operação encontrada.</td></tr>
                            ) : pagedOps.map(o => (
                                <tr key={o.id} className="border-b border-borderDark/50 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-sm text-gray-300">
                                        {new Date(o.data + 'T12:00:00').toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-white">{o.programa}</td>
                                    <td className="p-4 text-sm text-gray-300">{Number(o.quantidade).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.tipo === 'COMPRA' ? 'bg-blue-500/10 text-blue-400' : o.tipo === 'VENDA' ? 'bg-green-500/10 text-green-400' : 'bg-amber-500/10 text-amber-400'}`}>
                                            {o.tipo}
                                        </span>
                                        {o.tipo === 'VENDA' && o.status_recebimento === 'pendente' && (
                                            <div className="text-[10px] text-warning mt-0.5">⏳ Pendente</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-white">
                                        {Number(o.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="p-4 text-xs text-gray-400">
                                        {o.cpm ? `R$${Number(o.cpm).toFixed(2)}/mi` : '—'}
                                    </td>
                                    <td className="p-4 text-xs">
                                        {o.roi != null ? (
                                            <span className={Number(o.roi) >= 20 ? 'text-success' : Number(o.roi) >= 10 ? 'text-warning' : 'text-danger'}>
                                                {Number(o.roi).toFixed(1)}%
                                            </span>
                                        ) : '—'}
                                    </td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        {o.tipo === 'VENDA' && o.status_recebimento === 'pendente' && (
                                            <button onClick={() => handleRecebido(o.id)} title="Marcar Recebido" className="p-1.5 text-success hover:bg-success/10 rounded-md transition-colors">
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(o.id)} title="Excluir" className="p-1.5 text-danger hover:bg-danger/10 rounded-md transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOps.length > pagedOps.length && (
                    <div className="p-4 text-center">
                        <button onClick={() => setPage(p => p + 1)} className="text-sm text-accent hover:underline">
                            Ver mais ({filteredOps.length - pagedOps.length} restantes)
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
