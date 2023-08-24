import { ethers } from 'ethers'
import { getLocalStorageSignedMessage } from './localStorage/getSignedMessageFromLS'
import { saveSignedMessageToLS } from './localStorage/saveSignedMessageToLS'
import { signHash, signHashWithUser } from './signHash'
import { Maybe } from './utils'

export type TAuthorization = {
  userAddress: string
  v?: number | string
  r?: string
  s?: string
  validUntil: number
}

/**
 * Create an authorization object for the user
 * @param address - The user address
 * @param validity - The validity of the authorization in seconds
 * @returns The authorization object
 *
 */
export async function authorize(
  address: string,
  validity = 86400
): Promise<TAuthorization> {
  const validUntil = Math.round(Date.now() / 1000) + validity
  const message = ethers.utils.solidityKeccak256(
    ['address', 'uint256'],
    [address, validUntil]
  )
  const signedMessage = await signHash(address, message)
  return {
    userAddress: address,
    v: signedMessage.v,
    r: signedMessage.r,
    s: signedMessage.s,
    validUntil: validUntil
  }
}

/**
 * Create an authorization object for the user and store it in local storage
 * @param rpcSigner - The rpc signer
 * @param validity - The validity of the authorization in seconds
 * @returns The authorization object
 */
export async function authorizeWithWallet(
  rpcSigner: ethers.providers.JsonRpcSigner,
  validity = 86400
): Promise<TAuthorization> {
  const lsSignedMessage = await getValidSignedMessageFromLS(rpcSigner)
  if (lsSignedMessage) return lsSignedMessage

  const userAddress = await rpcSigner.getAddress()
  const validUntil = Math.round(Date.now() / 1000) + validity
  const message = ethers.utils.solidityKeccak256(
    ['address', 'uint256'],
    [userAddress, validUntil]
  )

  const signedMessage = await signHashWithUser(rpcSigner, message)

  const authResult = {
    userAddress: userAddress,
    v: signedMessage.v,
    r: signedMessage.r,
    s: signedMessage.s,
    validUntil: validUntil
  }

  saveSignedMessageToLS(userAddress, authResult)

  return authResult
}

/**
 * Get the signed message if it is valid from local storage
 * @param rpcSigner - The rpc signer
 * @returns The authorization object or null
 * @example
 * getValidSignedMessageFromLS(rpcSigner) // { userAddress: '0x1234...', v: 27, r: '0x1234...', s: '0x1234...', validUntil: 1234567890 }
 */
export const getValidSignedMessageFromLS = async (
  rpcSigner: ethers.providers.JsonRpcSigner
): Promise<Maybe<TAuthorization>> => {
  const signerAddress = await rpcSigner.getAddress()

  const signedMessage = getLocalStorageSignedMessage(signerAddress)
  if (signedMessage) {
    const now = Math.round(Date.now() / 1000)
    if (
      now < signedMessage.validUntil &&
      signedMessage.userAddress === signerAddress
    ) {
      return signedMessage
    }
  }
  return null
}
