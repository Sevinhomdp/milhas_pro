diff --git a/src/app/cartoes/page.tsx b/src/app/cartoes/page.tsx
index 0510e7431e046ca6eb4f848c68756ff350786d79..e75da9b80c675633f085d5ec94ffe6fda830cf87 100644
--- a/src/app/cartoes/page.tsx
+++ b/src/app/cartoes/page.tsx
@@ -1,38 +1,49 @@
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
 
+  const cartoesComLimite = (cartoes || []).map((cartao) => {
+    const totalEmAberto = (faturasAtivas || [])
+      .filter((fatura) => fatura.cartao_id === cartao.id)
+      .reduce((acc, fatura) => acc + Number(fatura.valor || 0), 0)
+
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
