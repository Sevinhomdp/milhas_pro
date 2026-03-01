diff --git a/src/components/providers/ThemeProvider.tsx b/src/components/providers/ThemeProvider.tsx
index 679dc29db90de694c938722d69019f9bac32d6c6..9d3ec481ca5da57cdccc118ce3cabf8d996cac3a 100644
--- a/src/components/providers/ThemeProvider.tsx
+++ b/src/components/providers/ThemeProvider.tsx
@@ -1,43 +1,52 @@
 'use client'
 
 import * as React from 'react'
 
 type Theme = 'light' | 'dark'
+const THEME_STORAGE_KEY = 'milhas-pro-theme'
+
+const applyThemeToDocument = (theme: Theme) => {
+    const root = document.documentElement
+    root.classList.toggle('dark', theme === 'dark')
+    root.style.colorScheme = theme
+}
 
 interface ThemeContextType {
     theme: Theme
     toggleTheme: () => void
 }
 
 const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)
 
 export function ThemeProvider({ children }: { children: React.ReactNode }) {
-    const [theme, setTheme] = React.useState<Theme>('dark')
+    const [theme, setTheme] = React.useState<Theme>('light')
 
     React.useEffect(() => {
-        const saved = localStorage.getItem('milhas-pro-theme') as Theme | null
-        const pref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
-        const initial = saved || pref
+        const saved = localStorage.getItem(THEME_STORAGE_KEY)
+        const fromStorage: Theme | null = saved === 'dark' || saved === 'light' ? saved : null
+        const fromDom: Theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
+        const initial = fromStorage ?? fromDom
+
         setTheme(initial)
-        document.documentElement.classList.toggle('dark', initial === 'dark')
+        applyThemeToDocument(initial)
     }, [])
 
     const toggleTheme = () => {
         const next = theme === 'dark' ? 'light' : 'dark'
         setTheme(next)
-        localStorage.setItem('milhas-pro-theme', next)
-        document.documentElement.classList.toggle('dark', next === 'dark')
+        localStorage.setItem(THEME_STORAGE_KEY, next)
+        applyThemeToDocument(next)
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
