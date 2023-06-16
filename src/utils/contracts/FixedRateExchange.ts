import { FixedRateExchangeABI } from '@/metadata/abis/FixedRateExchangeABI'
import { ethers } from 'ethers'
import { TCalcBaseInGivenOutDTResult } from './ContractReturnTypes'

class FixedRateExchange {
  public provider: ethers.providers.Provider
  public address: string
  public instance: ethers.Contract

  constructor(address: string, provider: ethers.providers.Provider) {
    this.provider = provider
    this.address = ethers.utils.getAddress(address)
    this.instance = new ethers.Contract(
      this.address,
      FixedRateExchangeABI,
      provider
    )
  }

  async getDtPrice(
    exchangeId: string
  ): Promise<TCalcBaseInGivenOutDTResult | Error> {
    try {
      const result = (await this.instance.calcBaseInGivenOutDT(
        exchangeId,
        ethers.utils.parseEther('1'),
        0
      )) as TCalcBaseInGivenOutDTResult
      return result
    } catch (e: any) {
      console.error(e)
      return e
    }
  }

  async buyDt(
    user: ethers.Wallet,
    exchangeId: string,
    baseTokenAmount: number
  ): Promise<ethers.ContractReceipt | Error> {
    try {
      // TODO - Fix gas estimation
      const gasPrice = await this.provider.getGasPrice()
      const gasLimit = await this.instance
        .connect(user)
        .estimateGas.buyDT(
          exchangeId,
          ethers.utils.parseEther('1'),
          baseTokenAmount,
          ethers.constants.AddressZero,
          0
        )

      //console.log('gasLimit', ethers.utils.formatEther(gasLimit.toString()))

      const tx = await this.instance
        .connect(user)
        .buyDT(
          exchangeId,
          ethers.utils.parseEther('1'),
          baseTokenAmount,
          ethers.constants.AddressZero,
          0,
          { gasLimit: gasLimit, gasPrice: gasPrice }
        )
      const receipt = await tx.wait()
      // get gas fee from receipt
      return receipt
    } catch (e: any) {
      console.error(e)
      return e
    }
  }
}

export default FixedRateExchange
