'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import SaldosFeature from '@/src/components/features/Saldos'
import { Database } from '@/src/types'

export function SaldosRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  return <SaldosFeature db={db} toast={toast} theme="dark" />
}
