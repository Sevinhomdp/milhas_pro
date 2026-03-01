'use client'

import { useRouteToast } from '@/src/lib/useRouteToast'
import InteligenciaFeature from '@/src/components/features/Inteligencia'
import { Database } from '@/src/types'

export function InteligenciaRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  return <InteligenciaFeature db={db} toast={toast} theme="dark" />
}
