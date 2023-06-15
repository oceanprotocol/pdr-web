import { IERC20ABI } from '@/metadata/abis/IERC20ABI'
import { Contract, ethers } from 'ethers'

class Token {
  public provider: ethers.providers.Provider
  public contractAddress: string
  public contractInstance: Contract

  constructor(address: string, provider: ethers.providers.Provider) {
    this.provider = provider
    this.contractAddress = ethers.utils.getAddress(address)
    this.contractInstance = new ethers.Contract(
      this.contractAddress,
      IERC20ABI,
      provider
    )
  }

  async allowance(account: string, spender: string): Promise<string> {
    return await this.contractInstance.allowance(account, spender)
  }

  async balanceOf(account: string): Promise<string> {
    return await this.contractInstance.balanceOf(account)
  }

  async approve(
    user: ethers.Wallet,
    spender: string,
    amount: string,
    provider: ethers.providers.JsonRpcProvider
  ): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      // TODO - Gas estimation
      // const gasPrice: BigNumber = await this.provider.getGasPrice();
      // const gasLimit: BigNumber = await this.contractInstance.estimateGas.approve(
      //   spender,
      //   ethers.utils.parseEther(amount)
      // );

      const tx = await this.contractInstance.connect(user).approve(
        spender,
        ethers.utils.parseEther(amount)
        // {gasLimit: gasLimit, gasPrice: gasPrice}
      )
      console.log(`Approval tx: ${tx.hash}.`)

      const receipt = await tx.wait()
      console.log(`Got receipt`)

      return receipt
    } catch (error) {
      console.error(error)
      return null
    }
  }
}

export default Token
