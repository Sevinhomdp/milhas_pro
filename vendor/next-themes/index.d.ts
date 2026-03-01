import * as React from 'react'

type Theme = 'light' | 'dark' | string

type ThemeProviderProps = {
  children: React.ReactNode
  attribute?: string
  defaultTheme?: Theme | 'system'
  enableSystem?: boolean
  storageKey?: string
  disableTransitionOnChange?: boolean
}

type UseThemeProps = {
  theme: Theme
  resolvedTheme: Theme
  systemTheme: 'light' | 'dark'
  themes: Theme[]
  setTheme: (theme: Theme | ((prevTheme: Theme) => Theme)) => void
}

export function ThemeProvider(props: ThemeProviderProps): React.JSX.Element
export function useTheme(): UseThemeProps
