'use client'

import { useMemo, useRef, useState } from 'react'
import { CartDrawer } from '@/components/cart-drawer'
import { Hero } from '@/components/hero'
import { PaymentMethodsSection } from '@/components/payment-methods-section'
import { ProductCard } from '@/components/product-card'
import { SiteHeader } from '@/components/site-header'
import { useStore } from '@/lib/store'
import type { Department } from '@/lib/types'

export default function HomePage() {
  const { products, categories } = useStore()
  const [department, setDepartment] = useState<Department>('mujer')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const collectionRef = useRef<HTMLDivElement>(null)

  const departmentCategories = useMemo(
    () => categories.filter((c) => c.department === department),
    [categories, department],
  )

  const visibleProducts = useMemo(() => {
    const categoryIds = departmentCategories.map((c) => c.id)
    return products.filter((p) => {
      if (selectedCategory) return p.categoryId === selectedCategory
      return categoryIds.includes(p.categoryId)
    })
  }, [products, departmentCategories, selectedCategory])

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? ''

  const handleDepartmentChange = (dep: Department) => {
    setDepartment(dep)
    setSelectedCategory(null)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        department={department}
        onDepartmentChange={handleDepartmentChange}
        onOpenCart={() => setCartOpen(true)}
      />

      <main className="flex-1">
        <Hero
          department={department}
          onVerColeccion={() => collectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />

        <section ref={collectionRef} className="mx-auto max-w-6xl px-4 pb-20 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-10">
            <h2 className="font-serif text-2xl md:text-3xl">La colección</h2>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {visibleProducts.length} artículos
            </p>
          </div>

          <nav aria-label="Categorías" className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                selectedCategory === null
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
              }`}
            >
              Todo
            </button>
            {departmentCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`border px-3 py-1 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                  selectedCategory === cat.id
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </nav>

          {visibleProducts.length === 0 ? (
            <p className="mt-12 text-center text-sm text-muted-foreground">
              No hay productos en esta categoría todavía.
            </p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  categoryName={categoryName(product.categoryId)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <PaymentMethodsSection />

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 md:px-6">
          <p className="font-serif text-sm tracking-[0.25em]">ATHENEA STORE</p>
          <p className="text-xs text-muted-foreground">Elegancia en cada detalle</p>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}
