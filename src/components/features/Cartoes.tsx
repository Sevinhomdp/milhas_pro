diff --git a/src/components/features/Cartoes.tsx b/src/components/features/Cartoes.tsx
index 792dcaf23b58d8ec7d0a16b58fd663856223c446..bf95fe9abfd0e16e14bd8796da90d73063caf577 100644
--- a/src/components/features/Cartoes.tsx
+++ b/src/components/features/Cartoes.tsx
@@ -1,93 +1,112 @@
 'use client'
 
 import * as React from 'react'
 import { Cartao, Database } from '@/src/types'
 import { adicionarCartao, removerCartao } from '@/src/app/actions'
 import { Button } from '../ui/Button'
 import { CreditCard, Plus, Trash2, RefreshCw } from 'lucide-react'
 import { formatCurrency, cn } from '@/src/lib/utils'
 
 
 interface CartoesProps {
     db: Database
     toast: (msg: string, type?: any) => void
     theme?: 'light' | 'dark'
 }
 
 export default function Cartoes({ db, toast }: CartoesProps) {
-    const { cartoes } = db
+    const { cartoes, faturas } = db
     const [showForm, setShowForm] = React.useState(false)
     const [loading, setLoading] = React.useState(false)
     const [nome, setNome] = React.useState('')
     const [limite, setLimite] = React.useState('')
     const [diaVenc, setDiaVenc] = React.useState('10')
     const [diaFech, setDiaFech] = React.useState('3')
     const [dolar, setDolar] = React.useState<number | null>(null)
     const [loadDolar, setLoadDolar] = React.useState(false)
     const [valorGasto, setValorGasto] = React.useState('5000')
     const [ptsPorDolar, setPtsPorDolar] = React.useState('2.5')
 
     const handleAdd = async (e: React.FormEvent) => {
         e.preventDefault(); setLoading(true)
         try {
             await adicionarCartao(
                 nome,
                 parseInt(diaFech) || 3,
                 parseInt(diaVenc) || 10,
                 parseFloat(limite) || 0
             )
             toast('Cartão adicionado!', 'success')
             setNome(''); setLimite(''); setShowForm(false)
         } catch (e: any) {
             toast(e.message, 'error')
         } finally { setLoading(false) }
     }
 
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
 
+
+    const limitePorCartao = React.useMemo(() => {
+        const totalAtivo = faturas
+            .filter(f => !f.pago)
+            .reduce<Record<string, number>>((acc, f) => {
+                acc[f.cartao_id] = (acc[f.cartao_id] || 0) + Number(f.valor || 0)
+                return acc
+            }, {})
+
+        return cartoes.reduce<Record<string, { limiteTotal: number; despesasAtivas: number; limiteDisponivel: number; utilizacaoPct: number }>>((acc, c) => {
+            const limiteTotal = Number(c.limite) || 0
+            const despesasAtivas = totalAtivo[c.id] || 0
+            const limiteDisponivel = Math.max(0, limiteTotal - despesasAtivas)
+            const utilizacaoPct = limiteTotal > 0 ? Math.min(100, (despesasAtivas / limiteTotal) * 100) : 0
+            acc[c.id] = { limiteTotal, despesasAtivas, limiteDisponivel, utilizacaoPct }
+            return acc
+        }, {})
+    }, [cartoes, faturas])
+
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
@@ -110,51 +129,70 @@ export default function Cartoes({ db, toast }: CartoesProps) {
                         </div>
                         <div className="mt-6">
                             <Button loading={loading} type="submit" size="lg" className="px-8">
                                 Salvar Cartão
                             </Button>
                         </div>
                     </form>
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
-                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Limite: {formatCurrency(Number(c.limite))}</p>
+                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
+                                    Limite total: {formatCurrency(limitePorCartao[c.id]?.limiteTotal || 0)}
+                                </p>
+                            </div>
+                        </div>
+
+
+                        <div className="mb-4 rounded-2xl bg-slate-50 dark:bg-white/5 p-3 border border-slate-200 dark:border-white/10">
+                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Limite disponível</p>
+                            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
+                                {formatCurrency(limitePorCartao[c.id]?.limiteDisponivel || 0)}
+                            </p>
+                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
+                                Em uso: {formatCurrency(limitePorCartao[c.id]?.despesasAtivas || 0)} ({(limitePorCartao[c.id]?.utilizacaoPct || 0).toFixed(1)}%)
+                            </p>
+                            <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
+                                <div
+                                    className="h-full bg-amber-500 transition-all"
+                                    style={{ width: `${(limitePorCartao[c.id]?.utilizacaoPct || 0).toFixed(1)}%` }}
+                                />
                             </div>
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
