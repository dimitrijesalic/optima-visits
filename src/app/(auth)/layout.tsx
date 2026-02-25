import type React from 'react'
import { Sidebar } from '@/components/sidebar'
import { AuthGuard } from '@/components/auth-guard'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64 p-4 md:p-6">
        <AuthGuard>{children}</AuthGuard>
      </main>
    </div>
  )
}
