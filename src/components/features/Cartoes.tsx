diff --git a/src/components/features/Cartoes.tsx b/src/components/features/Cartoes.tsx
index a1d065f73bc0dc84cf5a14e9ac709e19c73d276d..15e1818f834a1ea3c5c67c1eb3ffa9aa3a1c2e31 100644
--- a/src/components/features/Cartoes.tsx
+++ b/src/components/features/Cartoes.tsx
@@ -45,62 +45,50 @@ export default function Cartoes({ db, toast }: CartoesProps) {
 
     const handleDelete = async (id: string, nomeCur: string) => {
         if (!window.confirm(`Excluir ${nomeCur}?`)) return
         try {
             await removerCartao(id)
             toast('Cartão removido', 'info')
         } catch (e: any) {
             toast(e.message, 'error')
         }
     }
 
     const fetchDolar = async () => {
         setLoadDolar(true)
         try {
             const r = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
             const d = await r.json()
             setDolar(parseFloat(d.USDBRL.ask))
         } catch {
             setDolar(null)
         } finally {
             setLoadDolar(false)
         }
     }
 
 
-    const limiteDisponivelPorCartao = React.useMemo(() => {
-        const mapa = new Map<string, number>()
-
-        for (const fatura of faturas) {
-            if (!fatura.cartao_id || fatura.pago) continue
-            const atual = mapa.get(fatura.cartao_id) || 0
-            mapa.set(fatura.cartao_id, atual + Number(fatura.valor || 0))
-        }
-
-        return mapa
-    }, [faturas])
-
     const inputCls = "w-full rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
 
     return (
         <div className="space-y-6">
             <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                 <div>
                     <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Gestão Financeira</p>
                     <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                         Cartões
                     </h1>
                 </div>
                 <Button
                     variant={showForm ? 'secondary' : 'primary'}
                     onClick={() => setShowForm(!showForm)}
                     icon={<Plus className="w-4 h-4" />}
                 >
                     {showForm ? 'Cancelar' : 'Novo Cartão'}
                 </Button>
             </div>
 
             {showForm && (
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm animate-fadeIn">
                     <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Adicionar Cartão</h2>
                     <form onSubmit={handleAdd}>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
@@ -130,51 +118,51 @@ export default function Cartoes({ db, toast }: CartoesProps) {
                 </div>
             )}
 
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {cartoes.map((c) => (
                     <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleDelete(c.id, c.nome)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all">
                                 <Trash2 size={14} />
                             </button>
                         </div>
 
                         <div className="flex items-center gap-4 mb-6">
                             <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                 <CreditCard size={24} />
                             </div>
                             <div>
                                 <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{c.nome}</h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Limite total: {formatCurrency(Number(c.limite))}</p>
                             </div>
                         </div>
 
                         <div className="mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                             <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mb-1">Limite disponível</p>
                             <p className="text-base font-black text-emerald-700 dark:text-emerald-300">
-                                {formatCurrency(Math.max(0, Number(c.limite) - (limiteDisponivelPorCartao.get(c.id) || 0)))}
+                                {formatCurrency(Number(c.limite_disponivel ?? c.limite))}
                             </p>
                         </div>
 
                         <div className="grid grid-cols-2 gap-4 mt-auto pt-6 border-t border-slate-100 dark:border-white/5">
                             <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Fechamento</p>
                                 <p className="text-sm font-black text-slate-900 dark:text-white">Dia {c.dia_fechamento}</p>
                             </div>
                             <div>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Vencimento</p>
                                 <p className="text-sm font-black text-slate-900 dark:text-white">Dia {c.dia_vencimento}</p>
                             </div>
                         </div>
                     </div>
                 ))}
 
                 {cartoes.length === 0 && (
                     <div className="col-span-full py-12 text-center bg-gray-50/50 dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-white/10">
                         <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Nenhum cartão cadastrado.</p>
                     </div>
                 )}
             </div>
 
             {/* Simulador */}
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm">
