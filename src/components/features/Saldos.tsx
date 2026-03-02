diff --git a/src/components/features/Saldos.tsx b/src/components/features/Saldos.tsx
index 1cb33105d5afa01986cc05c4492f968189d47f51..ef028d39c771d50d6b36e17f053a0345998330c0 100644
--- a/src/components/features/Saldos.tsx
+++ b/src/components/features/Saldos.tsx
@@ -1,32 +1,32 @@
 'use client'
 
 import React, { useState, useRef, useEffect } from 'react'
 import { Database, ProgramaSaldo } from '@/src/types'
 import { PROGS } from '@/src/constants'
 import { formatNumber, formatCurrency, cn } from '@/src/lib/utils'
-import { ajustarSaldoManual, registrarPrograma } from '@/src/app/actions'
+import { adicionarProgramaAoSaldo, ajustarSaldoManual } from '@/src/app/actions'
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
 
@@ -82,51 +82,51 @@ function ProgramaCombobox({
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
 
     const programasCadastrados = db.saldos.map(s => s.nome_programa)
     const programasDisponiveis = PROGS.filter(p => !programasCadastrados.includes(p))
 
     const handleAddPrograma = async () => {
         if (!selectedProg) return
         setAddLoading(true)
         try {
-            await registrarPrograma(selectedProg)
+            await adicionarProgramaAoSaldo(selectedProg)
             toast(`Programa ${selectedProg} adicionado!`, 'success')
             setSelectedProg('')
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
