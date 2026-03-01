diff --git a/src/app/configuracoes/page.tsx b/src/app/configuracoes/page.tsx
index b3a6529994a3fc6b1357adb42538b3ad6a79e6a9..43e0dc3b8f1b132dd6a66f2566d5cafda1845d9d 100644
--- a/src/app/configuracoes/page.tsx
+++ b/src/app/configuracoes/page.tsx
@@ -1,24 +1,24 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
-import Configuracoes from '@/src/components/features/Configuracoes'
+import { ConfiguracoesRoute } from '@/src/components/routes/ConfiguracoesRoute'
 
 export default async function ConfiguracoesPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
   const db = {
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
+  return <ConfiguracoesRoute db={db as any} userEmail={user.email} />
 }
