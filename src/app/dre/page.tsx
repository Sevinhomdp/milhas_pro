import { createClient } from '@/src/lib/supabase/server'
import { DRE } from '@/src/components/features/DRE'

export default async function DrePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: operacoes } = await supabase.from('operacoes').select('*').eq('user_id', user.id).order('data', { ascending: false })

  return <DRE operacoes={operacoes || []} />
}
