import { NextResponse } from 'next/server'
import { getStore } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const store = await getStore()
  return NextResponse.json(store)
}
