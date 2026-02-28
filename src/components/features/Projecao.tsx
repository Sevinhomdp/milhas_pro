'use client'

import * as React from 'react'
import { FaturaParcela, Cartao, Operacao } from '@/src/types'
import { pagarParcelas } from '@/src/app/actions'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, Loader2 } from 'lucide-react'

interface ProjecaoProps {
    faturas: FaturaParcela[]
    cartoes: Cartao[]
    operacoes: Operacao[]
}

const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Projecao({ faturas, cartoes, operacoes }: ProjecaoProps) {
    const [paying, setPaying] = React.useState<string | null>(null)

    const faturasAberto = faturas.filter(f => !f.pago)
    const aReceber = operacoes.filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'pendente')
        .reduce((a, op) => a + Number(op.valor_total), 0)

    const hoje = new Date()
    const meses = Array.from({ length: 6 }, (_, i) => {
        const d = addMonths(hoje, i)
        return format(d, 'yyyy-MM')
    })

    const projecao = meses.map(mes => {
        const parcelasMes = faturasAberto.filter(f => f.mes_referencia === mes)
        const totalMes = parcelasMes.reduce((a, f) => a + Number(f.valor), 0)

        // Por cartão
        const porCartao: Record<string, number> = {}
        parcelasMes.forEach(f => {
            const cartao = cartoes.find(c => c.id === f.cartao_id)
            if (cartao) porCartao[cartao.nome] = (porCartao[cartao.nome] || 0) + Number(f.valor)
        })

        const status = totalMes <= 5000 ? 'green' : totalMes <= 10000 ? 'yellow' : 'red'
        return { mes, totalMes, porCartao, status, cartoesList: Object.entries(porCartao) }
    }).filter(m => m.totalMes > 0)

    const handlePagar = async (cartaoId: string, mes: string, cartaoNome: string) => {
        const key = `${cartaoId}-${mes}`
        setPaying(key)
        try {
            await pagarParcelas(cartaoId, mes)
        } catch (e) { console.error(e) } finally { setPaying(null) }
    }

    const totalAPagar = faturasAberto.reduce((a, f) => a + Number(f.valor), 0)

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">Projeção de Caixa</h1>
                <p className="text-sm text-gray-400">Visibilidade dos próximos 6 meses de comprometimento financeiro.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total a Receber (Pendente)</p>
                    <p className="text-2xl font-black text-blue-400">{fmtCur(aReceber)}</p>
                    <p className="text-xs text-gray-500 mt-1">Vendas ainda não recebidas</p>
                </div>
                <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total a Pagar (Faturas)</p>
                    <p className="text-2xl font-black text-danger">{fmtCur(totalAPagar)}</p>
                    <p className="text-xs text-gray-500 mt-1">Parcelas abertas no total</p>
                </div>
            </div>

            {/* Projeção por mês */}
            {projecao.length === 0 ? (
                <div className="bg-surfaceDark rounded-2xl border border-borderDark p-10 text-center text-gray-500">
                    Nenhuma fatura em aberto. Seu caixa está limpo! 🎉
                </div>
            ) : (
                <div className="space-y-4">
                    {projecao.map(({ mes, totalMes, cartoesList, status }) => {
                        const STATUS_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
                            green: { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success', badge: 'bg-success/10 text-success' },
                            yellow: { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning', badge: 'bg-warning/10 text-warning' },
                            red: { bg: 'bg-danger/10', border: 'border-danger/30', text: 'text-danger', badge: 'bg-danger/10 text-danger' },
                        }
                        const statusColors = STATUS_MAP[status] ?? STATUS_MAP['green']

                        return (
                            <div key={mes} className={`bg-surfaceDark rounded-2xl border ${statusColors.border} overflow-hidden`}>
                                <div className={`px-5 py-4 ${statusColors.bg} flex justify-between items-center`}>
                                    <div>
                                        <h3 className="text-white font-bold capitalize">{format(new Date(mes + '-01'), 'MMMM yyyy', { locale: ptBR })}</h3>
                                        <p className="text-xs text-gray-400 mt-0.5">{cartoesList.length} cartão/cartões com fatura</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black ${statusColors.text}`}>{fmtCur(totalMes)}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors.badge}`}>
                                            {status === 'green' ? '✔ Confortável' : status === 'yellow' ? '⚡ Atenção' : '⚠ Alto'}
                                        </span>
                                    </div>
                                </div>

                                {/* Por cartão com botão pagar */}
                                <div className="divide-y divide-borderDark/50">
                                    {cartoesList.map(([nomeCartao, valor]) => {
                                        const cartao = cartoes.find(c => c.nome === nomeCartao)
                                        if (!cartao) return null
                                        const key = `${cartao.id}-${mes}`
                                        return (
                                            <div key={nomeCartao} className="px-5 py-3 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-300">{nomeCartao}</span>
                                                    <span className="text-xs px-2 py-0.5 bg-bgDark rounded text-gray-500">
                                                        Vence dia {cartao.dia_vencimento}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-bold text-white">{fmtCur(valor)}</span>
                                                    <button
                                                        onClick={() => handlePagar(cartao.id, mes, nomeCartao)}
                                                        disabled={paying === key}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors disabled:opacity-50"
                                                    >
                                                        {paying === key ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                        Pagar
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Dica */}
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 text-sm text-gray-400">
                💡 <strong className="text-accent">Dica Operacional:</strong> Mantenha o capital comprometido em CDB de liquidez diária.
                Isso garante rentabilidade enquanto o dinheiro espera o vencimento das faturas.
            </div>
        </div>
    )
}
