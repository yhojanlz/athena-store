'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { formatPrice, useStore } from '@/lib/store'
import type { Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  categoryName: string
}

export function ProductCard({ product, categoryName }: ProductCardProps) {
  const { addToCart } = useStore()
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    const size = selectedSize ?? product.sizes[0] ?? 'Única'
    addToCart(product.id, size)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="group flex flex-col gap-3">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-secondary">
        <img
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium">{product.name}</h3>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            {categoryName}
          </p>
        </div>
        <p className="text-sm font-medium">{formatPrice(product.price)}</p>
      </div>

      <div className="flex flex-wrap gap-1" role="group" aria-label={`Tallas de ${product.name}`}>
        {product.sizes.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => setSelectedSize(size)}
            className={`min-w-7 border px-1.5 py-0.5 text-[11px] transition-colors ${
              selectedSize === size
                ? 'border-foreground bg-foreground text-background'
                : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
            }`}
            aria-pressed={selectedSize === size}
          >
            {size}
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={handleAdd}
        className="rounded-none text-[11px] uppercase tracking-[0.2em]"
      >
        {added ? 'Agregado' : 'Agregar al carrito'}
      </Button>
    </article>
  )
}
