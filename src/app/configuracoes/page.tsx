diff --git a/src/app/configuracoes/page.tsx b/src/app/configuracoes/page.tsx
index b3a6529994a3fc6b1357adb42538b3ad6a79e6a9..a868920f8985a9deb22d5b2f9323ba3a6c5ab102 100644
--- a/src/app/configuracoes/page.tsx
+++ b/src/app/configuracoes/page.tsx
@@ -1,24 +1,25 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
-import Configuracoes from '@/src/components/features/Configuracoes'
+import { ConfiguracoesRoute } from '@/src/components/routes/ConfiguracoesRoute'
+import { Database } from '@/src/types'
 
 export default async function ConfiguracoesPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
-  const db = {
+  const db: Database = {
     profile: null,
     programs: [],
     saldos: [],
     operacoes: [],
     faturas: [],
     cartoes: [],
     metas: [],
     market_prices: [],
     market_news: [],
     user_alerts: []
   }
 
-  return <Configuracoes db={db as any} toast={() => { }} theme="dark" toggleTheme={() => { }} userEmail={user.email} />
+  return <ConfiguracoesRoute db={db} userEmail={user.email} />
 }
