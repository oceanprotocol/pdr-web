import { BigNumber, ethers } from 'ethers'
import { TGetAggPredvalResult, TGetSubscriptions } from './ContractReturnTypes'
import { ERC20Template3ABI } from './ERC20Template3ABI'

class Predictoor {
  public provider: ethers.providers.JsonRpcProvider
  public address: string
  public instance: ethers.Contract | null

  public constructor(
    address: string,
    provider: ethers.providers.JsonRpcProvider
  ) {
    this.address = address
    this.provider = provider
    this.instance = null
  }

  async init() {
    this.instance = new ethers.Contract(
      this.address,
      ERC20Template3ABI,
      this.provider
    )
  }

  async isValidSubscription(address: string): Promise<boolean> {
    return this.instance?.isValidSubscription(address)
  }

  async getSubscriptions(address: string): Promise<TGetSubscriptions> {
    return this.instance?.subscriptions(address)
  }

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
    user: string
  ): Promise<TGetAggPredvalResult | null> {
    try {
      if (this.instance) {
        const [nom, denom] = await this.instance
          .connect(user)
          .getAggPredval(block)

        const nominator = ethers.utils.formatUnits(nom, 18)
        const denominator = ethers.utils.formatUnits(nom, 18)

        // TODO - Review in scale/testnet/production.
        // This will be either 1 or 0 right now.
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
      // console.log("Failed to call getAggPredval");
      console.error(e)
      return null
    }
  }
}

export default Predictoor
