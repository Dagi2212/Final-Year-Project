'use client'

import { useAuth } from '@/lib/auth-context'
import { hasRoleAccess } from '@/lib/role-permissions'
import { usePathname } from 'next/navigation'
import { ShieldAlert } from 'lucide-react'

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user || !hasRoleAccess(user.role, pathname)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <ShieldAlert className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
          <p className="text-muted-foreground">
            You do not have the required permissions to view this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
