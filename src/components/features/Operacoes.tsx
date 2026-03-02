diff --git a/src/components/features/Operacoes.tsx b/src/components/features/Operacoes.tsx
index 7e70ceb799445958c5a7996b63193f49cb178582..509d9e1e37477fe5c67a66c2c9c566c36c471b05 100644
--- a/src/components/features/Operacoes.tsx
+++ b/src/components/features/Operacoes.tsx
@@ -1,97 +1,93 @@
 'use client'
 
 import * as React from 'react'
 import { Operation, Cartao, Program, Database } from '@/src/types'
 import { executarCompra, executarVenda, executarTransf, excluirOperacao, marcarRecebido } from '@/src/app/actions'
 import { Badge } from '../ui/Badge'
 import { Button } from '../ui/Button'
 import { PlusCircle, Download, Check, Trash2, Info, ArrowRight } from 'lucide-react'
 import { format } from 'date-fns'
 import { cn, formatCurrency, formatNumber } from '@/src/lib/utils'
 
 interface OperacoesProps {
     db: Database
     toast: (msg: string, type?: any) => void
     theme: 'light' | 'dark'
 }
 
 type TipoOp = 'compra' | 'venda' | 'transferencia'
 type Score = { label: string; color: 'green' | 'yellow' | 'red' } | null
 
 export default function Operacoes({ db, toast }: OperacoesProps) {
     const { operacoes, cartoes, programs } = db
 
-    // M-08 FIX: Respeitar a seleção de "Programas Ativos" feita em Configurações.
-    // Lê a lista do localStorage (mesma chave usada por Configuracoes.tsx).
-    // Se não houver preferência salva, exibe todos os programas.
-    const [programasFiltrados, setProgramasFiltrados] = React.useState<typeof programs>(programs)
-    React.useEffect(() => {
-        try {
-            const saved = localStorage.getItem('progsAtivos')
-            if (saved) {
-                const ativos: string[] = JSON.parse(saved)
-                const filtrados = programs.filter(p => ativos.includes(p.name))
-                setProgramasFiltrados(filtrados.length > 0 ? filtrados : programs)
-            } else {
-                setProgramasFiltrados(programs)
-            }
-        } catch {
-            setProgramasFiltrados(programs)
-        }
-    }, [programs])
+    // Mantém todos os programas disponíveis no cadastro,
+    // mesmo que o saldo atual do programa seja zero.
+    const programasDisponiveis = React.useMemo(() => programs, [programs])
 
     const [tipo, setTipo] = React.useState<TipoOp>('compra')
     const [loading, setLoading] = React.useState(false)
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
-        program_id: programasFiltrados[0]?.id || '',
-        program_id_origem: programasFiltrados[0]?.id || '',
-        program_id_destino: programasFiltrados[1]?.id || '',
+        program_id: programasDisponiveis[0]?.id || '',
+        program_id_origem: programasDisponiveis[0]?.id || '',
+        program_id_destino: programasDisponiveis[1]?.id || programasDisponiveis[0]?.id || '',
         cartao_id: '',
         parcelas: '1',
         date: today,
         data_recebimento: '',
         status_recebimento: 'pendente',
         observacao: ''
     })
 
     const gf = (k: string) => fd[k] ?? ''
     const sf = (k: string, v: string) => setFdState(p => ({ ...p, [k]: v }))
 
