import { NextResponse } from 'next/server'
import { deleteProduct, updateProduct } from '@/lib/db'

export const runtime = 'nodejs'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()

  try {
    const updated = await updateProduct(id, {
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
  } catch (error) {
    console.error('PATCH /api/products/[id] error:', error)
    return NextResponse.json({ error: 'Error del servidor al actualizar producto.' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteProduct(id)
  return NextResponse.json({ success: true })
}
