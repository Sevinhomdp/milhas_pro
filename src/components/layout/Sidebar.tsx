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
  LogOut,
  Menu,
  X,
  Plane,
  Sun,
  Moon
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
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isDark, setIsDark] = React.useState(true)

  React.useEffect(() => {
    const isDarkStored = localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setIsDark(isDarkStored)
    if (isDarkStored) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

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
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-primary dark:bg-surfaceDark text-white shadow-xl transition-all duration-300 ease-in-out lg:translate-x-0",
          !isOpen && "lg:w-20"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
              <Plane className="h-6 w-6" />
            </div>
            {isOpen && <span className="text-xl font-bold tracking-tight text-white">MILHAS PRO</span>}
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mt-8 flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => typeof window !== 'undefined' && window.innerWidth < 1024 && setIsOpen(false)}
                  className={cn(
                    "group flex items-center rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-accent text-primary dark:bg-accent/10 dark:text-accent" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isOpen && "mr-3")} />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center rounded-xl px-3 py-3 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors",
                !isOpen && "justify-center"
              )}
            >
              {isDark ? <Sun className="h-5 w-5 shrink-0" /> : <Moon className="h-5 w-5 shrink-0" />}
              {isOpen && <span className="ml-3">{isDark ? "Modo Claro" : "Modo Escuro"}</span>}
            </button>
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center rounded-xl px-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors",
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
