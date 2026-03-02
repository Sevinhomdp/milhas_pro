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
                        animate={{ opacity: 1, y: 0 }}
                        className="block text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-1.5"
                    >
                        Hub de Inteligência & Mercado
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-none"
                    >
                        Market Analysis
                    </motion.h1>
                </div>

                <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={cn(
                                "flex items-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-white dark:bg-amber-500 text-amber-500 dark:text-slate-950 shadow-sm scale-[1.02]"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            )}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'historico' && <MarketAnalytics db={db} />}
                    {activeTab === 'promocoes' && <RadarPromocoes db={db} />}
                    {activeTab === 'alertas' && <AlertasSmart db={db} toast={toast} />}
                    {activeTab === 'oportunidades' && <OpportunityPanel db={db} />}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// 1. HISTÓRICO DE PREÇOS (Market Analytics)
function MarketAnalytics({ db }: { db: Database }) {
    const [filterProg, setFilterProg] = React.useState('SMILES')

    const chartData = (db.market_prices || [])
        .filter(p => p.programa === filterProg)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map(p => ({
            name: new Date(p.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            valor: Number(p.valor)
        }))

    return (
        <div className="space-y-6">
            <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
                {['SMILES', 'AZUL', 'LATAM', 'LIVELO'].map(prog => (
                    <button
                        key={prog}
                        onClick={() => setFilterProg(prog)}
                        className={cn(
                            "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                            filterProg === prog
                                ? "bg-amber-500 text-slate-950"
                                : "bg-slate-100 dark:bg-white/5 text-slate-500"
                        )}
                    >
                        {prog}
                    </button>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={120} className="text-amber-500" />
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Evolução do Milheiro (R$)</h3>
                    <Badge variant="info">SIMULAÇÃO DE MERCADO</Badge>
                </div>

                <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#88888811" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                            />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }}
                                axisLine={false}
                                tickLine={false}
                                domain={['dataMin - 1', 'dataMax + 1']}
                                tickFormatter={(v) => `R$${v}`}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: '#0f172a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: 16,
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                    padding: '12px'
                                }}
                                itemStyle={{ color: '#d4af37', fontWeight: '900', fontSize: '14px' }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '10px' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="valor"
                                stroke="#fbbf24"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorValue)"
                                animationDuration={1500}
                                dot={{ r: 4, fill: '#fbbf24', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 6, stroke: '#fbbf24', strokeWidth: 2, fill: '#fff' }}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl flex items-center gap-4">
                <div className="p-2.5 bg-amber-500 rounded-xl text-slate-950">
                    <Info size={16} />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
                    <span className="text-amber-500 uppercase tracking-widest mr-2 underline decoration-2 underline-offset-4">Nota:</span>
                    Os dados exibidos são uma simulação de mercado para demonstração. A integração com feeds de preços reais (HotMilhas/MaxMilhas) está prevista em versão futura.
                </p>
            </div>
        </div>
    )
}

// 2. RADAR DE PROMOÇÕES (Farming Hub)
function RadarPromocoes({ db }: { db: Database }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(db.market_news || []).map(news => (
                <motion.div
                    key={news.id}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm group relative overflow-hidden flex flex-col h-full"
                >
                    <div className="flex justify-between items-start mb-6">
                        <Badge variant={news.categoria === 'TRANSFERENCIA_BONUS' ? 'info' : 'COMPRA'}>
                            {news.categoria?.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Zap size={12} className={cn(news.importancia_score > 7 ? "text-amber-500 animate-pulse" : "text-slate-500")} />
                            SCORE: {news.importancia_score}
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
                {(db.user_alerts || []).map(alerta => (
                    <div key={alerta.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                <TrendingUp size={20} className="text-amber-500" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                    {alerta.tipo_alerta.replace('_', ' ')}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400">
                                    Status: <span className={cn(alerta.status === 'ACTIVE' ? "text-emerald-500" : "text-amber-500")}>{alerta.status}</span>
                                </p>
                            </div>
                        </div>
                        <Button variant="secondary" className="h-10 px-4">Editar</Button>
                    </div>
                ))}

                <button className="w-full border-2 border-dashed border-slate-200 dark:border-white/5 p-6 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all group">
                    <PlusCircle size={20} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Novo Alerta de Mercado</span>
                </button>
            </div>
        </div>
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
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <Zap className="text-amber-500" size={24} />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Oportunidades de Venda</h3>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {opportunities.length > 0 ? opportunities.map((opt) => (
                        <div key={opt.programa} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between group overflow-hidden relative">
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1.5",
                                opt.status === 'HOT' ? "bg-emerald-500" : opt.status === 'MILD' ? "bg-amber-500" : "bg-slate-100"
                            )} />

                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Programa</p>
                                    <h4 className="text-lg font-black text-amber-500 uppercase leading-none">{opt.programa}</h4>
                                </div>
                                <div className="w-px h-8 bg-slate-100 dark:bg-white/5" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valorização</p>
                                    <p className="text-xs font-bold dark:text-white leading-none">ROI: {opt.roi.toFixed(1)}%</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Estimado</p>
                                <p className={cn(
                                    "text-2xl font-black tracking-tighter",
                                    opt.profit > 0 ? "text-emerald-500" : "text-amber-500"
                                )}>
                                    {formatCurrency(opt.profit)}
                                </p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center opacity-50">
                            <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma oportunidade detectada.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-slate-950 p-8 rounded-[40px] text-white overflow-hidden relative border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-8 border-b border-white/10 pb-4">
                    ⚡ Market Monitor
                </h3>
                <div className="space-y-6">
                    {['SMILES', 'AZUL', 'LATAM'].map(prog => {
                        const price = (db.market_prices || []).find(p => p.programa === prog)?.valor || 0
                        return (
                            <div key={prog} className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-slate-500 uppercase">{prog}</p>
                                <p className="text-lg font-black tracking-tight">R$ {Number(price).toFixed(2)}</p>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 italic text-[10px] text-slate-500">
                    Dados atualizados automaticamente a cada 6 horas via Engine Pro.
                </div>
            </div>
        </div>
    )
}
