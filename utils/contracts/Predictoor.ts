import { BigNumber, ethers } from 'ethers'
import { ERC20Template3ABI } from '../../metadata/abis/ERC20Template3ABI'
import { TAuthorization } from '../authorize'
import { signHashWithUser } from '../signHash'
import { TPredictionContract } from '../subgraphs/getAllInterestingPredictionContracts'
import { Maybe, handleTransactionError } from '../utils'
import {
  TGetAggPredvalResult,
  TGetSubscriptions,
  TProviderFee
} from './ContractReturnTypes'
import FixedRateExchange from './FixedRateExchange'
import Token from './Token'
import { calculatePrediction } from './helpers/calculatePrediction'

export type TPredictoorArgs = {
  address: string
  provider: ethers.providers.JsonRpcProvider
  details: TPredictionContract
  signer: ethers.providers.JsonRpcSigner
  isSapphire?: boolean
}

export type PredictionResult = {
  nom: string
  denom: string
  confidence: number
  dir: number
  stake: number
}

// Predictoor class
class Predictoor {
  public instance: ethers.Contract | null = null
  public instanceWrite: ethers.Contract | null = null
  public FRE: FixedRateExchange | null = null
  public exchangeId: BigNumber = BigNumber.from(0)
  public currentEpoch: number | null = null
  public token: Token | null = null
  // Constructor
  public constructor(
    public address: string,
    public provider: ethers.providers.JsonRpcProvider,
    public details: TPredictionContract,
    public signer: ethers.providers.JsonRpcSigner,
    public isSapphire?: boolean
  ) {}

