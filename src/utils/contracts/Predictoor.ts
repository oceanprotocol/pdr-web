import { BigNumber, ethers } from 'ethers'
import { ERC20Template3ABI } from '../../metadata/abis/ERC20Template3ABI'
import { signHash } from '../signHash'
import {
  TGetAggPredvalResult,
  TGetSubscriptions,
  TProviderFee
} from './ContractReturnTypes'
import FixedRateExchange from './FixedRateExchange'
import Token from './Token'

export type TAuthorizationUser = {
  userAddress: string
  v: string
  r: string
  s: string
  validUntil: number
}

// Predictoor class
class Predictoor {
  public provider: ethers.providers.JsonRpcProvider
  public address: string
  public instance: ethers.Contract | null
  public FRE: FixedRateExchange | null
  public exchangeId: BigNumber
  public token: Token | null
  // Constructor
  public constructor(
    address: string,
    provider: ethers.providers.JsonRpcProvider
  ) {
    this.address = address
    this.token = null
    this.provider = provider
    this.instance = null
    this.FRE = null
    this.exchangeId = BigNumber.from(0)
  }
  // Initialize method
  async init() {
    // Create contract instance
    this.instance = new ethers.Contract(
      this.address,
      ERC20Template3ABI,
      this.provider
    )
    // Get stake token and create new token instance
    const stakeToken = await this.instance?.stakeToken()
    this.token = new Token(stakeToken, this.provider)
    // Get exchanges and log fixed rates
    const fixedRates = await this.getExchanges()

    // If there are fixed rates, set exchange and exchangeId
    if (fixedRates) {
      const [fixedRateAddress, exchangeId]: [string, BigNumber] = fixedRates[0]
      const exchange = new FixedRateExchange(fixedRateAddress, this.provider)
      this.FRE = exchange
      this.exchangeId = exchangeId
    }
  }
  // Check if subscription is valid
  async isValidSubscription(address: string): Promise<boolean> {
    return this.instance?.isValidSubscription(address)
  }
  // Get subscriptions
  async getSubscriptions(address: string): Promise<TGetSubscriptions> {
    return this.instance?.subscriptions(address)
  }
  // Calculate provider fee
  async getCalculatedProviderFee(user: ethers.Wallet): Promise<TProviderFee> {
    const providerData = JSON.stringify({ timeout: 0 })
    const providerFeeToken = ethers.constants.AddressZero
    const providerFeeAmount = 0
    const providerValidUntil = 0
    // Create message to sign
    const message = ethers.utils.solidityKeccak256(
      ['bytes', 'address', 'address', 'uint256', 'uint256'],
      [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(providerData)),
        await user.getAddress(),
        providerFeeToken,
        providerFeeAmount,
        providerValidUntil
      ]
    )
    // Sign the message
    const { v, r, s } = await signHash(user.address, message)
    return {
      providerFeeAddress: await user.getAddress(),
      providerFeeToken,
      providerFeeAmount,
      v,
      r,
      s,
      providerData: ethers.utils.hexlify(
        ethers.utils.toUtf8Bytes(providerData)
      ),
      validUntil: providerValidUntil
    }
  }
  // Get order parameters
  async getOrderParams(user: ethers.Wallet) {
    const providerFee = await this.getCalculatedProviderFee(user)
    return {
      consumer: user.address,
      serviceIndex: 0,
      _providerFee: providerFee,
      _consumeMarketFee: {
        consumeMarketFeeAddress: ethers.constants.AddressZero,
        consumeMarketFeeToken: ethers.constants.AddressZero,
        consumeMarketFeeAmount: 0
      }
    }
  }
  // Buy from Fixed Rate Exchange (FRE) and order
  async buyFromFreAndOrder(
    user: ethers.Wallet,
    exchangeId: string,
    baseTokenAmount: string
  ): Promise<ethers.ContractReceipt | Error> {
    try {
      const orderParams = await this.getOrderParams(user)
      const freParams = {
        exchangeContract: this.FRE.address,
        exchangeId,
        maxBaseTokenAmount: ethers.utils.parseEther(baseTokenAmount),
        swapMarketFee: 0,
        marketFeeAddress: ethers.constants.AddressZero
      }
      // Get gas price and limit
      const gasPrice = await this.provider.getGasPrice()
      let gasLimit = await this.instance
        .connect(user)
        .estimateGas.buyFromFreAndOrder(orderParams, freParams)
      // Check if gas limit is below minimum and adjust if necessary

      if (process.env.ENVIRONMENT === 'barge' && process.env.MIN_GAS_PRICE) {
        const minGasLimit = BigNumber.from(parseInt(process.env.MIN_GAS_PRICE))
        if (gasLimit.lt(minGasLimit)) gasLimit = minGasLimit
      }
      // Execute transaction and wait for receipt
      const tx = await this.instance
        .connect(user)
        .buyFromFreAndOrder(orderParams, freParams, {
          gasLimit,
          gasPrice
        })
      const receipt = await tx.wait()

      return receipt
    } catch (e: any) {
      console.error(e)
      return e
    }
  }
  // Buy and start subscription
  async buyAndStartSubscription(
    user: ethers.Wallet
  ): Promise<ethers.ContractReceipt | Error | null> {
    try {
      const dtPrice: any = await this.FRE?.getDtPrice(
        this.exchangeId?.toString()
      )
      const baseTokenAmount = dtPrice.baseTokenAmount
      // Check if baseTokenAmount is valid and token exists
      if (!baseTokenAmount || baseTokenAmount instanceof Error || !this.token) {
        return Error('Assert token requirements.')
      }
      const formattedBaseTokenAmount = ethers.utils.formatEther(baseTokenAmount)
      // Approve token and execute buy and order
      await this.token.approve(
        user,
        this.address || '',
        ethers.utils.formatEther(baseTokenAmount),
        this.provider
      )
      return await this.buyFromFreAndOrder(
        user,
        this.exchangeId?.toString(),
        formattedBaseTokenAmount
      )
    } catch (e: any) {
      console.error(e)
      return null
    }
  }
  // Start order
  startOrder(): Promise<ethers.ContractReceipt> {
    return this.instance?.startOrder()
  }
  // Get exchanges
  getExchanges(): Promise<[string, BigNumber][]> {
    return this.instance?.getFixedRates()
  }
  // Get stake token
  getStakeToken(): Promise<string> {
    return this.instance?.stakeToken()
  }
  // Get current epoch
  async getCurrentEpoch(): Promise<number> {
    const curEpoch: BigNumber = await this.instance?.curEpoch()
    const formattedEpoch: number = parseInt(
      ethers.utils.formatUnits(curEpoch, 0)
    )
    return formattedEpoch
  }
  // Get blocks per epoch
  async getBlocksPerEpoch(): Promise<number> {
    const blocksPerEpoch: BigNumber = await this.instance?.blocksPerEpoch()
    const formattedBlocksPerEpoch: number = parseInt(
      ethers.utils.formatUnits(blocksPerEpoch, 0)
    )
    return formattedBlocksPerEpoch
  }

  async getCurrentEpochStartBlockNumber(blockNumber: number): Promise<number> {
    const soonestBlockToPredict: BigNumber =
      await this.instance?.railBlocknumToSlot(blockNumber)
    const formattedSoonestBlockToPredict: number = parseInt(
      ethers.utils.formatUnits(soonestBlockToPredict, 0)
    )
    return formattedSoonestBlockToPredict
  }

  async getAggPredval(
    block: number,
    user: ethers.Wallet,
    authorizationMessage: TAuthorizationUser
  ): Promise<TGetAggPredvalResult | null> {
    try {
      if (this.instance) {
        const [nom, denom] = await this.instance
          .connect(user)
          .getAggPredval(block, authorizationMessage)
        const nominator = ethers.utils.formatUnits(nom, 18)
        const denominator = ethers.utils.formatUnits(nom, 18)
        // Calculate confidence and direction
        let confidence: number = parseFloat(nominator) / parseFloat(denominator)
        if (isNaN(confidence)) {
          confidence = 0
        }
        let dir: number = confidence >= 0.5 ? 1 : 0
        return {
          nom: nominator,
          denom: denominator,
          confidence: confidence,
          dir: dir,
          stake: denom?.toString()
        }
      }
      return null
    } catch (e) {
      console.error(e)
      return null
    }
  }
}
export default Predictoor
