'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import { useTheme } from '@/src/components/providers/ThemeProvider'
import ConfiguracoesFeature from '@/src/components/features/Configuracoes'
import { Database } from '@/src/types'

export function ConfiguracoesRoute({ db, userEmail }: { db: Database; userEmail?: string }) {
  const toast = useRouteToast()
  const { theme, toggleTheme } = useTheme()
  return (
    <ConfiguracoesFeature
      db={db}
      toast={toast}
      theme={theme}
      toggleTheme={toggleTheme}
      userEmail={userEmail}
    />
  )
}
