import { ethers } from 'ethers'
import { signHash, signHashWithUser } from './signHash'
import { Maybe } from './utils'

export type TAuthorization = {
  userAddress: string
  v?: string
  r?: string
  s?: string
  validUntil: number
}

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

export async function authorizeWithWallet(
  rpcSigner: ethers.providers.JsonRpcSigner,
  validity = 86400
): Promise<TAuthorization> {
  //const lsSignedMessage = getValidSignedMessageFromLS(rpcSigner)
  //if (lsSignedMessage) {
  //  return lsSignedMessage
  //}
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
  //localStorage.setItem('signedMessage', JSON.stringify(authResult))

  return authResult
}

export const getValidSignedMessageFromLS = async (
  rpcSigner: ethers.providers.JsonRpcSigner
): Promise<Maybe<TAuthorization>> => {
  const lsSignedMessage = localStorage.getItem('signedMessage')
  if (lsSignedMessage) {
    const signedMessage = JSON.parse(lsSignedMessage) as TAuthorization

    const now = Math.round(Date.now() / 1000)
    if (
      now < signedMessage.validUntil &&
      signedMessage.userAddress === (await rpcSigner.getAddress())
    ) {
      return signedMessage
    }
  }
  return null
}
