'use client'

import * as React from 'react'
import { useState } from 'react'

export function Simulador() {
    const [compradas, setCompradas] = useState<number>(0)
    const [saldoB, setSaldoB] = useState<number>(0)
    const [saldoS, setSaldoS] = useState<number>(0)
    const [bonus, setBonus] = useState<number>(100)
    const [custoCompra, setCustoCompra] = useState<number>(0)
    const [taxas, setTaxas] = useState<number>(0)
    const [valorVenda, setValorVenda] = useState<number>(0)

    const milhasFinais = ((compradas + saldoB) * (1 + bonus / 100)) + saldoS
    const custoTotal = custoCompra + taxas
    const cpm = milhasFinais > 0 ? (custoTotal / milhasFinais) * 1000 : 0
    const cpv = milhasFinais > 0 ? (valorVenda / milhasFinais) * 1000 : 0
    const lucro = valorVenda - custoTotal
    const roi = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0

    let roiText = ''
    let roiColor = ''
    if (roi < 10) {
        roiText = '❌ Evitar (< 10%)'
        roiColor = 'text-danger'
    } else if (roi < 20) {
        roiText = '⚠ Só se giro rápido (10–19%)'
        roiColor = 'text-warning'
    } else if (roi < 30) {
        roiText = '✔ Bom / Aceitável (20–29%)'
        roiColor = 'text-success'
    } else if (roi <= 50) {
        roiText = '✔✔ Excelente (30–50%)'
        roiColor = 'text-success'
    } else {
        roiText = '🚀 Prioridade Absoluta (> 50%)'
        roiColor = 'text-accent'
    }

    const isBlank = milhasFinais === 0 && custoTotal === 0 && valorVenda === 0

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Laboratório de Testes
                </h1>
                <p className="text-sm text-gray-400">Simule operações de compra e transferência bonificada.</p>
            </div>

            <div className="bg-surfaceDark p-5 rounded-2xl shadow-sm border border-borderDark mb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Milhas Compradas</label>
                        <input type="number" value={compradas || ''} onChange={e => setCompradas(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-bgDark border border-borderDark rounded-xl text-white text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Saldo Bonificável</label>
                        <input type="number" value={saldoB || ''} onChange={e => setSaldoB(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-bgDark border border-borderDark rounded-xl text-white text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Saldo Seco</label>
                        <input type="number" value={saldoS || ''} onChange={e => setSaldoS(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-bgDark border border-borderDark rounded-xl text-white text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Bônus (%)</label>
                        <input type="number" value={bonus || ''} onChange={e => setBonus(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-bgDark border border-borderDark rounded-xl text-white text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Custo Compra (R$)</label>
                        <input type="number" value={custoCompra || ''} onChange={e => setCustoCompra(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-bgDark border border-borderDark rounded-xl text-white text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Taxas/Clubes (R$)</label>
                        <input type="number" value={taxas || ''} onChange={e => setTaxas(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-bgDark border border-borderDark rounded-xl text-white text-sm focus:outline-none focus:border-accent" />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-3 xl:col-span-6">
                        <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider text-accent">Valor Total Da Venda (R$)</label>
                        <input type="number" value={valorVenda || ''} onChange={e => setValorVenda(parseFloat(e.target.value) || 0)} className="w-full p-3 bg-bgDark border border-accent rounded-xl text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>
                </div>

                <div className="mt-6 p-5 bg-bgDark rounded-xl border-l-4 border-l-accent">
                    {isBlank ? (
                        <p className="text-gray-400 text-sm">Aguardando dados da simulação...</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <div className="text-[11px] text-gray-400 uppercase mb-1 tracking-wider">Milhas Geradas</div>
                                    <div className="text-xl font-bold text-white">{Math.floor(milhasFinais).toLocaleString('pt-BR')}</div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-gray-400 uppercase mb-1 tracking-wider">Lucro Líquido</div>
                                    <div className={`text-xl font-bold ${lucro >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {lucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-gray-400 uppercase mb-1 tracking-wider">CPM Compra</div>
                                    <div className="text-lg font-semibold text-white">
                                        {cpm.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[11px] text-gray-400 uppercase mb-1 tracking-wider">CPV Venda</div>
                                    <div className="text-lg font-semibold text-white">
                                        {cpv.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center p-4 bg-surfaceDark rounded-xl border border-borderDark">
                                <div className="text-[11px] text-gray-400 uppercase tracking-wider">ROI da Operação</div>
                                <div className={`text-2xl font-bold mt-1 ${roiColor}`}>
                                    {roi.toFixed(2)}% — {roiText}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
