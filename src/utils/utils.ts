import { ethers } from 'ethers'
import { currentConfig } from './appconstants'

/* eslint-env mocha */
/* global */

export function getEventFromTx(
  txReceipt: ethers.ContractReceipt,
  eventName: string
): ethers.Event | undefined {
  return txReceipt.events?.filter((log: any) => {
    return log.event === eventName
  })[0]
}

export function stringToBytes32(data: string): string {
  const hexData = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(data))
  return ethers.utils.hexZeroPad(hexData, 32)
}

export const findContractMarketInConfig = (
  tokenName: string,
  pairName: string
): string | undefined =>
  currentConfig.tokenPredictions.find(
    (tokenPrediction) =>
      tokenPrediction.tokenName === tokenName &&
      tokenPrediction.pairName === pairName
  )?.exchange
