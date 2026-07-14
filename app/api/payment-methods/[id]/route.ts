import { NextResponse } from 'next/server'
import { updatePaymentField, updatePaymentMethod } from '@/lib/db'

export const runtime = 'nodejs'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  if (body.fieldKey) {
    const value = body.value ?? ''
    await updatePaymentField(id, String(body.fieldKey), String(value))
    return NextResponse.json({ success: true })
  }

  const updated = await updatePaymentMethod(id, {
    label: body.label,
    enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
    instructions: body.instructions,
  })

  if (!updated) {
    return NextResponse.json({ error: 'Método de pago no encontrado.' }, { status: 404 })
  }

  return NextResponse.json(updated)
}
