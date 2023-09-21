import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { configureChains, createConfig } from 'wagmi'
import { networkProvider } from './networkProvider'

const w3mProjectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''
const chainInfo = networkProvider.getChainInfo()
// Ensure chains is an array
const chains = chainInfo ? [chainInfo] : []

const { publicClient } = configureChains(chains, [
  w3mProvider({ projectId: w3mProjectId })
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId: w3mProjectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

export { ethereumClient, w3mProjectId, wagmiConfig }
