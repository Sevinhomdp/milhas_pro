'use client'

import * as React from "react"
import { Sidebar } from "./Sidebar"
import { Menu, Plane } from "lucide-react"
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
          {/* Mobile Header */}
          <header className="sticky top-0 z-30 lg:hidden flex h-14 items-center justify-between px-4 border-b border-gray-200 dark:border-borderDark bg-white/90 dark:bg-[#060d1a]/90 backdrop-blur-xl">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5 transition-colors active:scale-95 duration-150"
              aria-label="Abrir menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-accent flex items-center justify-center shadow-[0_0_12px_rgba(212,175,55,0.3)]">
                <Plane className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="text-sm font-black tracking-wide text-gray-900 dark:text-white">
                MILHAS<span className="text-accent">PRO</span>
              </span>
            </div>

            <div className="h-10 w-10" />
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
            <div className="mx-auto max-w-7xl animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
