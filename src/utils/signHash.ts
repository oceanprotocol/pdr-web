// @ts-ignore
import { ethers, providers } from 'ethers'
import { networkProvider } from './networkProvider'

export async function signHash(signerAddress: string, message: string) {
  // Since ganache has no support yet for personal_sign, we must use the legacy implementation
  // const signedMessage = await user2.signMessage(message)

  const messageHashBytes = ethers.utils.arrayify(message)

  const signerInstance = networkProvider.getSigner(
    signerAddress
  ) as providers.JsonRpcSigner
  let signedMessage
  try {
    signedMessage = await signerInstance._legacySignMessage(messageHashBytes)
  } catch (e) {
    console.error(e)
    return {}
  }
  signedMessage = signedMessage.substr(2) // remove 0x
  const r = '0x' + signedMessage.slice(0, 64)
  const s = '0x' + signedMessage.slice(64, 128)
  let v = '0x' + signedMessage.slice(128, 130)
  if (v === '0x00') v = '0x1b'
  if (v === '0x01') v = '0x1c'

  return { v, r, s }
}

export async function signHashWithUser(user: ethers.Signer, message: string) {
  // Since ganache has no support yet for personal_sign, we must use the legacy implementation
  // const signedMessage = await user2.signMessage(message)

  const messageHashBytes = ethers.utils.arrayify(message)

  const signature = await user.signMessage(messageHashBytes)
  const v = ethers.utils.hexStripZeros(
    ethers.utils.hexlify(ethers.utils.hexDataSlice(signature, 0, 1))
  )
  const r = ethers.utils.hexStripZeros(
    ethers.utils.hexlify(ethers.utils.hexDataSlice(signature, 1, 33))
  )
  const s = ethers.utils.hexStripZeros(
    ethers.utils.hexlify(ethers.utils.hexDataSlice(signature, 33, 65))
  )

  return { v, r, s }
}
