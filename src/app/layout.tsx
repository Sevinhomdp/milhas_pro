import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/src/components/layout/AppShell'
import { createClient, hasSupabaseEnv } from '@/src/lib/supabase/server'
import { ThemeProvider } from '@/src/components/providers/ThemeProvider'

export const metadata: Metadata = {
  title: 'Milhas Pro | Gestão de Elite',
  description: 'Plataforma de gestão financeira para operadores de milhas aéreas.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let session = null

  if (hasSupabaseEnv()) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getSession()
    session = data.session
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <ThemeProvider>{session ? <AppShell>{children}</AppShell> : children}</ThemeProvider>
      </body>
    </html>
  )
}
