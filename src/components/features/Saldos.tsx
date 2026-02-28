'use client'

import * as React from 'react'
import { ProgramaSaldo } from '@/src/types'
import { atualizarSaldo } from '@/src/app/actions'
import { CheckCircle2, Loader2, Save } from 'lucide-react'

const PROGS_PADRAO = ["Livelo", "Esfera", "Átomos", "Smiles", "Azul", "LATAM", "Inter", "Itaú"]

interface SaldosProps {
    saldos: ProgramaSaldo[]
}

export function Saldos({ saldos }: SaldosProps) {
    const mapSaldos = saldos.reduce((acc, curr) => {
        acc[curr.nome_programa] = curr.saldo_atual
        return acc
    }, {} as Record<string, number>)

    const [valores, setValores] = React.useState<Record<string, number>>(() => {
        const iniciais = { ...mapSaldos }
        PROGS_PADRAO.forEach(p => {
            if (iniciais[p] === undefined) iniciais[p] = 0
        })
        return iniciais
    })

    const [saving, setSaving] = React.useState<string | null>(null)
    const [synced, setSynced] = React.useState<string | null>(null)

    const handleUpdate = async (programa: string, val: string) => {
        const limpo = parseFloat(val) || 0
        setValores(prev => ({ ...prev, [programa]: limpo }))
    }

    const handleSave = async (programa: string) => {
        const novoValor = valores[programa]
        if (mapSaldos[programa] === novoValor) return // Nenhuma mudanca real

        setSaving(programa)
        setSynced(null)

        try {
            await atualizarSaldo(programa, novoValor)
            setSynced(programa)
            setTimeout(() => setSynced(null), 2000)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(null)
        }
    }

    const listSaldos = Array.from(new Set([...PROGS_PADRAO, ...saldos.map(s => s.nome_programa)])).sort()

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Minha Carteira
                </h1>
                <p className="text-sm text-gray-400">Atualize os saldos das suas contas e programas de fidelidade.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {listSaldos.map(prog => (
                    <div key={prog} className="bg-surfaceDark rounded-xl p-4 border border-borderDark flex flex-col justify-between border-t-4 border-t-accent shadow-[0_2px_6px_rgba(0,0,0,0.2)]">
                        <h3 className="text-[11px] text-gray-400 uppercase tracking-widest mb-3 font-semibold">{prog}</h3>

                        <div className="flex gap-2 items-center mb-1">
                            <input
                                type="number"
                                value={valores[prog] === 0 ? '' : valores[prog]}
                                placeholder="0"
                                onChange={e => handleUpdate(prog, e.target.value)}
                                onBlur={() => handleSave(prog)}
                                className="w-full bg-bgDark border border-borderDark rounded-lg p-2 text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                            />
                            <button
                                onClick={() => handleSave(prog)}
                                disabled={saving === prog || parseFloat(valores[prog]?.toString()) === mapSaldos[prog]}
                                className="p-2 text-gray-400 hover:text-accent disabled:opacity-30 disabled:hover:text-gray-400 transition-colors bg-bgDark rounded-lg border border-borderDark shrink-0"
                                title="Sincronizar"
                            >
                                {saving === prog ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                    synced === prog ? <CheckCircle2 className="w-4 h-4 text-success" /> : <Save className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="text-[11px] text-gray-500 mt-1">
                            {valores[prog]?.toLocaleString('pt-BR') || '0'} milhas
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
