'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatPrice, buildWhatsAppUrl, useStore } from '@/lib/store'
import type { PaymentMethodId } from '@/lib/types'

interface CheckoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CheckoutDialog({ open, onOpenChange }: CheckoutDialogProps) {
  const { paymentMethods, cartTotal, cart, products, whatsapp } = useStore()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodId>('pago_movil')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const enabledMethods = paymentMethods.filter((method) => method.enabled)
  const activeMethod =
    enabledMethods.find((method) => method.id === selectedMethod) ?? enabledMethods[0]

  const copyValue = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  const orderLines = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return null
      return `- ${product.name} (Talla ${item.size}) x${item.quantity} — ${formatPrice(product.price * item.quantity)}`
    })
    .filter(Boolean)

  const whatsappMessage = [
    'Hola, quiero confirmar mi pedido en Athenea Store:',
    '',
    ...orderLines,
    '',
    `Total: ${formatPrice(cartTotal)}`,
    activeMethod ? `Método de pago: ${activeMethod.label}` : '',
    '',
    'Adjunto comprobante de pago.',
  ]
    .filter(Boolean)
    .join('\n')

  const whatsappUrl = buildWhatsAppUrl(whatsapp, whatsappMessage)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif font-normal">Finalizar compra</DialogTitle>
          <DialogDescription>
            Elige un método de pago y realiza la transferencia. Luego envía el comprobante para
            confirmar tu pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between border border-border px-4 py-3">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Total a pagar</p>
          <p className="font-serif text-2xl">{formatPrice(cartTotal)}</p>
        </div>

        {enabledMethods.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay métodos de pago disponibles en este momento.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {enabledMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${
                    activeMethod?.id === method.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            {activeMethod && (
              <div className="flex flex-col gap-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {activeMethod.instructions}
                </p>

                <ul className="flex flex-col gap-2">
                  {activeMethod.fields.map((field) => (
                    <li
                      key={field.key}
                      className="flex items-center justify-between gap-3 border border-border px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                          {field.label}
                        </p>
                        <p className="truncate text-sm font-medium">{field.value || '—'}</p>
                      </div>
                      {field.value && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 shrink-0"
                          onClick={() => copyValue(`${activeMethod.id}-${field.key}`, field.value)}
                          aria-label={`Copiar ${field.label}`}
                        >
                          {copiedKey === `${activeMethod.id}-${field.key}` ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {whatsappUrl ? (
          <Button
            className="w-full rounded-none uppercase tracking-[0.2em]"
            asChild
            onClick={() => onOpenChange(false)}
          >
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Enviar comprobante por WhatsApp
            </a>
          </Button>
        ) : (
          <Button className="w-full rounded-none uppercase tracking-[0.2em]" onClick={() => onOpenChange(false)}>
            Entendido
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