  // Initialize method
  async init() {
    if (!this.signer) return

    // Create contract instance
    this.instance = new ethers.Contract(
      this.address,
      ERC20Template3ABI,
      this.signer
    )

    // Note: Sapphire wrapping is handled at the provider level
    // The signer wrapping functionality has been removed in sapphire-paratime v2
    this.instanceWrite = this.instance

    // Get stake token and create new token instance
    try {
      const stakeToken = await this.instance.connect(this.signer).stakeToken()

      this.token = new Token(
        stakeToken,
        this.provider,
        this.signer,
        this.isSapphire
      )
    } catch (error: unknown) {
      console.error('Predictoor: Failed to get stake token:', error)
      return
    }

    // Get exchanges and log fixed rates
    const fixedRates = await this.getExchanges()

    // If there are fixed rates, set exchange and exchangeId
    if (fixedRates && fixedRates.length > 0) {
      const [fixedRateAddress, exchangeId]: [string, BigNumber] = fixedRates[0]

      // Validate fixed rate address before creating exchange
      if (
        fixedRateAddress &&
        fixedRateAddress !== '0x0' &&
        fixedRateAddress !== ethers.constants.AddressZero
      ) {
        try {
          const exchange = new FixedRateExchange(
            fixedRateAddress,
            this.provider
          )
          this.FRE = exchange
          this.exchangeId = exchangeId
        } catch (error: unknown) {
          console.error(
            'Predictoor: Failed to create FixedRateExchange:',
            error
          )
        }
      }
    }
  }
  // Check if subscription is valid
  async isValidSubscription(address: string): Promise<boolean> {
    try {
      return await this.instance?.isValidSubscription(address)
    } catch (e: unknown) {
      // Handle contract revert errors gracefully
      const error = e as { code?: string; reason?: string; error?: { code?: string }; message?: string }
      if (
        error.code === 'CALL_EXCEPTION' ||
        error.reason === 'missing revert data' ||
        error.error?.code === 'CALL_EXCEPTION'
      ) {
        // Contract call reverted, subscription likely doesn't exist
        return false
      }
      console.error('Predictoor.isValidSubscription error:', error.message || e)
      return false
    }
  }
  // Get subscriptions
  async getSubscriptions(address: string): Promise<TGetSubscriptions | null> {
    try {
      return await this.instance?.subscriptions(address)
    } catch (e: unknown) {
      // Handle contract revert errors gracefully
      const error = e as { code?: string; reason?: string; error?: { code?: string }; message?: string }
      if (
        error.code === 'CALL_EXCEPTION' ||
        error.reason === 'missing revert data' ||
        error.error?.code === 'CALL_EXCEPTION'
      ) {
        // Contract call reverted, user likely doesn't have a subscription
        // Suppress noisy console errors for expected contract reverts
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `Predictoor: Contract call reverted for subscriptions(${address}). User may not have a subscription.`
          )
        }
        return null
      }
      // Log unexpected errors
      console.error('Predictoor.getSubscriptions error:', error.message || e)
      return null
    }
  }

  // Calculate provider fee
  async getCalculatedProviderFee(
    user: ethers.providers.JsonRpcSigner
  ): Promise<Maybe<TProviderFee>> {
    // Get address properly using getAddress() to avoid null errors
    const address = await user.getAddress()
    if (!address) {
      throw new Error('Unable to get address from signer')
    }
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
    const result = await signHashWithUser(user, message)

    if (!result) return null
    const { v, r, s } = result

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
  async getOrderParams(address: string, user: ethers.providers.JsonRpcSigner) {
    const providerFee = await this.getCalculatedProviderFee(user)
    if (!providerFee) return null

    // Validate publishMarketFeeAddress
    const publishMarketFeeAddress =
      this.details.publishMarketFeeAddress || ethers.constants.AddressZero

    return {
      consumer: address,
      serviceIndex: 0,
      _providerFee: providerFee,
      _consumeMarketFee: {
        consumeMarketFeeAddress: publishMarketFeeAddress,
        consumeMarketFeeToken:
          this.details.publishMarketFeeToken || ethers.constants.AddressZero,
        consumeMarketFeeAmount: this.details.publishMarketFeeAmount || 0
      }
    }
  }
  // Buy from Fixed Rate Exchange (FRE) and order
  async buyFromFreAndOrder(
    user: ethers.providers.JsonRpcSigner,
    exchangeId: string,
    baseTokenAmount: string
  ): Promise<ethers.ContractReceipt | Error> {
    try {
      // Check if FRE and token exist
      if (!this.FRE || !this.token || !this.instanceWrite) {
        return Error('Assert FRE and token requirements.')
      }
      const address = await user.getAddress()
      const orderParams = await this.getOrderParams(address, user)
      if (!orderParams) return Error('Assert order parameters.')
      const freParams = {
        exchangeContract: this.FRE.address,
        exchangeId,
        maxBaseTokenAmount: ethers.utils.parseEther(baseTokenAmount),
        swapMarketFee: 0,
        marketFeeAddress: ethers.constants.AddressZero
      }
      // Get gas price and limit
      const gasPrice = await this.provider.getGasPrice()
      const gasLimit = await this.instanceWrite
        .connect(user)
        .estimateGas.buyFromFreAndOrder(orderParams, freParams)
      // Check if gas limit is below minimum and adjust if necessary

      //console.log('gasLimit', gasLimit)
      //if (process.env.ENVIRONMENT === 'barge' && process.env.MIN_GAS_PRICE) {
      //  const minGasLimit = BigNumber.from(parseInt(process.env.MIN_GAS_PRICE))
      //  if (gasLimit.lt(minGasLimit)) gasLimit = minGasLimit
      //}
      //const gasLimit = (await networkProvider.getProvider().getBlock('latest'))
      //  .gasLimit

      // Execute transaction and wait for receipt
      const tx = await this.instanceWrite
        .connect(user)
        .buyFromFreAndOrder(orderParams, freParams, {
          gasLimit: gasLimit,
          gasPrice: gasPrice
        })

      const receipt = await tx.wait()

      return receipt
    } catch (e: unknown) {
      const error = e as { code?: string }
      throw error.code ? handleTransactionError(error) : e
    }
  }

  // Looks like this isn't being used anywhere
  async getContractSubscriptionInfo(): Promise<
    | {
        price: number
        secondsPerSubscription: string
      }
    | Error
  > {
    try {
      return await Promise.all([
        this.getContractPrice(),
        this.instance?.secondsPerSubscription()
      ]).then(([contractPrice, secondsPerSubscription]) => {
        if (contractPrice instanceof Error) {
          return contractPrice
        }
        if (!secondsPerSubscription) {
          return Error('Assert contract requirements.')
        }
        const price = parseFloat(contractPrice.formattedBaseTokenAmount)

        return {
          price,
          secondsPerSubscription: secondsPerSubscription
        }
      })
    } catch (e: unknown) {
      console.error(e)
      return e instanceof Error ? e : new Error(String(e))
    }
  }

  async getReadableContractPrice(): Promise<number | Error> {
    try {
      const contractPrice = await this.getContractPrice()
      if (contractPrice instanceof Error) {
        return contractPrice
      }

      return parseFloat(contractPrice.formattedBaseTokenAmount)
    } catch (e: unknown) {
      console.error(e)
      return e instanceof Error ? e : new Error(String(e))
    }
  }

  async getContractPrice(): Promise<
    | {
        formattedBaseTokenAmount: string
        baseTokenAmount: ethers.BigNumber
      }
    | Error
  > {
    try {
      const dtPrice = await this.FRE?.getDtPrice(
        this.exchangeId?.toString()
      ) as { baseTokenAmount: ethers.BigNumber } | undefined

      const baseTokenAmount = dtPrice?.baseTokenAmount
      // Check if baseTokenAmount is valid and token exists
      if (!baseTokenAmount || baseTokenAmount instanceof Error || !this.token) {
        return Error('Assert token requirements.')
      }
      const formattedBaseTokenAmount = ethers.utils.formatEther(baseTokenAmount)

      return {
        formattedBaseTokenAmount,
        baseTokenAmount
      }
    } catch (e: unknown) {
      console.error(e)
      return e instanceof Error ? e : new Error(String(e))
    }
  }

  // Buy and start subscription
  async buyAndStartSubscription(
    user: ethers.providers.JsonRpcSigner
  ): Promise<ethers.ContractReceipt | Error | null> {
    const priceInfo = await this.getContractPrice()

    if (priceInfo instanceof Error || !this.token) {
      throw new Error('Error getting price')
    }

    const { formattedBaseTokenAmount, baseTokenAmount } = priceInfo
    // Get address properly using getAddress() to avoid null errors
    const address = await user.getAddress()
    if (!address) {
      throw new Error('Unable to get address from signer')
    }
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
        this.address,
        ethers.utils.formatEther(baseTokenAmount),
        this.provider
      )
    }

    return await this.buyFromFreAndOrder(
      user,
      this.exchangeId?.toString(),
      formattedBaseTokenAmount
    )
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

  async getCurrentEpochStartBlockNumber(blockNumber: number): Promise<number> {
    const soonestBlockToPredict: BigNumber =
      await this.instance?.railBlocknumToSlot(blockNumber)
    const formattedSoonestBlockToPredict: number = parseInt(
      ethers.utils.formatUnits(soonestBlockToPredict, 0)
    )
    return formattedSoonestBlockToPredict
  }

  async getAggPredval(
    ts: number,
    user: ethers.Signer,
    authorizationData: TAuthorization
  ): Promise<TGetAggPredvalResult | null> {
    try {
      if (this.instanceWrite) {
        const [nom, denom] = await this.instanceWrite
          .connect(user)
          .getAggPredval(ts, authorizationData)

        const nominator = ethers.utils.formatUnits(nom, 18)
        const denominator = ethers.utils.formatUnits(denom, 18)

        const result: PredictionResult = calculatePrediction(
          nominator,
          denominator
        )
        return result
      }

      return null
    } catch (e) {
      // console.log("Failed to call getAggPredval");
      console.error(e)
      return null
    }
  }

  async getSecondsPerEpoch(): Promise<number> {
    const secondsPerEpoch: BigNumber = await this.instance?.secondsPerEpoch()
    const formattedSecondsPerEpoch: number = parseInt(
      ethers.utils.formatUnits(secondsPerEpoch, 0)
    )
    return formattedSecondsPerEpoch
  }

  async getCurrentEpochStartTs(seconds: number): Promise<number> {
    const soonestTsToPredict: BigNumber = await this.instance?.toEpochStart(
      seconds
    )
    const formattedSoonestTsToPredict: number = parseInt(
      ethers.utils.formatUnits(soonestTsToPredict, 0)
    )
    return formattedSoonestTsToPredict
  }
}

export default Predictoor
