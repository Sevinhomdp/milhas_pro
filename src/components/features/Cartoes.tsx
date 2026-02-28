'use client'

import * as React from 'react'
import { Cartao } from '@/src/types'
import { adicionarCartao, removerCartao } from '@/src/app/actions'
import { PlusCircle, Loader2, CreditCard, Trash2 } from 'lucide-react'

interface CartoesProps {
    cartoes: Cartao[]
}

export function Cartoes({ cartoes }: CartoesProps) {
    const [loading, setLoading] = React.useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        try {
            await adicionarCartao(
                formData.get('nome') as string,
                Number(formData.get('dia_fechamento')),
                Number(formData.get('dia_vencimento')),
                Number(formData.get('limite'))
            )
            e.currentTarget.reset()
        } catch (err) {
            console.error(err)
            alert("Erro ao salvar cartão")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este cartão? As faturas podem ser afetadas.")) return
        await removerCartao(id)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">Gestão de Cartões</h1>
                <p className="text-sm text-gray-400">Cadastre seus cartões para simular parcelamentos e faturas automaticamente na projeção de caixa.</p>
            </div>

            <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark shadow-sm mb-6 max-w-2xl">
                <h2 className="text-accent font-semibold text-sm mb-4 uppercase tracking-widest flex items-center gap-2">
                    <PlusCircle className="w-4 h-4" /> Novo Cartão
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Nome do Cartão (Apelido) *</label>
                        <input type="text" name="nome" placeholder="Ex: Azul Visa Infinite" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Dia de Fechamento *</label>
                        <input type="number" name="dia_fechamento" min="1" max="31" placeholder="Ex: 25" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Dia de Vencimento *</label>
                        <input type="number" name="dia_vencimento" min="1" max="31" placeholder="Ex: 5" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Limite Total (R$) *</label>
                        <input type="number" step="0.01" name="limite" min="0" placeholder="Ex: 15000" required className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none" />
                    </div>

                    <div className="sm:col-span-2 mt-2">
                        <button disabled={loading} type="submit" className="w-full sm:w-auto bg-primary text-white border border-borderDark hover:border-accent hover:text-accent font-semibold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Adicionar Cartão"}
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cartoes.length === 0 ? (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 text-center p-8 bg-surfaceDark rounded-xl border border-borderDark text-gray-500">
                        Nenhum cartão cadastrado.
                    </div>
                ) : cartoes.map(c => (
                    <div key={c.id} className="bg-bgDark p-5 rounded-2xl border border-borderDark shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/50 to-accent"></div>

                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-surfaceDark rounded-xl border border-borderDark">
                                    <CreditCard className="w-6 h-6 text-accent" />
                                </div>
                                <h3 className="font-bold text-white text-lg">{c.nome}</h3>
                            </div>
                            <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Vencimento</div>
                                <div className="font-semibold text-white">Dia {c.dia_vencimento}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Fechamento</div>
                                <div className="font-semibold text-white">Dia {c.dia_fechamento}</div>
                            </div>
                            <div className="col-span-2 pt-2 border-t border-borderDark/50">
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Limite Cadastrado</div>
                                <div className="font-bold text-accent">
                                    {Number(c.limite).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
