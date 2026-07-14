import { NextResponse } from 'next/server'
import { updateWhatsapp } from '@/lib/db'

export const runtime = 'nodejs'

export async function PATCH(req: Request) {
  const body = await req.json()
  if (!body?.value) {
    return NextResponse.json({ error: 'Número de WhatsApp inválido.' }, { status: 400 })
  }

  updateWhatsapp(String(body.value))
  return NextResponse.json({ success: true })
}
