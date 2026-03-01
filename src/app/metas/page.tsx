diff --git a/src/app/metas/page.tsx b/src/app/metas/page.tsx
index 19ef5250924d0952fe5412daf161a84e9287df71..d2b746f052ac9ac5a35e6830d895c32d7933d5b9 100644
--- a/src/app/metas/page.tsx
+++ b/src/app/metas/page.tsx
@@ -1,29 +1,29 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
-import Metas from '@/src/components/features/Metas'
+import { MetasRoute } from '@/src/components/routes/MetasRoute'
 
 export default async function MetasPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
   const [{ data: metas }, { data: operations }] = await Promise.all([
     supabase.from('metas').select('*').eq('user_id', user.id).order('mes', { ascending: false }),
     supabase.from('operations').select('*').eq('user_id', user.id),
   ])
 
   const db = {
     metas: metas || [],
     operacoes: operations || [],
     profile: null,
     programs: [],
     saldos: [],
     faturas: [],
     cartoes: [],
     market_prices: [],
     market_news: [],
     user_alerts: []
   }
 
-  return <Metas db={db as any} toast={() => { }} theme="dark" />
+  return <MetasRoute db={db as any} />
 }
