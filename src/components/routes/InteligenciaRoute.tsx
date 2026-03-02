'use client'

import InteligenciaFeature from '@/src/components/features/Inteligencia'
import { useRouteToast } from '@/src/lib/useRouteToast'
import { Database } from '@/src/types'

export function InteligenciaRoute({ db }: { db: Database }) {
  const toast = useRouteToast()

  return <InteligenciaFeature db={db} toast={toast} theme="dark" />
}
