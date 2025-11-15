"use client";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useMemo } from "react";

import AppProvider from "@/contexts/AppProvider";
import {
  EEthereumClientStatus,
  useEthereumClient,
} from "@/hooks/useEthereumClient";
import { NotConnectedWarning } from "@/components/NotConnectedWarning";

const queryClient = new QueryClient();

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const { wagmiConfig, chains, clientStatus } = useEthereumClient();

  const hasConfig = useMemo(
    () => Boolean(wagmiConfig) && chains.length > 0,
    [wagmiConfig, chains],
  );

  const isDisconnected = clientStatus === EEthereumClientStatus.DISCONNECTED;

  if (isDisconnected) {
    return <NotConnectedWarning clientStatus={clientStatus} />;
  }

  if (!hasConfig || !wagmiConfig) {
    return (
      <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
        Initializing wallet…
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider wagmiConfig={wagmiConfig}>
        <RainbowKitProvider modalSize="compact" initialChain={chains[0]}>
          {children}
        </RainbowKitProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}
