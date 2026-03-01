'use client'

import { Dashboard as DashboardFeature } from '@/src/components/features/Dashboard'
import { useRouteToast } from '@/src/lib/useRouteToast'
import { Cartao, FaturaParcela, Meta, Operation, ProgramaSaldo } from '@/src/types'

interface DashboardRouteProps {
  saldos: ProgramaSaldo[]
  operacoes: Operation[]
  faturas: FaturaParcela[]
  cartoes: Cartao[]
  metas: Meta[]
}

export function DashboardRoute(props: DashboardRouteProps) {
  const toast = useRouteToast()
  void toast

  return <DashboardFeature {...props} />
}
