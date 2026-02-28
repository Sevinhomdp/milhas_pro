'use client'

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react"

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: (id: string) => void;
}

const icons = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

const bgColors = {
  success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50",
  error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50",
  warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/50",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50",
}

export function Toast({ id, type, message, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, 5000)
    return () => clearTimeout(timer)
  }, [id, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl border p-4 shadow-lg ${bgColors[type]}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 rounded-full p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

// Toast Provider and Hook
type ToastContextType = {
  toast: (type: ToastType, message: string) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Omit<ToastProps, 'onClose'>[]>([])

  const addToast = React.useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 sm:p-6 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onClose={removeToast} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
