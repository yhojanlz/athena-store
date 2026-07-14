'use client'

import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import type { PaymentMethod } from '@/lib/types'

function PaymentMethodCard({ method }: { method: PaymentMethod }) {
  const { updatePaymentMethod, updatePaymentField } = useStore()

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-col gap-2 sm:max-w-xs">
              <Label htmlFor={`${method.id}-label`}>Nombre del método</Label>
              <Input
                id={`${method.id}-label`}
                value={method.label}
                onChange={(e) => updatePaymentMethod(method.id, { label: e.target.value })}
                placeholder="Ej: Pago Móvil"
              />
            </div>
            <CardDescription className="mt-2">
              Configura los datos que verán tus clientes al pagar.
            </CardDescription>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={method.enabled}
              onChange={(e) => updatePaymentMethod(method.id, { enabled: e.target.checked })}
              className="size-4 accent-foreground"
            />
            Activo
          </label>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${method.id}-instructions`}>Instrucciones para el cliente</Label>
          <Textarea
            id={`${method.id}-instructions`}
            value={method.instructions}
            onChange={(e) => updatePaymentMethod(method.id, { instructions: e.target.value })}
            rows={3}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {method.fields.map((field) => (
            <div key={field.key} className="flex flex-col gap-2 rounded-sm border border-border p-3">
              <Label htmlFor={`${method.id}-${field.key}-label`}>Etiqueta</Label>
              <Input
                id={`${method.id}-${field.key}-label`}
                value={field.label}
                onChange={(e) =>
                  updatePaymentMethod(method.id, {
                    fields: method.fields.map((f) =>
                      f.key === field.key ? { ...f, label: e.target.value } : f,
                    ),
                  })
                }
                placeholder="Ej: Banco, Teléfono..."
              />
              <Label htmlFor={`${method.id}-${field.key}`}>Valor</Label>
              <Input
                id={`${method.id}-${field.key}`}
                value={field.value}
                onChange={(e) => updatePaymentField(method.id, field.key, e.target.value)}
                placeholder={`Ingresa ${field.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function PaymentSettings() {
  const { paymentMethods, whatsapp, updateWhatsapp, resetPaymentMethods } = useStore()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Edita Pago Móvil, Binance y Zelle. Los cambios se guardan automáticamente en la tienda.
        </p>
        <Button variant="outline" size="sm" onClick={resetPaymentMethods}>
          <RotateCcw className="size-3.5" />
          Restaurar pagos
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">WhatsApp para comprobantes</CardTitle>
          <CardDescription>
            Número al que los clientes enviarán el comprobante de pago (con código de país, ej.
            584120000000).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 sm:max-w-sm">
            <Label htmlFor="whatsapp">Número de WhatsApp</Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => updateWhatsapp(e.target.value)}
              placeholder="584120000000"
            />
          </div>
        </CardContent>
      </Card>

      {paymentMethods.map((method) => (
        <PaymentMethodCard key={method.id} method={method} />
      ))}
    </div>
  )
}
