'use client'

import Link from 'next/link'
import { Moon, ShoppingBag, Sun, UserRound } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStore, DEPARTMENTS } from '@/lib/store'
import type { Department } from '@/lib/types'

interface SiteHeaderProps {
  department: Department
  onDepartmentChange: (department: Department) => void
  onOpenCart: () => void
}

export function SiteHeader({ department, onDepartmentChange, onOpenCart }: SiteHeaderProps) {
  const { cartCount } = useStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <Link href="/" className="font-serif text-xl font-semibold tracking-[0.25em]">
          ATHENEA
        </Link>

        <nav aria-label="Departamentos" className="flex items-center gap-1 md:gap-2">
          {DEPARTMENTS.map((dep) => (
            <button
              key={dep.id}
              type="button"
              onClick={() => onDepartmentChange(dep.id)}
              className={`px-2 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors md:px-3 ${
                department === dep.id
                  ? 'border-b-2 border-accent text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-current={department === dep.id ? 'page' : undefined}
            >
              {dep.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Cambiar tema"
          >
            {mounted && resolvedTheme === 'dark' ? (
              <Sun className="size-4" />
            ) : (
              <Moon className="size-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin" aria-label="Panel de administración">
              <UserRound className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={onOpenCart}
            aria-label={`Abrir carrito, ${cartCount} artículos`}
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}
