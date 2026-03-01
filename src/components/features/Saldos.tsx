'use client'

import * as React from 'react'
import { Program } from '@/src/types'
import { ajustarSaldoManual, registrarPrograma } from '@/src/app/actions'
import { Button } from '../ui/Button'
import { Wallet, Save, Plus, ArrowRightLeft } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface SaldoItem {
    program_id: string
    name: string
    calculated_balance: number
    manual_adjustment: number
    total_balance: number
    custo_medio: number
}

interface SaldosProps {
    data: SaldoItem[]
    programs: Program[]
}

const fmtNum = (v: number) => Math.floor(v).toLocaleString('pt-BR')

export function Saldos({ data, programs }: SaldosProps) {
    const [editValues, setEditValues] = React.useState<Record<string, string>>({})
    const [saving, setSaving] = React.useState<string | null>(null)
    const [showNewProg, setShowNewProg] = React.useState(false)
    const [newProgName, setNewProgName] = React.useState('')
    const [loadingNew, setLoadingNew] = React.useState(false)

    const totalMilhas = data.reduce((a, s) => a + s.total_balance, 0)
    // For now, patrimony is hard to estimate without full history, but we'll show milhas

    const handleAdjust = async (s: SaldoItem) => {
        const novoTotalDesejado = parseFloat(editValues[s.program_id] ?? '')
        if (isNaN(novoTotalDesejado)) return

        const novoAjuste = novoTotalDesejado - s.calculated_balance
        setSaving(s.program_id)
        try {
            await ajustarSaldoManual(s.program_id, novoAjuste)
            setEditValues(p => { const n = { ...p }; delete n[s.program_id]; return n })
        } catch (e) { console.error(e) } finally { setSaving(null) }
    }

    const handleAddProg = async () => {
        if (!newProgName) return
        setLoadingNew(true)
        try {
            await registrarPrograma(newProgName)
            setNewProgName(''); setShowNewProg(false)
        } catch (e) { console.error(e) } finally { setLoadingNew(false) }
    }

    const inputCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <p className="field-label mb-1">Portfolio</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Saldos Disponíveis</h1>
                </div>
                <Button variant="primary" onClick={() => setShowNewProg(true)} icon={<Plus className="w-4 h-4" />}>Novo Programa</Button>
            </div>

            {showNewProg && (
                <div className="card p-5 animate-fadeInUp">
                    <h2 className="field-label mb-4">Adicionar Novo Programa</h2>
                    <div className="flex gap-4">
                        <input value={newProgName} onChange={e => setNewProgName(e.target.value)} placeholder="Ex: AAdvantage, Iberia..." className={inputCls} />
                        <Button variant="primary" loading={loadingNew} onClick={handleAddProg}>Salvar</Button>
                        <Button variant="secondary" onClick={() => setShowNewProg(false)}>Cancelar</Button>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                <div className="card card-hover p-5 border-l-4 border-l-accent animate-fadeInUp">
                    <p className="field-label mb-0">Total Consolidado</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white tabular mt-2">{fmtNum(totalMilhas)}</p>
                    <p className="text-xs text-gray-500 mt-1">milhas totais (Operações + Ajustes)</p>
                </div>
                <div className="card card-hover p-5 border-l-4 border-l-blue-500 animate-fadeInUp" style={{ animationDelay: '60ms' }}>
                    <p className="field-label mb-0">Programas Ativos</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white tabular mt-2">{data.filter(s => s.total_balance > 0).length}</p>
                    <p className="text-xs text-gray-500 mt-1">com saldo acima de zero</p>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {data.map((s, i) => (
                    <div key={s.program_id} className="card card-hover p-5 animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-accent/10"><Wallet className="w-4 h-4 text-accent" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{s.name}</h3>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 rounded border border-gray-200 dark:border-white/5">
                                            Calculado: {fmtNum(s.calculated_balance)}
                                        </span>
                                        {s.manual_adjustment !== 0 && (
                                            <span className={cn(
                                                "text-[10px] px-1.5 py-0.5 rounded border",
                                                s.manual_adjustment > 0 ? "bg-success/10 text-success border-success/20" : "bg-danger/10 text-danger border-danger/20"
                                            )}>
                                                Ajuste: {s.manual_adjustment > 0 ? '+' : ''}{fmtNum(s.manual_adjustment)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="field-label flex justify-between">
                                Ajustar Saldo Total
                                <span className="text-accent font-black">{fmtNum(s.total_balance)}</span>
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder={s.total_balance.toString()}
                                    value={editValues[s.program_id] ?? ''}
                                    onChange={e => setEditValues(p => ({ ...p, [s.program_id]: e.target.value }))}
                                    className={inputCls}
                                />
                                <Button
                                    variant="primary"
                                    size="md"
                                    disabled={!editValues[s.program_id]}
                                    loading={saving === s.program_id}
                                    onClick={() => handleAdjust(s)}
                                    icon={<Save className="w-4 h-4" />}
                                />
                            </div>
                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                                <ArrowRightLeft className="w-3 h-3" />
                                O sistema calculará o ajuste necessário automaticamente.
                            </p>
                        </div>
                    </div>
                ))}
                {data.length === 0 && (
                    <div className="col-span-3 text-center py-12 card border-dashed border-2">
                        <p className="text-gray-500 text-sm">Nenhum programa cadastrado.</p>
                        <p className="text-xs text-gray-400 mt-1">Clique em "Novo Programa" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
