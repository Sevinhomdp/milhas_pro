diff --git a/src/components/features/Saldos.tsx b/src/components/features/Saldos.tsx
index 1cb33105d5afa01986cc05c4492f968189d47f51..c35a1f93f7747bc588f56e323a922a6db5ddffe9 100644
--- a/src/components/features/Saldos.tsx
+++ b/src/components/features/Saldos.tsx
@@ -1,32 +1,34 @@
 'use client'
 
 import React, { useState, useRef, useEffect } from 'react'
 import { Database, ProgramaSaldo } from '@/src/types'
 import { PROGS } from '@/src/constants'
 import { formatNumber, formatCurrency, cn } from '@/src/lib/utils'
-import { ajustarSaldoManual, registrarPrograma } from '@/src/app/actions'
+import { ajustarSaldoManual } from '@/src/app/actions'
+import { createClient } from '@/src/lib/supabase/client'
+import { useRouter } from 'next/navigation'
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
 
@@ -74,63 +76,83 @@ function ProgramaCombobox({
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
     const [selectedProg, setSelectedProg] = useState('')
     const [addLoading, setAddLoading] = useState(false)
     const [editValues, setEditValues] = useState<Record<string, string>>({})
     const [savingProg, setSavingProg] = useState<string | null>(null)
+    const supabase = createClient()
+    const router = useRouter()
 
     const programasCadastrados = db.saldos.map(s => s.nome_programa)
-    const programasDisponiveis = PROGS.filter(p => !programasCadastrados.includes(p))
+    const programasBase = Array.from(new Set([...PROGS, ...db.programs.map(p => p.name)])).sort((a, b) => a.localeCompare(b))
+    const programasDisponiveis = programasBase.filter(p => !programasCadastrados.includes(p))
 
     const handleAddPrograma = async () => {
         if (!selectedProg) return
         setAddLoading(true)
         try {
-            await registrarPrograma(selectedProg)
+            const { data: authData, error: authError } = await supabase.auth.getUser()
+            if (authError || !authData.user) {
+                throw new Error('Sessão inválida. Faça login novamente.')
+            }
+
+            const { error } = await supabase
+                .from('programs')
+                .insert({
+                    user_id: authData.user.id,
+                    name: selectedProg,
+                    currency_name: null,
+                })
+
+            if (error) {
+                throw error
+            }
+
             toast(`Programa ${selectedProg} adicionado!`, 'success')
             setSelectedProg('')
+            router.refresh()
         } catch (e: any) {
-            toast(e.message, 'error')
+            toast(e.message ?? 'Erro ao adicionar programa.', 'error')
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
