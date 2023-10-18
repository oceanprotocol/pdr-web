import { networkProvider } from '@/utils/networkProvider'
import { Maybe } from '@/utils/utils'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { useEffect, useState } from 'react'
import { Chain, configureChains, createConfig } from 'wagmi'

const w3mProjectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''

export enum EEthereumClientStatus {
  'LOADING',
  'CONNECTED',
  'DISCONNECTED'
}

type TWagmiConfig = ReturnType<typeof createConfig>

function useEthereumClient() {
  const [ethereumClient, setEthereumClient] =
    useState<Maybe<EthereumClient>>(null)
  const [wagmiConfig, setWagmiConfig] = useState<Maybe<TWagmiConfig>>(null)
  const [status, setStatus] = useState<EEthereumClientStatus>(
    EEthereumClientStatus.LOADING
  )

  useEffect(() => {
    async function initializeEthereumClient() {
      await networkProvider.init()
      const chainInfo = networkProvider.getChainInfo()

      if (!chainInfo) {
        setStatus(EEthereumClientStatus.DISCONNECTED)
        return
      }

      const chains: Array<Chain> = [chainInfo]

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
      setStatus(EEthereumClientStatus.CONNECTED)
    }

    initializeEthereumClient()
  }, [])

  return { ethereumClient, w3mProjectId, wagmiConfig, clientStatus: status }
}

export { useEthereumClient }
