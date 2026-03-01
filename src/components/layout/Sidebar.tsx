'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  BarChart3,
  TrendingUp,
  Calculator,
  CreditCard,
  Target,
  Settings,
  HelpCircle,
  LogOut,
  X,
  Plane,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react"
import { cn } from "@/src/lib/utils"
import { createClient } from "@/src/lib/supabase/client"
import { useRouter } from "next/navigation"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/saldos", label: "Saldos", icon: Wallet },
  { href: "/operacoes", label: "Lançamentos", icon: ArrowRightLeft },
  { href: "/dre", label: "DRE Mensal", icon: BarChart3 },
  { href: "/projecao", label: "Projeção de Caixa", icon: TrendingUp },
  { href: "/simulador", label: "Simulador", icon: Calculator },
  { href: "/cartoes", label: "Cartões", icon: CreditCard },
  { href: "/metas", label: "Metas", icon: Target },
]

import { useTheme } from "@/src/components/providers/ThemeProvider"
import { getProfile } from "@/src/app/actions"
import { Profile } from "@/src/types"

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const [profile, setProfile] = React.useState<Profile | null>(null)

  React.useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isOpen ? 280 : 80,
          x: isOpen ? 0 : (typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col text-white",
          "bg-[#060d1a]",
          "border-r border-white/5",
          "shadow-[4px_0_24px_rgba(0,0,0,0.4)]",
          "transition-colors duration-300 lg:translate-x-0",
          !isOpen && "lg:w-20"
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-primary shadow-[0_0_20px_rgba(212,175,55,0.35)]">
              <Plane className="h-5 w-5" />
            </div>
            {isOpen && (
              <span className="text-[15px] font-black tracking-wide text-white">
                MILHAS<span className="text-accent">PRO</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors duration-150"
            >
              {isOpen
                ? <PanelLeftClose className="h-4 w-4" />
                : <PanelLeftOpen className="h-4 w-4" />
              }
            </button>
            {/* Mobile close */}
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="mt-4 flex-1 overflow-y-auto px-3 py-2 scrollbar-hide">
          <nav className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <React.Fragment key={item.href}>
                  {/* Separador antes de Configurações */}
                  {item.href === '/configuracoes' && (
                    <div className="mx-3 my-3 h-px bg-white/5" />
                  )}
                  <Link
                    href={item.href}
                    title={!isOpen ? item.label : undefined}
                    onClick={() => typeof window !== 'undefined' && window.innerWidth < 1024 && setIsOpen(false)}
                    className={cn(
                      "relative group flex items-center rounded-xl px-3 py-2.5 text-sm font-medium",
                      "transition-all duration-150",
                      isActive
                        ? [
                          "text-white bg-white/[0.08]",
                          "before:absolute before:left-0 before:inset-y-1.5 before:w-0.5",
                          "before:rounded-full before:bg-accent before:shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                        ].join(" ")
                        : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5 shrink-0", isOpen && "mr-3")} />
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </React.Fragment>
              )
            })}
          </nav>
        </div>

        {/* Profile */}
        <div className="px-3 mb-2">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5",
            !isOpen && "justify-center"
          )}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                {profile?.full_name?.charAt(0) || 'U'}
              </div>
            )}
            {isOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{profile?.full_name || 'Usuário'}</p>
                <p className="text-[10px] text-gray-500 truncate">SaaS Pro</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-3">
          <div className="flex flex-col gap-0.5">
            <Link
              href="/ajuda"
              title={!isOpen ? "Ajuda" : undefined}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium",
                pathname === "/ajuda" ? "text-white bg-white/10" : "text-gray-500 hover:bg-white/5 hover:text-gray-200",
                !isOpen && "justify-center"
              )}
            >
              <HelpCircle className="h-5 w-5 shrink-0" />
              {isOpen && <span className="ml-3">Ajuda</span>}
            </Link>
            <Link
              href="/configuracoes"
              title={!isOpen ? "Configurações" : undefined}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium",
                pathname === "/configuracoes" ? "text-white bg-white/10" : "text-gray-500 hover:bg-white/5 hover:text-gray-200",
                !isOpen && "justify-center"
              )}
            >
              <Settings className="h-5 w-5 shrink-0" />
              {isOpen && <span className="ml-3">Configurações</span>}
            </Link>

            <div className="my-2 h-px bg-white/5" />

            <button
              onClick={toggleTheme}
              title={!isOpen ? (isDark ? "Modo Claro" : "Modo Escuro") : undefined}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-white/5 hover:text-gray-200 transition-all duration-150",
                !isOpen && "justify-center"
              )}
            >
              {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
              {isOpen && <span className="ml-3">{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
            </button>
            <button
              onClick={handleLogout}
              title={!isOpen ? "Sair" : undefined}
              className={cn(
                "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-150",
                !isOpen && "justify-center"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {isOpen && <span className="ml-3">Sair</span>}
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}
