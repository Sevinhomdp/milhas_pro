'use client'

import * as React from 'react'
import { alterarSenha } from '@/src/app/actions'
import { Loader2, Moon, Sun, Key } from 'lucide-react'

const PROGS = ['Livelo', 'Esfera', 'Átomos', 'Smiles', 'Azul', 'LATAM', 'Inter', 'Itaú']

interface ConfiguracoesProps {
    userEmail?: string
}

export function Configuracoes({ userEmail }: ConfiguracoesProps) {
    // Theme
    const [theme, setTheme] = React.useState<'dark' | 'light'>('dark')
    React.useEffect(() => {
        const t = localStorage.getItem('theme') as 'dark' | 'light' | null
        if (t) setTheme(t)
    }, [])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next)
        localStorage.setItem('theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
        document.documentElement.classList.toggle('light', next === 'light')
    }

    // Programas ativos
    const [progsAtivos, setProgsAtivos] = React.useState<string[]>(() => {
        if (typeof window === 'undefined') return PROGS
        const saved = localStorage.getItem('progsAtivos')
        return saved ? JSON.parse(saved) : PROGS
    })

    const toggleProg = (p: string) => {
        setProgsAtivos(prev => {
            const next = prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
            localStorage.setItem('progsAtivos', JSON.stringify(next))
            return next
        })
    }

    // Senha
    const [senha, setSenha] = React.useState('')
    const [senhaConf, setSenhaConf] = React.useState('')
    const [loadingPwd, setLoadingPwd] = React.useState(false)
    const [msgPwd, setMsgPwd] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSenha = async (e: React.FormEvent) => {
        e.preventDefault()
        if (senha !== senhaConf) { setMsgPwd({ type: 'error', text: 'As senhas não coincidem.' }); return }
        if (senha.length < 6) { setMsgPwd({ type: 'error', text: 'Senha deve ter ao menos 6 caracteres.' }); return }
        setLoadingPwd(true)
        setMsgPwd(null)
        try {
            await alterarSenha(senha)
            setMsgPwd({ type: 'success', text: 'Senha alterada com sucesso!' })
            setSenha(''); setSenhaConf('')
        } catch (err: unknown) {
            setMsgPwd({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao alterar senha.' })
        } finally { setLoadingPwd(false) }
    }

    const inputClass = 'w-full p-3 bg-bgDark border border-borderDark rounded-lg text-white text-sm focus:outline-none focus:border-accent'

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">Configurações</h1>
                <p className="text-sm text-gray-400">Personalize sua experiência no Milhas Pro.</p>
            </div>

            {/* Account Info */}
            {userEmail && (
                <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                    <h2 className="text-white font-bold mb-2 text-sm uppercase tracking-wider">Conta</h2>
                    <p className="text-sm text-gray-400">Logado como: <span className="text-white font-semibold">{userEmail}</span></p>
                </div>
            )}

            {/* Dark / Light mode */}
            <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Aparência</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-300 font-medium">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Alterna entre tema escuro e claro. Preferência salva localmente.</p>
                    </div>
                    <button onClick={toggleTheme} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-accent' : 'bg-gray-200'} px-1`}>
                        <span className={`inline-flex h-8 w-8 transform rounded-full bg-white items-center justify-center shadow-md transition-transform ${theme === 'dark' ? 'translate-x-10' : 'translate-x-0'}`}>
                            {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
                        </span>
                    </button>
                </div>
            </div>

            {/* Programas ativos */}
            <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Programas Ativos</h2>
                <p className="text-xs text-gray-400 mb-4">Selecione quais programas aparecem nos formulários de lançamento.</p>
                <div className="flex flex-wrap gap-2">
                    {PROGS.map(p => (
                        <button key={p} onClick={() => toggleProg(p)}
                            className={`px-4 py-2 text-sm font-semibold rounded-full border transition-all ${progsAtivos.includes(p) ? 'bg-accent border-accent text-primary' : 'bg-transparent border-borderDark text-gray-400 hover:border-gray-300'}`}>
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alterar senha */}
            <div className="bg-surfaceDark rounded-2xl border border-borderDark p-5">
                <h2 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2"><Key className="w-4 h-4 text-accent" /> Alterar Senha</h2>
                <form onSubmit={handleSenha}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Nova Senha</label>
                            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} className={inputClass} placeholder="Nova senha (mín. 6 caracteres)" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-1">Confirmar Senha</label>
                            <input type="password" value={senhaConf} onChange={e => setSenhaConf(e.target.value)} className={inputClass} placeholder="Repita a nova senha" />
                        </div>
                    </div>
                    {msgPwd && (
                        <p className={`mt-3 text-sm ${msgPwd.type === 'success' ? 'text-success' : 'text-danger'}`}>{msgPwd.text}</p>
                    )}
                    <button disabled={loadingPwd || !senha} type="submit" className="mt-4 bg-accent text-primary font-bold px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 disabled:opacity-50">
                        {loadingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Nova Senha'}
                    </button>
                </form>
            </div>
        </div>
    )
}
