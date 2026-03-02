diff --git a/src/components/features/Saldos.tsx b/src/components/features/Saldos.tsx
index ef028d39c771d50d6b36e17f053a0345998330c0..c7c836697aedb4b116906e6a410e45a00dcef4d9 100644
--- a/src/components/features/Saldos.tsx
+++ b/src/components/features/Saldos.tsx
@@ -76,58 +76,62 @@ function ProgramaCombobox({
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
 
     const programasCadastrados = db.saldos.map(s => s.nome_programa)
-    const programasDisponiveis = PROGS.filter(p => !programasCadastrados.includes(p))
+    const catalogoProgramas = Array.from(new Set([
+        ...db.programs.map((p) => p.name),
+        ...PROGS,
+    ])).sort((a, b) => a.localeCompare(b, 'pt-BR'))
+    const programasDisponiveis = catalogoProgramas.filter(p => !programasCadastrados.includes(p))
 
-    const handleAddPrograma = async () => {
-        if (!selectedProg) return
+    const handleAddPrograma = async (programa: string) => {
+        if (!programa) return
         setAddLoading(true)
         try {
-            await adicionarProgramaAoSaldo(selectedProg)
-            toast(`Programa ${selectedProg} adicionado!`, 'success')
+            await adicionarProgramaAoSaldo(programa)
+            toast(`Programa ${programa} adicionado!`, 'success')
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
 
@@ -138,77 +142,63 @@ export default function Saldos({ db, toast }: SaldosProps) {
     return (
         <div className="space-y-8 pb-20">
             {/* Header */}
             <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                 <div>
                     <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Portfólio de Ativos</p>
                     <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Saldos</h1>
                     <p className="text-sm text-gray-400 mt-2">Veja seus pontos acumulados e ajuste saldos manualmente se necessário.</p>
                 </div>
 
                 {!selectedProg && (
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
                                 options={programasDisponiveis}
                                 value={selectedProg}
-                                onChange={setSelectedProg}
+                                onChange={(programa) => {
+                                    setSelectedProg(programa)
+                                    void handleAddPrograma(programa)
+                                }}
                                 onClose={() => setShowCombobox(false)}
                             />
                         )}
                     </div>
                 )}
             </div>
-
-            {/* Confirmação após seleção no combobox */}
-            {selectedProg && !showCombobox && (
-                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 flex items-center justify-between gap-4 animate-fadeIn">
-                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
-                        Adicionar <span className="text-amber-500">{selectedProg}</span> ao portfólio?
-                    </p>
-                    <div className="flex items-center gap-2 shrink-0">
-                        <button
-                            onClick={handleAddPrograma}
-                            disabled={addLoading}
-                            className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-black text-xs rounded-xl transition-all disabled:opacity-50"
-                        >
-                            <Check size={12} />
-                            {addLoading ? 'Adicionando...' : 'Confirmar'}
-                        </button>
-                        <button onClick={() => setSelectedProg('')} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
-                            <X size={15} />
-                        </button>
-                    </div>
+            {addLoading && (
+                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl px-4 py-3 animate-fadeIn">
+                    <p className="text-sm font-bold text-amber-700 dark:text-amber-300">Adicionando programa...</p>
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
                             <div
                                 key={s.program_id}
                                 className={cn(
