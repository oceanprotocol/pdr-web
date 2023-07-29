import { ethers } from 'ethers'
import { signHash } from './signHash'

export async function authorize(address: string, validity = 86400) {
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
