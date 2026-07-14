import { NextResponse } from 'next/server'
import { addCategory } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json()
  if (!body?.name || !body?.department) {
    return NextResponse.json({ error: 'Datos de categoría incompletos.' }, { status: 400 })
  }

  const category = addCategory(String(body.name), String(body.department))
  return NextResponse.json(category)
}
