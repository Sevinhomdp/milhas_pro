'use client'

import * as React from 'react'
import { FaturaParcela, Cartao, Operation, Database } from '@/src/types'
import { pagarParcelas } from '@/src/app/actions'
import { format, addMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, AlertTriangle, Wallet, ArrowUpRight, Info } from 'lucide-react'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { formatCurrency } from '@/src/lib/utils'

interface ProjecaoProps {
    db: Database
    toast: (msg: string, type?: any) => void
    theme?: 'light' | 'dark'
}

export default function Projecao({ db, toast }: ProjecaoProps) {
    const { faturas, cartoes, operacoes } = db
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
        const key = `${cartaoId}-${mes}`
        setPaying(key)
        try {
            await pagarParcelas(cartaoId, mes)
            toast('Faturas marcadas como pagas!', 'success')
        } catch (e: any) {
            toast(e.message, 'error')
        } finally {
            setPaying(null)
        }
    }
    const totalAPagar = faturasAberto.reduce((a, f) => a + Number(f.valor), 0)

    const STATUS_MAP: Record<string, { bg: string; border: string; text: string; badge: 'success' | 'warning' | 'danger' }> = {
        green: { bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-500', badge: 'success' },
        yellow: { bg: 'bg-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-500', badge: 'warning' },
        red: { bg: 'bg-red-500/5', border: 'border-red-500/20', text: 'text-red-500', badge: 'danger' },
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Fluxo de Caixa</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                        Projeção Financeira
                    </h1>
                    <p className="text-sm text-gray-400 mt-2">Visibilidade dos vencimentos para os próximos 6 meses.</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 px-6 py-4 rounded-3xl shadow-sm flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400">Saldo Projetado</p>
                        <p className={`text-xl font-black tabular ${aReceber - totalAPagar >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {formatCurrency(aReceber - totalAPagar)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 border-l-4 border-l-blue-500 border-y border-r border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total a Receber</p>
                            <p className="text-2xl font-black text-blue-500 tabular mt-2">{formatCurrency(aReceber)}</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-blue-500/30" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-tight">Vendas pendentes nas plataformas</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border-l-4 border-l-red-500 border-y border-r border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total a Pagar</p>
                            <p className="text-2xl font-black text-red-500 tabular mt-2">{formatCurrency(totalAPagar)}</p>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-red-500/30" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-tight">Soma de todas parcelas em aberto</p>
                </div>
            </div>

            {projecao.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-16 rounded-3xl text-center shadow-sm">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Caixa Limpo!</h3>
                    <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Você não possui faturas em aberto para os próximos meses.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {projecao.map(({ mes, totalMes, cartoesList, status }) => {
                        const sc = STATUS_MAP[status] ?? STATUS_MAP['green']
                        return (
                            <div key={mes} className={`bg-white dark:bg-slate-900 border ${sc.border} rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300`}>
                                <div className={`px-8 py-5 ${sc.bg} flex justify-between items-center border-b ${sc.border}`}>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white capitalize tracking-wide">
                                            {format(new Date(mes + '-01T12:00:00'), 'MMMM yyyy', { locale: ptBR })}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-[0.2em]">
                                            {cartoesList.length} faturas {cartoesList.length === 1 ? 'pendente' : 'pendentes'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black tabular ${sc.text}`}>{formatCurrency(totalMes)}</p>
                                        <Badge variant={sc.badge} className="mt-1">
                                            {status === 'green' ? '✔ Confortável' : status === 'yellow' ? '⚡ Atenção' : '⚠ Fluxo Crítico'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                                    {cartoesList.map(([nomeCartao, valor]) => {
                                        const cartao = cartoes.find(c => c.nome === nomeCartao)
                                        if (!cartao) return null
                                        const key = `${cartao.id}-${mes}`
                                        return (
                                            <div key={nomeCartao} className="px-8 py-5 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <Wallet className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{nomeCartao}</span>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Vence dia {cartao.dia_vencimento}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-base font-black text-slate-900 dark:text-white tabular">{formatCurrency(valor)}</span>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        loading={paying === key}
                                                        onClick={() => handlePagar(cartao.id, mes)}
                                                        className="px-6 font-black text-[10px] uppercase tracking-widest"
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

            <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-3xl flex items-start gap-4">
                <Info size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    <strong className="text-slate-900 dark:text-slate-200">Estratégia Milhas Pro:</strong> O Total a Receber considera vendas realizadas mas ainda não pagas pelas plataformas. Se o saldo projetado estiver negativo, evite novas compras parceladas ou considere antecipações.
                </p>
            </div>
        </div>
    )
}
