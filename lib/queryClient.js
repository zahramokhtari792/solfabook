import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 10, // 10 دقیقه
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 روز
      retry: 1,
    },
  },
});
