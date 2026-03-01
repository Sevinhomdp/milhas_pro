import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Saldos } from '@/src/components/features/Saldos'
import { Program, Balance, Operation } from '@/src/types'

export default async function SaldosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch Programs (Global + User)
  const { data: programs } = await supabase
    .from('programs')
    .select('*')
    .or(`user_id.is.null,user_id.eq.${user.id}`)
    .order('name')

  // 2. Fetch Operations to calculate balances
  const { data: ops } = await supabase
    .from('operations')
    .select('program_id, quantity, type')
    .eq('user_id', user.id)

  // 3. Fetch Manual Adjustments
  const { data: adj } = await supabase
    .from('balances')
    .select('*')
    .eq('user_id', user.id)

  // 4. Group and Calculate
  const opsById = (ops || []).reduce((acc: Record<string, number>, op: any) => {
    const val = Number(op.quantity)
    if (op.type === 'compra') acc[op.program_id] = (acc[op.program_id] || 0) + val
    if (op.type === 'venda') acc[op.program_id] = (acc[op.program_id] || 0) - val
    if (op.type === 'transferencia') acc[op.program_id] = (acc[op.program_id] || 0) - val
    return acc
  }, {})

  const adjById = (adj || []).reduce((acc: Record<string, number>, a: any) => {
    acc[a.program_id] = Number(a.manual_adjustment)
    return acc
  }, {})

  // 5. Merge for Frontend
  const saldosHibridos = (programs || []).map((p: Program) => {
    const calc = opsById[p.id] || 0
    const manual = adjById[p.id] || 0
    return {
      program_id: p.id,
      name: p.name,
      calculated_balance: calc,
      manual_adjustment: manual,
      total_balance: calc + manual,
      // Custo médio: Need to calculate this as well, 
      // but for simplicity in this step, let's keep it 0 or calc from buy operations
      custo_medio: 0
    }
  })

  return <Saldos data={saldosHibridos} programs={programs || []} />
}
