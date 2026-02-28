import { createClient } from '@/src/lib/supabase/server'
import { Cartoes } from '@/src/components/features/Cartoes'

export default async function CartoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: cartoes } = await supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true })

  return <Cartoes cartoes={cartoes || []} />
}
