'use client'

import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminLogin } from '@/components/admin/admin-login'
import { useStore } from '@/lib/store'

export default function AdminPage() {
  const { ready, isAdmin } = useStore()

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando…</p>
      </main>
    )
  }

  return isAdmin ? <AdminDashboard /> : <AdminLogin />
}
