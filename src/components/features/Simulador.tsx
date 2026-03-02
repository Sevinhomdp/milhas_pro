'use client'

import * as React from 'react'
import { Calculator, Info, TrendingUp, RefreshCw } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '@/src/lib/utils'

const fmtNumber = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })

export interface SimuladorProps {
    theme?: 'light' | 'dark'
}

export default function Simulador({ theme }: SimuladorProps) {
    const [milhasCompra, setMilhasCompra] = React.useState(100000)
    const [saldoBonus, setSaldoBonus] = React.useState(0)
    const [saldoSeco, setSaldoSeco] = React.useState(0)
    const [bonus, setBonus] = React.useState(80)
    const [custoFixo, setCustoFixo] = React.useState(1600)
    const [taxasClubes, setTaxasClubes] = React.useState(0)
    const [valorVenda, setValorVenda] = React.useState(2400)

    const [gastoCartao, setGastoCartao] = React.useState(1600)
    const [pontosPorDolar, setPontosPorDolar] = React.useState(2.2)
    const [cotacaoUsd, setCotacaoUsd] = React.useState(5.4)
    const [nomeCartao, setNomeCartao] = React.useState('seu cartão')
    const [loadingUsd, setLoadingUsd] = React.useState(false)

    React.useEffect(() => {
        setGastoCartao(custoFixo)
    }, [custoFixo])

    const fetchDolar = async () => {
        setLoadingUsd(true)
        try {
            const r = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
            const d = await r.json()
            const ask = Number(d?.USDBRL?.ask)
            if (!Number.isNaN(ask) && ask > 0) setCotacaoUsd(ask)
        } finally {
            setLoadingUsd(false)
        }
    }

    React.useEffect(() => {
        void fetchDolar()
    }, [])

    const milhasGeradasOperacao = ((milhasCompra + saldoBonus) * (1 + bonus / 100)) + saldoSeco
    const custoTotal = custoFixo + taxasClubes
    const cpmCompra = milhasGeradasOperacao > 0 ? custoTotal / (milhasGeradasOperacao / 1000) : 0
    const lucroLiquido = valorVenda - custoTotal
    const cpvVenda = milhasGeradasOperacao > 0 ? valorVenda / (milhasGeradasOperacao / 1000) : 0
    const roi = custoTotal > 0 ? (lucroLiquido / custoTotal) * 100 : 0

    const statusRoi = roi > 30 ? 'Excelente' : roi >= 15 ? 'Bom' : 'Atenção'
    const statusVariant = roi > 30 ? 'success' : roi >= 15 ? 'warning' : 'danger'

    const milhasGeradasCartao = cotacaoUsd > 0 ? (gastoCartao / cotacaoUsd) * pontosPorDolar : 0
    const milhasTotaisComCartao = milhasGeradasOperacao + milhasGeradasCartao
    const cpmRealFinal = milhasTotaisComCartao > 0 ? custoTotal / (milhasTotaisComCartao / 1000) : 0
    const lucroPotencialComCartao = valorVenda - ((cpmRealFinal * milhasGeradasOperacao) / 1000)
    const ganhoEstimado = lucroPotencialComCartao - lucroLiquido

    const inputCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150 tabular'

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="field-label mb-1">Laboratório de Testes</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Calculator className="text-accent w-7 h-7" /> Simulador de Milhas
                    </h1>
                </div>
                <div className="hidden lg:flex items-start gap-3 p-4 rounded-2xl bg-accent/5 border border-accent/10 max-w-sm animate-fadeInUp">
                    <Info className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <p className="text-[11px] text-gray-500 leading-relaxed">O simulador integra operação + ganho no cartão para estimar um CPM real final.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="card p-6 space-y-4 xl:col-span-2">
                    <h3 className="text-sm font-bold">1) Operação de Milhas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><label className="field-label">Milhas Compradas</label><input type="number" className={inputCls} value={milhasCompra} onChange={e => setMilhasCompra(Number(e.target.value))} min="0" /></div>
                        <div><label className="field-label">Saldo Bonificável</label><input type="number" className={inputCls} value={saldoBonus} onChange={e => setSaldoBonus(Number(e.target.value))} min="0" /></div>
                        <div><label className="field-label">Saldo Seco</label><input type="number" className={inputCls} value={saldoSeco} onChange={e => setSaldoSeco(Number(e.target.value))} min="0" /></div>
                        <div><label className="field-label">Bônus (%)</label><input type="number" className={inputCls} value={bonus} onChange={e => setBonus(Number(e.target.value))} min="0" /></div>
                        <div><label className="field-label">Custo Compra (R$)</label><input type="number" className={inputCls} value={custoFixo} onChange={e => setCustoFixo(Number(e.target.value))} min="0" step="0.01" /></div>
                        <div><label className="field-label">Taxas/Clubes (R$)</label><input type="number" className={inputCls} value={taxasClubes} onChange={e => setTaxasClubes(Number(e.target.value))} min="0" step="0.01" /></div>
                        <div className="sm:col-span-2"><label className="field-label">Valor Total da Venda (R$)</label><input type="number" className={inputCls} value={valorVenda} onChange={e => setValorVenda(Number(e.target.value))} min="0" step="0.01" /></div>
                    </div>
                </div>

                <div className="card p-6 space-y-4">
                    <h3 className="text-sm font-bold">2) Ganho no Cartão</h3>
                    <div><label className="field-label">Nome do Cartão</label><input type="text" className={inputCls} value={nomeCartao} onChange={e => setNomeCartao(e.target.value)} /></div>
                    <div><label className="field-label">Gasto no Cartão (R$)</label><input type="number" className={inputCls} value={gastoCartao} onChange={e => setGastoCartao(Number(e.target.value))} min="0" step="0.01" /></div>
                    <div><label className="field-label">Pontos por Dólar</label><input type="number" className={inputCls} value={pontosPorDolar} onChange={e => setPontosPorDolar(Number(e.target.value))} min="0" step="0.1" /></div>
                    <div>
                        <label className="field-label">Cotação Dólar (R$)</label>
                        <div className="flex gap-2">
                            <input type="number" className={inputCls} value={cotacaoUsd} onChange={e => setCotacaoUsd(Number(e.target.value))} min="0.01" step="0.01" />
                            <button onClick={fetchDolar} className="px-3 rounded-xl bg-slate-100 dark:bg-white/10" disabled={loadingUsd}><RefreshCw className={`w-4 h-4 ${loadingUsd ? 'animate-spin' : ''}`} /></button>
                        </div>
                    </div>
                    <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/20">
                        <p className="text-xs font-bold">Milhas geradas no cartão: <span className="text-amber-500">{fmtNumber(milhasGeradasCartao)}</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="card p-4"><p className="field-label">Milhas Geradas (Operação)</p><p className="text-2xl font-black">{fmtNumber(milhasGeradasOperacao)}</p></div>
                <div className="card p-4"><p className="field-label">CPM Compra</p><p className="text-2xl font-black">{formatCurrency(cpmCompra)}</p></div>
                <div className="card p-4"><p className="field-label">CPV Venda</p><p className="text-2xl font-black">{formatCurrency(cpvVenda)}</p></div>
                <div className="card p-4"><p className="field-label">Lucro Líquido</p><p className="text-2xl font-black">{formatCurrency(lucroLiquido)}</p></div>
                <div className="card p-4"><p className="field-label">ROI da Operação</p><p className="text-2xl font-black">{roi.toFixed(2)}%</p></div>
                <div className="card p-4"><p className="field-label">Status</p><Badge variant={statusVariant as any}>{statusRoi}</Badge></div>
            </div>

            <div className="card p-6 border border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-4 h-4 text-blue-400" /><h4 className="text-sm font-black">Indicador de Viabilidade</h4></div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Ao utilizar o cartão <b>{nomeCartao || 'selecionado'}</b>, você reduz o seu CPM de <b>{formatCurrency(cpmCompra)}</b> para <b>{formatCurrency(cpmRealFinal)}</b>. Isso aumenta o seu lucro em <b>{formatCurrency(ganhoEstimado)}</b>. {ganhoEstimado > 0 ? 'Vale a pena executar.' : 'Revise as premissas antes de executar.'}
                </p>
            </div>
        </div>
    )
}
