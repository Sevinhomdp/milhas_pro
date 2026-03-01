'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: 'class' | string
  defaultTheme?: Theme
  enableSystem?: boolean
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

const getInitialTheme = (defaultTheme: Theme, storageKey: string, enableSystem: boolean): Theme => {
  if (typeof window === 'undefined') return defaultTheme

  const saved = window.localStorage.getItem(storageKey)
  if (saved === 'light' || saved === 'dark') return saved

  if (enableSystem && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'

  return defaultTheme
}

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'dark',
  enableSystem = false,
  storageKey = 'theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(() => getInitialTheme(defaultTheme, storageKey, enableSystem))

  const setTheme = React.useCallback(
    (nextTheme: Theme) => {
      setThemeState(nextTheme)
    },
    [],
  )

  React.useEffect(() => {
    const root = document.documentElement

    if (attribute === 'class') {
      root.classList.remove('light', 'dark')
      root.classList.add(theme)
    }

    root.style.colorScheme = theme
    window.localStorage.setItem(storageKey, theme)
  }, [attribute, storageKey, theme])

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = React.useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
