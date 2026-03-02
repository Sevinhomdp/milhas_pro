'use client'
import { useRouteToast } from '@/src/lib/useRouteToast'
import { useTheme } from '@/src/components/providers/ThemeProvider'
import ConfiguracoesFeature from '@/src/components/features/Configuracoes'
import { Database } from '@/src/types'

export function ConfiguracoesRoute({ db, userEmail, userName }: { db: Database; userEmail?: string; userName?: string }) {
  const toast = useRouteToast()
  const { resolvedTheme, setTheme } = useTheme()

  const theme = resolvedTheme === 'light' ? 'light' : 'dark'
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
  return (
    <ConfiguracoesFeature
      db={db}
      toast={toast}
      theme={theme}
      toggleTheme={toggleTheme}
      userEmail={userEmail}
      userName={userName}
    />
  )
}
