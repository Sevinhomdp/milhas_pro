import * as React from "react"
import { cn } from "@/src/lib/utils"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  borderColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  borderColor = "border-l-amber-500",
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-white dark:bg-surfaceDark p-5 shadow-sm border border-gray-100 dark:border-borderDark border-l-4",
        borderColor,
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        {icon && <div className="text-gray-400 dark:text-gray-500">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</div>
        {trend && trendValue && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === 'up' ? "text-green-600 dark:text-green-400" :
              trend === 'down' ? "text-red-600 dark:text-red-400" :
              "text-gray-500 dark:text-gray-400"
            )}
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'} {trendValue}
          </span>
        )}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{subtitle}</div>
      )}
    </div>
  )
}
