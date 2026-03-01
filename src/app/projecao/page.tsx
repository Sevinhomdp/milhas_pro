diff --git a/src/app/projecao/page.tsx b/src/app/projecao/page.tsx
index 02f02fb70cc05d8509daa17807e49c6a3ff9e3c0..bc4e1b8c04990e453d98e50e176ad504001a6d5e 100644
--- a/src/app/projecao/page.tsx
+++ b/src/app/projecao/page.tsx
@@ -1,30 +1,30 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
-import Projecao from '@/src/components/features/Projecao'
+import { ProjecaoRoute } from '@/src/components/routes/ProjecaoRoute'
 
 export default async function ProjecaoPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
   const [{ data: operations }, { data: faturas }, { data: cartoes }] = await Promise.all([
     supabase.from('operations').select('*').eq('user_id', user.id).eq('type', 'venda'),
     supabase.from('faturas_parcelas').select('*').eq('user_id', user.id),
     supabase.from('cartoes').select('*').eq('user_id', user.id),
   ])
 
   const db = {
     operacoes: operations || [],
     faturas: faturas || [],
     cartoes: cartoes || [],
     profile: null,
     programs: [],
     saldos: [],
     metas: [],
     market_prices: [],
     market_news: [],
     user_alerts: []
   }
 
-  return <Projecao db={db as any} toast={() => { }} theme="dark" />
+  return <ProjecaoRoute db={db as any} />
 }
