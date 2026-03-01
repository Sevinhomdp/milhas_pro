'use client'

import * as React from 'react'
import { Database } from '@/src/types'
import { alterarSenha } from '@/src/app/actions'
import { Moon, Sun, Key, Settings, User } from 'lucide-react'
import { Button } from '../ui/Button'
import { PROGS } from '@/src/constants'
import { cn } from '@/src/lib/utils'


interface ConfiguracoesProps {
    db: Database
    toast: (msg: string, type?: any) => void
    theme: 'light' | 'dark'
    toggleTheme: () => void
    userEmail?: string
}

export default function Configuracoes({ db, toast, theme, toggleTheme, userEmail }: ConfiguracoesProps) {
    const [progsAtivos, setProgsAtivos] = React.useState<string[]>(() => {
        if (typeof window === 'undefined') return PROGS
        const s = localStorage.getItem('progsAtivos'); return s ? JSON.parse(s) : PROGS
    })

    const toggleProg = (p: string) => {
        setProgsAtivos(prev => {
            const n = prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
            localStorage.setItem('progsAtivos', JSON.stringify(n))
            return n
        })
    }

    const [senha, setSenha] = React.useState('')
    const [senhaConf, setSenhaConf] = React.useState('')
    const [ldPwd, setLdPwd] = React.useState(false)

    const handleSenha = async (e: React.FormEvent) => {
        e.preventDefault()
        if (senha !== senhaConf) { toast('As senhas não coincidem.', 'error'); return }
        if (senha.length < 6) { toast('A senha deve ter no mínimo 6 caracteres.', 'error'); return }

        setLdPwd(true)
        try {
            await alterarSenha(senha)
            toast('Senha alterada com sucesso!', 'success')
            setSenha(''); setSenhaConf('')
        } catch (err: any) {
            toast(err.message, 'error')
        } finally {
            setLdPwd(false)
        }
    }

    const iCls = "w-full rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"

    return (
        <div className="space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                <div>
                    <p className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 mb-1.5">Preferências</p>
                    <h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2 leading-none">
                        Configurações
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    {/* Perfil */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm">
                        <h2 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            <User size={16} className="text-amber-500" /> Conta
                        </h2>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">E-mail de Acesso</p>
                                <p className="text-base font-black text-slate-900 dark:text-white">{userEmail || 'Não identificado'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Aparência */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm">
                        <h2 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                            {theme === 'dark' ? <Moon size={16} className="text-amber-500" /> : <Sun size={16} className="text-amber-500" />} Personalização
                        </h2>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white">Modo Visão</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Atualmente {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={cn(
                                    "relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300",
                                    theme === 'dark' ? "bg-amber-500 shadow-lg shadow-amber-500/20" : "bg-slate-200"
                                )}
                            >
                                <span
                                    className={cn(
                                        "inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-300 shadow-sm",
                                        theme === 'dark' ? "translate-x-7" : "translate-x-1"
                                    )}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Programas */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm">
                        <h2 className="text-xs font-black text-slate-900 dark:text-white mb-6 uppercase tracking-widest leading-none">Programas Ativos</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 leading-relaxed">Selecione quais programas deseja exibir nos formulários de operação.</p>
                        <div className="flex flex-wrap gap-2">
                            {PROGS.map(p => (
                                <button
                                    key={p}
                                    onClick={() => toggleProg(p)}
                                    className={cn(
                                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-200",
                                        progsAtivos.includes(p)
                                            ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                                            : "bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Senha */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm h-full">
                        <h2 className="text-xs font-black text-slate-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-2">
                            <Key size={16} className="text-amber-500" /> Segurança
                        </h2>
                        <form onSubmit={handleSenha} className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Nova Senha</label>
                                <input
                                    type="password"
                                    value={senha}
                                    onChange={e => setSenha(e.target.value)}
                                    className={iCls}
                                    placeholder="Mínimo de 6 caracteres"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5 ml-1">Confirmar Senha</label>
                                <input
                                    type="password"
                                    value={senhaConf}
                                    onChange={e => setSenhaConf(e.target.value)}
                                    className={iCls}
                                    placeholder="Repita a nova senha"
                                />
                            </div>

                            <div className="pt-4">
                                <Button
                                    loading={ldPwd}
                                    disabled={!senha || !senhaConf}
                                    type="submit"
                                    className="w-full h-12 uppercase font-black text-xs tracking-widest"
                                >
                                    Atualizar Senha
                                </Button>
                                <p className="text-[9px] text-center text-slate-400 font-bold mt-4 uppercase tracking-[0.1em]">Sua sessão será mantida após a troca.</p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
