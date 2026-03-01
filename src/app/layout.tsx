import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/src/components/layout/AppShell'
import { createClient } from '@/src/lib/supabase/server'
import { ThemeProvider } from '@/src/components/providers/ThemeProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Milhas Pro | Gestão de Elite',
  description: 'Plataforma de gestão financeira para operadores de milhas aéreas.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen`}>
        <ThemeProvider>{session ? <AppShell>{children}</AppShell> : children}</ThemeProvider>
      </body>
    </html>
  )
}
