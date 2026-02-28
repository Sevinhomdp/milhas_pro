import { createClient } from '@/src/lib/supabase/server'
import { Saldos } from '@/src/components/features/Saldos'

export default async function SaldosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: saldos } = await supabase.from('programas_saldos').select('*').eq('user_id', user.id)

  return <Saldos saldos={saldos || []} />
}
