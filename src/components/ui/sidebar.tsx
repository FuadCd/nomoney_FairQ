'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: number
}

interface SidebarProps {
  items: SidebarItem[]
  activeItem?: string
  onItemClick?: (itemId: string) => void
  className?: string
}

export function Sidebar({ items, activeItem, onItemClick, className }: SidebarProps) {
  return (
    <aside className={cn("w-64 border-r border-border bg-card", className)}>
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const isActive = activeItem === item.id
          return (
            <motion.button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <div className="flex items-center space-x-3">
                {item.icon && <span className="text-lg">{item.icon}</span>}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}>
                  {item.badge}
                </span>
              )}
            </motion.button>
          )
        })}
      </nav>
    </aside>
  )
}
