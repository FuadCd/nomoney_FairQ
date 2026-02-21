'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { LayoutDashboard, BarChart3, Home } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { cn } from '@/lib/utils/cn'

export default function Navigation() {
  const pathname = usePathname()
  
  const links = [
    { href: '/staff', label: 'Staff Dashboard', icon: LayoutDashboard },
    { href: '/admin', label: 'Admin Panel', icon: BarChart3 },
  ]
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              AccessER
            </motion.span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    "flex items-center space-x-2",
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="h-4 w-4" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}
            <div className="ml-4 pl-4 border-l border-border">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
