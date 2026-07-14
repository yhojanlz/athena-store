'use client'

import { useStore } from '@/lib/store'

export function PaymentMethodsSection() {
  const { paymentMethods } = useStore()
  const enabledMethods = paymentMethods.filter((method) => method.enabled)

  if (enabledMethods.length === 0) return null

  return (
    <section className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="text-center">
          <h2 className="font-serif text-2xl md:text-3xl">Métodos de pago</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Realiza tu pago con cualquiera de estas opciones y envía el comprobante.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {enabledMethods.map((method) => (
            <article key={method.id} className="border border-border bg-background p-5">
              <h3 className="text-sm font-medium uppercase tracking-[0.2em]">{method.label}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {method.instructions}
              </p>
              <ul className="mt-4 flex flex-col gap-2">
                {method.fields
                  .filter((field) => field.value.trim())
                  .map((field) => (
                    <li key={field.key} className="text-sm">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {field.label}
                      </span>
                      <p className="font-medium">{field.value}</p>
                    </li>
                  ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
