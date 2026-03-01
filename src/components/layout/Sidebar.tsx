diff --git a/src/components/layout/Sidebar.tsx b/src/components/layout/Sidebar.tsx
index 9a272422b3937a915922a697acabb83c14fbf67b..389f14b57e396d7a59d9b82236803b12eba5c794 100644
--- a/src/components/layout/Sidebar.tsx
+++ b/src/components/layout/Sidebar.tsx
@@ -1,76 +1,81 @@
 'use client'
 
 import * as React from "react"
 import Link from "next/link"
+import Image from "next/image"
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
   PanelLeftOpen,
   Zap
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
   { href: "/metas",        label: "Metas",             icon: Target },
   { href: "/inteligencia", label: "Inteligência",      icon: Zap },
 ]
 
 import { useTheme } from "@/src/components/providers/ThemeProvider"
 import { getProfile } from "@/src/app/actions"
 import { Profile } from "@/src/types"
 
 export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
   const pathname = usePathname()
   const router = useRouter()
-  const { theme, toggleTheme } = useTheme()
-  const isDark = theme === 'dark'
+  const { resolvedTheme, setTheme } = useTheme()
+  const isDark = resolvedTheme === 'dark'
+
+  const toggleTheme = () => {
+    setTheme(isDark ? 'light' : 'dark')
+  }
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
@@ -144,51 +149,51 @@ export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v:
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
-              <img src={profile.avatar_url} alt="Avatar" className="h-8 w-8 rounded-lg object-cover" />
+              <Image src={profile.avatar_url} alt="Avatar" width={32} height={32} className="h-8 w-8 rounded-lg object-cover" unoptimized />
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
