'use client'

import * as React from 'react'
import { ProgramaSaldo } from '@/src/types'
import { atualizarSaldo } from '@/src/app/actions'
import { Button } from '../ui/Button'
import { Wallet, Save } from 'lucide-react'

interface SaldosProps { saldos: ProgramaSaldo[] }
const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
const fmtNum = (v: number) => Math.floor(v).toLocaleString('pt-BR')

export function Saldos({ saldos }: SaldosProps) {
    const [editValues, setEditValues] = React.useState<Record<string, string>>({})
    const [saving, setSaving] = React.useState<string | null>(null)

    const totalMilhas = saldos.reduce((a, s) => a + Number(s.saldo_atual), 0)
    const patrimonio = saldos.reduce((a, s) => a + (Number(s.saldo_atual) * Number(s.custo_medio || 0)) / 1000, 0)

    const handleSave = async (s: ProgramaSaldo) => {
        const novoSaldo = parseFloat(editValues[s.id] ?? '') || Number(s.saldo_atual)
        setSaving(s.id)
        try { await atualizarSaldo(s.id, novoSaldo) } catch (e) { console.error(e) } finally { setSaving(null) }
    }

    const inputCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div><p className="field-label mb-1">Saldos</p><h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Portfólio de Milhas</h1><p className="text-sm text-gray-400 mt-1">Gerencie os saldos de cada programa.</p></div>

            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                <div className="card card-hover p-5 border-l-4 border-l-accent animate-fadeInUp">
                    <p className="field-label mb-0">Total em Milhas</p>
                    <p className="text-3xl font-black text-gray-900 dark:text-white tabular mt-2">{fmtNum(totalMilhas)}</p>
                    <p className="text-xs text-gray-500 mt-1">milhas em todos os programas</p>
                </div>
                <div className="card card-hover p-5 border-l-4 border-l-blue-500 animate-fadeInUp" style={{ animationDelay: '60ms' }}>
                    <p className="field-label mb-0">Patrimônio Estimado</p>
                    <div className="flex items-baseline gap-1.5 mt-2"><span className="text-sm font-medium text-gray-400">R$</span><span className="text-3xl font-black text-gray-900 dark:text-white tabular">{patrimonio.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span></div>
                    <p className="text-xs text-gray-500 mt-1">baseado no custo médio/mil</p>
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                {saldos.map((s, i) => (
                    <div key={s.id} className="card card-hover p-5 animate-fadeInUp" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-accent/10"><Wallet className="w-4 h-4 text-accent" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{s.nome_programa}</h3>
                                    <p className="text-[11px] text-gray-500 tabular">{Number(s.custo_medio) > 0 ? `Custo: R$${Number(s.custo_medio).toFixed(2)}/mil` : 'Sem custo médio'}</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="field-label">Saldo Atual</label>
                            <div className="flex gap-2">
                                <input type="number" defaultValue={Math.floor(Number(s.saldo_atual))} onChange={e => setEditValues(p => ({ ...p, [s.id]: e.target.value }))} className={inputCls} />
                                <Button variant="primary" size="md" loading={saving === s.id} onClick={() => handleSave(s)} icon={<Save className="w-4 h-4" />} />
                            </div>
                        </div>
                    </div>
                ))}
                {saldos.length === 0 && <p className="text-gray-500 text-sm col-span-3 text-center py-8">Nenhum saldo. Faça uma compra para iniciar.</p>}
            </div>
        </div>
    )
}
