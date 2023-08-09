import { ethers } from 'ethers'

export type TCalcBaseInGivenOutDTResult = {
  baseTokenAmount: number
  oceanFeeAmount: number
  publishMarketFeeAmount: number
  consumeMarketFeeAmount: number
}

export type TProviderFee = {
  providerFeeAddress: string
  providerFeeToken: string
  providerFeeAmount: number
  v: number | string
  r: number | string
  s: number | string
  validUntil: number
  providerData: number | string
}

export type TGetAggPredvalResult = {
  nom: string
  denom: string
  confidence: number
  dir: number
  stake: number
}

export type TGetSubscriptions = {
  user: string
  expires: ethers.BigNumber
}
