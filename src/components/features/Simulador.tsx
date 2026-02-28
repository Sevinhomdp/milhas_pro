'use client'

import * as React from 'react'

export function Simulador() {
    const [compradas, setCompradas] = React.useState('')
    const [saldoB, setSaldoB] = React.useState('')
    const [saldoS, setSaldoS] = React.useState('')
    const [bonus, setBonus] = React.useState('100')
    const [custo, setCusto] = React.useState('')
    const [taxas, setTaxas] = React.useState('')
    const [venda, setVenda] = React.useState('')

    const n = (v: string) => parseFloat(v) || 0
    const milhasFinais = ((n(compradas) + n(saldoB)) * (1 + n(bonus) / 100)) + n(saldoS)
    const custoTotal = n(custo) + n(taxas)
    const cpm = milhasFinais > 0 ? (custoTotal / milhasFinais) * 1000 : 0
    const cpv = milhasFinais > 0 ? (n(venda) / milhasFinais) * 1000 : 0
    const lucro = n(venda) - custoTotal
    const roi = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0

    // CPM para ROI alvo
    const cpmMax20 = n(venda) > 0 && milhasFinais > 0 ? (n(venda) / 1.20 / milhasFinais) * 1000 : 0
    const cpmMax30 = n(venda) > 0 && milhasFinais > 0 ? (n(venda) / 1.30 / milhasFinais) * 1000 : 0

    let roiText = ''; let roiColor = 'text-gray-400'
    if (n(venda) > 0) {
        if (roi < 10) { roiText = '❌ Evitar (< 10%)'; roiColor = 'text-danger' }
        else if (roi < 20) { roiText = '⚠ Só se giro rápido (10–19%)'; roiColor = 'text-warning' }
        else if (roi < 30) { roiText = '✔ Bom / Aceitável (20–29%)'; roiColor = 'text-success' }
        else if (roi <= 50) { roiText = '✔✔ Excelente (30–50%)'; roiColor = 'text-success' }
        else { roiText = '🚀 Prioridade Absoluta (> 50%)'; roiColor = 'text-accent' }
    }

    const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const hasData = milhasFinais > 0 || custoTotal > 0 || n(venda) > 0
    const inputClass = 'w-full p-3 bg-bgDark border border-borderDark rounded-xl text-white text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent'

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">Laboratório de Testes</h1>
                <p className="text-sm text-gray-400">Simule operações e descubra o potencial de lucro antes de executar.</p>
            </div>

            <div className="bg-surfaceDark p-6 rounded-2xl border border-borderDark">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        { label: 'Milhas Compradas', value: compradas, set: setCompradas },
                        { label: 'Saldo Bonificável', value: saldoB, set: setSaldoB },
                        { label: 'Saldo Seco (não bonificado)', value: saldoS, set: setSaldoS },
                        { label: 'Bônus de Transferência (%)', value: bonus, set: setBonus },
                        { label: 'Custo Compra (R$)', value: custo, set: setCusto },
                        { label: 'Taxas / Clubes (R$)', value: taxas, set: setTaxas },
                    ].map(({ label, value, set }) => (
                        <div key={label}>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">{label}</label>
                            <input type="number" value={value} onChange={e => set(e.target.value)} className={inputClass} placeholder="0" min="0" />
                        </div>
                    ))}
                    <div className="sm:col-span-2 lg:col-span-3">
                        <label className="block text-xs font-semibold text-accent mb-1 uppercase tracking-wider">💰 Valor Total de Venda (R$)</label>
                        <input type="number" value={venda} onChange={e => setVenda(e.target.value)} className={inputClass + ' border-accent/50'} placeholder="0.00" min="0" step="0.01" />
                    </div>
                </div>

                {/* Result Panel */}
                {hasData && (
                    <div className="mt-6 p-5 bg-bgDark rounded-xl border border-accent/30">
                        {/* Milhas e lucro */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Milhas Geradas', value: `${Math.floor(milhasFinais).toLocaleString('pt-BR')} mi` },
                                { label: 'Lucro Líquido', value: fmtCur(lucro), colored: true, positive: lucro >= 0 },
                                { label: 'CPM Compra', value: `R$${cpm.toFixed(2)}/mil` },
                                { label: 'CPV Venda', value: `R$${cpv.toFixed(2)}/mil` },
                            ].map(({ label, value, colored, positive }) => (
                                <div key={label} className="text-center">
                                    <div className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                                    <div className={`text-xl font-black ${colored ? (positive ? 'text-success' : 'text-danger') : 'text-white'}`}>{value}</div>
                                </div>
                            ))}
                        </div>

                        {/* ROI Box */}
                        <div className="text-center p-5 bg-surfaceDark rounded-xl border border-borderDark mb-4">
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">ROI da Operação</div>
                            <div className={`text-3xl font-black mt-1 ${roiColor}`}>
                                {n(venda) > 0 ? `${roi.toFixed(2)}%` : '—'}
                            </div>
                            {roiText && <div className="text-sm mt-1 text-gray-400">{roiText}</div>}
                        </div>

                        {/* CPM targets */}
                        {n(venda) > 0 && milhasFinais > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-success/5 border border-success/30 rounded-xl p-4 text-center">
                                    <p className="text-xs text-success uppercase tracking-wider mb-1">Para ROI de 20%</p>
                                    <p className="text-xl font-black text-success">R${cpmMax20.toFixed(2)}/mil</p>
                                    <p className="text-xs text-gray-500">CPM máximo de compra</p>
                                </div>
                                <div className="bg-success/10 border border-success/40 rounded-xl p-4 text-center">
                                    <p className="text-xs text-success uppercase tracking-wider mb-1">Para ROI de 30%</p>
                                    <p className="text-xl font-black text-success">R${cpmMax30.toFixed(2)}/mil</p>
                                    <p className="text-xs text-gray-500">CPM máximo de compra</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {!hasData && (
                    <div className="mt-6 p-5 text-center text-gray-500 text-sm">Preencha os campos acima para ver a simulação em tempo real.</div>
                )}
            </div>
        </div>
    )
}
