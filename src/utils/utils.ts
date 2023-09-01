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

export type ValueOf<T> = T[keyof T]
export type NonError<T> = Exclude<T, Error>

export const isSapphireNetwork = (): boolean =>
  currentConfig.chainId === '23295'

export function handleTransactionError(error: any) {
  console.log(error.code)
  if (error.code == 'ACTION_REJECTED') {
    // User rejected the transaction
    console.log('Transaction rejected by the user')
    // Display a user-friendly message to the user
    return 'Transaction was canceled by the user'
  } else if (error.code == -32603) {
    // Transaction failed due to out of gas or gas limit exceeded
    console.log('Transaction failed due to gas issues')
    // Display a user-friendly message
    return 'Transaction failed due to gas issues. Please try again with more gas.'
  } else {
    // Other types of errors
    console.error('Transaction error:', error)
    // Display a general error message
    return 'An error occurred while processing the transaction.'
  }
}