+    React.useEffect(() => {
+        if (programasDisponiveis.length === 0) return
+
+        setFdState(prev => ({
+            ...prev,
+            program_id: prev.program_id || programasDisponiveis[0].id,
+            program_id_origem: prev.program_id_origem || programasDisponiveis[0].id,
+            program_id_destino: prev.program_id_destino || programasDisponiveis[Math.min(1, programasDisponiveis.length - 1)].id,
+        }))
+    }, [programasDisponiveis])
+
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
         try {
             // ── Validações de entrada ─────────────────────────────────────
             const qtdNum = parseFloat(qtd) || 0
             const valorNum = parseFloat(valor) || 0
 
             if (qtdNum <= 0) {
                 setError('Informe uma quantidade de milhas válida (maior que zero).')
                 setLoading(false)
@@ -173,71 +169,76 @@ export default function Operacoes({ db, toast }: OperacoesProps) {
         <div className="space-y-8 pb-20">
             {/* Header */}
             <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                 <div>
                     <p className="block text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 dark:text-gray-500 mb-1.5">Registro de Atividades</p>
                     <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Lançamentos</h1>
                     <p className="text-sm text-gray-400 mt-1.5">Gerencie seu histórico de compras, vendas e transferências.</p>
                 </div>
                 <Button onClick={exportarCSV} variant="secondary" icon={<Download className="w-4 h-4" />}>Exportar CSV</Button>
             </div>
 
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                 {/* Form Side */}
                 <div className="lg:col-span-4 space-y-6">
                     <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
                         <div className="flex border-b border-slate-100 dark:border-white/5">
                             {(['compra', 'venda', 'transferencia'] as TipoOp[]).map(t => (
                                 <button key={t} onClick={() => setTipo(t)} className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all", tipo === t ? "text-amber-500 bg-amber-500/5" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200")}>
                                     {t}
                                 </button>
                             ))}
                         </div>
 
                         <form onSubmit={handleSubmit} className="p-6 space-y-4">
                             {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold">{error}</div>}
+                            {programasDisponiveis.length === 0 && (
+                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-bold">
+                                    Nenhum programa disponível. Cadastre um programa na aba Saldos para lançar operações.
+                                </div>
+                            )}
 
                             <div className="space-y-4">
                                 {tipo !== 'transferencia' ? (
                                     <div>
                                         <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Programa</label>
                                         <select value={gf('program_id')} onChange={e => sf('program_id', e.target.value)} className={inputCls} required>
-                                            {programasFiltrados.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
+                                            {programasDisponiveis.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                         </select>
                                     </div>
                                 ) : (
                                     <div className="grid grid-cols-2 gap-3">
                                         <div>
                                             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Origem</label>
                                             <select value={gf('program_id_origem')} onChange={e => sf('program_id_origem', e.target.value)} className={inputCls} required>
-                                                {programasFiltrados.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
+                                                {programasDisponiveis.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                             </select>
                                         </div>
                                         <div>
                                             <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Destino</label>
                                             <select value={gf('program_id_destino')} onChange={e => sf('program_id_destino', e.target.value)} className={inputCls} required>
-                                                {programasFiltrados.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
+                                                {programasDisponiveis.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                             </select>
                                         </div>
                                     </div>
                                 )}
 
                                 <div className="grid grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Quantidade</label>
                                         <input type="number" value={qtd} onChange={e => setQtd(e.target.value)} placeholder="0" className={inputCls} required />
                                     </div>
                                     <div>
                                         <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">{tipo === 'transferencia' ? 'Bônus %' : (tipo === 'venda' ? 'Valor Venda' : 'Valor Compra')}</label>
                                         <input type="number" value={tipo === 'transferencia' ? bonus : valor} onChange={e => tipo === 'transferencia' ? setBonus(e.target.value) : setValor(e.target.value)} placeholder="0" className={inputCls} required />
                                     </div>
                                 </div>
 
                                 {tipo === 'transferencia' && (
                                     <div className="p-3 bg-blue-500/5 rounded-xl border border-blue-500/10 flex justify-between items-center">
                                         <span className="text-[10px] font-black text-blue-500 uppercase">Receberá</span>
                                         <div className="flex items-center gap-2 text-blue-500 font-black">
                                             <span>{formatNumber(milhasDestino)}</span>
                                             <ArrowRight size={12} />
                                         </div>
                                     </div>
                                 )}
@@ -259,51 +260,51 @@ export default function Operacoes({ db, toast }: OperacoesProps) {
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
+                            <Button type="submit" loading={loading} disabled={programasDisponiveis.length === 0} className="w-full h-12" icon={<PlusCircle className="w-5 h-5" />}>Registrar Operação</Button>
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
