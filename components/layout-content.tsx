'use client';

import React from "react"

import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { usePathname } from 'next/navigation';

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // Pages that don't need sidebar/navbar
  const publicPages = ['/', '/login', '/register'];
  const isPublicPage = publicPages.includes(pathname);

  // Show public layout for non-authenticated users or public pages
  if (!user || isPublicPage) {
    return <>{children}</>;
  }

  // Authenticated users get sidebar and navbar
  return (
    <>
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          {children}
        </main>
      </div>
    </>
  );
}
