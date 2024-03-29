import { ethers } from 'ethers'
import { FixedRateExchangeABI } from '../../metadata/abis/FixedRateExchangeABI'
import { TCalcBaseInGivenOutDTResult } from './ContractReturnTypes'

class FixedRateExchange {
  public instance: ethers.Contract

  constructor(
    public address: string,
    public provider: ethers.providers.Provider
  ) {
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
      const args = [
        exchangeId,
        ethers.utils.parseEther('1'),
        baseTokenAmount,
        ethers.constants.AddressZero,
        0
      ]
      const gasPrice = await this.provider.getGasPrice()
      const gasLimit = await this.instance
        .connect(user)
        .estimateGas.buyDT(...args)

      //console.log('gasLimit', ethers.utils.formatEther(gasLimit.toString()))

      const tx = await this.instance
        .connect(user)
        .buyDT(...args, { gasLimit: gasLimit, gasPrice: gasPrice })
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
