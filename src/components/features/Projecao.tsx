'use client'

import * as React from 'react'
import { FaturaParcela, Cartao, Operation } from '@/src/types'
import { pagarParcelas } from '@/src/app/actions'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, AlertTriangle, Wallet, ArrowUpRight, Info } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'

interface ProjecaoProps { faturas: FaturaParcela[]; cartoes: Cartao[]; operacoes: Operation[] }
const fmtCur = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export function Projecao({ faturas, cartoes, operacoes }: ProjecaoProps) {
    const [paying, setPaying] = React.useState<string | null>(null)

    const faturasAberto = faturas.filter(f => !f.pago)
    const aReceber = operacoes.filter(op => op.type === 'venda' && op.status === 'pendente').reduce((a, op) => a + Number(op.value), 0)

    const hoje = new Date()
    const meses = Array.from({ length: 6 }, (_, i) => format(addMonths(hoje, i), 'yyyy-MM'))

    const projecao = meses.map(mes => {
        const parcelasMes = faturasAberto.filter(f => f.mes_referencia === mes)
        const totalMes = parcelasMes.reduce((a, f) => a + Number(f.valor), 0)
        const porCartao: Record<string, number> = {}

        parcelasMes.forEach(f => {
            const cartao = cartoes.find(c => c.id === f.cartao_id)
            if (cartao) porCartao[cartao.nome] = (porCartao[cartao.nome] || 0) + Number(f.valor)
        })

        const status = totalMes <= 5000 ? 'green' : totalMes <= 10000 ? 'yellow' : 'red'
        return { mes, totalMes, porCartao, status, cartoesList: Object.entries(porCartao) }
    }).filter(m => m.totalMes > 0)

    const handlePagar = async (cartaoId: string, mes: string) => {
        setPaying(`${cartaoId}-${mes}`)
        try { await pagarParcelas(cartaoId, mes) } catch (e) { console.error(e) } finally { setPaying(null) }
    }
    const totalAPagar = faturasAberto.reduce((a, f) => a + Number(f.valor), 0)

    const STATUS_MAP: Record<string, { bg: string; border: string; text: string; badge: 'success' | 'warning' | 'danger' }> = {
        green: { bg: 'bg-success/5', border: 'border-green-500/20', text: 'text-success', badge: 'success' },
        yellow: { bg: 'bg-warning/5', border: 'border-amber-500/20', text: 'text-warning', badge: 'warning' },
        red: { bg: 'bg-danger/5', border: 'border-red-500/20', text: 'text-danger', badge: 'danger' },
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <p className="field-label mb-1">Tesouraria</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                        <Wallet className="text-accent w-7 h-7" /> Projeção de Caixa
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Visibilidade financeira dos próximos 6 meses.</p>
                </div>

                <div className="hidden lg:flex items-center gap-4 animate-fadeIn">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Saldo Projetado</p>
                        <p className={`text-xl font-black tabular ${aReceber - totalAPagar >= 0 ? 'text-success' : 'text-danger'}`}>
                            {fmtCur(aReceber - totalAPagar)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 stagger-children">
                <div className="card card-hover p-6 border-l-4 border-l-blue-500 animate-fadeInUp">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="field-label mb-0 uppercase tracking-widest text-[10px]">Total a Receber</p>
                            <p className="text-2xl font-black text-blue-400 tabular mt-2">{fmtCur(aReceber)}</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-blue-500/50" />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-medium">Vendas pendentes de recebimento nas plataformas</p>
                </div>
                <div className="card card-hover p-6 border-l-4 border-l-red-500 animate-fadeInUp" style={{ animationDelay: '60ms' }}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="field-label mb-0 uppercase tracking-widest text-[10px]">Total a Pagar</p>
                            <p className="text-2xl font-black text-danger tabular mt-2">{fmtCur(totalAPagar)}</p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-red-500/50" />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-medium">Soma de todas as faturas em aberto projetadas</p>
                </div>
            </div>

            {projecao.length === 0 ? (
                <div className="card p-16 text-center space-y-3">
                    <div className="w-12 h-12 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Caixa Limpo!</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto">Você não possui faturas em aberto para os próximos meses. Aproveite para planejar novas operações!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {projecao.map(({ mes, totalMes, cartoesList, status }) => {
                        const sc = STATUS_MAP[status] ?? STATUS_MAP['green']
                        return (
                            <div key={mes} className={`card border ${sc.border} overflow-hidden group hover:shadow-xl transition-all duration-300`}>
                                <div className={`px-6 py-5 ${sc.bg} flex justify-between items-center border-b ${sc.border}`}>
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 dark:text-white capitalize tracking-wide">
                                            {format(new Date(mes + '-01T12:00:00'), 'MMMM yyyy', { locale: ptBR })}
                                        </h3>
                                        <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-widest">
                                            {cartoesList.length} faturas vindo aí
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black tabular ${sc.text}`}>{fmtCur(totalMes)}</p>
                                        <Badge variant={sc.badge} className="mt-1">
                                            {status === 'green' ? '✔ Confortável' : status === 'yellow' ? '⚡ Atenção' : '⚠ Fluxo Crítico'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                                    {cartoesList.map(([nomeCartao, valor]) => {
                                        const cartao = cartoes.find(c => c.nome === nomeCartao)
                                        if (!cartao) return null
                                        const key = `${cartao.id}-${mes}`
                                        return (
                                            <div key={nomeCartao} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors duration-150">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                        <Wallet className="w-4 h-4 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{nomeCartao}</span>
                                                        <p className="text-[10px] text-gray-500 font-medium tracking-tight">Vence dia {cartao.dia_vencimento}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-sm font-black text-gray-900 dark:text-white tabular">{fmtCur(valor)}</span>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        loading={paying === key}
                                                        onClick={() => handlePagar(cartao.id, mes)}
                                                        className="h-8 px-4 font-bold text-[11px]"
                                                    >
                                                        Pagar
                                                    </Button>
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

            <div className="card p-5 bg-accent/5 border border-accent/10 flex items-start gap-3">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                    <strong>Estratégia Pro:</strong> O Total a Receber já desconta as taxas das plataformas. Se o saldo projetado estiver negativo, considere antecipar recebíveis ou reduzir o volume de compras nas próximas faturas.
                </p>
            </div>
        </div>
    )
}
