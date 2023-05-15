import networksData from '../metadata/networks.json'

export const getNetworkName = async (chainId: number) => {
  return networksData.find((data) => data.chainId == chainId)?.name
}
