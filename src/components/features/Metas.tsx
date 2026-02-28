'use client'

import * as React from 'react'
import { Meta, Operacao } from '@/src/types'
import { salvarMeta } from '@/src/app/actions'
import { Loader2, Target, TrendingUp } from 'lucide-react'

interface MetasProps {
    metas: Meta[]
    operacoes: Operacao[]
}

export function Metas({ metas, operacoes }: MetasProps) {
    const [mes, setMes] = React.useState(() => new Date().toISOString().substring(0, 7))
    const [loading, setLoading] = React.useState(false)

    // Find meta for selected month
    const metaAtual = metas.find(m => m.mes === mes) || { meta_lucro: 0, meta_volume_milhas: 0 }

    const [metaLucro, setMetaLucro] = React.useState(() => metaAtual.meta_lucro)
    const [metaVolume, setMetaVolume] = React.useState(() => metaAtual.meta_volume_milhas)

    React.useEffect(() => {
        const m = metas.find(x => x.mes === mes)
        setMetaLucro(m?.meta_lucro || 0)
        setMetaVolume(m?.meta_volume_milhas || 0)
    }, [mes, metas])

    const handleSave = async () => {
        setLoading(true)
        try {
            await salvarMeta(mes, metaLucro, metaVolume)
        } catch (e) {
            console.error(e)
            alert("Erro ao salvar meta.")
        } finally {
            setLoading(false)
        }
    }

    // Calculate actuals
    let lucroReal = 0
    let volReal = 0

    // To perfectly calculate month's net profit we should ideally subtract this month's costs.
    // For simplicity based on template, we just sum VENDA minus their inferred costs based on CPM and amount,
    // or use the precalculated `roi` / `lucro` of operations in this month.
    // Wait, our `operacoes` VENDA doesn't explicitly store lucro, it stores `roi`. 
    // Let's approximate: 
    operacoes.forEach(o => {
        if (o.data?.startsWith(mes)) {
            if (o.tipo === 'VENDA') {
                volReal += Number(o.quantidade) || 0
                // Lucro da venda = Valor Total - (Quantidade * CustoMedio)
                // Since we don't have CustoMedio at the time explicitly saved on the operation except via derived ROI.
                // ROI = Lucro / Custo => Custo = Valor_Total / (1 + ROI/100)
                // Lucro = Valor_Total - Custo
                const valor = Number(o.valor_total) || 0
                const roi = Number(o.roi) || 0
                const custo = valor / (1 + roi / 100)
                const lucroOp = valor - custo
                lucroReal += lucroOp
            } else if (o.tipo === 'TRANSF') {
                // As taxas daquele mes abatem o lucro
                const taxa = Number(o.valor_total) || 0
                lucroReal -= taxa
            }
        }
    })

    const pctLucro = metaLucro > 0 ? Math.min(100, (Math.max(0, lucroReal) / metaLucro) * 100) : 0
    const pctVol = metaVolume > 0 ? Math.min(100, (volReal / metaVolume) * 100) : 0

    const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Objetivos Mensais
                </h1>
                <p className="text-sm text-gray-400">Defina e acompanhe suas metas de faturamento e volume.</p>
            </div>

            <div className="bg-surfaceDark p-5 rounded-2xl border border-borderDark shadow-sm max-w-2xl mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Mês de Referência</label>
                        <input
                            type="month"
                            value={mes}
                            onChange={e => setMes(e.target.value)}
                            className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm outline-none focus:border-accent"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Meta de Lucro (R$)</label>
                        <input
                            type="number"
                            value={metaLucro === 0 ? '' : metaLucro}
                            placeholder="Ex: 5000"
                            onChange={e => setMetaLucro(Number(e.target.value))}
                            onBlur={handleSave}
                            className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm outline-none focus:border-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Meta de Vendas (Milhas)</label>
                        <input
                            type="number"
                            value={metaVolume === 0 ? '' : metaVolume}
                            placeholder="Ex: 1000000"
                            onChange={e => setMetaVolume(Number(e.target.value))}
                            onBlur={handleSave}
                            className="w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm outline-none focus:border-accent"
                        />
                    </div>
                </div>

                {loading && <div className="text-xs text-accent mt-3 animate-pulse">Salvando alterações...</div>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="bg-bgDark p-6 rounded-2xl border border-borderDark shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-surfaceDark rounded-xl border border-borderDark text-accent"><Target className="w-5 h-5" /></div>
                        <div>
                            <h3 className="font-bold text-white">Lucro Projetado</h3>
                            <p className="text-[11px] text-gray-400">Progresso do Mês</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className={`text-2xl font-black ${lucroReal >= metaLucro && metaLucro > 0 ? 'text-success' : 'text-white'}`}>
                                {fmt(lucroReal)}
                            </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-400">
                            de {fmt(metaLucro)}
                        </div>
                    </div>

                    <div className="w-full bg-surfaceDark rounded-full h-3 mb-1 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ${pctLucro >= 100 ? 'bg-success' : 'bg-accent'}`}
                            style={{ width: `${pctLucro}%` }}
                        ></div>
                    </div>
                    <div className="text-right text-[10px] text-gray-500 font-bold">{pctLucro.toFixed(1)}% Alcançado</div>
                </div>

                <div className="bg-bgDark p-6 rounded-2xl border border-borderDark shadow-lg">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-surfaceDark rounded-xl border border-borderDark text-blue-400"><TrendingUp className="w-5 h-5" /></div>
                        <div>
                            <h3 className="font-bold text-white">Volume de Milhas</h3>
                            <p className="text-[11px] text-gray-400">Milhas Vendidas no Mês</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                        <div>
                            <div className={`text-2xl font-black ${volReal >= metaVolume && metaVolume > 0 ? 'text-blue-400' : 'text-white'}`}>
                                {volReal.toLocaleString('pt-BR')}
                            </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-400">
                            de {metaVolume.toLocaleString('pt-BR')} mi
                        </div>
                    </div>

                    <div className="w-full bg-surfaceDark rounded-full h-3 mb-1 overflow-hidden">
                        <div
                            className={`h-3 rounded-full transition-all duration-1000 ${pctVol >= 100 ? 'bg-blue-400' : 'bg-gray-400'}`}
                            style={{ width: `${pctVol}%` }}
                        ></div>
                    </div>
                    <div className="text-right text-[10px] text-gray-500 font-bold">{pctVol.toFixed(1)}% Alcançado</div>
                </div>
            </div>
        </div>
    )
}
