import { currentConfig } from './appconstants'

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
  BPE: number
): number[] => [
  BPE * (currentEpoch - 1),
  BPE * currentEpoch,
  BPE * (currentEpoch + 1)
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
