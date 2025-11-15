import { ethers } from 'ethers'
import { FixedRateExchangeABI } from '../../metadata/abis/FixedRateExchangeABI'
import { TCalcBaseInGivenOutDTResult } from './ContractReturnTypes'

export class FixedRateExchange {
  public readonly instance: ethers.Contract
  public readonly provider: ethers.providers.Provider
  public readonly address: string

  constructor(address: string, provider: ethers.providers.Provider) {
    // Validate address before creating contract
    if (
      !address ||
      address === '0x0' ||
      address === ethers.constants.AddressZero
    ) {
      throw new Error(`FixedRateExchange: Invalid address provided: ${address}`)
    }

    this.address = address
    this.provider = provider

    this.instance = new ethers.Contract(
      address,
      FixedRateExchangeABI,
      provider
    )
  }

  async getDtPrice(
    exchangeId: string
  ): Promise<TCalcBaseInGivenOutDTResult | Error> {
    try {
      // Validate exchangeId before making the call
      if (
        !exchangeId ||
        exchangeId ===
          '0x0000000000000000000000000000000000000000000000000000000000000000'
      ) {
        return new Error('Invalid exchange ID')
      }

      const result = (await this.instance.calcBaseInGivenOutDT(
        exchangeId,
        ethers.utils.parseEther('1'),
        0
      )) as TCalcBaseInGivenOutDTResult

      return result
    } catch (error: unknown) {
      console.error(error)

      if (error instanceof Error) {
        return error
      }

      return new Error('Failed to fetch DT price')
    }
  }

  async buyDt(
    user: ethers.Wallet,
    exchangeId: string,
    baseTokenAmount: number
  ): Promise<ethers.ContractReceipt | Error> {
    try {
      if (!exchangeId) {
        return new Error('Invalid exchange ID')
      }

      // TODO - Fix gas estimation if needed
      const args: [string, ethers.BigNumber, number, string, number] = [
        exchangeId,
        ethers.utils.parseEther('1'),
        baseTokenAmount,
        ethers.constants.AddressZero,
        0
      ]

      const gasPrice = await this.provider.getGasPrice()

      const contractWithSigner = this.instance.connect(user)

      const gasLimit = await contractWithSigner.estimateGas.buyDT(...args)

      const tx = await contractWithSigner.buyDT(...args, {
        gasLimit,
        gasPrice
      })

      const receipt = await tx.wait()

      return receipt
    } catch (error: unknown) {
      console.error(error)

      if (error instanceof Error) {
        return error
      }

      return new Error('Failed to buy DT')
    }
  }
}

export default FixedRateExchange
