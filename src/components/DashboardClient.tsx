'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import {
    Database,
    ViewType
} from '../types'
import { cn } from '../lib/utils'
import {
    LayoutDashboard,
    Wallet,
    History,
    PieChart,
    TrendingUp,
    Calculator,
    CreditCard,
    Target,
    ShoppingCart,
    Settings,
    HelpCircle,
    Moon,
    Sun,
    Zap,
    LogOut,
    Menu,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

// Views
import { Dashboard } from './features/Dashboard'
import Saldos from './features/Saldos'
import Simulador from './features/Simulador'
import Operacoes from './features/Operacoes'
import DRE from './features/DRE'
import Cartoes from './features/Cartoes'
import Projecao from './features/Projecao'
import Metas from './features/Metas'
import Configuracoes from './features/Configuracoes'
import HubMercado from './features/Inteligencia'
import ProTip from './ProTip'


interface DashboardClientProps {
    initialDb: Database
    user: User
}

export default function DashboardClient({ initialDb, user }: DashboardClientProps) {
    const router = useRouter()
    const [db, setDb] = useState<Database>(initialDb)
    const [view, setView] = useState<ViewType>('dashboard')
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')
    const [confirmModal, setConfirmModal] = useState<{ title: string; msg: string; onConfirm: () => void } | null>(null)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)

    // 1.3 — Sincronização de tema (anti-flash)
    useEffect(() => {
        const isDark = document.documentElement.classList.contains('dark')
        setTheme(isDark ? 'dark' : 'light')
    }, [])

    useEffect(() => {
        localStorage.setItem('milhas-pro-theme', theme)
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
        root.style.colorScheme = theme
    }, [theme])

    const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
        setToast({ msg, type })
        setTimeout(() => setToast(null), 3000)
    }

    const handleLogout = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    const mainMenuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'saldos', label: 'Meus Saldos', icon: Wallet },
        { id: 'operacoes', label: 'Lançamentos', icon: History },
        { id: 'dre', label: 'DRE Mensal', icon: PieChart },
        { id: 'projecao', label: 'Projeção', icon: TrendingUp },
        { id: 'simulador', label: 'Simulador', icon: Calculator },
        { id: 'cartoes', label: 'Cartões', icon: CreditCard },
        { id: 'metas', label: 'Metas', icon: Target },
        { id: 'mercado', label: 'Inteligência', icon: Zap },
    ]


    const supportMenuItems = [
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
    ]

    const renderView = () => {
        const props = {
            db,
            onSave: (newDb: Database) => setDb(newDb),
            toast: showToast,
            confirm: (title: string, msg: string, onConfirm: () => void) =>
                setConfirmModal({ title, msg, onConfirm }),
            theme,
        }

        const viewComponent: Record<string, React.ReactNode> = {
            dashboard: <Dashboard {...props} saldos={db.saldos} operacoes={db.operacoes} faturas={db.faturas} cartoes={db.cartoes} metas={db.metas} />,
            saldos: <Saldos db={db} toast={showToast} theme={theme} />,
            simulador: <Simulador theme={theme} />,
            operacoes: <Operacoes db={db} toast={showToast} theme={theme} />,
            dre: <DRE db={db} theme={theme} />,
            cartoes: <Cartoes db={db} toast={showToast} theme={theme} />,
            projecao: <Projecao db={db} toast={showToast} theme={theme} />,
            metas: <Metas db={db} toast={showToast} theme={theme} />,
            configuracoes: <Configuracoes db={db} toast={showToast} theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} userEmail={user.email} />,
            mercado: <HubMercado db={db} toast={showToast} theme={theme} />,
        }


        return (
            <div className="animate-fadeIn">
                <ProTip view={view} />
                {viewComponent[view] ?? viewComponent.dashboard}
            </div>
        )
    }

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                className="fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 z-50 overflow-hidden flex flex-col shadow-sm"
            >
                {/* Logo + toggle */}
                <div className="p-5 flex items-center justify-between shrink-0">
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.05 }}
                            className="font-black text-xl tracking-tighter"
                        >
                            <span className="text-slate-900 dark:text-white">MILHAS</span>
                            <span className="text-amber-500"> PRO</span>
                        </motion.div>
                    )}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400 transition-all ml-auto"
                    >
                        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
                    </button>
                </div>

                {/* NAV PRINCIPAL */}
                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto scrollbar-hide py-2">
                    {mainMenuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as ViewType)}
                            title={!sidebarOpen ? item.label : undefined}
                            className={cn(
                                'w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150 relative',
                                view === item.id
                                    ? 'bg-slate-900 dark:bg-amber-500/15 text-white dark:text-amber-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            )}
                        >
                            {view === item.id && (
                                <motion.div
                                    layoutId="activeBar"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-full"
                                />
                            )}
                            <item.icon size={18} className="shrink-0" />
                            {sidebarOpen && <span className="text-sm font-semibold truncate">{item.label}</span>}
                        </button>
                    ))}
                </nav>

                {/* FOOTER — Conta e suporte */}
                <div className="shrink-0 border-t border-slate-100 dark:border-white/5 px-3 pt-3 pb-4 space-y-0.5">

                    {sidebarOpen && (
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.12em] px-3 pb-1">
                            Conta
                        </p>
                    )}

                    {/* Configurações */}
                    {supportMenuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setView(item.id as ViewType)}
                            title={!sidebarOpen ? item.label : undefined}
                            className={cn(
                                'w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all duration-150',
                                view === item.id
                                    ? 'bg-slate-900 dark:bg-amber-500/15 text-white dark:text-amber-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            )}
                        >
                            <item.icon size={18} className="shrink-0" />
                            {sidebarOpen && <span className="text-sm font-semibold">{item.label}</span>}
                        </button>
                    ))}

                    {/* Link Ajuda — abre em nova aba */}
                    <a
                        href="/ajuda"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={!sidebarOpen ? 'Ajuda' : undefined}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all duration-150"
                    >
                        <HelpCircle size={18} className="shrink-0" />
                        {sidebarOpen && <span className="text-sm font-semibold">Ajuda</span>}
                    </a>

                    {/* Toggle de tema */}
                    <button
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        title={!sidebarOpen ? (theme === 'light' ? 'Modo Escuro' : 'Modo Claro') : undefined}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-150"
                    >
                        {theme === 'light'
                            ? <Moon size={18} className="shrink-0" />
                            : <Sun size={18} className="shrink-0" />
                        }
                        {sidebarOpen && (
                            <span className="text-sm font-semibold">
                                {theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
                            </span>
                        )}
                    </button>

                    {/* Avatar + nome do usuário */}
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 mt-1">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-amber-500 flex items-center justify-center shrink-0">
                            {(db?.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                                <img
                                    src={db?.profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture}
                                    alt="avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-slate-950 font-black text-[10px]">
                                    {(db?.profile?.full_name || user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                                </span>
                            )}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">
                                    {db?.profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuário'}
                                </p>
                                <p className="text-[9px] text-slate-500 truncate font-bold">{user?.email}</p>
                            </div>
                        )}
                    </div>


                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        title={!sidebarOpen ? 'Sair' : undefined}
                        className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-150"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {sidebarOpen && <span className="text-sm font-semibold">Sair</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className={cn(
                "flex-1 transition-all duration-300 min-h-screen",
                sidebarOpen ? "pl-[280px]" : "pl-[80px]"
            )}>
                <div className="max-w-7xl mx-auto p-8">
                    {renderView()}
                </div>
            </main>

            {/* Confirmation Modal */}
            {confirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{confirmModal.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{confirmModal.msg}</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="flex-1 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold text-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
                                className="flex-1 px-4 py-2 rounded-xl bg-red-500 text-white font-bold text-sm"
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className={cn(
                    "fixed bottom-8 right-8 z-[110] px-6 py-3 rounded-2xl shadow-2xl font-bold text-sm animate-fadeInUp",
                    toast.type === 'success' ? "bg-green-500 text-white" :
                        toast.type === 'error' ? "bg-red-500 text-white" :
                            "bg-slate-900 text-white"
                )}>
                    {toast.msg}
                </div>
            )}
        </div>
    )
}
