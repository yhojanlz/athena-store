import { NextResponse } from 'next/server'
import { addProduct } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json()
  if (!body?.name || !body?.categoryId || typeof body.price !== 'number') {
    return NextResponse.json({ error: 'Datos de producto incompletos.' }, { status: 400 })
  }

  const product = await addProduct({
    name: String(body.name).trim(),
    price: body.price,
    categoryId: String(body.categoryId),
    image: String(body.image || '/placeholder.svg?height=800&width=600'),
    description: String(body.description || ''),
    sizes: Array.isArray(body.sizes)
      ? body.sizes.map((size: unknown) => String(size).trim()).filter(Boolean)
      : [],
  })

  return NextResponse.json(product)
}
