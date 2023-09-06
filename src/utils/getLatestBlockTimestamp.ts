import { networkProvider } from './networkProvider'

/**
 * Returns the timestamp of the latest block
 * @returns The timestamp of the latest block
 * @throws If the latest block cannot be fetched
 */
export const getLatestTimestamp = async (): Promise<number | null> => {
  const provider = networkProvider.getProvider()
  // Fetch the latest block from the provider
  let block
  try {
    block = await provider.getBlock('latest')
  } catch (error) {
    console.error(error)
    return null
  }

  // Return the timestamp of the latest block
  return block.timestamp
}
