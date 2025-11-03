import { MarketPriceProvider } from '@/contexts/MarketPriceContext'
import { PredictoorsProvider } from '@/contexts/PredictoorsContext'
import { SocketProvider } from '@/contexts/SocketContext'
import { TimeFrameProvider } from '@/contexts/TimeFrameContext'
import { UserProvider } from '@/contexts/UserContext'
import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'
import { WagmiProvider } from 'wagmi'
import { AccuracyProvider } from './AccuracyContext'

interface AppProviderProps {
  wagmiConfig: any
  children: React.ReactNode
}

const AppProvider: React.FC<AppProviderProps> = ({ wagmiConfig, children }) => {
  return (
    <WagmiProvider config={wagmiConfig}>
      <UserProvider>
        <TimeFrameProvider
          defaultTimeFrameInterval={EPredictoorContractInterval.e_5M}
        >
          <AccuracyProvider>
            <SocketProvider>
              <PredictoorsProvider>
                <MarketPriceProvider>{children}</MarketPriceProvider>
              </PredictoorsProvider>
            </SocketProvider>
          </AccuracyProvider>
        </TimeFrameProvider>
      </UserProvider>
    </WagmiProvider>
  )
}

export default AppProvider
