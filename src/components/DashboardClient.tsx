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
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
            return 'dark'
        }
        return 'light'
    })
    const [confirmModal, setConfirmModal] = useState<{ title: string; msg: string; onConfirm: () => void } | null>(null)
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)

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
        <div className="flex-1 transition-all duration-300 min-h-screen">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {renderView()}
            </div>

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
