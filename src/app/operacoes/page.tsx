diff --git a/src/app/operacoes/page.tsx b/src/app/operacoes/page.tsx
index 1570bb444f83ec20078b3ebeb270f8c48ea95416..826b4e1ab93331e366db9c7e858c34e11d5a384f 100644
--- a/src/app/operacoes/page.tsx
+++ b/src/app/operacoes/page.tsx
@@ -1,37 +1,37 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
-import Operacoes from '@/src/components/features/Operacoes'
+import { OperacoesRoute } from '@/src/components/routes/OperacoesRoute'
 
 export default async function OperacoesPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
   const [
     { data: operations },
     { data: cartoes },
     { data: programs }
   ] = await Promise.all([
     supabase.from('operations').select('*, program:programs(*)').eq('user_id', user.id).order('date', { ascending: false }),
     supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
     supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name', { ascending: true })
   ])
 
   const db = {
     operacoes: (operations || []).map((o: any) => ({
       ...o,
       programa: o.program?.name || '?'
     })),
     cartoes: cartoes || [],
     programs: programs || [],
     profile: null,
     saldos: [],
     faturas: [],
     metas: [],
     market_prices: [],
     market_news: [],
     user_alerts: []
   }
 
-  return <Operacoes db={db as any} toast={() => { }} theme="dark" />
+  return <OperacoesRoute db={db as any} />
 }
