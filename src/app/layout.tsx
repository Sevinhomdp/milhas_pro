import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/src/components/layout/AppShell'
import { createClient } from '@/src/lib/supabase/server'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Milhas Pro | Gestão de Elite',
  description: 'Plataforma de gestão financeira para operadores de milhas aéreas.',
}

import { ThemeProvider } from '@/src/components/providers/ThemeProvider'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme');
                if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            `
          }}
        />
      </head>
      <body className="font-sans antialiased bg-gray-50 dark:bg-bgDark text-gray-900 dark:text-gray-100 transition-colors duration-300">
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
