import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Configuracoes } from '@/src/components/features/Configuracoes'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return <Configuracoes userEmail={user.email} />
}
