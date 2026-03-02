diff --git a/src/app/cartoes/page.tsx b/src/app/cartoes/page.tsx
index 0510e7431e046ca6eb4f848c68756ff350786d79..55efac2addc1d97de48e773139eacf93bc09f5cb 100644
--- a/src/app/cartoes/page.tsx
+++ b/src/app/cartoes/page.tsx
@@ -1,38 +1,47 @@
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
 
   const db = {
-    cartoes: cartoes || [],
+    cartoes: (cartoes || []).map((cartao: any) => {
+      const totalEmAberto = (faturasAtivas || [])
+        .filter((fatura: any) => fatura.cartao_id === cartao.id && !fatura.pago)
+        .reduce((acc: number, fatura: any) => acc + Number(fatura.valor || 0), 0)
+
+      return {
+        ...cartao,
+        total_em_aberto: totalEmAberto,
+        limite_disponivel: Number(cartao.limite || 0) - totalEmAberto,
+      }
+    }),
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
