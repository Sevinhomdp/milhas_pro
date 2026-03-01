'use client'

const React = require('react')

const ThemeContext = React.createContext(undefined)

function applyTheme(theme, attribute) {
  if (typeof document === 'undefined') return
  const root = document.documentElement

  if (attribute === 'class') {
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  } else {
    root.setAttribute(attribute, theme)
  }

  root.style.colorScheme = theme
}

function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'system',
  enableSystem = true,
  storageKey = 'theme',
  disableTransitionOnChange = false
}) {
  const getInitialTheme = React.useCallback(() => {
    if (typeof window === 'undefined') return defaultTheme === 'system' ? 'light' : defaultTheme

    const saved = window.localStorage.getItem(storageKey)
    if (saved === 'light' || saved === 'dark') return saved

    if (defaultTheme === 'system' && enableSystem) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }

    return defaultTheme
  }, [defaultTheme, enableSystem, storageKey])

  const [theme, setThemeState] = React.useState(getInitialTheme)

  const setTheme = React.useCallback((nextTheme) => {
    setThemeState((prev) => {
      const value = typeof nextTheme === 'function' ? nextTheme(prev) : nextTheme
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, value)
      }
      return value
    })
  }, [storageKey])

  React.useEffect(() => {
    if (disableTransitionOnChange && typeof document !== 'undefined') {
      const style = document.createElement('style')
      style.appendChild(document.createTextNode('* { transition: none !important }'))
      document.head.appendChild(style)
      void document.body.offsetHeight
      requestAnimationFrame(() => {
        document.head.removeChild(style)
      })
    }

    applyTheme(theme, attribute)
  }, [attribute, disableTransitionOnChange, theme])

  const value = React.useMemo(() => ({
    theme,
    setTheme,
    resolvedTheme: theme,
    systemTheme: enableSystem && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
    themes: ['light', 'dark']
  }), [enableSystem, setTheme, theme])

  return React.createElement(ThemeContext.Provider, { value }, children)
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

module.exports = {
  ThemeProvider,
  useTheme
}
