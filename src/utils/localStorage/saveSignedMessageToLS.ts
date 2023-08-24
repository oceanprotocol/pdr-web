import { TAuthorization } from '../authorize'
import { getLocalStorageSignedMessageKey } from './getLocalStorageSignedMessageKey'

/**
 * Save the signed message to local storage
 * @param address
 * @param signedMessage
 */
export const saveSignedMessageToLS = (
  address: string,
  signedMessage: TAuthorization
): void => {
  localStorage.setItem(
    getLocalStorageSignedMessageKey(address),
    JSON.stringify(signedMessage)
  )
}
