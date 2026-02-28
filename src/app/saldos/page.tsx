import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Saldos } from '@/src/components/features/Saldos'

export default async function SaldosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: saldos } = await supabase
    .from('programas_saldos')
    .select('*')
    .eq('user_id', user.id)
    .order('nome_programa')

  return <Saldos saldos={saldos || []} />
}
