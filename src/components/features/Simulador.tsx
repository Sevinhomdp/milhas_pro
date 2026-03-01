'use client'

import * as React from 'react'
import { Calculator, Info, TrendingUp, ArrowRight } from 'lucide-react'
import { Badge } from '../ui/Badge'

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Simulador() {
    const [milhas, setMilhas] = React.useState(50000)
    const [bonus, setBonus] = React.useState(100)
    const [custo, setCusto] = React.useState(900)
    const [taxas, setTaxas] = React.useState(0)
    const [valorVenda, setValorVenda] = React.useState(1400)

    const milhasFinais = Math.floor(milhas * (1 + bonus / 100))
    const custoTotal = custo + taxas

    const cpmOrigem = milhas > 0 ? (custo / milhas) * 1000 : 0
    const cpmFinal = milhasFinais > 0 ? (custoTotal / milhasFinais) * 1000 : 0

    const lucro = valorVenda - custoTotal
    const roi = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0

    const cpmAlvo20 = milhasFinais > 0 && valorVenda > 0 ? ((valorVenda / 1.2) / milhasFinais) * 1000 : 0
    const cpmAlvo30 = milhasFinais > 0 && valorVenda > 0 ? ((valorVenda / 1.3) / milhasFinais) * 1000 : 0

    const classRoi = roi >= 30 ? 'text-success' : roi >= 15 ? 'text-accent' : roi >= 0 ? 'text-warning' : 'text-danger'
    const labelRoi = roi >= 30 ? '🚀 Meta Batida' : roi >= 15 ? '✔ Operação Saudável' : roi >= 0 ? '⚡ Margem Estreita' : '⚠ Prejuízo Detectado'

    const inputCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="field-label mb-1">Cálculo Prévio</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Calculator className="text-accent w-7 h-7" /> Simulador de ROI
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Simule custos e lucros antes de assinar o plano ou transferir.</p>
                </div>

                <div className="hidden lg:flex items-start gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10 max-w-sm animate-fadeInUp">
                    <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-accent">Dica do Simulador</p>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                            O ROI real deve considerar todas as taxas extras (emissão, anuidade proporcional, etc.) para que você não tenha surpresas no fechamento do DRE.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form */}
                <div className="card p-6 space-y-5">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        🛠 Parâmetros de Entrada
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="field-label">Milhas Base</label><input type="number" value={milhas} onChange={e => setMilhas(Number(e.target.value))} className={inputCls} min="0" /></div>
                        <div><label className="field-label">Bônus da Promo (%)</label><input type="number" value={bonus} onChange={e => setBonus(Number(e.target.value))} className={inputCls} min="0" max="1000" /></div>
                        <div><label className="field-label">Custo do Bloco (R$)</label><input type="number" value={custo} onChange={e => setCusto(Number(e.target.value))} className={inputCls} step="0.01" min="0" /></div>
                        <div><label className="field-label">Taxas Extras (R$)</label><input type="number" value={taxas} onChange={e => setTaxas(Number(e.target.value))} className={inputCls} step="0.01" min="0" /></div>
                        <div className="sm:col-span-2"><label className="field-label">Previsão de Venda Total (R$)</label><input type="number" value={valorVenda} onChange={e => setValorVenda(Number(e.target.value))} className={inputCls} step="0.01" min="0" /></div>
                    </div>
                    {bonus > 0 && (
                        <div className="card p-4 bg-accent/5 border-dashed border-accent/20 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Milhas Acumuladas</span>
                            <span className="text-xl font-black text-accent tabular">{milhasFinais.toLocaleString('pt-BR')}</span>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="card p-6 space-y-6">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">🎯 Resultado da Projeção</h3>
                    <div className={`card overflow-hidden border-t-4 ${roi >= 15 ? 'border-t-success' : roi >= 0 ? 'border-t-accent' : 'border-t-danger'} p-6 text-center bg-gray-50/50 dark:bg-white/[0.01]`}>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">ROI ESTIMADO</p>
                        <p className={`text-5xl font-black tabular ${classRoi}`}>{roi.toFixed(1)}%</p>
                        <Badge variant={roi >= 15 ? 'success' : roi >= 0 ? 'warning' : 'danger'} className="mt-3 py-1 px-4">{labelRoi}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="card p-4 space-y-1 bg-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Lucro Líquido</p>
                            <p className={`text-xl font-black tabular ${lucro >= 0 ? 'text-success' : 'text-danger'}`}>{fmtCur(lucro)}</p>
                        </div>
                        <div className="card p-4 space-y-1 bg-white/5">
                            <p className="text-[10px] text-gray-500 uppercase font-bold text-accent">CPM Final</p>
                            <p className="text-xl font-black tabular text-gray-900 dark:text-white">R$ {cpmFinal.toFixed(2)}</p>
                        </div>
                    </div>

                    <div className="card p-5 border-blue-500/20 bg-blue-500/5">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Onde comprar para lucrar?</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Para ROI de <span className="text-white font-bold">20%</span> compre milheiro a:</span>
                                <span className="font-black text-accent tabular">R$ {cpmAlvo20.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Para ROI de <span className="text-white font-bold">30%</span> compre milheiro a:</span>
                                <span className="font-black text-success tabular">R$ {cpmAlvo30.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
