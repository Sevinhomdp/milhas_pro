import { cookies } from 'next/headers'
import { createClient } from '@/src/lib/supabase/server'
import { Configuracoes } from '@/src/components/features/Configuracoes'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const cookieStore = await cookies()
  const theme = cookieStore.get('theme')?.value as 'light' | 'dark' || 'dark'

  return <Configuracoes currentTheme={theme} />
}
