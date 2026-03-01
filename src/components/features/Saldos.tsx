'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Database, ProgramaSaldo } from '@/src/types'
import { PROGS } from '@/src/constants'
import { formatNumber, formatCurrency, cn } from '@/src/lib/utils'
import { ajustarSaldoManual, registrarPrograma } from '@/src/app/actions'
import { Plus, Check, X, Search, ChevronDown, TrendingUp } from 'lucide-react'

interface SaldosProps {
    db: Database
    onSave?: (db: Database) => void
    toast: (msg: string, type?: any) => void
    theme: 'light' | 'dark'
}

// ── Combobox pesquisável ─────────
function ProgramaCombobox({
    options,
    value,
    onChange,
    onClose,
}: {
    options: string[]
    value: string
    onChange: (v: string) => void
    onClose: () => void
}) {
    const [search, setSearch] = useState('')
    const inputRef = useRef<HTMLInputElement>(null)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose()
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [onClose])

    const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()))

    return (
        <div
            ref={ref}
            className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-black/40 z-50 overflow-hidden"
        >
            <div className="p-2 border-b border-slate-100 dark:border-white/5">
                <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar programa..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-700 rounded-xl pl-8 pr-3 py-2 text-sm font-medium dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                </div>
            </div>
            <div className="max-h-52 overflow-y-auto p-1.5">
                {filtered.length === 0 ? (
                    <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                        Nenhum programa encontrado
                    </p>
                ) : (
                    filtered.map(prog => (
                        <button
                            key={prog}
                            onClick={() => { onChange(prog); onClose() }}
                            className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all',
                                value === prog
                                    ? 'bg-amber-500 text-slate-900'
                                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                            )}
                        >
                            <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-black shrink-0">
                                {prog[0]}
                            </span>
                            {prog}
                            {value === prog && <Check size={13} className="ml-auto" />}
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

// ── Componente principal ─────────────────────────────────────
export default function Saldos({ db, toast }: SaldosProps) {
    const [showCombobox, setShowCombobox] = useState(false)
    const [selectedProg, setSelectedProg] = useState('')
    const [addLoading, setAddLoading] = useState(false)
    const [editValues, setEditValues] = useState<Record<string, string>>({})
    const [savingProg, setSavingProg] = useState<string | null>(null)

    const programasCadastrados = db.saldos.map(s => s.nome_programa)
    const programasDisponiveis = PROGS.filter(p => !programasCadastrados.includes(p))

    const handleAddPrograma = async () => {
        if (!selectedProg) return
        setAddLoading(true)
        try {
            await registrarPrograma(selectedProg)
            toast(`Programa ${selectedProg} adicionado!`, 'success')
            setSelectedProg('')
        } catch (e: any) {
            toast(e.message, 'error')
        } finally {
            setAddLoading(false)
        }
    }

    const handleSaveManual = async (s: ProgramaSaldo) => {
        const val = parseFloat(editValues[s.program_id])
        if (isNaN(val)) return
        setSavingProg(s.program_id)
        try {
            await ajustarSaldoManual(s.program_id, val)
            toast('Saldo manual atualizado!', 'success')
            const next = { ...editValues }
            delete next[s.program_id]
            setEditValues(next)
        } catch (e: any) {
            toast(e.message, 'error')
        } finally {
            setSavingProg(null)
        }
    }

    const getSaldoExibido = (s: ProgramaSaldo) => {
        return s.usar_ajuste_manual ? (s.ajuste_manual ?? 0) : s.saldo_atual
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Portfólio de Ativos</p>
                    <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Saldos</h1>
                    <p className="text-sm text-gray-400 mt-2">Veja seus pontos acumulados e ajuste saldos manualmente se necessário.</p>
                </div>

                {!selectedProg && (
                    <div className="relative">
                        <button
                            onClick={() => setShowCombobox(!showCombobox)}
                            className="group flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-amber-500/50 shadow-sm hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300"
                        >
                            <Plus size={18} className="text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                            <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Adicionar Programa</span>
                            <ChevronDown size={14} className={cn('ml-2 text-slate-400 transition-transform', showCombobox && 'rotate-180')} />
                        </button>

                        {showCombobox && (
                            <ProgramaCombobox
                                options={programasDisponiveis}
                                value={selectedProg}
                                onChange={setSelectedProg}
                                onClose={() => setShowCombobox(false)}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Confirmação após seleção no combobox */}
            {selectedProg && !showCombobox && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 animate-fadeIn">
                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                        Adicionar <span className="text-amber-500">{selectedProg}</span> ao portfólio?
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={handleAddPrograma}
                            disabled={addLoading}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs rounded-xl transition-all disabled:opacity-50"
                        >
                            <Check size={12} />
                            {addLoading ? 'Adicionando...' : 'Confirmar'}
                        </button>
                        <button onClick={() => setSelectedProg('')} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                            <X size={15} />
                        </button>
                    </div>
                </div>
            )}

            {/* Estado vazio */}
            {db.saldos.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-16 text-center">
                    <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Plus size={24} className="text-amber-500" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">Nenhum programa adicionado</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500">
                        Clique em &quot;Adicionar Programa&quot; para começar a gerir seus pontos.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {db.saldos.map(s => {
                        const saldoExibido = getSaldoExibido(s)
                        const isEditando = s.program_id in editValues
                        const isSaving = savingProg === s.program_id

                        return (
                            <div
                                key={s.program_id}
                                className={cn(
                                    'bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/5',
                                    'border-t-4 shadow-sm hover:shadow-xl dark:hover:shadow-black/30 transition-all duration-300 group',
                                    s.usar_ajuste_manual ? 'border-t-amber-500' : 'border-t-blue-500'
                                )}
                            >
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-600 dark:text-slate-300">
                                            {s.nome_programa[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                                                {s.nome_programa}
                                            </h3>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {s.usar_ajuste_manual ? 'Manual' : 'Calculado'}
                                            </span>
                                        </div>
                                    </div>
                                    <TrendingUp className={cn('w-4 h-4', s.usar_ajuste_manual ? 'text-amber-500/40' : 'text-blue-500/40')} />
                                </div>

                                <div className="space-y-1 mb-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saldo Atual</p>
                                    <div className="flex items-end gap-1">
                                        <span className="text-3xl font-black text-slate-900 dark:text-white tabular tracking-tight">
                                            {formatNumber(saldoExibido)}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-400 mb-2 uppercase">Pontos</span>
                                    </div>
                                    <p className="text-[10px] text-slate-400 font-bold">
                                        Custo Médio: <span className="text-slate-900 dark:text-slate-200">{formatCurrency(s.custo_medio)}/mil</span>
                                    </p>
                                </div>

                                <div className="pt-5 border-t border-slate-100 dark:border-white/5">
                                    {isEditando ? (
                                        <div className="flex items-center gap-2 animate-fadeIn">
                                            <input
                                                type="number"
                                                autoFocus
                                                value={editValues[s.program_id]}
                                                onChange={e => setEditValues({ ...editValues, [s.program_id]: e.target.value })}
                                                className="w-full h-8 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-lg px-2 text-xs font-bold tabular"
                                                placeholder="Novo saldo"
                                            />
                                            <button
                                                onClick={() => handleSaveManual(s)}
                                                disabled={isSaving}
                                                className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center shrink-0 transition-colors disabled:opacity-50"
                                            >
                                                {isSaving ? (
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Check size={14} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const next = { ...editValues }
                                                    delete next[s.program_id]
                                                    setEditValues(next)
                                                }}
                                                className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center shrink-0 transition-colors"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setEditValues({ ...editValues, [s.program_id]: String(getSaldoExibido(s)) })}
                                            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
                                        >
                                            <Search size={12} />
                                            Ajustar Manualmente
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
