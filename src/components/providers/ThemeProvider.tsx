'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from '@/src/lib/next-themes'

type Theme = 'light' | 'dark'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="milhas-pro-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}

export const useTheme = () => {
  const { theme, setTheme } = useNextTheme()
  const resolvedTheme = (theme ?? 'dark') as Theme

  return {
    theme: resolvedTheme,
    resolvedTheme,
    setTheme,
    toggleTheme: () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark'),
  }
}
