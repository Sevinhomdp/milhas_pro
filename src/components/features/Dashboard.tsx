'use client'

import * as React from "react"
import { ProgramaSaldo, Operacao, FaturaParcela, Cartao, Meta } from "@/src/types"
import { MetricCard } from "../ui/MetricCard"
import { formatCurrency, formatNumber, formatPercent } from "@/src/lib/utils"
import { Wallet, TrendingUp, CreditCard, ArrowRightLeft, Target } from "lucide-react"

interface DashboardProps {
  saldos: ProgramaSaldo[];
  operacoes: Operacao[];
  faturas: FaturaParcela[];
  cartoes: Cartao[];
  metas: Meta[];
}

export function Dashboard({ saldos, operacoes, faturas, cartoes, metas }: DashboardProps) {
  const totalMilhas = saldos.reduce((acc, curr) => acc + curr.saldo_atual, 0)
  
  const lucroRealizado = operacoes
    .filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'recebido')
    .reduce((acc, curr) => acc + curr.valor_total, 0) -
    operacoes
    .filter(op => op.tipo === 'COMPRA' || op.tipo === 'TRANSF')
    .reduce((acc, curr) => acc + curr.valor_total, 0)

  const lucroAReceber = operacoes
    .filter(op => op.tipo === 'VENDA' && op.status_recebimento === 'pendente')
    .reduce((acc, curr) => acc + curr.valor_total, 0)

  const faturasAbertas = faturas
    .filter(f => !f.pago)
    .reduce((acc, curr) => acc + curr.valor, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Visão geral do seu portfólio de milhas.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total de Milhas"
          value={formatNumber(totalMilhas)}
          icon={<Wallet className="h-5 w-5" />}
          borderColor="border-l-blue-500"
        />
        <MetricCard
          title="Lucro Realizado"
          value={formatCurrency(lucroRealizado)}
          icon={<TrendingUp className="h-5 w-5" />}
          borderColor={lucroRealizado >= 0 ? "border-l-green-500" : "border-l-red-500"}
          trend={lucroRealizado >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Lucro a Receber"
          value={formatCurrency(lucroAReceber)}
          icon={<ArrowRightLeft className="h-5 w-5" />}
          borderColor="border-l-amber-500"
        />
        <MetricCard
          title="Faturas Abertas"
          value={formatCurrency(faturasAbertas)}
          icon={<CreditCard className="h-5 w-5" />}
          borderColor="border-l-red-500"
        />
      </div>
    </div>
  )
}
