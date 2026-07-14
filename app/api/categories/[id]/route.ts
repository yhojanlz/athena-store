import { NextResponse } from 'next/server'
import { deleteCategory } from '@/lib/db'

export const runtime = 'nodejs'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  deleteCategory(params.id)
  return NextResponse.json({ success: true })
}
