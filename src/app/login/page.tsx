'use client'

import * as React from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plane, Mail, Lock, ArrowRight, Loader2, User, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [nome, setNome] = React.useState('')
  const [isSignUp, setIsSignUp] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        if (!nome) throw new Error('O nome é obrigatório para o cadastro.')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: nome,
            },
          },
        })
        if (error) throw error

        // Manual profile creation if signup was successful
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: nome,
            updated_at: new Date().toISOString()
          })
        }

        setError('Conta criada! Verifique seu email para confirmar.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex flex-col items-center mb-8"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-accent rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 relative z-10 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-300">
              <Plane className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter">MILHAS PRO</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-px w-4 bg-accent/50" />
            <p className="text-accent font-bold tracking-[0.3em] text-[10px] uppercase italic">Operador de Elite</p>
            <div className="h-px w-4 bg-accent/50" />
          </div>
        </motion.div>

        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surfaceDark/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative"
        >
          {/* Subtle shine effect */}
          <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="wait">
              {isSignUp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Nome Completo</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-accent transition-colors" />
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                      placeholder="Como deseja ser chamado?"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Endereço de Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-accent transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Senha de Acesso</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-accent transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] font-bold text-center flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3 h-3" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent hover:bg-accentLight text-primary font-black rounded-2xl py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-accent/10"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isSignUp ? 'Finalizar Cadastro' : 'Acessar Plataforma')}
              {!loading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Acesso Rápido</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="mt-6 w-full bg-white text-primary hover:bg-gray-100 font-bold rounded-2xl py-3.5 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Entrar com conta Google
          </button>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-bold text-gray-500 hover:text-accent transition-colors"
            >
              {isSignUp ? 'Já possui uma conta? ACESSAR' : 'Não tem uma conta? CRIAR AGORA'}
            </button>
          </div>
        </motion.div>

        <p className="text-center text-[10px] text-gray-500 mt-8 tracking-widest font-medium">
          MILHAS PRO © {new Date().getFullYear()} • SEGURANÇA BANCÁRIA
        </p>
      </div>
    </div>
  )
}
