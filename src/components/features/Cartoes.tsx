'use client'

import * as React from 'react'
import { Cartao } from '@/src/types'
import { adicionarCartao, removerCartao } from '@/src/app/actions'
import { Button } from '../ui/Button'
import { CreditCard, Plus, Trash2, RefreshCw } from 'lucide-react'

interface CartoesProps { cartoes: Cartao[] }
const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Cartoes({ cartoes }: CartoesProps) {
    const [showForm, setShowForm] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [nome, setNome] = React.useState('')
    const [limite, setLimite] = React.useState('')
    const [diaVenc, setDiaVenc] = React.useState('10')
    const [diaFech, setDiaFech] = React.useState('3')
    const [dolar, setDolar] = React.useState<number | null>(null)
    const [loadDolar, setLoadDolar] = React.useState(false)

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true)
        try {
            await adicionarCartao(
                nome,
                parseInt(diaFech) || 3,
                parseInt(diaVenc) || 10,
                parseFloat(limite) || 0
            )
            setNome(''); setLimite(''); setShowForm(false)
        } catch (e) {
            console.error(e)
            alert(e instanceof Error ? e.message : 'Erro ao adicionar cartão')
        } finally { setLoading(false) }
    }

    const handleDelete = async (id: string, nome: string) => {
        if (!window.confirm(`Excluir ${nome}?`)) return
        try {
            await removerCartao(id)
        } catch (e) {
            console.error(e)
            alert(e instanceof Error ? e.message : 'Erro ao remover cartão')
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

    const inputCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <p className="field-label mb-1">Gestão</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="text-accent w-7 h-7" /> Cartões
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
                <div className="card p-6 animate-fadeInUp">
                    <h2 className="field-label mb-4">Adicionar Cartão</h2>
                    <form onSubmit={handleAdd}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="field-label">Nome</label>
                                <input value={nome} onChange={e => setNome(e.target.value)} className={inputCls} placeholder="C6 Black" required />
                            </div>
                            <div>
                                <label className="field-label">Dia Fechamento</label>
                                <input type="number" value={diaFech} onChange={e => setDiaFech(e.target.value)} className={inputCls} min="1" max="31" required />
                            </div>
                            <div>
                                <label className="field-label">Dia Vencimento</label>
                                <input type="number" value={diaVenc} onChange={e => setDiaVenc(e.target.value)} className={inputCls} min="1" max="31" required />
                            </div>
                            <div>
                                <label className="field-label">Limite (R$)</label>
                                <input type="number" value={limite} onChange={e => setLimite(e.target.value)} className={inputCls} step="0.01" placeholder="0.00" required />
                            </div>
                        </div>
                        <div className="mt-5">
                            <Button variant="primary" size="lg" loading={loading} type="submit">
                                Salvar Cartão
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {cartoes.map((c, i) => (
                    <div key={c.id} className="card card-hover p-5 animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-accent/10"><CreditCard className="w-4 h-4 text-accent" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{c.nome}</h3>
                                    <p className="text-[11px] text-gray-500">Limite: {fmtCur(Number(c.limite))}</p>
                                </div>
                            </div>
                            <Button variant="danger" size="sm" onClick={() => handleDelete(c.id, c.nome)} icon={<Trash2 className="w-3 h-3" />} />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4 border-t border-gray-50 dark:border-white/5 pt-3">
                            <div>
                                <p className="field-label mb-0">Fechamento</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white tabular mt-0.5">Dia {c.dia_fechamento}</p>
                            </div>
                            <div>
                                <p className="field-label mb-0">Vencimento</p>
                                <p className="text-sm font-black text-gray-900 dark:text-white tabular mt-0.5">Dia {c.dia_vencimento}</p>
                            </div>
                        </div>
                    </div>
                ))}
                {cartoes.length === 0 && <p className="text-gray-500 text-sm col-span-3 text-center py-8">Nenhum cartão cadastrado.</p>}
            </div>

            <div className="card p-6">
                <h2 className="field-label mb-4">🏦 Calculadora C6 Black (Pontos/Dólar)</h2>
                <div className="flex items-center gap-3 flex-wrap">
                    <Button variant="secondary" onClick={fetchDolar} loading={loadDolar} icon={<RefreshCw className="w-4 h-4" />}>
                        Buscar Cotação
                    </Button>
                    {dolar && (
                        <div className="flex items-center gap-4">
                            <div>
                                <span className="field-label mb-0">USD/BRL:</span>
                                <span className="text-sm font-black text-accent tabular ml-1.5">R${dolar.toFixed(4)}</span>
                            </div>
                            <div>
                                <span className="field-label mb-0">Pontos/USD (2.5x):</span>
                                <span className="text-sm font-black text-success tabular ml-1.5">{(dolar * 2.5).toFixed(2)}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
