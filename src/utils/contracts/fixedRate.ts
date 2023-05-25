import { FixedRateExchangeABI } from '@/metadata/abis/fixedRateExchangeABI';
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

  async getDtPrice(exchangeId: string): Promise<number | Error> {
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

  async buyDt(exchangeId: string, baseTokenAmount: number): Promise<ethers.ContractReceipt | Error> {
    try {
      const tx = await this.contractInstance.buyDT(
          exchangeId,
          ethers.utils.parseEther('1'), 
          baseTokenAmount, 
          ethers.constants.AddressZero, 
          0)
        .connect(ethers.provider.getSigner())
        .gasPrice(gasPrice)
        .transact();
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