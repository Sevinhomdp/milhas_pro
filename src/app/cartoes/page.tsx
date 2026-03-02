diff --git a/src/app/cartoes/page.tsx b/src/app/cartoes/page.tsx
index 07781d2b2e82d439dba5a34e9a14025eb8e7d1b6..3c03fb2440db0088a363aef8d2644bf70f06d742 100644
--- a/src/app/cartoes/page.tsx
+++ b/src/app/cartoes/page.tsx
@@ -1,38 +1,58 @@
-diff --git a/src/app/cartoes/page.tsx b/src/app/cartoes/page.tsx
-index d0c35fa0a028d1a94429c58b87e32cd72d79cd41..7b4dfbc8fc3bed2870a5056151d0afd68a397af1 100644
---- a/src/app/cartoes/page.tsx
-+++ b/src/app/cartoes/page.tsx
-@@ -1,31 +1,31 @@
- import { createClient } from '@/src/lib/supabase/server'
- import { redirect } from 'next/navigation'
--import Cartoes from '@/src/components/features/Cartoes'
-+import { CartoesRoute } from '@/src/components/routes/CartoesRoute'
- 
- export default async function CartoesPage() {
-   const supabase = await createClient()
-   const { data: { user } } = await supabase.auth.getUser()
-   if (!user) redirect('/login')
- 
-   const { data: cartoes } = await supabase
-     .from('cartoes')
-     .select('*')
-     .eq('user_id', user.id)
-     .order('nome', { ascending: true })
- 
-   const db = {
-     cartoes: cartoes || [],
-     profile: null,
-     programs: [],
-     saldos: [],
-     operacoes: [],
-     faturas: [],
-     metas: [],
-     market_prices: [],
-     market_news: [],
-     user_alerts: []
-   }
- 
--  return <Cartoes db={db as any} toast={() => { }} />
-+  return <CartoesRoute db={db as any} />
- }
- 
+import { createClient } from '@/src/lib/supabase/server'
+import { redirect } from 'next/navigation'
+import { CartoesRoute } from '@/src/components/routes/CartoesRoute'
+
+export default async function CartoesPage() {
+  const supabase = await createClient()
+  const { data: { user } } = await supabase.auth.getUser()
+  if (!user) redirect('/login')
+
+  const [{ data: cartoes }, { data: faturasAbertas }] = await Promise.all([
+    supabase
+      .from('cartoes')
+      .select('*')
+      .eq('user_id', user.id)
+      .order('nome', { ascending: true }),
+    supabase
+      .from('faturas_parcelas')
+      .select('*')
+      .eq('user_id', user.id)
+      .eq('pago', false),
+  ])
+
+  const db = {
+    cartoes: (cartoes || []).map((c: any) => ({
+      id: String(c.id),
+      user_id: String(c.user_id),
+      nome: String(c.nome),
+      dia_fechamento: Number(c.dia_fechamento),
+      dia_vencimento: Number(c.dia_vencimento),
+      limite: Number(c.limite) || 0,
+      created_at: String(c.created_at),
+    })),
+    profile: null,
+    programs: [],
+    saldos: [],
+    operacoes: [],
+    faturas: (faturasAbertas || []).map((f: any) => ({
+      id: String(f.id),
+      user_id: String(f.user_id),
+      operacao_id: String(f.operacao_id),
+      cartao_id: String(f.cartao_id),
+      valor: Number(f.valor) || 0,
+      mes_referencia: String(f.mes_referencia),
+      parc_num: Number(f.parc_num) || 0,
+      total_parc: Number(f.total_parc) || 0,
+      pago: Boolean(f.pago),
+      data_pagamento: f.data_pagamento ?? null,
+      created_at: String(f.created_at),
+    })),
+    metas: [],
+    market_prices: [],
+    market_news: [],
+    user_alerts: []
+  }
+
+  return <CartoesRoute db={db as any} />
+}
+
