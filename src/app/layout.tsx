import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AppShell } from '@/src/components/layout/AppShell'
import { createClient } from '@/src/lib/supabase/server'
import { cookies } from 'next/headers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Milhas Pro | Gestão de Elite',
  description: 'Plataforma de gestão financeira para operadores de milhas aéreas.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value || 'dark'

  return (
    <html lang="pt-BR" className={`${theme} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-bg dark:bg-bgDark text-gray-900 dark:text-gray-100">
        {session ? (
          <AppShell>{children}</AppShell>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
