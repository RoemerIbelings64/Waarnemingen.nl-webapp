import { QueryClient } from '@tanstack/react-query';
import { ApiError, RateLimitError } from './client';

/**
 * Globale QueryClient met een net retry-beleid: rate limits en netwerkfouten
 * worden met exponentiële backoff opnieuw geprobeerd, maar 4xx-clientfouten
 * (behalve 429) niet — die lossen zich niet op door herhalen.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 min: past bij verse waarnemingsdata
      gcTime: 30 * 60 * 1000,
      retry: (failureCount, error) => {
        if (error instanceof RateLimitError) return failureCount < 3;
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 15000),
      refetchOnWindowFocus: false,
    },
  },
});
