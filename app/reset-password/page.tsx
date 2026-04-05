'use client';

import React from 'react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Page Deprecated</h1>
        <p className="mb-4">We've upgraded our security! Please use the standard Forgot Password page.</p>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Go to Forgot Password
        </Link>
      </div>
    </div>
  );
}
