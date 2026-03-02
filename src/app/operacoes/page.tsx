diff --git a/src/app/operacoes/page.tsx b/src/app/operacoes/page.tsx
index 5f483f30a16b70bd3911dc9fa50bc4fcd83985e7..9425c0e8a7597e90fe8fa317f863ba76757f0655 100644
--- a/src/app/operacoes/page.tsx
+++ b/src/app/operacoes/page.tsx
@@ -1,44 +1,62 @@
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
+  const { data: { user } } = await supabase.auth.getUser()
+  if (!user) redirect('/login')
+
+  const [
+    { data: operations },
+    { data: cartoes },
+    { data: programs }
+  ] = await Promise.all([
+    supabase.from('operations').select('*, program:programs(*)').eq('user_id', user.id).order('date', { ascending: false }),
+    supabase.from('cartoes').select('*').eq('user_id', user.id).order('nome', { ascending: true }),
+    supabase.from('programs').select('*').or(`user_id.is.null,user_id.eq.${user.id}`).order('name', { ascending: true })
+  ])
+
+  const db = {
+    operacoes: (operations || []).map((o: any) => ({
+      id: String(o.id),
+      user_id: String(o.user_id),
+      type: o.type,
+      program_id: String(o.program_id),
+      quantity: Number(o.quantity) || 0,
+      value: Number(o.value) || 0,
+      fees: Number(o.fees) || 0,
+      cartao_id: o.cartao_id ?? null,
+      date: String(o.date),
+      status: String(o.status),
+      created_at: String(o.created_at),
+      observacao: o.observacao ?? null,
+      programa: o.program?.name || '?'
+    })),
+    cartoes: (cartoes || []).map((c: any) => ({
+      id: String(c.id),
+      user_id: String(c.user_id),
+      nome: String(c.nome),
+      dia_fechamento: Number(c.dia_fechamento),
+      dia_vencimento: Number(c.dia_vencimento),
+      limite: Number(c.limite) || 0,
+      created_at: String(c.created_at),
+    })),
+    programs: (programs || []).map((p: any) => ({
+      id: String(p.id),
+      name: String(p.name),
+      currency_name: p.currency_name ?? null,
+      user_id: p.user_id ?? null,
+      created_at: String(p.created_at),
+    })),
+    profile: null,
+    saldos: [],
+    faturas: [],
+    metas: [],
+    market_prices: [],
+    market_news: [],
+    user_alerts: []
+  }
+
+  return <OperacoesRoute db={db as any} />
+}
