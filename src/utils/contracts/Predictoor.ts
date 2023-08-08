import { BigNumber, ethers } from 'ethers'
import { ERC20Template3ABI } from '../../metadata/abis/ERC20Template3ABI'
import { signHashWithUser } from '../signHash'
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
    console.log('herre')
    this.instance = new ethers.Contract(
      this.address,
      ERC20Template3ABI,
      this.provider.getSigner()
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
  async getCalculatedProviderFee(user: ethers.Signer): Promise<TProviderFee> {
    const address = await user.getAddress()
    console.log('herrre')
    const providerData = JSON.stringify({ timeout: 0 })
    const providerFeeToken = ethers.constants.AddressZero
    const providerFeeAmount = 0
    const providerValidUntil = 0
    // Create message to sign
    const message = ethers.utils.solidityKeccak256(
      ['bytes', 'address', 'address', 'uint256', 'uint256'],
      [
        ethers.utils.hexlify(ethers.utils.toUtf8Bytes(providerData)),
        address,
        providerFeeToken,
        providerFeeAmount,
        providerValidUntil
      ]
    )
    // Sign the message
    console.log('message', message)
    const { v, r, s } = await signHashWithUser(user, message)

    return {
      providerFeeAddress: address,
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
  async getOrderParams(address: string, user: ethers.Signer) {
    const providerFee = await this.getCalculatedProviderFee(user)
    return {
      consumer: address,
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
    user: ethers.Signer,
    exchangeId: string,
    baseTokenAmount: string
  ): Promise<ethers.ContractReceipt | Error> {
    try {
      // Check if FRE and token exist
      if (!this.FRE || !this.token || !this.instance) {
        return Error('Assert FRE and token requirements.')
      }
      const address = await user.getAddress()
      const orderParams = await this.getOrderParams(address, user)
      const freParams = {
        exchangeContract: this.FRE.address,
        exchangeId,
        maxBaseTokenAmount: ethers.utils.parseEther(baseTokenAmount),
        swapMarketFee: 0,
        marketFeeAddress: ethers.constants.AddressZero
      }
      // Get gas price and limit
      //const gasPrice = await this.provider.getGasPrice()
      //let gasLimit = await this.instance
      //  .connect(user)
      //  .estimateGas.buyFromFreAndOrder(orderParams, freParams)
      // Check if gas limit is below minimum and adjust if necessary

      //console.log('gasLimit', gasLimit)
      //if (process.env.ENVIRONMENT === 'barge' && process.env.MIN_GAS_PRICE) {
      //  const minGasLimit = BigNumber.from(parseInt(process.env.MIN_GAS_PRICE))
      //  if (gasLimit.lt(minGasLimit)) gasLimit = minGasLimit
      //}

      const gasLimit = BigNumber.from(16000000)
      // Execute transaction and wait for receipt
      const tx = await this.instance
        .connect(user)
        .buyFromFreAndOrder(orderParams, freParams, {
          gasLimit
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
    user: ethers.Signer
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

      const address = await user.getAddress()
      const aprrovedTokenAmount = await this.token.allowance(
        address,
        this.address
      )

      if (
        ethers.utils.formatEther(aprrovedTokenAmount) <
        ethers.utils.formatEther(baseTokenAmount)
      ) {
        await this.token.approve(
          user,
          this.address || '',
          ethers.utils.formatEther(baseTokenAmount),
          this.provider
        )
      }
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
    user: ethers.Signer,
    authorizationData: TAuthorizationUser
  ): Promise<TGetAggPredvalResult | null> {
    try {
      if (this.instance) {
        const [nom, denom] = await this.instance
          .connect(user)
          .getAggPredval(block, authorizationData)

        const nominator = ethers.utils.formatUnits(nom, 18)
        const denominator = ethers.utils.formatUnits(denom, 18)

        let confidence: number = parseFloat(nominator) / parseFloat(denominator)
        let dir: number = confidence >= 0.5 ? 1 : 0
        if (confidence > 0.5) {
          confidence -= 0.5
        } else {
          confidence = 0.5 - confidence
        }
        confidence = (confidence / 0.5) * 100

        return {
          nom: nominator,
          denom: denominator,
          confidence: confidence,
          dir: dir,
          stake: parseFloat(ethers.utils.formatUnits(denom, 18))
        }
      }

      return null
    } catch (e) {
      // console.log("Failed to call getAggPredval");
      console.error(e)
      return null
    }
  }
}
export default Predictoor
