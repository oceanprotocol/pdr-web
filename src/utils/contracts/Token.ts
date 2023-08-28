import * as sapphire from '@oasisprotocol/sapphire-paratime'
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
    this.contractInstance = new ethers.Contract(
      address,
      IERC20ABI,
      signer || provider.getSigner()
    )

    this.contractInstanceWrite = !this.isSapphire
      ? this.contractInstance
      : new ethers.Contract(address, IERC20ABI, sapphire.wrap(signer))
  }

  async allowance(account: string, spender: string): Promise<string> {
    const result = await this.contractInstance.allowance(account, spender)

    return result.toString()
  }

  async balanceOf(account: string): Promise<string> {
    return await this.contractInstance.balanceOf(account)
  }

  async approve(
    user: ethers.Signer,
    spender: string,
    amount: string,
    provider: ethers.providers.JsonRpcProvider
  ): Promise<ethers.providers.TransactionReceipt | null> {
    try {
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
    } catch (error: any) {
      console.log(error)
      console.error(error)
      throw handleTransactionError(error)
    }
  }
}

export default Token
