'use client'

import * as React from 'react'
import { setThemeCookie } from '@/src/app/actions'
import { Moon, Sun, Loader2 } from 'lucide-react'

interface ConfigProps {
    currentTheme: 'light' | 'dark'
}

export function Configuracoes({ currentTheme }: ConfigProps) {
    const [loading, setLoading] = React.useState(false)
    const [theme, setTheme] = React.useState(currentTheme)

    const toggleTheme = async () => {
        setLoading(true)
        const newTheme = theme === 'dark' ? 'light' : 'dark'
        setTheme(newTheme)

        // Toggle on DOM immediately for snappy UX
        const root = document.documentElement
        if (newTheme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        try {
            await setThemeCookie(newTheme)
        } catch (e) {
            console.error(e)
            // Revert if error
            setTheme(theme)
            if (theme === 'dark') root.classList.add('dark')
            else root.classList.remove('dark')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Configurações
                </h1>
                <p className="text-sm text-gray-400">Ajuste as preferências da sua conta e interface.</p>
            </div>

            <div className="bg-surfaceDark p-6 rounded-2xl border border-borderDark shadow-sm max-w-2xl">
                <h2 className="text-lg font-bold text-white mb-6 border-b border-borderDark pb-2">Aparência</h2>

                <div className="flex items-center justify-between p-4 bg-bgDark rounded-xl border border-borderDark">
                    <div className="flex flex-col gap-1">
                        <span className="font-semibold text-white">Modo Escuro / Claro</span>
                        <span className="text-xs text-gray-400">Altere o tema visual da plataforma.</span>
                    </div>

                    <button
                        onClick={toggleTheme}
                        disabled={loading}
                        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${theme === 'dark' ? 'bg-accent' : 'bg-gray-400'
                            }`}
                    >
                        <span className="sr-only">Habilitar modo escuro</span>
                        <span
                            aria-hidden="true"
                            className={`pointer-events-none absolute left-0 inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="h-3 w-3 text-gray-500 animate-spin" />
                            ) : theme === 'dark' ? (
                                <Moon className="h-4 w-4 text-accent" />
                            ) : (
                                <Sun className="h-4 w-4 text-gray-500" />
                            )}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
