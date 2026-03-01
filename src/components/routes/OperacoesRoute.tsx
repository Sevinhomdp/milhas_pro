'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import OperacoesFeature from '@/src/components/features/Operacoes'
import { useTheme } from '@/src/components/providers/ThemeProvider'
import { Database } from '@/src/types'

export function OperacoesRoute({ db }: { db: Database }) {
  const toast = useRouteToast()
  const { theme } = useTheme()

  return <OperacoesFeature db={db} toast={toast} theme={theme} />
}
