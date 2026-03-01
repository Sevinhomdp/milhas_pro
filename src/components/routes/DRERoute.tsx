'use client'

import DREFeature from '@/src/components/features/DRE'
import { useRouteToast } from '@/src/lib/useRouteToast'
import { Database } from '@/src/types'

export function DRERoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  void toast

  return <DREFeature db={db} />
}
