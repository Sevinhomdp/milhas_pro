'use client'

import * as React from 'react'
import { Operacao } from '@/src/types'

interface DREProps {
    operacoes: Operacao[]
}

export function DRE({ operacoes }: DREProps) {
    // Aggregate operations by month (YYYY-MM)
    const mesesAgg: Record<string, { receitas: number; custos: number; taxas: number; qtdVendas: number; qtdCompras: number; qtdMilhasVendidas: number; qtdMilhasCompradas: number }> = {}

    operacoes.forEach(o => {
        if (!o.data) return
        const mes = o.data.substring(0, 7) // '2023-11'
        if (!mesesAgg[mes]) {
            mesesAgg[mes] = { receitas: 0, custos: 0, taxas: 0, qtdVendas: 0, qtdCompras: 0, qtdMilhasVendidas: 0, qtdMilhasCompradas: 0 }
        }

        const val = Number(o.valor_total) || 0
        const qtd = Number(o.quantidade) || 0

        if (o.tipo === 'VENDA') {
            mesesAgg[mes].receitas += val
            mesesAgg[mes].qtdVendas++
            mesesAgg[mes].qtdMilhasVendidas += qtd
        } else if (o.tipo === 'COMPRA') {
            mesesAgg[mes].custos += val
            mesesAgg[mes].qtdCompras++
            mesesAgg[mes].qtdMilhasCompradas += qtd
        } else if (o.tipo === 'TRANSF') {
            mesesAgg[mes].taxas += val
        }
    })

    const sortedMeses = Object.keys(mesesAgg).sort().reverse()
    const [selectedMes, setSelectedMes] = React.useState<string>(sortedMeses[0] || '')

    React.useEffect(() => {
        if (sortedMeses.length > 0 && (!selectedMes || !sortedMeses.includes(selectedMes))) {
            setSelectedMes(sortedMeses[0])
        }
    }, [sortedMeses, selectedMes])

    if (sortedMeses.length === 0) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">DRE Mensal</h1>
                    <p className="text-sm text-gray-400">Demonstrativo de Resultados do Exercício.</p>
                </div>
                <div className="bg-surfaceDark p-10 rounded-2xl border border-borderDark shadow-sm text-center">
                    <p className="text-gray-500">Nenhuma operação lançada que gere resultados consolidados.</p>
                </div>
            </div>
        )
    }

    const m = mesesAgg[selectedMes] || { receitas: 0, custos: 0, taxas: 0, qtdVendas: 0, qtdCompras: 0, qtdMilhasVendidas: 0, qtdMilhasCompradas: 0 }
    const lucro = m.receitas - m.custos - m.taxas
    const margem = m.receitas > 0 ? (lucro / m.receitas) * 100 : 0
    const cpm = m.qtdMilhasCompradas > 0 ? (m.custos / m.qtdMilhasCompradas) * 1000 : 0
    const cpv = m.qtdMilhasVendidas > 0 ? (m.receitas / m.qtdMilhasVendidas) * 1000 : 0

    const [year, month] = selectedMes.split('-')
    const dateObj = new Date(parseInt(year), parseInt(month) - 1)
    const monthName = dateObj.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

    const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">DRE Mensal</h1>
                <p className="text-sm text-gray-400">Demonstrativo de Resultados do Exercício.</p>
            </div>

            <div className="flex gap-2 flex-wrap mb-2">
                {sortedMeses.map(mes => {
                    const [y, m] = mes.split('-')
                    const shortName = new Date(parseInt(y), parseInt(m) - 1).toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
                    return (
                        <button
                            key={mes}
                            onClick={() => setSelectedMes(mes)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors border ${selectedMes === mes
                                    ? 'bg-primary border-primary text-white shadow-md'
                                    : 'bg-surfaceDark border-borderDark text-gray-400 hover:text-white'
                                }`}
                        >
                            {shortName}
                        </button>
                    )
                })}
            </div>

            <div className="bg-surfaceDark p-6 lg:p-8 rounded-2xl border border-borderDark shadow-sm max-w-4xl mx-auto">
                <h2 className="text-xl font-bold text-white capitalize mb-6 pb-4 border-b border-borderDark">
                    {monthName}
                </h2>

                <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-borderDark/50">
                        <span className="text-gray-300">
                            📥 Receita de Vendas <span className="text-gray-500 text-xs ml-1">({m.qtdVendas} vendas · {Math.floor(m.qtdMilhasVendidas).toLocaleString('pt-BR')} milhas)</span>
                        </span>
                        <span className="font-semibold text-success">{fmt(m.receitas)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-borderDark/50">
                        <span className="text-gray-300">
                            📤 Custo de Compras <span className="text-gray-500 text-xs ml-1">({m.qtdCompras} compras · {Math.floor(m.qtdMilhasCompradas).toLocaleString('pt-BR')} milhas)</span>
                        </span>
                        <span className="font-semibold text-danger">({fmt(m.custos)})</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b border-borderDark/50">
                        <span className="text-gray-300">💸 Taxas e Clubes</span>
                        <span className="font-semibold text-danger">({fmt(m.taxas)})</span>
                    </div>

                    <div className="flex justify-between items-center py-4 mt-4 border-t-2 border-accent">
                        <span className="font-bold text-lg text-white">💰 Lucro Líquido</span>
                        <span className={`font-bold text-lg ${lucro >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(lucro)}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    <div className="bg-bgDark p-5 rounded-xl border border-borderDark text-center">
                        <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Margem Líquida</div>
                        <div className={`text-2xl font-bold ${margem >= 20 ? 'text-success' : margem >= 10 ? 'text-warning' : 'text-danger'}`}>
                            {margem.toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-bgDark p-5 rounded-xl border border-borderDark text-center border-b-4 border-b-blue-500">
                        <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">CPM Médio Compras</div>
                        <div className="text-2xl font-bold text-white">
                            {m.qtdMilhasCompradas > 0 ? fmt(cpm) : '—'}
                        </div>
                    </div>
                    <div className="bg-bgDark p-5 rounded-xl border border-borderDark text-center border-b-4 border-b-green-500">
                        <div className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">CPV Médio Vendas</div>
                        <div className="text-2xl font-bold text-white">
                            {m.qtdMilhasVendidas > 0 ? fmt(cpv) : '—'}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
