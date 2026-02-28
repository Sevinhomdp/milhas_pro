'use client'

import * as React from 'react'
import { Operacao, Cartao } from '@/src/types'
import { executarAcao, excluirOperacao, marcarRecebido } from '@/src/app/actions'
import { PlusCircle, Loader2, Download, Check, Trash2 } from 'lucide-react'

interface OperacoesProps {
    operacoes: Operacao[]
    cartoes: Cartao[]
}

const PROGS_PADRAO = ["Livelo", "Esfera", "Átomos", "Smiles", "Azul", "LATAM", "Inter", "Itaú"]

export function Operacoes({ operacoes, cartoes }: OperacoesProps) {
    const [tipo, setTipo] = React.useState<'COMPRA' | 'VENDA' | 'TRANSF'>('COMPRA')
    const [loading, setLoading] = React.useState(false)

    // O form action handler
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        try {
            await executarAcao(formData)
            e.currentTarget.reset()
        } catch (err) {
            console.error(err)
            alert("Erro ao salvar operação")
        } finally {
            setLoading(false)
        }
    }

    // Acoes Tabela
    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta operação?")) return
        await excluirOperacao(id)
    }

    const handleRecebido = async (id: string) => {
        await marcarRecebido([id])
    }

    const exportarCSV = () => {
        if (!operacoes.length) return alert('Nenhuma operação para exportar.')
        const header = 'Data,Programa,Tipo,Qtd Milhas,Valor (R$),Status,Data Recebimento\n'
        const rows = operacoes.map(o => `"${o.data}","${o.programa}","${o.tipo}","${o.quantidade}","${o.valor_total}","${o.status_recebimento || ''}","${o.data_recebimento || ''}"`).join('\n')
        const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `operacoes-${new Date().toISOString().substring(0, 10)}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">Lançamentos</h1>
                <p className="text-sm text-gray-400">Registre novas compras, vendas e transferências de milhas.</p>
            </div>

            <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark shadow-sm mb-6">
                <h2 className="text-accent font-semibold text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Nova Operação
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <select
                            name="tipo"
                            value={tipo}
                            onChange={e => setTipo(e.target.value as any)}
                            className="w-full max-w-sm bg-bgDark border border-accent text-white rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                            <option value="COMPRA">🛒 Compra / Entrada</option>
                            <option value="TRANSF">🔄 Transferência Bonificada</option>
                            <option value="VENDA">💰 Venda / Saída</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {tipo === 'COMPRA' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Programa *</label>
                                    <select name="programa" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent">
                                        {PROGS_PADRAO.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Qtd Milhas *</label>
                                    <input type="number" name="quantidade" required min="1" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Custo Total (R$) *</label>
                                    <input type="number" name="valor_total" step="0.01" required min="0" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Cartão Utilizado</label>
                                    <select name="cartao_id" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent">
                                        <option value="">— Nenhum —</option>
                                        {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Parcelas</label>
                                    <input type="number" name="parcelas" defaultValue="1" min="1" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Data *</label>
                                    <input type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                            </>
                        )}

                        {tipo === 'TRANSF' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Programa Origem *</label>
                                    <select name="programa" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent">
                                        {PROGS_PADRAO.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Programa Destino *</label>
                                    <select name="programa_destino" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent">
                                        {PROGS_PADRAO.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Qtd Enviada *</label>
                                    <input type="number" name="quantidade" required min="1" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Bônus (%) *</label>
                                    <input type="number" name="bonus" defaultValue="100" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Taxa Transferência (R$)</label>
                                    <input type="number" name="valor_total" step="0.01" defaultValue="0" min="0" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Data *</label>
                                    <input type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                            </>
                        )}

                        {tipo === 'VENDA' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Programa *</label>
                                    <select name="programa" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent">
                                        {PROGS_PADRAO.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Qtd Vendida *</label>
                                    <input type="number" name="quantidade" required min="1" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Valor Recebido/A Receber (R$) *</label>
                                    <input type="number" name="valor_total" step="0.01" required min="0" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Data Venda *</label>
                                    <input type="date" name="data" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Data Prevista Recebimento</label>
                                    <input type="date" name="data_recebimento" className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 mb-1">Status Pagamento</label>
                                    <select name="status_recebimento" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent">
                                        <option value="pendente">⏳ Pendente</option>
                                        <option value="recebido">✅ Já Recebido</option>
                                    </select>
                                </div>
                            </>
                        )}
                    </div>

                    <button disabled={loading} type="submit" className="mt-6 w-full sm:w-auto bg-primary text-white border border-borderDark hover:border-accent hover:text-accent font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lançar Operação"}
                    </button>
                </form>
            </div>

            <div className="bg-surfaceDark rounded-2xl border border-borderDark shadow-sm overflow-hidden">
                <div className="p-5 border-b border-borderDark flex justify-between items-center">
                    <h2 className="text-white font-semibold">Histórico de Operações</h2>
                    <button onClick={exportarCSV} className="text-xs flex items-center gap-1 text-gray-400 hover:text-white px-3 py-1.5 border border-borderDark rounded-md hover:bg-bgDark transition">
                        <Download className="w-3 h-3" /> CSV
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bgDark/50 text-[11px] uppercase tracking-wider text-gray-400 border-b border-borderDark">
                                <th className="p-4 font-semibold">Data</th>
                                <th className="p-4 font-semibold">Programa</th>
                                <th className="p-4 font-semibold">Qtd</th>
                                <th className="p-4 font-semibold">Tipo</th>
                                <th className="p-4 font-semibold">Valor</th>
                                <th className="p-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operacoes.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">Nenhuma operação lançada.</td>
                                </tr>
                            ) : operacoes.map(o => (
                                <tr key={o.id} className="border-b border-borderDark/50 hover:bg-white/5 transition-colors">
                                    <td className="p-4 text-sm text-gray-300">
                                        {new Date(o.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-white">{o.programa}</td>
                                    <td className="p-4 text-sm text-gray-300">{Number(o.quantidade).toLocaleString('pt-BR')}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.tipo === 'COMPRA' ? 'bg-blue-500/10 text-blue-400' :
                                                o.tipo === 'VENDA' ? 'bg-green-500/10 text-green-400' :
                                                    'bg-amber-500/10 text-amber-400'
                                            }`}>
                                            {o.tipo}
                                        </span>
                                        {o.tipo === 'VENDA' && o.status_recebimento === 'pendente' && (
                                            <div className="text-[10px] text-warning mt-1">⏳ A receber</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-white">{Number(o.valor_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
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
            </div>
        </div>
    )
}
