import { useEffect, useState } from 'react';
import { http } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import type { Chain } from '@rainbow-me/rainbowkit';

import { networkProvider } from '@/utils/networkProvider';
import { Maybe } from '@/utils/utils';

import {
  argentWallet,
  backpackWallet,
  binanceWallet,
  bitgetWallet,
  braveWallet,
  coin98Wallet,
  coreWallet,
  enkryptWallet,
  frameWallet,
  frontierWallet,
  imTokenWallet,
  ledgerWallet,
  metaMaskWallet,
  mewWallet,
  okxWallet,
  omniWallet,
  oneInchWallet,
  oneKeyWallet,
  phantomWallet,
  rabbyWallet,
  safeWallet,
  safepalWallet,
  tahoWallet,
  talismanWallet,
  tokenPocketWallet,
  trustWallet,
  xdefiWallet,
  zerionWallet,
} from '@rainbow-me/rainbowkit/wallets';

export enum EEthereumClientStatus {
  LOADING,
  CONNECTED,
  DISCONNECTED,
}

type TWagmiConfig = ReturnType<typeof getDefaultConfig>;

function useEthereumClient() {
  const [wagmiConfig, setWagmiConfig] = useState<Maybe<TWagmiConfig>>(null);
  const [chains, setChains] = useState<Chain[]>([]);
  const [status, setStatus] = useState<EEthereumClientStatus>(
    EEthereumClientStatus.LOADING,
  );

  useEffect(() => {
    // Ensure we're in the browser environment before initializing
    if (typeof window === 'undefined') {
      return;
    }

    const initializeEthereumClient = async () => {
      try {
        await networkProvider.init();

        // Get network provider (already initialized by networkProvider.init)
        const provider = networkProvider.getProvider();

        // Get chain info from networkProvider
        let chainInfo = networkProvider.getChainInfo() as Chain | null | undefined;

        // If chainInfo is null, create it from environment
        if (!chainInfo) {
          const env = process.env.NEXT_PUBLIC_ENV || 'barge';

          let fallbackChainId: number;
          let fallbackRpcUrl: string;

          switch (env) {
            case 'production':
              fallbackChainId = 23294;
              fallbackRpcUrl = 'https://sapphire.oasis.io';
              break;
            case 'staging':
              fallbackChainId = 23295;
              fallbackRpcUrl = 'https://testnet.sapphire.oasis.dev';
              break;
            case 'barge':
            case 'development':
            default:
              fallbackChainId = 8996;
              fallbackRpcUrl =
                process.env.NEXT_PUBLIC_DEV_GANACHE_HOST ||
                'http://localhost:8545';
              break;
          }

          chainInfo = {
            id: fallbackChainId,
            name:
              env === 'production'
                ? 'Oasis Sapphire'
                : env === 'staging'
                ? 'Oasis Sapphire Testnet'
                : 'Ganache',
            nativeCurrency: {
              name: 'Oasis Network',
              symbol: 'ROSE',
              decimals: 18,
            },
            rpcUrls: {
              default: { http: [fallbackRpcUrl] },
              public: { http: [fallbackRpcUrl] },
            },
          } satisfies Chain;
        }

        // Sanity check: ensure we have at least one RPC URL
        const rpcUrl = chainInfo.rpcUrls.default.http[0];
        if (!rpcUrl) {
          console.error('RPC URL not found for chain');
          setStatus(EEthereumClientStatus.DISCONNECTED);
          return;
        }

        // Define all potential chains
        const allChains: Chain[] = [
          {
            id: 23294,
            name: 'Oasis Sapphire',
            nativeCurrency: {
              name: 'Oasis Network',
              symbol: 'ROSE',
              decimals: 18,
            },
            rpcUrls: {
              default: { http: ['https://sapphire.oasis.io'] },
              public: { http: ['https://sapphire.oasis.io'] },
            },
            blockExplorers: {
              default: {
                name: 'Oasis Sapphire Explorer',
                url: 'https://explorer.sapphire.oasis.io',
              },
            },
          },
          {
            id: 23295,
            name: 'Oasis Sapphire Testnet',
            nativeCurrency: {
              name: 'Oasis Network',
              symbol: 'ROSE',
              decimals: 18,
            },
            rpcUrls: {
              default: { http: ['https://testnet.sapphire.oasis.dev'] },
              public: { http: ['https://testnet.sapphire.oasis.dev'] },
            },
            blockExplorers: {
              default: {
                name: 'Oasis Sapphire Testnet Explorer',
                url: 'https://testnet.explorer.sapphire.oasis.dev',
              },
            },
          },
          {
            id: 8996,
            name: 'Ganache',
            nativeCurrency: {
              name: 'Ganache Token',
              symbol: 'GNTK',
              decimals: 18,
            },
            rpcUrls: {
              default: {
                http: [
                  process.env.NEXT_PUBLIC_DEV_GANACHE_HOST ||
                    'http://localhost:8545',
                ],
              },
              public: {
                http: [
                  process.env.NEXT_PUBLIC_DEV_GANACHE_HOST ||
                    'http://localhost:8545',
                ],
              },
            },
          },
        ];

        // Keep current chain + mainnet/testnet if relevant
        const supportedChains = allChains.filter(
          (chain) =>
            chain.id === chainInfo.id ||
            chain.id === 23294 ||
            chain.id === 23295,
        );

        if (supportedChains.length === 0) {
          console.error('No supported chains resolved');
          setStatus(EEthereumClientStatus.DISCONNECTED);
          return;
        }

        setChains(supportedChains);

        // Create transports object for all chains
        const transports = supportedChains.reduce(
          (acc, chain) => {
            const chainRpcUrl = chain.rpcUrls.default.http[0];
            if (chainRpcUrl) {
              acc[chain.id] = http(chainRpcUrl);
            }
            return acc;
          },
          {} as Record<number, ReturnType<typeof http>>,
        );

        const projectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID as
          | string
          | undefined;

        if (!projectId) {
          console.error(
            'WalletConnect Project ID is missing. Please set NEXT_PUBLIC_WC2_PROJECT_ID',
          );
          setStatus(EEthereumClientStatus.DISCONNECTED);
          return;
        }

        // App URL for deep links / metadata
        let appUrl: string | undefined;
        try {
          appUrl = window.location.origin.replace(/\/+$/, '');
        } catch (e) {
          console.warn('Failed to get app URL for deep links:', e);
        }

        // Custom wallet groups (RainbowKit v2 expects wallet factories directly)
        const walletList = [
          {
            groupName: 'Popular',
            wallets: [metaMaskWallet, tahoWallet],
          },
          {
            groupName: 'DeFi Wallets',
            wallets: [
              rabbyWallet,
              zerionWallet,
              oneInchWallet,
              argentWallet,
              xdefiWallet,
            ],
          },
          {
            groupName: 'Hardware Wallets',
            wallets: [ledgerWallet, oneKeyWallet],
          },
          {
            groupName: 'Browser Wallets',
            wallets: [
              braveWallet,
              frameWallet,
              coreWallet,
              enkryptWallet,
              frontierWallet,
              talismanWallet,
            ],
          },
          {
            groupName: 'Mobile Wallets',
            wallets: [
              trustWallet,
              imTokenWallet,
              omniWallet,
              okxWallet,
              tokenPocketWallet,
              safepalWallet,
              coin98Wallet,
            ],
          },
          {
            groupName: 'Exchange Wallets',
            wallets: [binanceWallet, bitgetWallet],
          },
          {
            groupName: 'Other Wallets',
            wallets: [mewWallet, safeWallet, phantomWallet, backpackWallet],
          },
        ];

        const chainsForConfig = supportedChains as [Chain, ...Chain[]];

        const config = getDefaultConfig({
          appName: 'Predictoor',
          projectId,
          chains: chainsForConfig,
          transports,
          ssr: false,
          appUrl,
          appDescription: 'Predictoor - Decentralized Prediction Markets',
          appIcon: appUrl ? `${appUrl}/favicon.ico` : undefined,
          wallets: walletList,
        });

        setWagmiConfig(config);
        setStatus(EEthereumClientStatus.CONNECTED);

        console.log(
          'Wagmi config initialized with chains:',
          supportedChains.map((c) => `${c.name} (${c.id})`).join(', '),
        );
      } catch (error) {
        console.error('Failed to initialize Ethereum client:', error);
        setStatus(EEthereumClientStatus.DISCONNECTED);
      }
    };

    initializeEthereumClient();
  }, []);

  return { wagmiConfig, chains, clientStatus: status };
}

export { useEthereumClient };
