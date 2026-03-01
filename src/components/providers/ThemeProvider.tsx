'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'

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

export { useTheme }
