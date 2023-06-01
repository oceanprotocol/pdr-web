import { FixedRateExchangeABI } from '@/metadata/abis/FixedRateExchangeABI';
import { ethers } from 'ethers';

class FixedRateExchange {
  public provider: ethers.providers.Provider;
  public address: string;
  public instance: ethers.Contract;

  constructor(address: string, provider: ethers.providers.Provider) {
    this.provider = provider
    this.address = ethers.utils.getAddress(address);
    this.instance = new ethers.Contract(
      this.address,
      FixedRateExchangeABI,
      provider
    );
  }

  async getDtPrice(exchangeId: string): Promise<any | Error> {
    try {
      const result = await this.instance.calcBaseInGivenOutDT(
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
      // const gasLimit: BigNumber = await this.instance.estimateGas.buyDT(
      //   exchangeId,
      //   ethers.utils.parseEther('1'), 
      //   baseTokenAmount, 
      //   ethers.constants.AddressZero, 
      //   0);

      const tx = await this.instance.connect(user).buyDT(
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

export default FixedRateExchange;