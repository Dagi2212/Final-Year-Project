'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  Eye,
  Cpu,
  ClipboardList,
  Settings,
  LogOut,
  Sprout,
  RefreshCw,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', group: 'Overview' },
  { href: '/dashboard/farmers', icon: Users, label: 'Farmers', group: 'Field Data' },
  { href: '/dashboard/plots', icon: MapPin, label: 'Plots', group: 'Field Data' },
  { href: '/dashboard/observations', icon: Eye, label: 'Observations', group: 'Field Data' },
  { href: '/dashboard/crop-types', icon: Sprout, label: 'Crop Types', group: 'Field Data' },
  { href: '/dashboard/ai-query', icon: Sparkles, label: 'AI Query', group: 'Intelligence' },
  { href: '/dashboard/predictions', icon: TrendingUp, label: 'Predictions', group: 'Intelligence' },
  { href: '/dashboard/imports', icon: FileSpreadsheet, label: 'Data Imports', group: 'Intelligence' },
  { href: '/dashboard/organizations', icon: Building2, label: 'Organizations', group: 'Admin' },
  { href: '/dashboard/users', icon: Users, label: 'Users', group: 'Admin' },
  { href: '/dashboard/devices', icon: Cpu, label: 'Devices', group: 'Admin' },
  { href: '/dashboard/sync-queue', icon: RefreshCw, label: 'Sync Queue', group: 'Admin' },
  { href: '/dashboard/audit-logs', icon: ClipboardList, label: 'Audit Logs', group: 'Admin' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', group: 'Admin' },
];

const NAV_GROUPS = ['Overview', 'Field Data', 'Intelligence', 'Admin'] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">IADS</h1>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Agricultural Data System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-4">
        {NAV_GROUPS.map((group) => {
          const items = navItems.filter((i) => i.group === group);
          return (
            <div key={group}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 mb-1">{group}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link href={item.href}>
                        <Button
                          variant={isActive ? 'default' : 'ghost'}
                          className={cn(
                            "w-full justify-start h-8 text-sm",
                            item.group === 'Intelligence' && !isActive
                              ? "text-primary/80 hover:text-primary"
                              : ""
                          )}
                        >
                          <Icon className="w-4 h-4 mr-2.5 flex-shrink-0" />
                          {item.label}
                          {item.group === 'Intelligence' && !isActive && (
                            <span className="ml-auto text-[9px] font-bold tracking-wide text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded">AI</span>
                          )}
                        </Button>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {user && (
          <div className="mb-4 pb-4 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {user.fullName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
          </div>
        )}
        <Button
          variant="outline"
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
