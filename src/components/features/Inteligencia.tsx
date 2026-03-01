'use client'

import * as React from 'react'
import { TrendingUp, Megaphone, Calculator, Bell, BarChart3, ArrowUpRight, ArrowDownRight, Info, Zap, Search, Clock, ShieldCheck, Mail, Smartphone, PlusCircle } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import { Database, HistoricoPreco, PromocaoRadar, AlertaConfig } from '@/src/types'
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
    const [filterPlat, setFilterPlat] = React.useState('TODAS')
    const [filterPrazo, setFilterPrazo] = React.useState('TODOS')

    // Extrair opções únicas do DB para os filtros
    const platforms = ['TODAS', ...Array.from(new Set(db.historico_precos.map(p => p.plataforma).filter(Boolean)))]
    const periods = ['TODOS', ...Array.from(new Set(db.historico_precos.map(p => p.prazo_recebimento).filter(Boolean)))]

    // Processar dados para o gráfico baseado nos filtros
    const chartData = db.historico_precos
        .filter(p => {
            const matchProg = p.programa === filterProg
            const matchPlat = filterPlat === 'TODAS' || p.plataforma === filterPlat
            const matchPrazo = filterPrazo === 'TODOS' || p.prazo_recebimento === filterPrazo
            return matchProg && matchPlat && matchPrazo
        })
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        .map(p => ({
            name: new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            valor: Number(p.valor_milheiro)
        }))

    const programs = Array.from(new Set(db.historico_precos.map(p => p.programa)))

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar flex-1">
                    {['SMILES', 'AZUL', 'LATAM', 'TAP'].map(prog => (
                        <button
                            key={prog}
                            onClick={() => setFilterProg(prog)}
                            className={cn(
                                "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                filterProg === prog
                                    ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                            )}
                        >
                            {prog}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3 items-center">
                    <select
                        value={filterPlat}
                        onChange={(e) => setFilterPlat(e.target.value)}
                        className="bg-slate-100 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
                    >
                        {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>

                    <select
                        value={filterPrazo}
                        onChange={(e) => setFilterPrazo(e.target.value)}
                        className="bg-slate-100 dark:bg-white/5 border-none rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 focus:ring-1 focus:ring-amber-500 outline-none cursor-pointer"
                    >
                        {periods.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <TrendingUp size={120} className="text-amber-500" />
                </div>

                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none">Evolução do Milheiro (R$)</h3>
                    <Badge variant="info">DADOS REAIS</Badge>
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
                    <span className="text-amber-500 uppercase tracking-widest mr-2 underline decoration-2 underline-offset-4">Insight Antigravity:</span>
                    Os preços de cotação da {filterProg} mostram uma tendência de {db.historico_precos.find(p => p.programa === filterProg)?.tendencia === 'UP' ? 'ALTA' : 'ESTABILIDADE'} para os próximos 15 dias. Excelente momento para aguardar liquidação.
                </p>
            </div>
        </div>
    )
}

// 2. RADAR DE PROMOÇÕES (Farming Hub)
function RadarPromocoes({ db }: { db: Database }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {db.promocoes_radar.map(promo => (
                <motion.div
                    key={promo.id}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm group relative overflow-hidden flex flex-col h-full"
                >
                    <div className="flex justify-between items-start mb-6">
                        <Badge variant={promo.categoria === 'COMPRA' ? 'info' : 'COMPRA'}>{promo.categoria}</Badge>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <Clock size={12} className="text-amber-500" />
                            {promo.data_validade ? new Date(promo.data_validade).toLocaleDateString('pt-BR') : 'Sem prazo'}
                        </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors leading-tight mb-2">
                        {promo.titulo}
                    </h3>

                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{promo.programa_origem}</span>
                        <ArrowUpRight size={12} className="text-slate-300" />
                        <span className="text-[10px] font-bold text-amber-500 uppercase">{promo.programa_destino}</span>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bônus Target</p>
                            <p className="text-2xl font-black text-amber-500 tracking-tighter">+{promo.bonus_percentual}%</p>
                        </div>
                        <Button className="h-10 w-10 p-0 rounded-xl" variant="secondary">
                            <PlusCircle size={20} />
                        </Button>
                    </div>
                </motion.div>
            ))}

            {/* CTA para novas fontes */}
            <div className="border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                    <Search size={24} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Pesquisando novas<br />promoções em tempo real...
                </p>
            </div>
        </div>
    )
}

// 3. SISTEMA DE ALARMES INTELIGENTES (Smart Triggers)
function AlertasSmart({ db, toast }: { db: Database, toast: (m: string) => void }) {
    const defaultAlerts: AlertaConfig[] = [
        { id: '1', user_id: '', tipo_alerta: 'CPM_THRESHOLD', valor_gatilho: 16.50, programas_foco: ['SMILES'], notificacao_email: true, notificacao_push: true, ultimo_disparo: null, created_at: '' },
        { id: '2', user_id: '', tipo_alerta: 'FATURA_VENCENDO', valor_gatilho: 3, programas_foco: [], notificacao_email: true, notificacao_push: false, ultimo_disparo: null, created_at: '' },
    ]

    const alerts = db.alertas_config.length > 0 ? db.alertas_config : defaultAlerts

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
                <div className="absolute -bottom-4 -right-4 opacity-10">
                    <Bell size={120} />
                </div>
            </div>

            <div className="space-y-4">
                {alerts.map(alerta => (
                    <div key={alerta.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center">
                                {alerta.tipo_alerta === 'CPM_THRESHOLD' ? <TrendingUp size={20} className="text-amber-500" /> : <Calculator size={20} className="text-blue-500" />}
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                                    {alerta.tipo_alerta.replace('_', ' ')}
                                </h4>
                                <p className="text-[10px] font-bold text-slate-400">
                                    Disparar se {alerta.tipo_alerta === 'CPM_THRESHOLD' ? `milheiro < R$ ${alerta.valor_gatilho}` : `vencimento < ${alerta.valor_gatilho} dias`}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className={cn("p-2 rounded-lg transition-colors", alerta.notificacao_email ? "text-amber-500 bg-amber-500/10" : "text-slate-400 bg-slate-100 dark:bg-white/5")}>
                                <Mail size={16} />
                            </button>
                            <button className={cn("p-2 rounded-lg transition-colors", alerta.notificacao_push ? "text-amber-500 bg-amber-500/10" : "text-slate-400 bg-slate-100 dark:bg-white/5")}>
                                <Smartphone size={16} />
                            </button>
                            <Button variant="secondary" className="h-10 px-4 ml-2">Editar</Button>
                        </div>
                    </div>
                ))}

                <button className="w-full border-2 border-dashed border-slate-200 dark:border-white/5 p-6 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:border-amber-500 hover:text-amber-500 transition-all group">
                    <PlusCircle size={20} className="group-hover:scale-125 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Configurar Novo Alerta</span>
                </button>
            </div>
        </div>
    )
}

// 4. PAINEL DE OPORTUNIDADE (O 4º Pilar)
function OpportunityPanel({ db }: { db: Database }) {
    // Cálculo simples de oportunidade cruzando Mercado x Usuário
    const opportunities = db.saldos.map(saldo => {
        const marketPrice = db.historico_precos
            .filter(p => p.programa === saldo.nome_programa.toUpperCase())
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]?.valor_milheiro || 0

        const userCpm = Number(saldo.custo_medio) || 0
        const profitPerMile = marketPrice - userCpm
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
                    {opportunities.length > 0 ? opportunities.map((opt, idx) => (
                        <div key={opt.programa} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm flex items-center justify-between group overflow-hidden relative">
                            {/* Indicador lateral de status */}
                            <div className={cn(
                                "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500",
                                opt.status === 'HOT' ? "bg-emerald-500" : opt.status === 'MILD' ? "bg-amber-500" : "bg-slate-100"
                            )} />

                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Programa</p>
                                    <h4 className="text-lg font-black text-amber-500 uppercase leading-none">{opt.programa}</h4>
                                </div>
                                <div className="w-px h-8 bg-slate-100 dark:bg-white/5" />
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume</p>
                                    <p className="text-sm font-bold dark:text-white leading-none">{(opt.saldo / 1000).toFixed(0)}k milhas</p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Lucro Estimado</p>
                                <p className={cn(
                                    "text-2xl font-black tracking-tighter tabular leading-none",
                                    opt.profit > 0 ? "text-emerald-500" : "text-amber-500"
                                )}>
                                    {formatCurrency(opt.profit)}
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">ROI: {opt.roi.toFixed(1)}%</p>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center space-y-4">
                            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Nenhuma oportunidade detectada no seu portfólio atual.</p>
                            <Button variant="secondary">Adicionar Milhas</Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Resumo do Mercado Sidecard */}
            <div className="bg-slate-950 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                    <BarChart3 size={200} />
                </div>

                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500 mb-8 border-b border-white/10 pb-4">
                    ⚡ Fast Market Info
                </h3>

                <div className="space-y-8 relative z-10">
                    {['SMILES', 'AZUL', 'LATAM'].map(prog => {
                        const price = db.historico_precos.find(p => p.programa === prog)?.valor_milheiro || 0
                        const tendencia = db.historico_precos.find(p => p.programa === prog)?.tendencia
                        return (
                            <div key={prog} className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{prog}</p>
                                    <p className="text-lg font-black tracking-tight">R$ {Number(price).toFixed(2)}</p>
                                </div>
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    tendencia === 'UP' ? "bg-emerald-500/10 text-emerald-500" : tendencia === 'DOWN' ? "bg-red-500/10 text-red-500" : "bg-white/5 text-slate-400"
                                )}>
                                    {tendencia === 'UP' ? <ArrowUpRight size={16} /> : tendencia === 'DOWN' ? <ArrowDownRight size={16} /> : <TrendingUp size={16} />}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-2">Resumo da Carteira</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        Seu lucro total potencial hoje é de <span className="text-emerald-500 font-black">{formatCurrency(opportunities.reduce((acc, curr) => acc + curr.profit, 0))}</span> se realizar todas as vendas nas plataformas de balcão recomendadas.
                    </p>
                </div>
            </div>
        </div>
    )
}
