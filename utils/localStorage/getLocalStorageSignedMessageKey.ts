import { ELocalStorageKeys } from '../config'

/**
 * Get the local storage key for a signed message
 * @param address
 * @returns string
 * @example
 * getLocalStorageSignedMessageKey('0x1234...') // 'signedMessage-0x1234...'
 */
export const getLocalStorageSignedMessageKey = (address: string): string => {
  return `${ELocalStorageKeys.signedMessage}-${address}`
}
