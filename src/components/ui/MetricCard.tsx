'use client'

import * as React from "react"
import { cn } from "@/src/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | React.ReactNode
  prefix?: string
  suffix?: string
  subtitle?: string | React.ReactNode
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accentColor?: 'gold' | 'green' | 'red' | 'blue' | 'orange' | 'purple'
  borderColor?: string
  loading?: boolean
  animationDelay?: number
}

const accents: Record<string, { bar: string; icon: string }> = {
  gold: { bar: "border-l-accent", icon: "text-accent" },
  green: { bar: "border-l-green-500", icon: "text-green-400" },
  red: { bar: "border-l-red-500", icon: "text-red-400" },
  blue: { bar: "border-l-blue-500", icon: "text-blue-400" },
  orange: { bar: "border-l-orange-400", icon: "text-orange-400" },
  purple: { bar: "border-l-violet-500", icon: "text-violet-400" },
}

export function MetricCard({
  title, value, prefix, suffix, subtitle, icon,
  trend, trendValue, accentColor = 'gold', borderColor,
  loading = false, animationDelay = 0,
  className, style, ...props
}: MetricCardProps) {
  const acc = accents[accentColor] ?? accents.gold
  const barClass = borderColor || acc.bar

  if (loading) {
    return (
      <div className={cn("card border-l-4 border-l-white/5 p-5 overflow-hidden relative", className)}>
        <div className="skeleton-shimmer absolute inset-0 rounded-2xl" />
        <div className="skeleton h-2.5 w-20 mb-4" />
        <div className="skeleton h-7 w-28 mb-2" />
        <div className="skeleton h-2 w-14" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "card card-hover border-l-4 p-5 overflow-hidden",
        "animate-fadeInUp",
        barClass,
        className
      )}
      style={{ animationDelay: `${animationDelay}ms`, ...style }}
      {...props}
    >
      {/* Header: label + ícone */}
      <div className="flex items-center justify-between mb-3">
        <p className="field-label mb-0">{title}</p>
        {icon && (
          <div className={cn(
            "p-1.5 rounded-lg transition-colors duration-200",
            "bg-gray-100 dark:bg-white/5",
            acc.icon
          )}>
            {icon}
          </div>
        )}
      </div>

      {/* Valor principal com hierarquia tipográfica */}
      <div className="flex items-baseline gap-1.5">
        {prefix && (
          <span className="text-sm font-medium text-gray-400 dark:text-gray-500 self-start mt-1">
            {prefix}
          </span>
        )}
        <div className="text-2xl font-black tracking-tight tabular text-gray-900 dark:text-white leading-none">
          {value}
        </div>
        {suffix && (
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
            {suffix}
          </span>
        )}
      </div>

      {/* Trend / subtitle */}
      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center gap-2">
          {trend && trendValue && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs font-bold",
              trend === 'up' ? "text-green-500" :
                trend === 'down' ? "text-red-500" : "text-gray-400"
            )}>
              {trend === 'up'
                ? <TrendingUp className="h-3 w-3" />
                : trend === 'down'
                  ? <TrendingDown className="h-3 w-3" />
                  : <Minus className="h-3 w-3" />
              }
              {trendValue}
            </span>
          )}
          {subtitle && (
            <span className="text-[11px] text-gray-400 dark:text-gray-500 leading-tight">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
