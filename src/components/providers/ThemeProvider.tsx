'use client'

import * as React from 'react'

type Theme = 'light' | 'dark'
const THEME_STORAGE_KEY = 'milhas-pro-theme'

const applyThemeToDocument = (theme: Theme) => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
}

interface ThemeContextType {
    theme: Theme
    toggleTheme: () => void
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = React.useState<Theme>('light')

    React.useEffect(() => {
        const saved = localStorage.getItem(THEME_STORAGE_KEY)
        const fromStorage: Theme | null = saved === 'dark' || saved === 'light' ? saved : null
        const fromDom: Theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
        const initial = fromStorage ?? fromDom

        setTheme(initial)
        applyThemeToDocument(initial)
    }, [])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        localStorage.setItem(THEME_STORAGE_KEY, next)
        applyThemeToDocument(next)
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = React.useContext(ThemeContext)
    if (!context) throw new Error('useTheme must be used within ThemeProvider')
    return context
}
