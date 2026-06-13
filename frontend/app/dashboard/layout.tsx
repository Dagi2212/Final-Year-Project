import { ProtectedRoute } from '@/components/protected-route';
import { RoleGuard } from '@/components/role-guard';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-background">
          <RoleGuard>{children}</RoleGuard>
        </main>
      </div>
    </ProtectedRoute>
  );
}
