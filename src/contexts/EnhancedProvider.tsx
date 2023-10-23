import { useEthereumClient } from '@/hooks/useEthereumClient'
import { WagmiConfig } from 'wagmi'
import { MarketPriceProvider } from './MarketPriceContext'
import { PredictoorsProvider } from './PredictoorsContext'
import { SocketProvider } from './SocketContext'
import { TimeFrameProvider } from './TimeFrameContext'
import { UserProvider } from './UserContext'
import { withProviders } from './withProviders'

export type TEnhancedProviderProps = {
  wagmiConfig: ReturnType<typeof useEthereumClient>['wagmiConfig']
  children: React.ReactNode
}

export const EnhancedProvider: React.FC<TEnhancedProviderProps> = ({
  wagmiConfig,
  children
}) => {
  return (
    <>
      {withProviders(
        [
          { provider: WagmiConfig, props: { config: wagmiConfig } },
          { provider: UserProvider },
          { provider: TimeFrameProvider },
          { provider: SocketProvider },
          { provider: PredictoorsProvider },
          { provider: MarketPriceProvider }
        ],
        children
      )}
    </>
  )
}
