import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "COMPRA" | "VENDA" | "TRANSF" | "pendente" | "recebido" | "info"
}


const variants: Record<string, string> = {
  default: "bg-gray-500/10 text-gray-400    ring-1 ring-gray-500/20",
  success: "bg-green-500/10 text-green-400  ring-1 ring-green-500/20",
  warning: "bg-amber-500/10 text-amber-400  ring-1 ring-amber-500/20",
  danger: "bg-red-500/10   text-red-400    ring-1 ring-red-500/20",
  COMPRA: "bg-blue-500/10  text-blue-400   ring-1 ring-blue-500/20",
  VENDA: "bg-green-500/10 text-green-400  ring-1 ring-green-500/20",
  TRANSF: "bg-amber-500/10 text-amber-400  ring-1 ring-amber-500/20",
  info: "bg-blue-500/10   text-blue-400    ring-1 ring-blue-500/20",
  pendente: "bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/20",
  recebido: "bg-green-500/10 text-green-400  ring-1 ring-green-500/20",
}


function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5",
        "text-[10px] font-bold uppercase tracking-wide",
        "transition-colors duration-150",
        variants[variant] ?? variants.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
