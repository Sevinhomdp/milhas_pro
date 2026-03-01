'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import MetasFeature from '@/src/components/features/Metas'
import { Database } from '@/src/types'

export function MetasRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  return <MetasFeature db={db} toast={toast} theme="dark" />
}
