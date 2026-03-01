diff --git a/src/components/DashboardClient.tsx b/src/components/DashboardClient.tsx
index d2bed1a4358d11d33722d03f7724e56bfe1c20d3..7eac3f09e2ab1ac47df44b83baf4daa09794dad9 100644
--- a/src/components/DashboardClient.tsx
+++ b/src/components/DashboardClient.tsx
@@ -32,60 +32,57 @@ import { motion, AnimatePresence } from 'motion/react'
 
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
-    const [theme, setTheme] = useState<'light' | 'dark'>('dark')
+    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
+        if (typeof document === 'undefined') return 'dark'
+        return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
+    })
     const [confirmModal, setConfirmModal] = useState<{ title: string; msg: string; onConfirm: () => void } | null>(null)
     const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null)
 
-    // 1.3 — Sincronização de tema (anti-flash)
-    useEffect(() => {
-        const isDark = document.documentElement.classList.contains('dark')
-        setTheme(isDark ? 'dark' : 'light')
-    }, [])
-
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
