diff --git a/src/app/operacoes/page.tsx b/src/app/operacoes/page.tsx
index 5f483f30a16b70bd3911dc9fa50bc4fcd83985e7..a60145b899930ac2a7748667fba7f81db9bce047 100644
--- a/src/app/operacoes/page.tsx
+++ b/src/app/operacoes/page.tsx
@@ -1,44 +1,63 @@
-diff --git a/src/app/operacoes/page.tsx b/src/app/operacoes/page.tsx
-index 1570bb444f83ec20078b3ebeb270f8c48ea95416..826b4e1ab93331e366db9c7e858c34e11d5a384f 100644
---- a/src/app/operacoes/page.tsx
-+++ b/src/app/operacoes/page.tsx
-@@ -1,37 +1,37 @@
- import { createClient } from '@/src/lib/supabase/server'
- import { redirect } from 'next/navigation'
--import Operacoes from '@/src/components/features/Operacoes'
-+import { OperacoesRoute } from '@/src/components/routes/OperacoesRoute'
- 
- export default async function OperacoesPage() {
-   const supabase = await createClient()
-   const { data: { user } } = await supabase.auth.getUser()
-   if (!user) redirect('/login')
- 
-   const [
-     { data: operations },
-     { data: cartoes },
-     { data: programs }
-   ] = await Promise.all([
-     supabase.from('operations').select('*, program:programs(*)').eq('user_id', user.id).order('date', { ascending: false }),
-     supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
-     supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name', { ascending: true })
-   ])
- 
-   const db = {
-     operacoes: (operations || []).map((o: any) => ({
-       ...o,
-       programa: o.program?.name || '?'
-     })),
-     cartoes: cartoes || [],
-     programs: programs || [],
-     profile: null,
-     saldos: [],
-     faturas: [],
-     metas: [],
-     market_prices: [],
-     market_news: [],
-     user_alerts: []
-   }
- 
--  return <Operacoes db={db as any} toast={() => { }} theme="dark" />
-+  return <OperacoesRoute db={db as any} />
- }
+import { createClient } from '@/src/lib/supabase/server'
+import { redirect } from 'next/navigation'
+import { OperacoesRoute } from '@/src/components/routes/OperacoesRoute'
+
+export default async function OperacoesPage() {
+  const supabase = await createClient()
+  const {
+    data: { user },
+  } = await supabase.auth.getUser()
+  if (!user) redirect('/login')
+
+  const [{ data: operations }, { data: cartoes }, { data: programs }, { data: balancesPrograms }] = await Promise.all([
+    supabase.from('operations').select('*, program:programs(*)').eq('user_id', user.id).order('date', { ascending: false }),
+    supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
+    supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name', { ascending: true }),
+    supabase.from('balances').select('programs(*)').eq('user_id', user.id),
+  ])
+
+  const map = new Map<string, any>()
+
+  for (const p of programs || []) {
+    map.set(String(p.id), {
+      id: String(p.id),
+      name: String(p.name),
+      currency_name: p.currency_name ?? null,
+      user_id: p.user_id ?? null,
+      created_at: String(p.created_at),
+    })
+  }
+
+  for (const row of balancesPrograms || []) {
+    const program = (row as any).programs
+    if (!program?.id) continue
+
+    if (!map.has(String(program.id))) {
+      map.set(String(program.id), {
+        id: String(program.id),
+        name: String(program.name),
+        currency_name: program.currency_name ?? null,
+        user_id: program.user_id ?? null,
+        created_at: String(program.created_at),
+      })
+    }
+  }
+
+  const db = {
+    operacoes: (operations || []).map((o: any) => ({
+      ...o,
+      programa: o.program?.name || '?',
+    })),
+    cartoes: cartoes || [],
+    programs: Array.from(map.values()),
+    profile: null,
+    saldos: [],
+    faturas: [],
+    metas: [],
+    market_prices: [],
+    market_news: [],
+    user_alerts: [],
+  }
+
+  return <OperacoesRoute db={db as any} />
+}
