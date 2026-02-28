'use client'

import * as React from 'react'
import { FaturaParcela, Cartao, Operacao } from '@/src/types'
import { pagarParcelas } from '@/src/app/actions'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle } from 'lucide-react'
import { Button } from '../ui/Button'

interface ProjecaoProps { faturas: FaturaParcela[]; cartoes: Cartao[]; operacoes: Operacao[] }
const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Projecao({ faturas, cartoes, operacoes }: ProjecaoProps) {
    const [paying, setPaying] = React.useState<string | null>(null)
    const faturasAberto = faturas.filter(f => !f.pago)
    const aReceber = operacoes.filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'pendente').reduce((a, op) => a + Number(op.valor_total), 0)
    const hoje = new Date()
    const meses = Array.from({ length: 6 }, (_, i) => format(addMonths(hoje, i), 'yyyy-MM'))

    const projecao = meses.map(mes => {
        const parcelasMes = faturasAberto.filter(f => f.mes_referencia === mes)
        const totalMes = parcelasMes.reduce((a, f) => a + Number(f.valor), 0)
        const porCartao: Record<string, number> = {}
        parcelasMes.forEach(f => { const cartao = cartoes.find(c => c.id === f.cartao_id); if (cartao) porCartao[cartao.nome] = (porCartao[cartao.nome] || 0) + Number(f.valor) })
        const status = totalMes <= 5000 ? 'green' : totalMes <= 10000 ? 'yellow' : 'red'
        return { mes, totalMes, porCartao, status, cartoesList: Object.entries(porCartao) }
    }).filter(m => m.totalMes > 0)

    const handlePagar = async (cartaoId: string, mes: string) => {
        setPaying(`${cartaoId}-${mes}`)
        try { await pagarParcelas(cartaoId, mes) } catch (e) { console.error(e) } finally { setPaying(null) }
    }
    const totalAPagar = faturasAberto.reduce((a, f) => a + Number(f.valor), 0)

    const STATUS_MAP: Record<string, { bg: string; border: string; text: string; badge: string }> = {
        green: { bg: 'bg-success/5', border: 'border-green-500/20', text: 'text-success', badge: 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20' },
        yellow: { bg: 'bg-warning/5', border: 'border-amber-500/20', text: 'text-warning', badge: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20' },
        red: { bg: 'bg-danger/5', border: 'border-red-500/20', text: 'text-danger', badge: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20' },
    }

    return (
        <div className="space-y-6">
            <div><p className="field-label mb-1">Financeiro</p><h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">Projeção de Caixa</h1><p className="text-sm text-gray-400 mt-1">Visibilidade dos próximos 6 meses.</p></div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                <div className="card card-hover p-5 border-l-4 border-l-blue-500 animate-fadeInUp"><p className="field-label mb-0">Total a Receber</p><p className="text-2xl font-black text-blue-400 tabular mt-2">{fmtCur(aReceber)}</p><p className="text-xs text-gray-500 mt-1">Vendas pendentes de recebimento</p></div>
                <div className="card card-hover p-5 border-l-4 border-l-red-500 animate-fadeInUp" style={{ animationDelay: '60ms' }}><p className="field-label mb-0">Total a Pagar</p><p className="text-2xl font-black text-danger tabular mt-2">{fmtCur(totalAPagar)}</p><p className="text-xs text-gray-500 mt-1">Parcelas abertas no total</p></div>
            </div>

            {projecao.length === 0 ? (
                <div className="card p-10 text-center text-gray-500">Nenhuma fatura em aberto. Seu caixa está limpo! 🎉</div>
            ) : (
                <div className="space-y-4">
                    {projecao.map(({ mes, totalMes, cartoesList, status }) => {
                        const sc = STATUS_MAP[status] ?? STATUS_MAP['green']
                        return (
                            <div key={mes} className={`card border ${sc.border} overflow-hidden`}>
                                <div className={`px-5 py-4 ${sc.bg} flex justify-between items-center`}>
                                    <div><h3 className="text-sm font-bold text-gray-900 dark:text-white capitalize">{format(new Date(mes + '-01'), 'MMMM yyyy', { locale: ptBR })}</h3><p className="text-[11px] text-gray-500 mt-0.5">{cartoesList.length} cartão/cartões com fatura</p></div>
                                    <div className="text-right"><p className={`text-xl font-black tabular ${sc.text}`}>{fmtCur(totalMes)}</p><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sc.badge}`}>{status === 'green' ? '✔ Confortável' : status === 'yellow' ? '⚡ Atenção' : '⚠ Alto'}</span></div>
                                </div>
                                <div className="divide-y divide-gray-50 dark:divide-borderDark/50">
                                    {cartoesList.map(([nomeCartao, valor]) => {
                                        const cartao = cartoes.find(c => c.nome === nomeCartao)
                                        if (!cartao) return null
                                        const key = `${cartao.id}-${mes}`
                                        return (
                                            <div key={nomeCartao} className="px-5 py-3 flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors duration-100">
                                                <div className="flex items-center gap-2"><span className="text-sm text-gray-700 dark:text-gray-300">{nomeCartao}</span><span className="text-[10px] px-2 py-0.5 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500">Dia {cartao.dia_vencimento}</span></div>
                                                <div className="flex items-center gap-3"><span className="text-sm font-black text-gray-900 dark:text-white tabular">{fmtCur(valor)}</span><Button variant="success" size="sm" loading={paying === key} onClick={() => handlePagar(cartao.id, mes)} icon={<CheckCircle className="w-3 h-3" />}>Pagar</Button></div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <div className="card p-4 border-accent/20">
                <p className="text-sm text-gray-500">💡 <strong className="text-accent">Dica:</strong> Mantenha capital em CDB de liquidez diária enquanto espera os vencimentos.</p>
            </div>
        </div>
    )
}
