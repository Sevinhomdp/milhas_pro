'use client'

import * as React from 'react'
import { TrendingUp, Megaphone, Calculator, Bell, BarChart3, ArrowUpRight, ArrowDownRight, Info, Zap, Search, Clock } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { Database } from '@/src/types'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell
} from 'recharts'
import { cn, formatCurrency } from '@/src/lib/utils'

interface InteligenciaProps {
    db: Database
    toast: (msg: string, type?: any) => void
    theme?: 'light' | 'dark'
}

type TabId = 'historico' | 'promocoes' | 'simulador' | 'alertas'

export default function Inteligencia({ db, toast }: InteligenciaProps) {
    const [activeTab, setActiveTab] = React.useState<TabId>('historico')

    const tabs = [
        { id: 'historico', label: 'Preços', icon: BarChart3 },
        { id: 'promocoes', label: 'Promoções', icon: Megaphone },
        { id: 'simulador', label: 'ROI', icon: Calculator },
        { id: 'alertas', label: 'Alertas', icon: Bell },
    ]

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Inteligência Competitiva</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white leading-none">Market Intelligence</h1>
                </div>

                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-amber-500 text-amber-500 dark:text-slate-950 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-fadeIn">
                {activeTab === 'historico' && <HistoricoPrecos />}
                {activeTab === 'promocoes' && <RadarPromocoes />}
                {activeTab === 'simulador' && <SimuladorROI />}
                {activeTab === 'alertas' && <AlertasSmart />}
            </div>
        </div>
    )
}

function HistoricoPrecos() {
    const data = [
        { data: 'Set', smiles: 16.50, azul: 19.20, latam: 24.50 },
        { data: 'Out', smiles: 15.80, azul: 18.50, latam: 23.80 },
        { data: 'Nov', smiles: 14.50, azul: 17.50, latam: 22.50 },
        { data: 'Dez', smiles: 17.20, azul: 21.00, latam: 26.50 },
        { data: 'Jan', smiles: 16.80, azul: 20.50, latam: 25.80 },
        { data: 'Fev', smiles: 15.50, azul: 19.80, latam: 25.20 },
    ]

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PriceStat label="Smiles" value="R$ 15,50" change="-8.2%" status="down" color="#f97316" />
                <PriceStat label="TudoAzul" value="R$ 19,80" change="+4.1%" status="up" color="#3b82f6" />
                <PriceStat label="LATAM Pass" value="R$ 25,20" change="+2.5%" status="up" color="#ef4444" />
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Evolução de Mercado</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Smiles</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Azul</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LATAM</span></div>
                    </div>
                </div>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#88888811" vertical={false} />
                            <XAxis dataKey="data" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                                domain={['dataMin - 2', 'dataMax + 2']}
                                tickFormatter={(v) => `R$${v}`}
                            />
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.3)', fontWeight: 'bold' }}
                                labelStyle={{ color: '#d4af37', marginBottom: 4 }}
                            />
                            <Line type="monotone" dataKey="smiles" stroke="#f97316" strokeWidth={4} dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="azul" stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                            <Line type="monotone" dataKey="latam" stroke="#ef4444" strokeWidth={4} dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl flex items-start gap-4">
                <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    <strong className="text-slate-900 dark:text-slate-200">Insights do Algoritmo:</strong> Tendência de queda para LATAM nas próximas 2 semanas devido à saturação de promoções bonificadas recentes. Smiles apresenta estabilidade incomum.
                </p>
            </div>
        </div>
    )
}

function RadarPromocoes() {
    const promos = [
        { id: 1, title: 'Bumerangue Livelo & LATAM', bonus: 'Até 100%', category: 'Bumerangue', expires: '2 dias', hot: true },
        { id: 2, title: 'Esfera & Smiles', bonus: '80% de Bônus', category: 'Bonificada', expires: '5 dias', hot: false },
        { id: 3, title: 'Azul & Inter', bonus: '90% de Bônus', category: 'Transferência', expires: '12h', hot: true },
        { id: 4, title: 'Livelo: Compra de Pontos', bonus: '52% de Desconto', category: 'Compra', expires: '7 dias', hot: false },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promos.map(p => (
                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                        <Badge variant={p.hot ? 'danger' : 'COMPRA'}>{p.category.toUpperCase()}</Badge>
                        <span className="text-[10px] font-black text-slate-400 flex items-center gap-1.5 uppercase tracking-widest">
                            <Clock size={12} className="text-amber-500" /> {p.expires}
                        </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight uppercase tracking-tight">{p.title}</h3>
                    <p className="text-amber-500 font-black text-4xl mt-3 tracking-tighter">{p.bonus}</p>

                    <div className="mt-8 grid grid-cols-2 gap-3">
                        <Button variant="secondary" className="h-10 text-[10px] uppercase font-black tracking-widest">Análise</Button>
                        <Button className="h-10 text-[10px] uppercase font-black tracking-widest">Ir p/ Site</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

function SimuladorROI() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-16 rounded-3xl text-center shadow-sm space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto">
                <Calculator size={32} />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Cálculo de ROI Preditivo</h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Estamos calibrando nosso motor de IA para cruzar os preços de mercado atuais com as promoções vigentes.
                </p>
            </div>
            <div className="pt-4 flex justify-center">
                <Badge variant="info" className="px-4 py-1">EM DESENVOLVIMENTO</Badge>
            </div>
        </div>
    )
}

function AlertasSmart() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-16 rounded-3xl text-center shadow-sm space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto">
                <Bell size={32} />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Alertas de Preço Automáticos</h2>
                <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Receba notificações instantâneas via Telegram ou WhatsApp quando o milheiro atingir seu valor alvo.
                </p>
            </div>
            <div className="pt-4 flex justify-center">
                <Button className="px-10 h-12 uppercase font-black text-xs tracking-widest">Configurar Meu Primeiro Alerta</Button>
            </div>
        </div>
    )
}

function PriceStat({ label, value, change, status, color }: { label: string, value: string, change: string, status: 'up' | 'down', color: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm border-t-4" style={{ borderTopColor: color }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{label}</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular tracking-tight">{value}</p>
                </div>
                <div className={cn(
                    "flex items-center gap-0.5 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter",
                    status === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                )}>
                    {status === 'up' ? <ArrowUpRight size={12} strokeWidth={3} /> : <ArrowDownRight size={12} strokeWidth={3} />}
                    {change}
                </div>
            </div>
        </div>
    )
}
