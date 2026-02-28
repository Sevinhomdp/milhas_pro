import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
  hint?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, hint, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={id} className="field-label">{label}</label>
        )}
        <input
          id={id}
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl px-3.5 py-2.5 text-sm font-medium",
            "bg-gray-50 dark:bg-white/5",
            "border border-gray-200 dark:border-borderDark",
            "text-gray-900 dark:text-white",
            "placeholder:text-gray-400 dark:placeholder:text-gray-600",
            "focus:outline-none",
            "focus:border-accent focus:ring-2 focus:ring-accent/20",
            "transition-all duration-150",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "tabular",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <span className="text-[11px] text-gray-400 dark:text-gray-500">{hint}</span>
        )}
        {error && (
          <span className="text-[11px] text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </span>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
