import * as React from "react"
import { cn } from "@/src/lib/utils"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
    size?: 'sm' | 'md' | 'lg'
    loading?: boolean
    icon?: React.ReactNode
}

const variantStyles = {
    primary: "bg-accent hover:bg-amber-400 text-primary font-bold shadow-[0_0_16px_rgba(212,175,55,0.25)] hover:shadow-[0_0_24px_rgba(212,175,55,0.35)]",
    secondary: "bg-gray-100 dark:bg-white/8 hover:bg-gray-200 dark:hover:bg-white/12 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-borderDark",
    ghost: "hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 ring-1 ring-red-500/30",
    success: "bg-green-500/10 hover:bg-green-500/20 text-green-500 ring-1 ring-green-500/30",
}

const sizeStyles = {
    sm: "h-8  px-3   text-xs  gap-1.5 rounded-lg",
    md: "h-10 px-4   text-sm  gap-2   rounded-xl",
    lg: "h-11 px-5   text-sm  gap-2   rounded-xl",
}

export function Button({
    variant = 'secondary', size = 'md', loading = false, icon,
    className, children, disabled, ...props
}: ButtonProps) {
    return (
        <button
            disabled={disabled || loading}
            className={cn(
                "inline-flex items-center justify-center font-medium",
                "transition-all duration-150",
                "active:scale-95",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
            {loading
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : icon
            }
            {children}
        </button>
    )
}
