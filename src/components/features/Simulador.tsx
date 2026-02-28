'use client'

import * as React from 'react'
import { Calculator } from 'lucide-react'

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Simulador() {
    const [milhas, setMilhas] = React.useState(50000)
    const [bonus, setBonus] = React.useState(100)
    const [custo, setCusto] = React.useState(900)
    const [valorVenda, setValorVenda] = React.useState(1200)

    const milhasFinais = Math.floor(milhas * (1 + bonus / 100))
    const cpm = milhas > 0 ? (custo / milhas) * 1000 : 0
    const cpmFinal = milhasFinais > 0 ? (custo / milhasFinais) * 1000 : 0
    const cpv = milhasFinais > 0 ? (valorVenda / milhasFinais) * 1000 : 0
    const lucro = valorVenda - custo
    const roi = custo > 0 ? (lucro / custo) * 100 : 0

    const cpmAlvo20 = milhasFinais > 0 && valorVenda > 0 ? ((valorVenda / 1.2) / milhasFinais) * 1000 : 0
    const cpmAlvo30 = milhasFinais > 0 && valorVenda > 0 ? ((valorVenda / 1.3) / milhasFinais) * 1000 : 0

    const classRoi = roi >= 30 ? 'text-success' : roi >= 15 ? 'text-accent' : roi >= 0 ? 'text-warning' : 'text-danger'
    const labelRoi = roi >= 30 ? '🚀 Excelente' : roi >= 15 ? '✔ Bom' : roi >= 0 ? '⚡ Aceitável' : '⚠ Negativo'

    const inputCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div><p className="field-label mb-1">Análise</p><h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2"><Calculator className="text-accent w-7 h-7" /> Simulador</h1><p className="text-sm text-gray-400 mt-1">Calcule o retorno de uma operação antes de executar.</p></div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="card p-6 space-y-5">
                    <h2 className="field-label">Parâmetros da Operação</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="field-label">Milhas Compradas</label><input type="number" value={milhas} onChange={e => setMilhas(Number(e.target.value))} className={inputCls} min="0" /></div>
                        <div><label className="field-label">Bônus (%)</label><input type="number" value={bonus} onChange={e => setBonus(Number(e.target.value))} className={inputCls} min="0" max="1000" /></div>
                        <div><label className="field-label">Custo Total (R$)</label><input type="number" value={custo} onChange={e => setCusto(Number(e.target.value))} className={inputCls} step="0.01" min="0" /></div>
                        <div><label className="field-label">Valor de Venda (R$)</label><input type="number" value={valorVenda} onChange={e => setValorVenda(Number(e.target.value))} className={inputCls} step="0.01" min="0" /></div>
                    </div>
                    {bonus > 0 && <div className="card p-4 border-accent/20"><p className="field-label mb-0">Milhas Finais (com bônus)</p><p className="text-lg font-black text-accent tabular mt-1">{milhasFinais.toLocaleString('pt-BR')}</p></div>}
                </div>

                {/* Results */}
                <div className="card p-6 space-y-4">
                    <h2 className="field-label">Resultado Projetado</h2>
                    <div className={`card border-l-4 ${roi >= 15 ? 'border-l-green-500' : roi >= 0 ? 'border-l-amber-500' : 'border-l-red-500'} p-5 text-center`}>
                        <p className="field-label mb-0">ROI</p>
                        <p className={`text-4xl font-black tabular ${classRoi}`}>{roi.toFixed(1)}%</p>
                        <p className={`text-xs font-bold mt-1 ${classRoi}`}>{labelRoi}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="card p-4"><p className="field-label mb-0">Lucro</p><p className={`text-lg font-black tabular mt-1 ${lucro >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(lucro)}</p></div>
                        <div className="card p-4"><p className="field-label mb-0">CPM (c/ bônus)</p><p className={`text-lg font-black tabular mt-1 ${cpmFinal < 18 ? 'text-success' : cpmFinal < 25 ? 'text-accent' : 'text-danger'}`}>R${cpmFinal.toFixed(2)}</p></div>
                        <div className="card p-4"><p className="field-label mb-0">CPM (s/ bônus)</p><p className="text-lg font-black tabular mt-1 text-gray-900 dark:text-white">R${cpm.toFixed(2)}</p></div>
                        <div className="card p-4"><p className="field-label mb-0">CPV</p><p className="text-lg font-black tabular mt-1 text-blue-400">R${cpv.toFixed(2)}</p></div>
                    </div>
                    <div className="card p-4 border-accent/20">
                        <h3 className="field-label">Alvos de CPM</h3>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                            <div><span className="text-[11px] text-gray-500">p/ ROI 20%:</span><span className="text-sm font-black text-accent tabular ml-1.5">R${cpmAlvo20.toFixed(2)}</span></div>
                            <div><span className="text-[11px] text-gray-500">p/ ROI 30%:</span><span className="text-sm font-black text-success tabular ml-1.5">R${cpmAlvo30.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
