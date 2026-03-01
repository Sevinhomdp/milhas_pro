'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import ProjecaoFeature from '@/src/components/features/Projecao'
import { Database } from '@/src/types'

export function ProjecaoRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  return <ProjecaoFeature db={db} toast={toast} theme="dark" />
}
