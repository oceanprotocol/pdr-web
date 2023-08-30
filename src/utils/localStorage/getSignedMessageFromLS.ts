import { TAuthorization } from '../authorize'
import { Maybe } from '../utils'
import { getLocalStorageSignedMessageKey } from './getLocalStorageSignedMessageKey'

/**
 * Get the valid signed message from local storage
 * @param address
 * @returns type TAuthorization or null
 * @example
 * getValidSignedMessageFromLS('0x1234...') // { userAddress: '0x1234...', v: 27, r: '0x1234...', s: '0x1234...', validUntil: 1234567890 }
 */
export const getLocalStorageSignedMessage = (
  address: string
): Maybe<TAuthorization> => {
  const lsSignedMessage = localStorage.getItem(
    getLocalStorageSignedMessageKey(address)
  )
  console.log('lsSignedMessage', lsSignedMessage)
  if (lsSignedMessage) {
    return JSON.parse(lsSignedMessage) as TAuthorization
  }
  return null
}
