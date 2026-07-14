import { NextResponse } from 'next/server'
import { deleteProduct, updateProduct } from '@/lib/db'

export const runtime = 'nodejs'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updated = updateProduct(params.id, {
    name: data.name,
    price: data.price,
    categoryId: data.categoryId,
    image: data.image,
    description: data.description,
    sizes: Array.isArray(data.sizes) ? data.sizes : undefined,
  })

  if (!updated) {
    return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 })
  }

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  deleteProduct(params.id)
  return NextResponse.json({ success: true })
}
