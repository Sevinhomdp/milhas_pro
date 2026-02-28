'use client'

import * as React from 'react'
import { Operacao, FaturaParcela, Cartao } from '@/src/types'
import { pagarParcelas } from '@/src/app/actions'
import { Check } from 'lucide-react'

interface ProjecaoProps {
    operacoes: Operacao[]
    faturas: FaturaParcela[]
    cartoes: Cartao[]
}

export function Projecao({ operacoes, faturas, cartoes }: ProjecaoProps) {
    const [pagando, setPagando] = React.useState<string | null>(null)

    // Aggregate by month (YYYY-MM)
    const mesesAgg: Record<string, {
        entradasPrevistas: number; // vendas pendentes
        entradasRealizadas: number; // vendas recebidas
        saidasPrevistas: number; // faturas em aberto
        saidasRealizadas: number; // faturas pagas
        detalhesFaturas: Record<string, { valorTotal: number; pago: boolean }>; // cartao_id -> { valor, pago }
    }> = {}

    // 1. Processar Vendas
    operacoes.forEach(o => {
        if (o.tipo === 'VENDA' && o.data_recebimento) {
            const mes = o.data_recebimento.substring(0, 7)
            if (!mesesAgg[mes]) mesesAgg[mes] = { entradasPrevistas: 0, entradasRealizadas: 0, saidasPrevistas: 0, saidasRealizadas: 0, detalhesFaturas: {} }

            const val = Number(o.valor_total) || 0
            if (o.status_recebimento === 'recebido') {
                mesesAgg[mes].entradasRealizadas += val
            } else {
                mesesAgg[mes].entradasPrevistas += val
            }
        }
    })

    // 2. Processar Faturas (Saídas)
    faturas.forEach(f => {
        const mes = f.mes_referencia
        if (!mesesAgg[mes]) mesesAgg[mes] = { entradasPrevistas: 0, entradasRealizadas: 0, saidasPrevistas: 0, saidasRealizadas: 0, detalhesFaturas: {} }

        const val = Number(f.valor) || 0
        if (f.pago) {
            mesesAgg[mes].saidasRealizadas += val
        } else {
            mesesAgg[mes].saidasPrevistas += val
        }

        if (!mesesAgg[mes].detalhesFaturas[f.cartao_id]) {
            mesesAgg[mes].detalhesFaturas[f.cartao_id] = { valorTotal: 0, pago: !!f.pago }
        }
        // Assume mixed status means partially paid, but for simplicity we treat card invoice status by whatever the last parsed one was, 
        // ideally all parcels for a card in that month share the paid state.
        mesesAgg[mes].detalhesFaturas[f.cartao_id].valorTotal += val
    })

    const sortedMeses = Object.keys(mesesAgg).sort().reverse()

    const handlePagarFatura = async (cartaoId: string, mesReferencia: string) => {
        if (!confirm("Confirmar pagamento da fatura deste cartão no respectivo mês?")) return
        setPagando(`${cartaoId}-${mesReferencia}`)
        try {
            await pagarParcelas(cartaoId, mesReferencia)
        } catch (e) {
            console.error(e)
            alert("Erro ao marcar como pago.")
        } finally {
            setPagando(null)
        }
    }

    const getNomeCartao = (id: string) => cartoes.find(c => c.id === id)?.nome || 'Cartão Desconhecido'

    const fmt = (val: number) => val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

    if (sortedMeses.length === 0) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-bold tracking-tight text-white">Fluxo de Caixa / Projeção</h1>
                <div className="bg-surfaceDark p-10 rounded-2xl border border-borderDark text-center">
                    <p className="text-gray-500">Nenhuma previsão futura registrada.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">Fluxo de Caixa</h1>
                <p className="text-sm text-gray-400">Previsão de Entradas (Vendas a receber) vs Saídas (Faturas de cartão).</p>
            </div>

            <div className="space-y-6">
                {sortedMeses.map(mes => {
                    const m = mesesAgg[mes]
                    const totalEntradas = m.entradasPrevistas // só o que falta receber
                    const totalSaidas = m.saidasPrevistas // só o que falta pagar
                    const saldoProjetado = totalEntradas - totalSaidas // Saldo pendente mensal

                    const [y, mm] = mes.split('-')
                    const monthName = new Date(parseInt(y), parseInt(mm) - 1).toLocaleString('pt-BR', { month: 'long', year: 'numeric' })

                    return (
                        <div key={mes} className="bg-surfaceDark p-6 rounded-2xl border border-borderDark shadow-sm overflow-hidden">
                            <h2 className="text-lg font-bold text-white capitalize mb-4 pb-2 border-b border-borderDark">
                                {monthName}
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Lado Esquerdo: Totais */}
                                <div className="space-y-4">
                                    <div className="flex justify-between p-3 rounded-xl bg-bgDark border border-borderDark/40">
                                        <div>
                                            <div className="text-[11px] text-gray-400 uppercase tracking-widest">A Receber (Vendas)</div>
                                            <div className="text-lg font-bold text-success mt-1">{fmt(totalEntradas)}</div>
                                        </div>
                                        {m.entradasRealizadas > 0 && (
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase">Já Recebido</div>
                                                <div className="text-sm font-semibold text-gray-400">{fmt(m.entradasRealizadas)}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-between p-3 rounded-xl bg-bgDark border border-borderDark/40">
                                        <div>
                                            <div className="text-[11px] text-gray-400 uppercase tracking-widest">A Pagar (Faturas)</div>
                                            <div className="text-lg font-bold text-danger mt-1">{fmt(totalSaidas)}</div>
                                        </div>
                                        {m.saidasRealizadas > 0 && (
                                            <div className="text-right">
                                                <div className="text-[10px] text-gray-500 uppercase">Já Pago</div>
                                                <div className="text-sm font-semibold text-gray-400">{fmt(m.saidasRealizadas)}</div>
                                            </div>
                                        )}
                                    </div>

                                    <div className={`p-4 rounded-xl border-l-4 ${saldoProjetado >= 0 ? 'bg-success/5 border-l-success' : 'bg-danger/5 border-l-danger'}`}>
                                        <div className="text-[11px] uppercase tracking-widest opacity-70 mb-1">Caixa Presumido do Mês (Pendente)</div>
                                        <div className={`text-2xl font-bold ${saldoProjetado >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {fmt(saldoProjetado)}
                                        </div>
                                    </div>
                                </div>

                                {/* Lado Direito: Detalhamento Faturas */}
                                <div className="bg-bgDark p-4 rounded-xl border border-borderDark/50 h-full">
                                    <h3 className="text-[11px] text-gray-400 uppercase tracking-widest mb-3">Rateio de Faturas</h3>
                                    {Object.keys(m.detalhesFaturas).length === 0 ? (
                                        <div className="text-sm text-gray-500 italic">Sem faturas neste mês.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {Object.entries(m.detalhesFaturas).map(([cartaoId, details]) => {
                                                const isPagando = pagando === `${cartaoId}-${mes}`
                                                return (
                                                    <div key={cartaoId} className="flex justify-between items-center p-2 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-borderDark/50">
                                                        <div>
                                                            <div className="text-sm font-semibold text-white">{getNomeCartao(cartaoId)}</div>
                                                            <div className="text-xs text-gray-400 mt-0.5">{fmt(details.valorTotal)}</div>
                                                        </div>
                                                        <div>
                                                            {details.pago ? (
                                                                <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                                    <Check className="w-3 h-3" /> Pago
                                                                </span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handlePagarFatura(cartaoId, mes)}
                                                                    disabled={isPagando}
                                                                    className="text-[10px] uppercase font-bold tracking-wider hover:bg-success hover:text-bgDark border border-success text-success px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                                                                >
                                                                    {isPagando ? '...' : 'Pagar Fatura'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
