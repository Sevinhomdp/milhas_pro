'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import SaldosFeature from '@/src/components/features/Saldos'
import { useTheme } from '@/src/components/providers/ThemeProvider'
import { Database } from '@/src/types'

export function SaldosRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  const { theme } = useTheme()

  return <SaldosFeature db={db} toast={toast} theme={theme} />
}
