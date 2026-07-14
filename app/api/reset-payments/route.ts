import { NextResponse } from 'next/server'
import { resetPaymentMethods } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST() {
  resetPaymentMethods()
  return NextResponse.json({ success: true })
}
