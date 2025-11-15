import { Contract, ethers } from 'ethers'
import { IERC20ABI } from '../../metadata/abis/IERC20ABI'
import { handleTransactionError } from '../utils'

class Token {
  public contractInstance: Contract
  public contractInstanceWrite: Contract

  constructor(
    public address: string,
    public provider: ethers.providers.JsonRpcProvider,
    public signer: ethers.providers.JsonRpcSigner,
    public isSapphire: boolean = false
  ) {
    // Validate address before creating contract
    if (!address || address === '0x0' || address === ethers.constants.AddressZero) {
      throw new Error(`Token: Invalid address provided: ${address}`)
    }

    if (!signer) {
      throw new Error('Token: Signer is required')
    }

    this.contractInstance = new ethers.Contract(
      address,
      IERC20ABI,
      signer || provider.getSigner()
    )

    // Note: Sapphire wrapping is handled at the provider level
    // The signer wrapping functionality has been removed in sapphire-paratime v2
    this.contractInstanceWrite = this.contractInstance
  }

  async allowance(account: string, spender: string): Promise<string> {
    // Validate addresses before making contract calls
    if (!account || account === '0x0' || account === ethers.constants.AddressZero) {
      throw new Error(`Token.allowance: Invalid account address: ${account}`)
    }
    if (!spender || spender === '0x0' || spender === ethers.constants.AddressZero) {
      throw new Error(`Token.allowance: Invalid spender address: ${spender}`)
    }
    const result = await this.contractInstance.allowance(account, spender)

    return result.toString()
  }

  async balanceOf(account: string): Promise<string> {
    // Validate address before making contract call
    if (!account || account === '0x0' || account === ethers.constants.AddressZero) {
      throw new Error(`Token.balanceOf: Invalid account address: ${account}`)
    }
    return await this.contractInstance.balanceOf(account)
  }

  async approve(
    user: ethers.Signer,
    spender: string,
    amount: string,
    provider: ethers.providers.JsonRpcProvider
  ): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      // Validate spender address before approving
      if (!spender || spender === '0x0' || spender === ethers.constants.AddressZero) {
        throw new Error(`Token.approve: Invalid spender address: ${spender}`)
      }
      // TODO - Gas estimation
      const gasPrice = await this.provider.getGasPrice()
      const gasLimit = await this.contractInstance
        .connect(user)
        .estimateGas.approve(spender, ethers.utils.parseEther(amount))

      console.log(`TOKEN Gas price: ${gasPrice.toString()}`)
      console.log(`TOKEN Gas limit: ${gasLimit.toString()}`)

      const tx = await this.contractInstance
        .connect(user)
        .approve(spender, ethers.utils.parseEther(amount), {
          gasLimit: gasLimit,
          gasPrice: gasPrice
        })

      const receipt = await tx.wait()
      // console.log(`Got receipt`);

      return receipt
    } catch (error: unknown) {
      console.log(error)
      console.error(error)
      throw handleTransactionError(error as Error)
    }
  }
}

export default Token
