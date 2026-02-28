import { createClient } from '@/src/lib/supabase/server'
import { Metas } from '@/src/components/features/Metas'

export default async function MetasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [
    { data: metas },
    { data: operacoes }
  ] = await Promise.all([
    supabase.from('metas').select('*').eq('user_id', user.id),
    supabase.from('operacoes').select('*').eq('user_id', user.id).in('tipo', ['VENDA', 'TRANSF'])
  ])

  return <Metas metas={metas || []} operacoes={operacoes || []} />
}
