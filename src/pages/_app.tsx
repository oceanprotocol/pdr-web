import { ContractsProvider } from '@/contexts/ContractsContext'
import { LocalEpochProvider } from '@/contexts/LocalEpochContext'
import { OPFProvider } from '@/contexts/OPFContext'
import { UserProvider } from '@/contexts/UserContext'
import { ganache, oasis } from '@/metadata/networksConfig'
import '@/styles/globals.css'
import { predictoorWallet } from '@/utils/appconstants'
import { networkProvider } from '@/utils/networkProvider'
import { EthereumClient, w3mConnectors } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import type { AppProps } from 'next/app'
import { WagmiConfig, createClient } from 'wagmi'

const chains = [oasis, ganache]

const projectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''
// const predictoorRPC = process.env.NEXT_PUBLIC_PREDICTOOR_RPC || ''

const provider = networkProvider.getProvider()
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        <OPFProvider provider={provider} wallet={predictoorWallet}>
          <ContractsProvider>
            <UserProvider>
              <LocalEpochProvider>
                <Component {...pageProps} />
              </LocalEpochProvider>
            </UserProvider>
          </ContractsProvider>
        </OPFProvider>
      </WagmiConfig>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
    </>
  )
}
