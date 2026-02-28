import * as React from "react"
import { cn } from "@/src/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  label?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, label, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label htmlFor={id} className="field-label">{label}</label>
        )}
        <div className="relative">
          <select
            id={id}
            className={cn(
              "flex h-11 w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm font-medium",
              "bg-gray-50 dark:bg-white/5",
              "border border-gray-200 dark:border-borderDark",
              "text-gray-900 dark:text-white",
              "focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20",
              "transition-all duration-150",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "appearance-none cursor-pointer",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
        </div>
        {error && (
          <span className="text-[11px] text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </span>
        )}
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
