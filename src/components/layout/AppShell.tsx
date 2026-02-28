'use client'

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { Menu } from "lucide-react"
import { ToastProvider } from "../ui/Toast"

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true)

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      } else {
        setIsSidebarOpen(true)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg dark:bg-bgDark text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        <div className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-borderDark bg-white/80 dark:bg-surfaceDark/80 px-4 backdrop-blur-md sm:px-6 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-semibold text-lg text-primary dark:text-white">MILHAS PRO</div>
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
