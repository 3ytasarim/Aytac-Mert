import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
    // Treat 401 as expected (not authenticated) rather than an error
    throwOnError: (error: any) => {
      return !error.message.includes('401');
    },
  });

  // If we get a 401, treat as not authenticated (not an error)
  const isAuthError = error && error.message.includes('401');
  const actuallyLoading = isLoading && !isAuthError;

  return {
    user: isAuthError ? undefined : user,
    isLoading: actuallyLoading,
    isAuthenticated: !!user && !isAuthError,
  };
}
