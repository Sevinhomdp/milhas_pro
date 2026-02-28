'use client'

import * as React from 'react'
import { Cartao } from '@/src/types'
import { adicionarCartao, removerCartao } from '@/src/app/actions'
import { PlusCircle, Trash2, Loader2, CreditCard, RefreshCw } from 'lucide-react'

interface CartoesProps {
    cartoes: Cartao[]
}

export function Cartoes({ cartoes }: CartoesProps) {
    const [nome, setNome] = React.useState('')
    const [fechamento, setFechamento] = React.useState('5')
    const [vencimento, setVencimento] = React.useState('15')
    const [limite, setLimite] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)
    const [deleting, setDeleting] = React.useState<string | null>(null)

    // C6 Calculator
    const [gasto, setGasto] = React.useState('')
    const [dolar, setDolar] = React.useState('5.00')
    const [loadingDolar, setLoadingDolar] = React.useState(false)

    const pontos = dolar && gasto ? Math.floor((parseFloat(gasto) / parseFloat(dolar)) * 2.5) : 0

    const fetchDolar = async () => {
        setLoadingDolar(true)
        try {
            const res = await fetch('https://economia.awesomeapi.com.br/json/last/USD-BRL')
            const j = await res.json()
            setDolar(parseFloat(j.USDBRL.bid).toFixed(2))
        } catch { } finally { setLoadingDolar(false) }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!nome.trim()) { setError('Nome é obrigatório'); return }
        setLoading(true)
        try {
            await adicionarCartao(nome.trim(), parseInt(fechamento), parseInt(vencimento), parseFloat(limite) || 0)
            setNome(''); setLimite('')
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erro ao adicionar cartão')
        } finally { setLoading(false) }
    }

    const handleRemove = async (id: string, nome: string) => {
        if (!confirm(`Remover o cartão "${nome}"? Isso pode afetar as faturas em aberto.`)) return
        setDeleting(id)
        try { await removerCartao(id) }
        catch (e) { console.error(e) } finally { setDeleting(null) }
    }

    const inputClass = 'w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:outline-none focus:border-accent'

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2"><CreditCard className="text-accent w-6 h-6" /> Meus Cartões</h1>
                <p className="text-sm text-gray-400">Gerencie seus cartões para controle de faturas e parcelas.</p>
            </div>

            {/* Add Form */}
            <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark">
                <h2 className="text-accent font-semibold text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Adicionar Cartão
                </h2>
                <form onSubmit={handleAdd}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Nome do Cartão *</label>
                            <input value={nome} onChange={e => setNome(e.target.value)} className={inputClass} placeholder="Ex: Nubank Ultravioleta" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Dia Fechamento *</label>
                            <input type="number" value={fechamento} onChange={e => setFechamento(e.target.value)} className={inputClass} min="1" max="31" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Dia Vencimento *</label>
                            <input type="number" value={vencimento} onChange={e => setVencimento(e.target.value)} className={inputClass} min="1" max="31" required />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Limite (R$)</label>
                            <input type="number" value={limite} onChange={e => setLimite(e.target.value)} className={inputClass} step="0.01" min="0" placeholder="0.00" />
                        </div>
                    </div>
                    {error && <p className="text-danger text-sm mt-2">{error}</p>}
                    <button disabled={loading} type="submit" className="mt-4 bg-accent text-primary font-bold px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                        Adicionar
                    </button>
                </form>
            </div>

            {/* Cartões list */}
            {cartoes.length === 0 ? (
                <div className="bg-surfaceDark rounded-2xl border border-borderDark p-10 text-center text-gray-500">Nenhum cartão cadastrado ainda.</div>
            ) : (
                <div className="bg-surfaceDark rounded-2xl border border-borderDark overflow-hidden">
                    <div className="p-5 border-b border-borderDark">
                        <h2 className="text-white font-semibold">Cartões Cadastrados</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-bgDark/50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderDark">
                                    <th className="px-5 py-3 text-left">Nome</th>
                                    <th className="px-5 py-3 text-left">Fechamento</th>
                                    <th className="px-5 py-3 text-left">Vencimento</th>
                                    <th className="px-5 py-3 text-left">Limite</th>
                                    <th className="px-5 py-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartoes.map(c => (
                                    <tr key={c.id} className="border-b border-borderDark/50 hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 font-medium text-white">{c.nome}</td>
                                        <td className="px-5 py-4 text-gray-300">Dia {c.dia_fechamento}</td>
                                        <td className="px-5 py-4 text-gray-300">Dia {c.dia_vencimento}</td>
                                        <td className="px-5 py-4 text-gray-300">{Number(c.limite).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                        <td className="px-5 py-4 text-right">
                                            <button
                                                onClick={() => handleRemove(c.id, c.nome)}
                                                disabled={deleting === c.id}
                                                className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors disabled:opacity-50"
                                            >
                                                {deleting === c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                Remover
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* C6 Black Calculator */}
            <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark">
                <h2 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">🖤 Calculadora C6 Black</h2>
                <p className="text-xs text-gray-400 mb-4">Calcule os pontos gerados com gastos no cartão C6 Black (2.5 pontos por dólar).</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Valor do Gasto (R$)</label>
                        <input type="number" value={gasto} onChange={e => setGasto(e.target.value)} className={inputClass} placeholder="0.00" min="0" step="0.01" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Cotação do Dólar (R$)</label>
                        <div className="flex gap-2">
                            <input type="number" value={dolar} onChange={e => setDolar(e.target.value)} className={inputClass} step="0.01" min="0" />
                            <button onClick={fetchDolar} disabled={loadingDolar} className="p-3 bg-bgDark border border-borderDark rounded-lg text-gray-400 hover:text-accent transition-colors shrink-0" title="Buscar cotação atual">
                                <RefreshCw className={`w-4 h-4 ${loadingDolar ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>
                    <div className="text-center p-4 bg-bgDark rounded-xl border border-accent/30">
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Pontos Gerados</p>
                        <p className="text-3xl font-black text-accent">{pontos.toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
