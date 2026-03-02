diff --git a/src/components/features/Operacoes.tsx b/src/components/features/Operacoes.tsx
index 7e70ceb799445958c5a7996b63193f49cb178582..8b23916d7f2fa2d0ec296063dde18781bb039376 100644
--- a/src/components/features/Operacoes.tsx
+++ b/src/components/features/Operacoes.tsx
@@ -48,50 +48,61 @@ export default function Operacoes({ db, toast }: OperacoesProps) {
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
 
     const gf = (k: string) => fd[k] ?? ''
     const sf = (k: string, v: string) => setFdState(p => ({ ...p, [k]: v }))
 
+    React.useEffect(() => {
+        if (programasFiltrados.length === 0) return
+
+        setFdState(prev => ({
+            ...prev,
+            program_id: prev.program_id || programasFiltrados[0]?.id || '',
+            program_id_origem: prev.program_id_origem || programasFiltrados[0]?.id || '',
+            program_id_destino: prev.program_id_destino || programasFiltrados[1]?.id || programasFiltrados[0]?.id || '',
+        }))
+    }, [programasFiltrados])
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
