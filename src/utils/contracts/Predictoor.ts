import { BigNumber, ethers } from 'ethers'
import { ERC20Template3ABI } from '../../metadata/abis/ERC20Template3ABI'
import { networkProvider } from '../networkProvider'
import { signHashWithUser } from '../signHash'
import { TPredictionContract } from '../subgraphs/getAllInterestingPredictionContracts'
import {
  TGetAggPredvalResult,
  TGetSubscriptions,
  TProviderFee
} from './ContractReturnTypes'
import FixedRateExchange from './FixedRateExchange'
import Token from './Token'

export type TAuthorizationUser = {
  userAddress: string
  v: string | undefined
  r: string | undefined
  s: string | undefined
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
  public details: TPredictionContract
  // Constructor
  public constructor(
    address: string,
    provider: ethers.providers.JsonRpcProvider,
    details: TPredictionContract
  ) {
    this.address = address
    this.token = null
    this.provider = provider
    this.instance = null
    this.FRE = null
    this.details = details
    this.exchangeId = BigNumber.from(0)
  }
  // Initialize method
  async init() {
    // Create contract instance
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
        consumeMarketFeeAddress: this.details.publishMarketFeeAddress,
        consumeMarketFeeToken: this.details.publishMarketFeeToken,
        consumeMarketFeeAmount: this.details.publishMarketFeeAmount
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
      const gasLimit = (await networkProvider.getProvider().getBlock('latest'))
        .gasLimit

      const currentNonce = await user.getTransactionCount()
      console.log('currentNonce', currentNonce)
      // Execute transaction and wait for receipt
      const tx = await this.instance
        .connect(user)
        .buyFromFreAndOrder(orderParams, freParams, {
          gasLimit,
          nonce: currentNonce + 1
        })

      const receipt = await tx.wait()

      return receipt
    } catch (e: any) {
      console.error(e)
      return e
    }
  }

  async getContractSubscriptionInfo(): Promise<
    | {
        price: number
        duration: string
      }
    | Error
  > {
    try {
      return await Promise.all([
        this.getContractPrice(),
        this.instance?.secondsPerSubscription()
      ]).then(([contractPrice, duration]) => {
        if (contractPrice instanceof Error) {
          return contractPrice
        }
        if (!duration) {
          return Error('Assert contract requirements.')
        }
        const price = parseFloat(contractPrice.formattedBaseTokenAmount)

        const durationInHours = duration.div(60 * 60).toString()

        return {
          price,
          duration: durationInHours
        }
      })
    } catch (e: any) {
      console.error(e)
      return e
    }
  }

  async getReadableContractPrice(): Promise<number | Error> {
    try {
      const contractPrice = await this.getContractPrice()
      if (contractPrice instanceof Error) {
        return contractPrice
      }

      return parseFloat(contractPrice.formattedBaseTokenAmount)
    } catch (e: any) {
      console.error(e)
      return e
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
      const dtPrice: any = await this.FRE?.getDtPrice(
        this.exchangeId?.toString()
      )
      const baseTokenAmount = dtPrice.baseTokenAmount as ethers.BigNumber
      // Check if baseTokenAmount is valid and token exists
      if (!baseTokenAmount || baseTokenAmount instanceof Error || !this.token) {
        return Error('Assert token requirements.')
      }
      const formattedBaseTokenAmount = ethers.utils.formatEther(baseTokenAmount)

      return {
        formattedBaseTokenAmount,
        baseTokenAmount
      }
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
      const priceInfo = await this.getContractPrice()

      if (priceInfo instanceof Error || !this.token) {
        throw new Error('Error getting price')
      }

      const { formattedBaseTokenAmount, baseTokenAmount } = priceInfo

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
    authorizationData: TAuthorizationUser
  ): Promise<TGetAggPredvalResult | null> {
    try {
      if (this.instance) {
        const [nom, denom] = await this.instance
          .connect(user)
          .getAggPredval(ts, authorizationData)

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
