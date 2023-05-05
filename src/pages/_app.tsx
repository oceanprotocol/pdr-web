import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, goerli } from 'wagmi/chains'
import { ethers } from 'ethers'
import { RPCProvider } from '@/contexts/RPCContext';

const chains = [arbitrum, mainnet, goerli]
const projectId = process.env.NEXT_PUBLIC_WC2_PROJECT_ID || ''
const predictoorRPC = process.env.NEXT_PUBLIC_WC2_PREDICTOOR_RPC || '';
const predictoorPK = process.env.NEXT_PUBLIC_WC2_PREDICTOOR_PK || '';

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

const predictoorProvider = new ethers.providers.JsonRpcProvider(predictoorRPC);
const predictoorWallet = new ethers.Wallet(predictoorPK, predictoorProvider);

export default function App({ Component, pageProps }: AppProps) {
  return( 
  <>
    <WagmiConfig client={wagmiClient}>
      <RPCProvider provider={predictoorProvider} wallet={predictoorWallet} >
        <Component {...pageProps} />
      </RPCProvider>
    </WagmiConfig>
    <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
  </>
)}
