'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/lib/utils';

import {
  LayoutDashboard,
  BoxesIcon,
  Users,
  FileText,
  BarChart2,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      current: pathname === '/dashboard',
    },
    {
      name: 'Negotiations',
      href: '/negotiations',
      icon: BoxesIcon,
      current: pathname.startsWith('/negotiations'),
    },
    {
      name: 'Suppliers',
      href: '/suppliers',
      icon: Users,
      current: pathname.startsWith('/suppliers'),
    },
    {
      name: 'Contracts',
      href: '/contracts',
      icon: FileText,
      current: pathname.startsWith('/contracts'),
    },
    {
      name: 'Spend Analysis',
      href: '/spend-analysis',
      icon: BarChart2,
      current: pathname.startsWith('/spend-analysis'),
    },
    {
      name: 'Market Analysis',
      href: '/market-analysis',
      icon: TrendingUp,
      current: pathname.startsWith('/market-analysis'),
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: pathname.startsWith('/settings'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Mobile sidebar toggle */}
      <div className="sm:hidden bg-background border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src="/logo.svg"
            alt="Procurement AI"
            className="h-8 w-8 mr-2"
          />
          <span className="font-bold text-lg">Procurement AI</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-40 bg-background bg-opacity-90 pt-16">
          <div className="flex flex-col h-full p-4">
            <nav className="space-y-1 mb-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'sidebar-item',
                    item.current && 'active'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="sidebar-icon" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t pt-4">
              <div className="flex items-center px-3 mb-4">
                <div className="h-9 w-9 mr-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user?.name ? getInitials(user.name) : 'U'}
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="flex flex-1">
        <div className="hidden sm:flex sm:flex-col sm:w-64 sm:fixed sm:inset-y-0 border-r bg-background">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 px-4 border-b">
              <img
                src="/logo.svg"
                alt="Procurement AI"
                className="h-8 w-8 mr-2"
              />
              <span className="font-bold text-lg">Procurement AI</span>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'sidebar-item',
                    item.current && 'active'
                  )}
                >
                  <item.icon className="sidebar-icon" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center px-1 mb-4">
                <div className="h-9 w-9 mr-3 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {user?.name ? getInitials(user.name) : 'U'}
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col sm:pl-64">
          <main className="flex-1 pb-6">{children}</main>
        </div>
      </div>
    </div>
  );
}