'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
      retry: 1,
    },
  },
});

export function ClientLayout({ children }: ClientLayoutProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
