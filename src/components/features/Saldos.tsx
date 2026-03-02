diff --git a/src/components/features/Saldos.tsx b/src/components/features/Saldos.tsx
index 1cb33105d5afa01986cc05c4492f968189d47f51..f6f0a06c55be8bb153e94c9694e029d74391259d 100644
--- a/src/components/features/Saldos.tsx
+++ b/src/components/features/Saldos.tsx
@@ -1,32 +1,32 @@
 'use client'
 
 import React, { useState, useRef, useEffect } from 'react'
 import { Database, ProgramaSaldo } from '@/src/types'
 import { PROGS } from '@/src/constants'
 import { formatNumber, formatCurrency, cn } from '@/src/lib/utils'
-import { ajustarSaldoManual, registrarPrograma } from '@/src/app/actions'
+import { ajustarSaldoManual } from '@/src/app/actions'
 import { Plus, Check, X, Search, ChevronDown, TrendingUp } from 'lucide-react'
 
 interface SaldosProps {
     db: Database
     onSave?: (db: Database) => void
     toast: (msg: string, type?: any) => void
     theme: 'light' | 'dark'
 }
 
 // ── Combobox pesquisável ─────────
 function ProgramaCombobox({
     options,
     value,
     onChange,
     onClose,
 }: {
     options: string[]
     value: string
     onChange: (v: string) => void
     onClose: () => void
 }) {
     const [search, setSearch] = useState('')
     const inputRef = useRef<HTMLInputElement>(null)
     const ref = useRef<HTMLDivElement>(null)
 
@@ -70,142 +70,150 @@ function ProgramaCombobox({
                             key={prog}
                             onClick={() => { onChange(prog); onClose() }}
                             className={cn(
                                 'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all',
                                 value === prog
                                     ? 'bg-amber-500 text-slate-900'
                                     : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'
                             )}
                         >
                             <span className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-black shrink-0">
                                 {prog[0]}
                             </span>
                             {prog}
                             {value === prog && <Check size={13} className="ml-auto" />}
                         </button>
                     ))
                 )}
             </div>
         </div>
     )
 }
 
 // ── Componente principal ─────────────────────────────────────
 export default function Saldos({ db, toast }: SaldosProps) {
     const [showCombobox, setShowCombobox] = useState(false)
-    const [selectedProg, setSelectedProg] = useState('')
+    const [selectedProgId, setSelectedProgId] = useState('')
     const [addLoading, setAddLoading] = useState(false)
     const [editValues, setEditValues] = useState<Record<string, string>>({})
     const [savingProg, setSavingProg] = useState<string | null>(null)
 
-    const programasCadastrados = db.saldos.map(s => s.nome_programa)
-    const programasDisponiveis = PROGS.filter(p => !programasCadastrados.includes(p))
+    const programasCadastrados = new Set(db.saldos.map((s) => s.program_id))
+    const programasDisponiveis: Array<{ id: string; name: string }> = (db.programs.length > 0
+        ? db.programs.map((p) => ({ id: p.id, name: p.name }))
+        : PROGS.map((name) => ({ id: name, name })))
+        .filter((p) => !programasCadastrados.has(p.id))
+
+    const selectedPrograma = programasDisponiveis.find((p) => p.id === selectedProgId)
 
     const handleAddPrograma = async () => {
-        if (!selectedProg) return
+        if (!selectedProgId) return
         setAddLoading(true)
         try {
-            await registrarPrograma(selectedProg)
-            toast(`Programa ${selectedProg} adicionado!`, 'success')
-            setSelectedProg('')
+            await ajustarSaldoManual(selectedProgId, 0)
+            toast(`Programa ${selectedPrograma?.name ?? 'selecionado'} adicionado!`, 'success')
+            setSelectedProgId('')
         } catch (e: any) {
             toast(e.message, 'error')
         } finally {
             setAddLoading(false)
         }
     }
 
     const handleSaveManual = async (s: ProgramaSaldo) => {
         const val = parseFloat(editValues[s.program_id])
         if (isNaN(val)) return
         setSavingProg(s.program_id)
         try {
             await ajustarSaldoManual(s.program_id, val)
             toast('Saldo manual atualizado!', 'success')
             const next = { ...editValues }
             delete next[s.program_id]
             setEditValues(next)
         } catch (e: any) {
             toast(e.message, 'error')
         } finally {
             setSavingProg(null)
         }
     }
 
     const getSaldoExibido = (s: ProgramaSaldo) => {
         return s.usar_ajuste_manual ? (s.ajuste_manual ?? 0) : s.saldo_atual
     }
 
     return (
         <div className="space-y-8 pb-20">
             {/* Header */}
             <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                 <div>
                     <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Portfólio de Ativos</p>
                     <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Saldos</h1>
                     <p className="text-sm text-gray-400 mt-2">Veja seus pontos acumulados e ajuste saldos manualmente se necessário.</p>
                 </div>
 
-                {!selectedProg && (
+                {!selectedProgId && (
                     <div className="relative">
                         <button
                             onClick={() => setShowCombobox(!showCombobox)}
                             className="group flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl hover:border-amber-500/50 shadow-sm hover:shadow-lg dark:hover:shadow-black/20 transition-all duration-300"
                         >
                             <Plus size={18} className="text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                             <span className="text-sm font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">Adicionar Programa</span>
                             <ChevronDown size={14} className={cn('ml-2 text-slate-400 transition-transform', showCombobox && 'rotate-180')} />
                         </button>
 
                         {showCombobox && (
                             <ProgramaCombobox
-                                options={programasDisponiveis}
-                                value={selectedProg}
-                                onChange={setSelectedProg}
+                                options={programasDisponiveis.map((p) => p.name)}
+                                value={programasDisponiveis.find((p) => p.id === selectedProgId)?.name ?? ''}
+                                onChange={(name) => {
+                                    const programa = programasDisponiveis.find((p) => p.name === name)
+                                    if (programa) setSelectedProgId(programa.id)
+                                }}
                                 onClose={() => setShowCombobox(false)}
                             />
                         )}
                     </div>
                 )}
             </div>
 
             {/* Confirmação após seleção no combobox */}
-            {selectedProg && !showCombobox && (
+            {selectedPrograma && !showCombobox && (
                 <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 animate-fadeIn">
                     <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
-                        Adicionar <span className="text-amber-500">{selectedProg}</span> ao portfólio?
+                        Adicionar <span className="text-amber-500">{selectedPrograma.name}</span> ao portfólio?
                     </p>
                     <div className="flex items-center gap-2 shrink-0">
                         <button
                             onClick={handleAddPrograma}
                             disabled={addLoading}
                             className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs rounded-xl transition-all disabled:opacity-50"
                         >
                             <Check size={12} />
                             {addLoading ? 'Adicionando...' : 'Confirmar'}
                         </button>
-                        <button onClick={() => setSelectedProg('')} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
+                        <button onClick={() => setSelectedProgId('')} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                             <X size={15} />
                         </button>
                     </div>
                 </div>
             )}
 
             {/* Estado vazio */}
             {db.saldos.length === 0 ? (
                 <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-2xl p-16 text-center">
                     <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                         <Plus size={24} className="text-amber-500" />
                     </div>
                     <h3 className="font-bold text-slate-900 dark:text-white mb-2">Nenhum programa adicionado</h3>
                     <p className="text-sm text-slate-400 dark:text-slate-500">
                         Clique em &quot;Adicionar Programa&quot; para começar a gerir seus pontos.
                     </p>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                     {db.saldos.map(s => {
                         const saldoExibido = getSaldoExibido(s)
                         const isEditando = s.program_id in editValues
                         const isSaving = savingProg === s.program_id
 
                         return (
