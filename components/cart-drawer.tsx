'use client'

import { useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { CheckoutDialog } from '@/components/checkout-dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { formatPrice, useStore } from '@/lib/store'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const { cart, products, updateCartQuantity, removeFromCart, cartTotal, cartCount, clearCart } =
    useStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const items = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...item, product } : null
    })
    .filter((i): i is NonNullable<typeof i> => i !== null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif tracking-wide">Tu carrito</SheetTitle>
          <SheetDescription>
            {cartCount === 0
              ? 'Aún no has agregado artículos.'
              : `${cartCount} artículo${cartCount === 1 ? '' : 's'} en tu carrito.`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center px-4">
            <p className="text-sm text-muted-foreground">Tu carrito está vacío.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4">
            <ul className="flex flex-col">
              {items.map((item, index) => (
                <li key={`${item.productId}-${item.size}`}>
                  {index > 0 && <Separator />}
                  <div className="flex gap-4 py-4">
                    <div className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-secondary">
                      <img
                        src={item.product.image || '/placeholder.svg'}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Talla: {item.size}</p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.size, item.quantity - 1)
                            }
                            aria-label={`Reducir cantidad de ${item.product.name}`}
                          >
                            <Minus className="size-3" />
                          </Button>
                          <span className="w-8 text-center text-sm" aria-live="polite">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-none"
                            onClick={() =>
                              updateCartQuantity(item.productId, item.size, item.quantity + 1)
                            }
                            aria-label={`Aumentar cantidad de ${item.product.name}`}
                          >
                            <Plus className="size-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeFromCart(item.productId, item.size)}
                          aria-label={`Eliminar ${item.product.name} del carrito`}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="border-t border-border">
            <div className="flex w-full items-center justify-between">
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Total</p>
              <p className="font-serif text-xl">{formatPrice(cartTotal)}</p>
            </div>
            <Button
              className="w-full rounded-none uppercase tracking-[0.2em]"
              onClick={() => setCheckoutOpen(true)}
            >
              Finalizar compra
            </Button>
            <Button
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={clearCart}
            >
              Vaciar carrito
            </Button>
          </SheetFooter>
        )}
      </SheetContent>

      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </Sheet>
  )
}
