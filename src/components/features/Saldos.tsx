'use client'

import * as React from 'react'
import { ProgramaSaldo } from '@/src/types'
import { atualizarSaldo } from '@/src/app/actions'
import { CheckCircle2, Loader2, Save, Wallet } from 'lucide-react'

const PROGS = ['Livelo', 'Esfera', 'Átomos', 'Smiles', 'Azul', 'LATAM', 'Inter', 'Itaú']

interface SaldosProps {
    saldos: ProgramaSaldo[]
}

export function Saldos({ saldos }: SaldosProps) {
    const saldoMap = React.useMemo(() => {
        const m: Record<string, ProgramaSaldo> = {}
        saldos.forEach(s => { m[s.nome_programa] = s })
        return m
    }, [saldos])

    const [valores, setValores] = React.useState<Record<string, string>>(() => {
        const init: Record<string, string> = {}
        const progs = [...new Set([...PROGS, ...saldos.map(s => s.nome_programa)])]
        progs.forEach(p => { init[p] = String(saldoMap[p]?.saldo_atual || '') })
        return init
    })
    const [saving, setSaving] = React.useState<string | null>(null)
    const [synced, setSynced] = React.useState<string | null>(null)

    const handleSave = async (prog: string) => {
        const novo = parseFloat(valores[prog]) || 0
        const atual = Number(saldoMap[prog]?.saldo_atual) || 0
        if (novo === atual) return
        setSaving(prog)
        try {
            await atualizarSaldo(prog, novo)
            setSynced(prog)
            setTimeout(() => setSynced(null), 2000)
        } catch (e) { console.error(e) } finally { setSaving(null) }
    }

    const allProgs = [...new Set([...PROGS, ...saldos.map(s => s.nome_programa)])]
    const totalMilhas = allProgs.reduce((a, p) => a + (Number(saldoMap[p]?.saldo_atual) || 0), 0)
    const patrimonio = allProgs.reduce((a, p) => {
        const s = saldoMap[p]
        return a + (Number(s?.saldo_atual) || 0) * (Number(s?.custo_medio) || 0) / 1000
    }, 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Wallet className="text-accent w-6 h-6" /> Minha Carteira
                </h1>
                <p className="text-sm text-gray-400">Atualize os saldos das suas contas de fidelidade.</p>
            </div>

            {/* Summary Panel */}
            <div className="bg-gradient-to-r from-primary to-surfaceDark rounded-2xl p-6 border border-borderDark flex flex-col sm:flex-row gap-6 justify-between">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total de Milhas</p>
                    <p className="text-3xl font-bold text-accent">{Math.floor(totalMilhas).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Patrimônio Estimado</p>
                    <p className="text-3xl font-bold text-white">{patrimonio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    <p className="text-xs text-gray-500 mt-1">Baseado no custo médio de cada programa</p>
                </div>
            </div>

            {/* Cards por programa */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                {allProgs.map(prog => {
                    const s = saldoMap[prog]
                    const custoMedio = Number(s?.custo_medio) || 0
                    return (
                        <div key={prog} className="bg-surfaceDark rounded-xl p-4 border border-borderDark border-t-4 border-t-accent shadow-md">
                            <h3 className="text-[11px] text-gray-400 uppercase tracking-widest mb-3 font-semibold">{prog}</h3>

                            <div className="flex gap-2 items-center mb-2">
                                <input
                                    type="number"
                                    value={valores[prog] ?? ''}
                                    placeholder="0"
                                    onChange={e => setValores(prev => ({ ...prev, [prog]: e.target.value }))}
                                    onBlur={() => handleSave(prog)}
                                    className="w-full bg-bgDark border border-borderDark rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                                />
                                <button
                                    onClick={() => handleSave(prog)}
                                    disabled={saving === prog}
                                    className="p-2 text-gray-400 hover:text-accent disabled:opacity-30 transition-colors bg-bgDark rounded-lg border border-borderDark shrink-0"
                                    title="Salvar"
                                >
                                    {saving === prog ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                        synced === prog ? <CheckCircle2 className="w-4 h-4 text-success" /> :
                                            <Save className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="text-[11px] text-gray-500 mt-1">
                                {(parseFloat(valores[prog]) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} milhas
                            </div>

                            {custoMedio > 0 && (
                                <div className="text-[11px] text-success mt-0.5 font-semibold">
                                    CPM: R${custoMedio.toFixed(2)}/mil
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
