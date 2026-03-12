'use client';

import React from "react"

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';
import { LayoutDashboard, FileText, Upload, Zap, ScanLine as ChainLink, Settings, Menu, Shield } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['patient', 'doctor', 'researcher', 'admin'],
  },
  {
    label: 'Records',
    href: '/records',
    icon: FileText,
    roles: ['patient', 'doctor'],
  },
  {
    label: 'Upload',
    href: '/upload',
    icon: Upload,
    roles: ['patient'],
  },
  {
    label: 'Research',
    href: '/research',
    icon: Zap,
    roles: ['researcher', 'admin'],
  },
  {
    label: 'Blockchain',
    href: '/blockchain',
    icon: ChainLink,
    roles: ['patient', 'doctor', 'researcher', 'admin'],
  },
  {
    label: 'Admin',
    href: '/admin',
    icon: Shield,
    roles: ['admin'],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['patient', 'doctor', 'researcher', 'admin'],
  },
];

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  if (!user) return null;

  const userNavItems = navItems.filter((item) => item.roles.includes(user.role));

  return (
    <>
      {/* Mobile Toggle */}
      <div className="fixed left-4 top-20 z-40 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="h-9 w-9"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-border bg-sidebar transition-transform duration-200 md:translate-x-0',
          isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        )}
      >
        <div className="space-y-2 p-4">
          <nav className="space-y-1">
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 top-16 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
