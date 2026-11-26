import React from 'react';
import { RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { router } from '@/routes/router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Do not retry 401, 403, 404, or 422 errors
        if (error?.status && [401, 403, 404, 422].includes(error.status)) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
