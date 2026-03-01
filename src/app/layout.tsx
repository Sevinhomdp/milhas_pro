diff --git a/src/app/layout.tsx b/src/app/layout.tsx
index d72a46d35d2c976634d7ee8e0274d18d1ebbd5f9..6c94da9b2d149b94c93eb192dded48a66f47b99c 100644
--- a/src/app/layout.tsx
+++ b/src/app/layout.tsx
@@ -1,61 +1,29 @@
 import type { Metadata } from 'next'
-import { Inter } from 'next/font/google'
 import './globals.css'
 import { AppShell } from '@/src/components/layout/AppShell'
 import { createClient } from '@/src/lib/supabase/server'
-
-const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
+import { ThemeProvider } from '@/src/components/providers/ThemeProvider'
 
 export const metadata: Metadata = {
   title: 'Milhas Pro | Gestão de Elite',
   description: 'Plataforma de gestão financeira para operadores de milhas aéreas.',
 }
 
-import { ThemeProvider } from '@/src/components/providers/ThemeProvider'
-
 export default async function RootLayout({ children }: { children: React.ReactNode }) {
   const supabase = await createClient()
   const { data: { session } } = await supabase.auth.getSession()
 
   return (
     <html lang="pt-BR" suppressHydrationWarning>
-      <head>
-        {/*
-         * CRÍTICO: Primeiro elemento do <head>.
-         * Executa síncronamente antes de qualquer renderização.
-         * Elimina o flash de tema incorreto (FOUC — Flash of Unstyled Content).
-         */}
-        <script
-          dangerouslySetInnerHTML={{
-            __html: `
-              (function() {
-                try {
-                  var t = localStorage.getItem('milhas-pro-theme');
-                  var isDark = t ? t === 'dark' : true;
-                  if (isDark) {
-                    document.documentElement.classList.add('dark');
-                    document.documentElement.style.colorScheme = 'dark';
-                  } else {
-                    document.documentElement.classList.remove('dark');
-                    document.documentElement.style.colorScheme = 'light';
-                  }
-                } catch (e) {
-                  document.documentElement.classList.add('dark');
-                }
-              })();
-            `,
-          }}
-        />
-      </head>
-      <body className={`${inter.className} min-h-screen`}>
+      <body className="min-h-screen">
         <ThemeProvider>
           {session ? (
             <AppShell>{children}</AppShell>
           ) : (
             children
           )}
         </ThemeProvider>
       </body>
     </html>
   )
 }
