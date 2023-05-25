import { ERC20Template3ABI } from '@/metadata/abis/ERC20Template3ABI';
import { Contract, ethers } from 'ethers';

class Token {
  public provider: ethers.providers.Provider;
  public contractAddress: string;
  public contractInstance: Contract;

  constructor(address: string, provider: ethers.providers.Provider) {
    this.provider = provider;
    this.contractAddress = ethers.utils.getAddress(address);
    this.contractInstance = new ethers.Contract(
      this.contractAddress,
      ERC20Template3ABI,
      provider
    );
  }

  async allowance(account: string, spender: string): Promise<string> {
    return await this.contractInstance.functions.allowance(
        account, 
        spender
    );
  }

  async balanceOf(account: string): Promise<string> {
    return await this.contractInstance.functions.balanceOf(
        account
    );
  }

  async approve(spender: string, amount: string, provider: ethers.providers.Provider): Promise<ethers.providers.TransactionReceipt | null> {
    try {
      const estGas = await this.contractInstance.estimateGas.approve(
        spender, 
        amount
      );

      const tx = await this.contractInstance.approve(
        spender, 
        amount, 
        {estGas}
      );
      console.log(`Approval tx: ${tx.hash}.`);

      const receipt = await tx.wait();
      console.log(`Got receipt`);
      
      return receipt;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
}

export default Token;