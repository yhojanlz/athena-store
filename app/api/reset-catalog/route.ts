import { NextResponse } from 'next/server'
import { resetCatalog } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST() {
  await resetCatalog()
  return NextResponse.json({ success: true })
}
