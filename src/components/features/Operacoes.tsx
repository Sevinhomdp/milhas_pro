diff --git a/src/components/features/Operacoes.tsx b/src/components/features/Operacoes.tsx
index 7e70ceb799445958c5a7996b63193f49cb178582..d9d9d6de6fc4e1ad3bd0629c0f441e204ca5ac60 100644
--- a/src/components/features/Operacoes.tsx
+++ b/src/components/features/Operacoes.tsx
@@ -45,70 +45,79 @@ export default function Operacoes({ db, toast }: OperacoesProps) {
     const [error, setError] = React.useState<string | null>(null)
     const [score, setScore] = React.useState<Score>(null)
     const [qtd, setQtd] = React.useState('')
     const [valor, setValor] = React.useState('')
     const [taxas, setTaxas] = React.useState('0')
     const [bonus, setBonus] = React.useState('100')
 
     const [filtroTipo, setFiltroTipo] = React.useState<'' | TipoOp>('')
     const [filtroMes, setFiltroMes] = React.useState('')
     const [page, setPage] = React.useState(1)
     const PAGE_SIZE = 20
     const today = new Date().toISOString().split('T')[0]
 
     const [fd, setFdState] = React.useState<Record<string, string>>({
         program_id: programasFiltrados[0]?.id || '',
         program_id_origem: programasFiltrados[0]?.id || '',
         program_id_destino: programasFiltrados[1]?.id || '',
         cartao_id: '',
         parcelas: '1',
         date: today,
         data_recebimento: '',
         status_recebimento: 'pendente',
         observacao: ''
     })
 
+    const hasPrograms = programasFiltrados.length > 0
+
     const gf = (k: string) => fd[k] ?? ''
     const sf = (k: string, v: string) => setFdState(p => ({ ...p, [k]: v }))
 
     React.useEffect(() => {
         const q = parseFloat(qtd) || 0, v = parseFloat(valor) || 0, t = parseFloat(taxas) || 0
         if (!q || (!v && tipo !== 'transferencia')) { setScore(null); return }
 
         if (tipo === 'compra') {
             const cpm = ((v + t) / q) * 1000
             setScore(cpm < 18 ? { label: `✔ CPM excelente: R$${cpm.toFixed(2)}/mil`, color: 'green' } : cpm < 25 ? { label: `⚡ CPM aceitável: R$${cpm.toFixed(2)}/mil`, color: 'yellow' } : { label: `⚠ CPM alto (R$${cpm.toFixed(2)}/mil)`, color: 'red' })
         } else if (tipo === 'venda') {
             const cpv = ((v - t) / q) * 1000
             setScore(cpv > 30 ? { label: `🚀 CPV excelente: R$${cpv.toFixed(2)}/mil`, color: 'green' } : cpv > 20 ? { label: `✔ CPV bom: R$${cpv.toFixed(2)}/mil`, color: 'yellow' } : { label: `⚠ CPV fraco: R$${cpv.toFixed(2)}/mil`, color: 'red' })
         } else setScore(null)
     }, [qtd, valor, taxas, tipo])
 
     const milhasDestino = tipo === 'transferencia' ? Math.floor((parseFloat(qtd) || 0) * (1 + (parseFloat(bonus) || 0) / 100)) : 0
 
     const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
         e.preventDefault(); setLoading(true); setError(null)
+
+        if (!hasPrograms) {
+            setLoading(false)
+            toast('Cadastre ou adicione ao menos um programa na aba Saldos para lançar operações.', 'warning')
+            return
+        }
+
         try {
             // ── Validações de entrada ─────────────────────────────────────
             const qtdNum = parseFloat(qtd) || 0
             const valorNum = parseFloat(valor) || 0
 
             if (qtdNum <= 0) {
                 setError('Informe uma quantidade de milhas válida (maior que zero).')
                 setLoading(false)
                 return
             }
             if (tipo !== 'transferencia' && valorNum <= 0) {
                 setError('Informe um valor em reais válido (maior que zero).')
                 setLoading(false)
                 return
             }
             if (!gf('date')) {
                 setError('Informe a data da operação.')
                 setLoading(false)
                 return
             }
             // ─────────────────────────────────────────────────────────────
 
             if (tipo === 'compra') {
                 await executarCompra({
                     program_id: gf('program_id'),
@@ -259,51 +268,57 @@ export default function Operacoes({ db, toast }: OperacoesProps) {
                                             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Cartão</label>
                                             <select value={gf('cartao_id')} onChange={e => sf('cartao_id', e.target.value)} className={inputCls}>
                                                 <option value="">À Vista / Pix</option>
                                                 {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                                             </select>
                                         </div>
                                         {gf('cartao_id') && (
                                             <div>
                                                 <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Parcelas</label>
                                                 <select value={gf('parcelas')} onChange={e => sf('parcelas', e.target.value)} className={inputCls}>
                                                     {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => <option key={n} value={n}>{n}x</option>)}
                                                 </select>
                                             </div>
                                         )}
                                     </div>
                                 )}
                             </div>
 
                             {score && (
                                 <div className={cn("p-4 rounded-2xl border flex items-center gap-3 animate-fadeIn", score.color === 'green' ? "bg-green-500/5 border-green-500/20 text-green-500" : score.color === 'yellow' ? "bg-amber-500/5 border-amber-500/20 text-amber-500" : "bg-red-500/5 border-red-500/20 text-red-500")}>
                                     <Info size={16} />
                                     <span className="text-[11px] font-bold leading-tight">{score.label}</span>
                                 </div>
                             )}
 
-                            <Button type="submit" loading={loading} className="w-full h-12" icon={<PlusCircle className="w-5 h-5" />}>Registrar Operação</Button>
+                            {!hasPrograms && (
+                                <div className="p-4 rounded-2xl border bg-red-500/5 border-red-500/20 text-red-500 text-[11px] font-bold">
+                                    Nenhum programa disponível para lançamento. Vá em Saldos e adicione um programa primeiro.
+                                </div>
+                            )}
+
+                            <Button type="submit" loading={loading} disabled={!hasPrograms} className="w-full h-12" icon={<PlusCircle className="w-5 h-5" />}>Registrar Operação</Button>
                         </form>
                     </div>
                 </div>
 
                 {/* List Side */}
                 <div className="lg:col-span-8 space-y-6">
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                         <div className="overflow-x-auto">
                             <table className="w-full">
                                 <thead>
                                     <tr className="border-b border-slate-100 dark:border-white/5">
                                         <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Data</th>
                                         <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Operação</th>
                                         <th className="px-6 py-4 text-left text-[10px] font-black uppercase text-slate-400 tracking-widest">Quantidade</th>
                                         <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Valor Líquido</th>
                                         <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Ações</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-slate-50 dark:divide-white/[0.02]">
                                     {paginatedOps.map(op => (
                                         <tr key={op.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                                             <td className="px-6 py-4 text-xs font-bold text-slate-500">{format(new Date(op.date + 'T12:00:00'), 'dd/MM/yy')}</td>
                                             <td className="px-6 py-4">
                                                 <div className="flex flex-col">
                                                     <Badge variant={op.type === 'compra' ? 'COMPRA' : op.type === 'venda' ? 'VENDA' : 'TRANSF'} className="w-fit mb-1">{op.type.toUpperCase()}</Badge>
