'use client'

import * as React from 'react'
import { alterarSenha } from '@/src/app/actions'
import { Moon, Sun, Key, Settings } from 'lucide-react'
import { Button } from '../ui/Button'

const PROGS = ['Livelo', 'Esfera', 'Átomos', 'Smiles', 'Azul', 'LATAM', 'Inter', 'Itaú']

interface ConfiguracoesProps { userEmail?: string }

export function Configuracoes({ userEmail }: ConfiguracoesProps) {
    const [theme, setTheme] = React.useState<'dark' | 'light'>('dark')
    React.useEffect(() => { const t = localStorage.getItem('theme') as 'dark' | 'light' | null; if (t) setTheme(t) }, [])

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark'
        setTheme(next); localStorage.setItem('theme', next)
        document.documentElement.classList.toggle('dark', next === 'dark')
        document.documentElement.classList.toggle('light', next === 'light')
    }

    const [progsAtivos, setProgsAtivos] = React.useState<string[]>(() => {
        if (typeof window === 'undefined') return PROGS
        const s = localStorage.getItem('progsAtivos'); return s ? JSON.parse(s) : PROGS
    })
    const toggleProg = (p: string) => {
        setProgsAtivos(prev => { const n = prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]; localStorage.setItem('progsAtivos', JSON.stringify(n)); return n })
    }

    const [senha, setSenha] = React.useState('')
    const [senhaConf, setSenhaConf] = React.useState('')
    const [ldPwd, setLdPwd] = React.useState(false)
    const [msgPwd, setMsgPwd] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const handleSenha = async (e: React.FormEvent) => {
        e.preventDefault()
        if (senha !== senhaConf) { setMsgPwd({ type: 'error', text: 'Senhas não coincidem.' }); return }
        if (senha.length < 6) { setMsgPwd({ type: 'error', text: 'Mín. 6 caracteres.' }); return }
        setLdPwd(true); setMsgPwd(null)
        try {
            await alterarSenha(senha); setMsgPwd({ type: 'success', text: 'Senha alterada!' }); setSenha(''); setSenhaConf('')
        } catch (err: unknown) { setMsgPwd({ type: 'error', text: err instanceof Error ? err.message : 'Erro.' }) } finally { setLdPwd(false) }
    }

    const iCls = 'flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-borderDark text-gray-900 dark:text-white focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-150'

    return (
        <div className="space-y-6">
            <div><p className="field-label mb-1">Sistema</p><h1 className="text-3xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2"><Settings className="text-accent w-7 h-7" /> Configurações</h1></div>

            {userEmail && (<div className="card p-5"><h2 className="field-label mb-2">Conta</h2><p className="text-sm text-gray-500">Logado como: <span className="text-gray-900 dark:text-white font-bold">{userEmail}</span></p></div>)}

            <div className="card p-5">
                <h2 className="field-label mb-4">Aparência</h2>
                <div className="flex items-center justify-between">
                    <div><p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Modo {theme === 'dark' ? 'Escuro' : 'Claro'}</p><p className="text-[11px] text-gray-500 mt-0.5">Salvo localmente.</p></div>
                    <button onClick={toggleTheme} className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-accent' : 'bg-gray-200'} px-1`}>
                        <span className={`inline-flex h-8 w-8 transform rounded-full bg-white items-center justify-center shadow-md transition-transform ${theme === 'dark' ? 'translate-x-10' : 'translate-x-0'}`}>
                            {theme === 'dark' ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-warning" />}
                        </span>
                    </button>
                </div>
            </div>

            <div className="card p-5">
                <h2 className="field-label mb-4">Programas Ativos</h2>
                <p className="text-[11px] text-gray-500 mb-3">Quais programas aparecem nos formulários.</p>
                <div className="flex flex-wrap gap-2">
                    {PROGS.map(p => (<button key={p} onClick={() => toggleProg(p)} className={`px-4 py-2 text-xs font-bold rounded-full transition-all duration-150 active:scale-95 ${progsAtivos.includes(p) ? 'bg-accent text-primary shadow-[0_0_12px_rgba(212,175,55,0.2)]' : 'bg-transparent border border-gray-200 dark:border-borderDark text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>{p}</button>))}
                </div>
            </div>

            <div className="card p-5">
                <h2 className="field-label mb-4 flex items-center gap-2"><Key className="w-3.5 h-3.5 text-accent" /> Alterar Senha</h2>
                <form onSubmit={handleSenha}><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="field-label">Nova Senha</label><input type="password" value={senha} onChange={e => setSenha(e.target.value)} className={iCls} placeholder="Mín. 6 caracteres" /></div>
                    <div><label className="field-label">Confirmar</label><input type="password" value={senhaConf} onChange={e => setSenhaConf(e.target.value)} className={iCls} placeholder="Repita" /></div>
                </div>
                    {msgPwd && <p className={`mt-3 text-sm ${msgPwd.type === 'success' ? 'text-success' : 'text-danger'}`}>{msgPwd.text}</p>}
                    <div className="mt-5"><Button variant="primary" size="lg" loading={ldPwd} disabled={!senha} type="submit">Salvar Senha</Button></div></form>
            </div>
        </div>
    )
}
