diff --git a/src/app/cartoes/page.tsx b/src/app/cartoes/page.tsx
index 0510e7431e046ca6eb4f848c68756ff350786d79..113de5bd8750ffb704ac4611579d5c4c54c8368f 100644
--- a/src/app/cartoes/page.tsx
+++ b/src/app/cartoes/page.tsx
@@ -1,38 +1,53 @@
 import { createClient } from '@/src/lib/supabase/server'
 import { redirect } from 'next/navigation'
 import { CartoesRoute } from '@/src/components/routes/CartoesRoute'
 
 export default async function CartoesPage() {
   const supabase = await createClient()
   const { data: { user } } = await supabase.auth.getUser()
   if (!user) redirect('/login')
 
   const [{ data: cartoes }, { data: faturasAtivas }] = await Promise.all([
     supabase
       .from('cartoes')
       .select('*')
       .eq('user_id', user.id)
       .order('nome', { ascending: true }),
     supabase
       .from('faturas_parcelas')
       .select('*')
       .eq('user_id', user.id)
       .eq('pago', false),
   ])
 
+  const totalEmAbertoPorCartao = new Map<string, number>()
+  for (const fatura of faturasAtivas || []) {
+    if (!fatura.cartao_id || fatura.pago) continue
+    const atual = totalEmAbertoPorCartao.get(fatura.cartao_id) || 0
+    totalEmAbertoPorCartao.set(fatura.cartao_id, atual + Number(fatura.valor || 0))
+  }
+
+  const cartoesComLimite = (cartoes || []).map((cartao: any) => {
+    const totalEmAberto = totalEmAbertoPorCartao.get(cartao.id) || 0
+    return {
+      ...cartao,
+      total_em_aberto: totalEmAberto,
+      limite_disponivel: Number(cartao.limite || 0) - totalEmAberto,
+    }
+  })
+
   const db = {
-    cartoes: cartoes || [],
+    cartoes: cartoesComLimite,
     profile: null,
     programs: [],
     saldos: [],
     operacoes: [],
     faturas: faturasAtivas || [],
     metas: [],
     market_prices: [],
     market_news: [],
     user_alerts: []
   }
 
   return <CartoesRoute db={db as any} />
 }
-
