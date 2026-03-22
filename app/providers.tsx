"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { SessionProvider } from "next-auth/react";
import { trpc } from "@/lib/trpc";
import { getTrpcHttpUrl } from "@/lib/public-origin";
import { ScreenProfileProvider } from "@/lib/screen-profile";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getTrpcHttpUrl(),
          transformer: superjson,
        }),
      ],
    }),
  );

  return (
    <SessionProvider>
      <ScreenProfileProvider>
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
          <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </trpc.Provider>
      </ScreenProfileProvider>
    </SessionProvider>
  );
}
