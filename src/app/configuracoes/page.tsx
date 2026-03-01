import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import Configuracoes from '@/src/components/features/Configuracoes'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = {
    profile: null,
    programs: [],
    saldos: [],
    operacoes: [],
    faturas: [],
    cartoes: [],
    metas: []
  }

  return <Configuracoes db={db as any} toast={() => { }} theme="dark" toggleTheme={() => { }} userEmail={user.email} />
}
