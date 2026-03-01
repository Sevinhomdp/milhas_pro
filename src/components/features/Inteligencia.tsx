'use client'

import * as React from 'react'
import { TrendingUp, Megaphone, Calculator, Bell, BarChart3, ArrowUpRight, ArrowDownRight, Info, Zap, Search } from 'lucide-react'
import { Button } from '@/src/components/ui/Button'
import { Badge } from '@/src/components/ui/Badge'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'

type TabId = 'historico' | 'promocoes' | 'simulador' | 'alertas'

export function Inteligencia() {
    const [activeTab, setActiveTab] = React.useState<TabId>('historico')

    const tabs = [
        { id: 'historico', label: 'Histórico de Preços', icon: BarChart3 },
        { id: 'promocoes', label: 'Radar de Promoções', icon: Megaphone },
        { id: 'simulador', label: 'ROI Inteligente', icon: Calculator },
        { id: 'alertas', label: 'Alertas Smart', icon: Bell },
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">Inteligência de Mercado</h1>
                    <p className="text-sm text-gray-500 mt-1">Dados em tempo real para maximizar seus lucros.</p>
                </div>

                <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl border border-gray-200 dark:border-borderDark">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-accent text-accent dark:text-primary shadow-sm'
                                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="animate-fadeInUp">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PriceStat label="Smiles" value="R$ 15,50" change="-8.2%" status="down" />
                <PriceStat label="Azul" value="R$ 19,80" change="+4.1%" status="up" />
                <PriceStat label="LATAM Pass" value="R$ 25,20" change="+2.5%" status="up" />
            </div>

            <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="field-label mb-0">Variação do Milheiro (6 meses)</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500" /> <span className="text-[10px] text-gray-500">Smiles</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" /> <span className="text-[10px] text-gray-500">Azul</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500" /> <span className="text-[10px] text-gray-500">LATAM</span></div>
                    </div>
                </div>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="data" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                                domain={['dataMin - 2', 'dataMax + 2']}
                                tickFormatter={(v) => `R$${v}`}
                            />
                            <Tooltip
                                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}
                                labelStyle={{ color: '#d4af37', marginBottom: 4 }}
                            />
                            <Line type="monotone" dataKey="smiles" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="azul" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="latam" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card p-4 bg-accent/5 border border-accent/10 flex items-start gap-3">
                <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">
                    <strong>Análise Milhas Pro:</strong> O mercado de LATAM Pass apresentou forte recuperação em Dezembro devido à alta demanda por passagens internacionais de final de ano. Smiles segue estável nas casas dos R$ 15,00.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {promos.map(p => (
                <div key={p.id} className="card p-5 group hover:border-accent/40 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <Badge variant={p.hot ? 'danger' : 'default'}>{p.category}</Badge>
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" /> Expira em {p.expires}
                        </span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-accent transition-colors">{p.title}</h3>
                    <p className="text-accent font-black text-2xl mt-1">{p.bonus}</p>
                    <div className="mt-4 flex gap-2">
                        <Button variant="secondary" size="sm" className="w-full">Ver Análise</Button>
                        <Button variant="primary" size="sm" className="w-full">Ir p/ Site</Button>
                    </div>
                </div>
            ))}
        </div>
    )
}

function SimuladorROI() {
    return (
        <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
                <Calculator className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Calculadora de ROI Inteligente</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
                Estamos integrando nosso algoritmo que cruza os preços de mercado atuais com suas promoções para te dar a margem real em segundos.
            </p>
            <div className="pt-4">
                <Badge variant="warning">Em Beta - Disponível em Breve</Badge>
            </div>
        </div>
    )
}

function AlertasSmart() {
    return (
        <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mx-auto">
                <Bell className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Alertas de Preço Smart</h2>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
                Seja notificado no WhatsApp ou E-mail assim que o milheiro bater o seu preço alvo de venda ou compra.
            </p>
            <div className="pt-4 flex justify-center gap-3">
                <Button variant="primary">Criar Meu Primeiro Alerta</Button>
            </div>
        </div>
    )
}

function PriceStat({ label, value, change, status }: { label: string, value: string, change: string, status: 'up' | 'down' }) {
    return (
        <div className="card p-4">
            <div className="flex justify-between items-start">
                <div>
                    <p className="field-label mb-0">{label}</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white mt-1 tabular">{value}</p>
                </div>
                <div className={`flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${status === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {status === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {change}
                </div>
            </div>
        </div>
    )
}
