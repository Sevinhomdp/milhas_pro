'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import ProjecaoFeature from '@/src/components/features/Projecao'
import { useTheme } from '@/src/components/providers/ThemeProvider'
import { Database } from '@/src/types'

export function ProjecaoRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  const { theme } = useTheme()

  return <ProjecaoFeature db={db} toast={toast} theme={theme} />
}
