'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'

interface NextThemesContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const NextThemesContext = React.createContext<NextThemesContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: 'class'
  defaultTheme?: Theme | 'system'
  enableSystem?: boolean
  storageKey?: string
  disableTransitionOnChange?: boolean
}

function getInitialTheme(defaultTheme: Theme, enableSystem: boolean, storageKey: string): Theme {
  if (typeof window === 'undefined') return defaultTheme

  const storedTheme = window.localStorage.getItem(storageKey)
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme

  if (enableSystem) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return defaultTheme
}

function applyClassTheme(theme: Theme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = 'theme',
}: ThemeProviderProps) {
  const fallbackTheme: Theme = defaultTheme === 'light' ? 'light' : 'dark'
  const [theme, setThemeState] = React.useState<Theme>(() =>
    getInitialTheme(fallbackTheme, enableSystem, storageKey)
  )

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, nextTheme)
      }
    },
    [storageKey]
  )

  React.useEffect(() => {
    if (attribute === 'class') {
      applyClassTheme(theme)
    }
  }, [attribute, theme])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <NextThemesContext.Provider value={value}>{children}</NextThemesContext.Provider>
}

export function useTheme() {
  const context = React.useContext(NextThemesContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
