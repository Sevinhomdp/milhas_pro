import { createClient } from '@/src/lib/supabase/server'

export default async function CartoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: cartoes } = await supabase.from('cartoes').select('*').eq('user_id', user.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Cartões</h1>
      <pre>{JSON.stringify(cartoes, null, 2)}</pre>
    </div>
  )
}
