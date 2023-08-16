import { States } from '@/components/Banner'
import { currentConfig } from './appconstants'
const { chainId } = currentConfig

/* eslint-env mocha */
/* global */

export const findContractMarketInConfig = (
  tokenName: string,
  pairName: string
): string | undefined =>
  currentConfig.tokenPredictions.find(
    (tokenPrediction) =>
      tokenPrediction.tokenName === tokenName &&
      tokenPrediction.pairName === pairName
  )?.market

export type Maybe<T> = T | null

export const calculatePredictionEpochs = (
  currentEpoch: number,
  SPE: number
): number[] => [
  SPE * (currentEpoch - 2),
  SPE * (currentEpoch - 1),
  SPE * currentEpoch,
  SPE * (currentEpoch + 1)
]

export type DeepNonNullable<T> = T extends null | undefined
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: DeepNonNullable<T[K]>
    }
  : T

export const omit = <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const cloned = { ...obj }
  for (const key of keys) {
    delete cloned[key]
  }
  return cloned
}

export const checkForBannerMessage = (
  userAddress: `0x${string}` | undefined,
  connectedNetwork: number | undefined
) => {
  let message: string | undefined = undefined
  let type: States = States.WARNING
  console.log(connectedNetwork, chainId)
  if (!userAddress) {
    message = 'Wallet not connected!'
  } else if (connectedNetwork != parseInt(chainId)) {
    message = 'Connected to wrong network!'
  }
  return {
    message,
    type
  }
}
