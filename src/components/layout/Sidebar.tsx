diff --git a/src/components/layout/Sidebar.tsx b/src/components/layout/Sidebar.tsx
index 9a272422b3937a915922a697acabb83c14fbf67b..16bae62b61c990c6a895d416155075d3310b8e1b 100644
--- a/src/components/layout/Sidebar.tsx
+++ b/src/components/layout/Sidebar.tsx
@@ -1,80 +1,109 @@
 'use client'
 
 import * as React from "react"
 import Link from "next/link"
-import { usePathname } from "next/navigation"
+import { usePathname, useRouter } from "next/navigation"
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
-import { useRouter } from "next/navigation"
 
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
-import { getProfile } from "@/src/app/actions"
 import { Profile } from "@/src/types"
 
 export function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
   const pathname = usePathname()
   const router = useRouter()
   const { theme, toggleTheme } = useTheme()
   const isDark = theme === 'dark'
   const [profile, setProfile] = React.useState<Profile | null>(null)
 
   React.useEffect(() => {
-    getProfile().then(setProfile)
+    let isMounted = true
+    const supabase = createClient()
+
+    const loadProfile = async () => {
+      const { data: userData, error: userError } = await supabase.auth.getUser()
+
+      if (userError || !userData.user) {
+        if (isMounted) setProfile(null)
+        return
+      }
+
+      const { data: profileData, error: profileError } = await supabase
+        .from('profiles')
+        .select('*')
+        .eq('id', userData.user.id)
+        .maybeSingle()
+
+      if (!isMounted) return
+
+      if (profileError) {
+        setProfile(null)
+        return
+      }
+
+      setProfile(profileData as Profile | null)
+    }
+
+    loadProfile()
+
+    return () => {
+      isMounted = false
+    }
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
