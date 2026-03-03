'use client'

import InteligenciaFeature from '@/src/components/features/Inteligencia'
import { useRouteToast } from '@/src/lib/useRouteToast'
import { Database } from '@/src/types'

interface InteligenciaRouteProps {
  db: Database
  userEmail: string
  alertasConfig: any[]
}

export function InteligenciaRoute({ db, userEmail, alertasConfig }: InteligenciaRouteProps) {
  const toast = useRouteToast()
  return <InteligenciaFeature db={db} toast={toast} theme="dark" userEmail={userEmail} alertasConfig={alertasConfig} />
}
