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
