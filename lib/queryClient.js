import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { 
      staleTime: 1000 * 60 * 5,  
      cacheTime: 1000 * 60 * 60 * 24 * 30, 
       
      networkMode: 'offlineFirst',
       
      refetchOnWindowFocus: false,
      
      retry: 1,
    },
  },
});
