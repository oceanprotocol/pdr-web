import { FixedRateExchangeABI } from '@/metadata/abis/FixedRateExchangeABI';
import { ethers } from 'ethers';

class FixedRate {
  public provider: ethers.providers.Provider;
  public contractAddress: string;
  public contractInstance: ethers.Contract;

  constructor(address: string, provider: ethers.providers.Provider) {
    this.provider = provider
    this.contractAddress = ethers.utils.getAddress(address);
    this.contractInstance = new ethers.Contract(
      this.contractAddress,
      FixedRateExchangeABI,
      provider
    );
  }

  async getDtPrice(exchangeId: string): Promise<any | Error> {
    try {
      const result = await this.contractInstance.calcBaseInGivenOutDT(
        exchangeId, 
        ethers.utils.parseEther('1'), 
        0);
      return result;
    } catch (e: any) {
      console.error(e);
      return e;
    }
  }

  async buyDt(user: ethers.Wallet, exchangeId: string, baseTokenAmount: number): Promise<ethers.ContractReceipt | Error> {
    try {
      // TODO - Fix gas estimation
      // const gasPrice: BigNumber = await this.provider.getGasPrice();
      // const gasLimit: BigNumber = await this.contractInstance.estimateGas.buyDT(
      //   exchangeId,
      //   ethers.utils.parseEther('1'), 
      //   baseTokenAmount, 
      //   ethers.constants.AddressZero, 
      //   0);

      const tx = await this.contractInstance.connect(user).buyDT(
        exchangeId,
        ethers.utils.parseEther('1'),
        baseTokenAmount, 
        ethers.constants.AddressZero, 
        0
        // {gasLimit: gasLimit, gasPrice: gasPrice}
      );
      console.log(`Bought 1 DT tx: ${tx.hash}`);
      const receipt = await tx.wait();
      return receipt;
    } catch (e: any) {
      console.error(e);
      return e;
    }
  }
}

export default FixedRate;