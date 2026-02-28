import { createClient } from '@/src/lib/supabase/server'

export default async function OperacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: operacoes } = await supabase.from('operacoes').select('*').eq('user_id', user.id).order('data', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Lançamentos</h1>
      <pre>{JSON.stringify(operacoes, null, 2)}</pre>
    </div>
  )
}
