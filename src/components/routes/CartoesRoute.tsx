'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import CartoesFeature from '@/src/components/features/Cartoes'
import { Database } from '@/src/types'

export function CartoesRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  return <CartoesFeature db={db} toast={toast} />
}
