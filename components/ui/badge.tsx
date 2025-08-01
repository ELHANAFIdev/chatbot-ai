import type * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "border-transparent bg-gray-900 text-white",
    secondary: "border-transparent bg-gray-100 text-gray-900",
    destructive: "border-transparent bg-red-500 text-white",
    outline: "border-gray-300 text-gray-700 bg-white",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
