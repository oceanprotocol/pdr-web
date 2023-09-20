import { networkProvider } from '@/utils/networkProvider'
import { Maybe } from '@/utils/utils'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { useEffect, useState } from 'react'
import { configureChains, createConfig } from 'wagmi'

const w3mProjectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''

type TWagmiConfig = ReturnType<typeof createConfig>

function useEthereumClient() {
  const [ethereumClient, setEthereumClient] =
    useState<Maybe<EthereumClient>>(null)
  const [wagmiConfig, setWagmiConfig] = useState<Maybe<TWagmiConfig>>(null)

  useEffect(() => {
    async function initializeEthereumClient() {
      await networkProvider.init()
      const chainInfo = networkProvider.getChainInfo()
      const chains = chainInfo ? [chainInfo] : []

      const { publicClient } = configureChains(chains, [
        w3mProvider({ projectId: w3mProjectId })
      ])

      const config = createConfig({
        autoConnect: true,
        connectors: w3mConnectors({ projectId: w3mProjectId, chains }),
        publicClient
      })

      setWagmiConfig(config as TWagmiConfig)
      setEthereumClient(new EthereumClient(config, chains))
    }

    initializeEthereumClient()
  }, [])

  return { ethereumClient, w3mProjectId, wagmiConfig }
}

export { useEthereumClient }
