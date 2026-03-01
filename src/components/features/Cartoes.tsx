'use client'

import * as React from 'react'
import { Cartao, Database } from '@/src/types'
import { adicionarCartao, removerCartao } from '@/src/app/actions'
import { Button } from '../ui/Button'
import { CreditCard, Plus, Trash2, RefreshCw } from 'lucide-react'
import { formatCurrency, cn } from '@/src/lib/utils'


interface CartoesProps {
    db: Database
    toast: (msg: string, type?: any) => void
    theme?: 'light' | 'dark'
}

export default function Cartoes({ db, toast }: CartoesProps) {
    const { cartoes } = db
    const [showForm, setShowForm] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [nome, setNome] = React.useState('')
    const [limite, setLimite] = React.useState('')
    const [diaVenc, setDiaVenc] = React.useState('10')
    const [diaFech, setDiaFech] = React.useState('3')
    const [dolar, setDolar] = React.useState<number | null>(null)
    const [loadDolar, setLoadDolar] = React.useState(false)
    const [valorGasto, setValorGasto] = React.useState('5000')
    const [ptsPorDolar, setPtsPorDolar] = React.useState('2.5')

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true)
        try {
            await adicionarCartao(
                nome,
                parseInt(diaFech) || 3,
                parseInt(diaVenc) || 10,
                parseFloat(limite) || 0
            )
            toast('Cartão adicionado!', 'success')
            setNome(''); setLimite(''); setShowForm(false)
        } catch (e: any) {
            toast(e.message, 'error')
        } finally { setLoading(false) }
    }

    const handleDelete = async (id: string, nomeCur: string) => {
        if (!window.confirm(`Excluir ${nomeCur}?`)) return
        try {
            await removerCartao(id)
            toast('Cartão removido', 'info')
        } catch (e: any) {
            toast(e.message, 'error')
        }
    }

    const fetchDolar = async () => {
        setLoadDolar(true)
        try {
            const r = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
            const d = await r.json()
            setDolar(parseFloat(d.USDBRL.ask))
        } catch {
            setDolar(null)
        } finally {
            setLoadDolar(false)
        }
    }

    const inputCls = "w-full rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Gestão Financeira</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                        Cartões
                    </h1>
                </div>
                <Button
                    variant={showForm ? 'secondary' : 'primary'}
                    onClick={() => setShowForm(!showForm)}
                    icon={<Plus className="w-4 h-4" />}
                >
                    {showForm ? 'Cancelar' : 'Novo Cartão'}
                </Button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm animate-fadeIn">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Adicionar Cartão</h2>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Nome</label>
                                <input value={nome} onChange={e => setNome(e.target.value)} className={inputCls} placeholder="C6 Black" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Dia Fechamento</label>
                                <input type="number" value={diaFech} onChange={e => setDiaFech(e.target.value)} className={inputCls} min="1" max="31" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Dia Vencimento</label>
                                <input type="number" value={diaVenc} onChange={e => setDiaVenc(e.target.value)} className={inputCls} min="1" max="31" required />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Limite (R$)</label>
                                <input type="number" value={limite} onChange={e => setLimite(e.target.value)} className={inputCls} step="0.01" placeholder="0.00" required />
                            </div>
                        </div>
                        <div className="mt-6">
                            <Button loading={loading} type="submit" size="lg" className="px-8">
                                Salvar Cartão
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cartoes.map((c) => (
                    <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(c.id, c.nome)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                                <Trash2 size={14} />
                            </button>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{c.nome}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Limite: {formatCurrency(Number(c.limite))}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fechamento</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">Dia {c.dia_fechamento}</p>
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Vencimento</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">Dia {c.dia_vencimento}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {cartoes.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Nenhum cartão cadastrado.</p>
                    </div>
                )}
            </div>

            {/* Simulador */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <RefreshCw className="w-5 h-5 text-amber-500" />
                    <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Simulador de Acúmulo</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Gasto Mensal (R$)</label>
                        <input
                            type="number"
                            className={inputCls}
                            placeholder="Ex: 5000"
                            value={valorGasto}
                            onChange={e => setValorGasto(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Pontos por Dólar</label>
                        <input
                            type="number"
                            className={inputCls}
                            placeholder="Ex: 2.5"
                            value={ptsPorDolar}
                            onChange={e => setPtsPorDolar(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Cotação Dólar</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                className={inputCls}
                                value={dolar || ''}
                                onChange={e => setDolar(parseFloat(e.target.value))}
                            />
                            <button onClick={fetchDolar} disabled={loadDolar} className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-amber-500 rounded-xl transition-all disabled:opacity-50">
                                <RefreshCw size={18} className={cn(loadDolar && 'animate-spin')} />
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col justify-end">
                        <div className="h-[46px] flex flex-col justify-center px-6 rounded-2xl bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Total Estimado</p>
                            <span className="text-lg font-black tabular leading-none">
                                {valorGasto && dolar && ptsPorDolar ? Math.floor((parseFloat(valorGasto) / dolar) * parseFloat(ptsPorDolar)).toLocaleString('pt-BR') : '0'} pts
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
