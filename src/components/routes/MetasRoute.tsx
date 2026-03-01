'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import MetasFeature from '@/src/components/features/Metas'
import { useTheme } from '@/src/components/providers/ThemeProvider'
import { Database } from '@/src/types'

export function MetasRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  const { theme } = useTheme()

  return <MetasFeature db={db} toast={toast} theme={theme} />
}
