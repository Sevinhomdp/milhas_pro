diff --git a/src/app/saldos/page.tsx b/src/app/saldos/page.tsx
index d0281d55757b60588e18141198b84006cd42f8e5..908ac05627a691c5372598957bd57141d47c6f60 100644
--- a/src/app/saldos/page.tsx
+++ b/src/app/saldos/page.tsx
@@ -1,41 +1,42 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
-import Saldos from '@/src/components/features/Saldos'
+import { Database } from '@/src/types'
+import { SaldosRoute } from '@/src/components/routes/SaldosRoute'
 
 export default async function SaldosPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
   const [
     { data: programs },
     { data: balances }
   ] = await Promise.all([
     supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name'),
     supabase.from('balances').select('*, programs(*)').eq('user_id', user.id)
   ])
 
   const formattedSaldos = (balances || []).map((s: any) => ({
     program_id: s.program_id,
     nome_programa: s.programs?.name || '?',
     saldo_atual: Number(s.calculated_balance) || 0,
     ajuste_manual: s.manual_adjustment,
     usar_ajuste_manual: (s.manual_adjustment !== null && s.manual_adjustment !== 0),
     custo_medio: Number(s.custo_medio) || 0,
   }))
 
-  const db = {
+  const db: Database = {
     programs: programs || [],
     saldos: formattedSaldos,
     profile: null,
     operacoes: [],
     faturas: [],
     cartoes: [],
     metas: [],
     market_prices: [],
     market_news: [],
     user_alerts: []
   }
 
-  return <Saldos db={db as any} toast={() => { }} theme="dark" />
+  return <SaldosRoute db={db} />
 }
