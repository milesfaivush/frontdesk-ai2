'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/lib/auth-provider';

export function ThemeProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}
