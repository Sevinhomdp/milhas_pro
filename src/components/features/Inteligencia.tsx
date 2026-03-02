diff --git a/src/components/features/Inteligencia.tsx b/src/components/features/Inteligencia.tsx
index 380882930c130cd6bb2d9f730f13c95844856b9e..1c85838626cc223529c5098280042a06b6306bd6 100644
--- a/src/components/features/Inteligencia.tsx
+++ b/src/components/features/Inteligencia.tsx
@@ -1,37 +1,38 @@
 'use client'
 
 import * as React from 'react'
 import { TrendingUp, Megaphone, Calculator, Bell, BarChart3, ArrowUpRight, ArrowDownRight, Info, Zap, Search, Clock, ShieldCheck, Mail, Smartphone, PlusCircle } from 'lucide-react'
 import { Button } from '@/src/components/ui/Button'
 import { Badge } from '@/src/components/ui/Badge'
 import { Database, MarketPrice, MarketNews, UserAlert } from '@/src/types'
 import {
     AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
 } from 'recharts'
 import { cn, formatCurrency } from '@/src/lib/utils'
 import { motion, AnimatePresence } from 'motion/react'
+import { createAlertaConfig, updateAlertaConfig } from '@/src/app/actions/inteligencia'
 
 interface InteligenciaProps {
     db: Database
     toast: (msg: string, type?: any) => void
     theme?: 'light' | 'dark'
 }
 
 type TabId = 'historico' | 'promocoes' | 'alertas' | 'oportunidades'
 
 export default function Inteligencia({ db, toast }: InteligenciaProps) {
     const [activeTab, setActiveTab] = React.useState<TabId>('historico')
 
     const tabs = [
         { id: 'historico', label: 'Histórico', icon: BarChart3 },
         { id: 'promocoes', label: 'Radar', icon: Megaphone },
         { id: 'alertas', label: 'Alertas', icon: Bell },
         { id: 'oportunidades', label: 'Oportunidades', icon: Zap },
     ]
 
     return (
         <div className="space-y-8 pb-20">
             <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                 <div>
                     <motion.p
                         initial={{ opacity: 0, y: -10 }}
@@ -211,88 +212,150 @@ function RadarPromocoes({ db }: { db: Database }) {
                         </div>
                     </div>
 
                     <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight mb-4">
                         {news.titulo}
                     </h3>
 
                     <p className="text-[11px] text-slate-400 mb-6 line-clamp-2 italic">
                         {news.resumo_ai || "Link de promoção inteligente capturado via Engine."}
                     </p>
 
                     <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                         <span className="text-[9px] font-bold text-slate-500 uppercase">
                             {new Date(news.data_publicacao).toLocaleDateString('pt-BR')}
                         </span>
                         <a href={news.link} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline text-[10px] font-black uppercase tracking-widest">Ver Promoção</a>
                     </div>
                 </motion.div>
             ))}
         </div>
     )
 }
 
 // 3. ALERTAS SMART
 function AlertasSmart({ db, toast }: { db: Database, toast: (m: string) => void }) {
+    const [isModalOpen, setIsModalOpen] = React.useState(false)
+    const [tipo, setTipo] = React.useState('promocao_transferencia')
+    const [threshold, setThreshold] = React.useState<string>('')
+    const [email, setEmail] = React.useState('')
+    const [isSaving, setIsSaving] = React.useState(false)
+    const [alerts, setAlerts] = React.useState<any[]>(db.user_alerts || [])
+
+    const shouldShowThreshold = ['preco_acima', 'preco_abaixo', 'fatura_vencimento'].includes(tipo)
+
+    async function handleCreateAlert() {
+        try {
+            setIsSaving(true)
+            await createAlertaConfig({
+                type: tipo,
+                threshold_value: shouldShowThreshold ? Number(threshold || 0) : null,
+                notification_channel: 'email',
+                contact_value: email,
+            })
+            toast('Alerta criado com sucesso')
+            setIsModalOpen(false)
+        } catch (error) {
+            console.error('Erro ao criar alerta:', error)
+            toast('Erro ao criar alerta')
+        } finally {
+            setIsSaving(false)
+        }
+    }
+
+    async function handleToggle(alerta: any) {
+        try {
+            const nextValue = !(alerta.is_active ?? alerta.status === 'ACTIVE')
+            await updateAlertaConfig(alerta.id, { is_active: nextValue })
+            setAlerts((prev) => prev.map((item) => (item.id === alerta.id ? { ...item, is_active: nextValue } : item)))
+            toast('Alerta atualizado')
+        } catch (error) {
+            console.error('Erro ao atualizar alerta:', error)
+            toast('Erro ao atualizar alerta')
+        }
+    }
+
     return (
         <div className="max-w-2xl mx-auto space-y-6">
             <div className="bg-amber-500 p-8 rounded-3xl flex items-center justify-between text-slate-950 overflow-hidden relative group">
                 <div className="relative z-10">
                     <h3 className="text-xl font-black tracking-tight leading-none mb-2 uppercase">Central de Automações</h3>
                     <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Proteja sua margem e não perca bônus</p>
                 </div>
                 <div className="bg-slate-950/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
                     <ShieldCheck size={40} />
                 </div>
             </div>
 
             <div className="space-y-4">
-                {(db.user_alerts || []).map(alerta => (
+                {alerts.map(alerta => (
                     <div key={alerta.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                 <TrendingUp size={20} className="text-amber-500" />
                             </div>
                             <div>
                                 <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
-                                    {alerta.tipo_alerta.replace('_', ' ')}
+                                    {(alerta.type || alerta.tipo_alerta || '').replace('_', ' ')}
                                 </h4>
                                 <p className="text-[10px] font-bold text-slate-400">
-                                    Status: <span className={cn(alerta.status === 'ACTIVE' ? "text-emerald-500" : "text-amber-500")}>{alerta.status}</span>
+                                    Status: <span className={cn((alerta.is_active ?? alerta.status === 'ACTIVE') ? "text-emerald-500" : "text-amber-500")}>{(alerta.is_active ?? alerta.status === 'ACTIVE') ? 'ATIVO' : 'INATIVO'}</span>
                                 </p>
                             </div>
                         </div>
-                        <Button variant="secondary" className="h-10 px-4">Editar</Button>
+                        <Button variant="secondary" className="h-10 px-4" onClick={() => handleToggle(alerta)}>{(alerta.is_active ?? alerta.status === "ACTIVE") ? "Desativar" : "Ativar"}</Button>
                     </div>
                 ))}
 
-                <button className="w-full border-2 border-dashed border-slate-200 dark:border-white/5 p-6 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all group">
+                <button onClick={() => setIsModalOpen(true)} className="w-full border-2 border-dashed border-slate-200 dark:border-white/5 p-6 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all group">
                     <PlusCircle size={20} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Novo Alerta de Mercado</span>
                 </button>
             </div>
-        </div>
+        
+            {isModalOpen && (
+                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
+                    <div className="w-full max-w-lg bg-slate-950 border border-white/10 rounded-3xl p-6 space-y-4">
+                        <h4 className="text-sm font-black uppercase tracking-widest text-amber-500">Novo Alerta de Mercado</h4>
+                        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm">
+                            <option value="promocao_transferencia">Promoção de Transferência</option>
+                            <option value="preco_acima">Preço acima de R$ X por milheiro</option>
+                            <option value="preco_abaixo">Preço abaixo de R$ X por milheiro</option>
+                            <option value="fatura_vencimento">Fatura vencendo em X dias</option>
+                        </select>
+                        {shouldShowThreshold && (
+                            <input type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="Valor limite" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm" />
+                        )}
+                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@destino.com" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm" />
+                        <div className="flex justify-end gap-2">
+                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
+                            <Button onClick={handleCreateAlert} disabled={isSaving}>{isSaving ? 'Salvando...' : 'Salvar'}</Button>
+                        </div>
+                    </div>
+                </div>
+            )}
+</div>
     )
 }
 
 // 4. PAINEL DE OPORTUNIDADE
 function OpportunityPanel({ db }: { db: Database }) {
     const opportunities = (db.saldos || []).map(saldo => {
         const latestPrice = (db.market_prices || [])
             .filter(p => p.programa === saldo.nome_programa.toUpperCase())
             .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]?.valor || 0
 
         const userCpm = Number(saldo.custo_medio) || 0
         const profitPerMile = latestPrice - userCpm
         const totalProfitPotential = (saldo.saldo_atual / 1000) * profitPerMile
 
         return {
             programa: saldo.nome_programa,
             saldo: saldo.saldo_atual,
             status: profitPerMile > 2 ? 'HOT' : profitPerMile > 0 ? 'MILD' : 'COLD',
             profit: totalProfitPotential,
             roi: userCpm > 0 ? (profitPerMile / userCpm) * 100 : 0
         }
     }).filter(opt => opt.saldo > 0).sort((a, b) => b.profit - a.profit)
 
     return (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
