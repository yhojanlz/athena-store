import { NextResponse } from 'next/server'
import { getStore } from '@/lib/db'

export const runtime = 'nodejs'

export async function GET() {
  const store = getStore()
  return NextResponse.json(store)
}
