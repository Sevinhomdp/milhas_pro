import { createClient } from '@/src/lib/supabase/server'

export default async function MetasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: metas } = await supabase.from('metas').select('*').eq('user_id', user.id)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Metas</h1>
      <pre>{JSON.stringify(metas, null, 2)}</pre>
    </div>
  )
}
