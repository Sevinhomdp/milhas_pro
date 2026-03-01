diff --git a/src/app/inteligencia/page.tsx b/src/app/inteligencia/page.tsx
index a660f1ac700754e40ac8c8ad027cc13122b0e5b1..6f867a0a2e1305ec0d49d6b4e31f7ecb6ce02bb0 100644
--- a/src/app/inteligencia/page.tsx
+++ b/src/app/inteligencia/page.tsx
@@ -1,28 +1,28 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
-import Inteligencia from '@/src/components/features/Inteligencia'
+import { InteligenciaRoute } from '@/src/components/routes/InteligenciaRoute'
 import { Database } from '@/src/types'
 
 export default async function InteligenciaPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
   const [
     { data: saldos },
     { data: marketPrices },
     { data: marketNews },
     { data: userAlerts },
   ] = await Promise.all([
     supabase
       .from('balances')
       .select('*, programs(*)')
       .eq('user_id', user.id),
     supabase
       .from('market_prices')
       .select('*')
       .order('timestamp', { ascending: true }),
     supabase
       .from('market_news')
       .select('*')
       .eq('ativa', true)
@@ -35,29 +35,29 @@ export default async function InteligenciaPage() {
 
   const formattedSaldos = (saldos || []).map((s: any) => ({
     program_id: s.program_id,
     nome_programa: s.programs?.name || '?',
     saldo_atual: Number(s.calculated_balance) || 0,
     ajuste_manual: s.manual_adjustment,
     usar_ajuste_manual: s.manual_adjustment !== null && s.manual_adjustment !== 0,
     custo_medio: Number(s.custo_medio) || 0,
   }))
 
   const db: Partial<Database> = {
     profile: null,
     programs: [],
     saldos: formattedSaldos,
     operacoes: [],
     faturas: [],
     cartoes: [],
     metas: [],
     market_prices: marketPrices || [],
     market_news: marketNews || [],
     user_alerts: userAlerts || [],
   }
 
   return (
     <div className="p-4 md:p-8">
-      <Inteligencia db={db as Database} toast={() => {}} theme="dark" />
+      <InteligenciaRoute db={db as Database} />
     </div>
   )
 }
