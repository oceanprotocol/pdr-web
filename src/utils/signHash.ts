// @ts-ignore
import { ethers, providers } from 'ethers'
import { NotificationManager } from 'react-notifications'
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

export type TSignatureValues = {
  v: number
  r: string
  s: string
}

export async function signHashWithUser(
  user: ethers.Signer,
  message: string
): Promise<TSignatureValues | undefined> {
  // Since ganache has no support yet for personal_sign, we must use the legacy implementation
  // const signedMessage = await user2.signMessage(message)
  try {
    const messageHashBytes = ethers.utils.arrayify(message) // hashing the message
    const signature = await user.signMessage(messageHashBytes)

    const { v, r, s } = ethers.utils.splitSignature(signature)

    return {
      v: v,
      r: r,
      s: s
    }
  } catch (e: any) {
    NotificationManager.error(
      'Failed to sign message. Please try again later.',
      'Error',
      5000
    )
  }
}
