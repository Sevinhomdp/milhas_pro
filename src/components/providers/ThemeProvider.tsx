diff --git a/src/components/providers/ThemeProvider.tsx b/src/components/providers/ThemeProvider.tsx
index 679dc29db90de694c938722d69019f9bac32d6c6..a5ab2e43705c59874fb5a5d9ad605521ce567f02 100644
--- a/src/components/providers/ThemeProvider.tsx
+++ b/src/components/providers/ThemeProvider.tsx
@@ -1,43 +1,20 @@
 'use client'
 
 import * as React from 'react'
-
-type Theme = 'light' | 'dark'
-
-interface ThemeContextType {
-    theme: Theme
-    toggleTheme: () => void
-}
-
-const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)
+import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
 
 export function ThemeProvider({ children }: { children: React.ReactNode }) {
-    const [theme, setTheme] = React.useState<Theme>('dark')
-
-    React.useEffect(() => {
-        const saved = localStorage.getItem('milhas-pro-theme') as Theme | null
-        const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
-        const initial = saved || pref
-        setTheme(initial)
-        document.documentElement.classList.toggle('dark', initial === 'dark')
-    }, [])
-
-    const toggleTheme = () => {
-        const next = theme === 'dark' ? 'light' : 'dark'
-        setTheme(next)
-        localStorage.setItem('milhas-pro-theme', next)
-        document.documentElement.classList.toggle('dark', next === 'dark')
-    }
-
-    return (
-        <ThemeContext.Provider value={{ theme, toggleTheme }}>
-            {children}
-        </ThemeContext.Provider>
-    )
+  return (
+    <NextThemesProvider
+      attribute="class"
+      defaultTheme="dark"
+      enableSystem={false}
+      storageKey="milhas-pro-theme"
+      disableTransitionOnChange
+    >
+      {children}
+    </NextThemesProvider>
+  )
 }
 
-export const useTheme = () => {
-    const context = React.useContext(ThemeContext)
-    if (!context) throw new Error('useTheme must be used within ThemeProvider')
-    return context
-}
+export { useTheme }
