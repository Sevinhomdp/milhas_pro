diff --git a/src/components/features/Cartoes.tsx b/src/components/features/Cartoes.tsx
index 792dcaf23b58d8ec7d0a16b58fd663856223c446..e34ba22702936447eb0a4561a2b141a1f7bbbf15 100644
--- a/src/components/features/Cartoes.tsx
+++ b/src/components/features/Cartoes.tsx
@@ -1,54 +1,62 @@
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
 
+    const gastosAtivosPorCartao = React.useMemo(() => {
+        return faturas.reduce<Record<string, number>>((acc, fatura) => {
+            acc[fatura.cartao_id] = (acc[fatura.cartao_id] || 0) + Number(fatura.valor || 0)
+            return acc
+        }, {})
+    }, [faturas])
+
+
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
@@ -110,51 +118,56 @@ export default function Cartoes({ db, toast }: CartoesProps) {
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
+                                    Limite total: {formatCurrency(Number(c.limite))}
+                                </p>
+                                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest mt-1">
+                                    Disponível: {formatCurrency(Math.max(0, Number(c.limite) - (gastosAtivosPorCartao[c.id] || 0)))}
+                                </p>
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
