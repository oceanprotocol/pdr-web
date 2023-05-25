import { ERC20Template3ABI } from '@/metadata/abis/ERC20Template3ABI';
import { ethers } from 'ethers';
import FixedRate from './fixedRate';
import Token from './token';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"
const user = process.env.NEXT_PUBLIC_USER_ADDRESS;

class PredictorContract {
    public provider: ethers.providers.Provider;
    public contractAddress: string;
    public contractInstance: ethers.Contract;
    public token: Token;

    constructor(address: string, provider: ethers.providers.Provider) {
        this.provider = provider;
        this.contractAddress = ethers.utils.getAddress(address);
        this.contractInstance = new ethers.Contract(
            address, 
            ERC20Template3ABI,
            provider
        );
        const stakeToken = this.getStakeToken();
        this.token = new Token(stakeToken, provider);
    }

    async isValidSubscription(): Promise<boolean> {
        return await this.contractInstance.isValidSubscription(user);
    }

    getEmptyProviderFee(): any {
        return {
            providerFeeAddress: ZERO_ADDRESS,
            providerFeeToken: ZERO_ADDRESS,
            providerFeeAmount: 0,
            v: 0,
            r: 0,
            s: 0,
            validUntil: 0,
            providerData: 0,
        };
    }

    stringToBytes32(data: string): string {
        if (data.length > 32) {
            return data.slice(0, 32);
        } else {
            return data.padEnd(32, '0');
        }
    }

    async buyAndStartSubscription(
        user: ethers.Wallet, 
        provider: ethers.providers.Provider
    ): Promise<any> {
        const fixedRates = this.getExchanges();
        if (!fixedRates) {
            return;
        }
        const [
            fixedRateAddress, 
            exchangeId
        ]: [string, number] = fixedRates[0];
        const exchange = new FixedRate(fixedRateAddress);
        const baseTokenAmount: number = await exchange.getDtPrice(exchangeId);
        console.log(`Buying 1.0 DT with price: ${baseTokenAmount}`);
        await this.token.approve(fixedRateAddress, baseTokenAmount);
        await exchange.buyDt(exchangeId, baseTokenAmount);
        const gasPrice = await provider.getGasPrice();
        const providerFees = this.getEmptyProviderFee();
        try {
            console.log("Calling startOrder");
            const tx = await this.contractInstance.startOrder(
                user, 
                0, 
                [
                    ZERO_ADDRESS, 
                    ZERO_ADDRESS, 
                    0, 
                    0, 
                    this.stringToBytes32(''), 
                    this.stringToBytes32(''),
                    providerFees.validUntil,
                    ethers.constants.HashZero
                ],
                [
                    ZERO_ADDRESS, 
                    ZERO_ADDRESS, 
                    0
                ], 
                { gasPrice }
            );
            console.log(`Subscription tx: ${tx.hash}`);
            const receipt = await tx.wait();
            return receipt;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    getExchanges(): [string, number][] {
        return this.contractInstance.getFixedRates();
    }

    getStakeToken(): string {
        return this.contractInstance.stakeToken();
    }

    getCurrentEpoch(): Promise<number> {
        return this.contractInstance.curEpoch();
    }

    getBlocksPerEpoch(): Promise<number> {
        return this.contractInstance.blocksPerEpoch();
    }

    async getAggPredval(block: number): Promise<object | null> {
        if (!(await this.isValidSubscription())) {
            console.log("Buying a new subscription...");
            await this.buyAndStartSubscription();
            await sleep(1000);
        }
        try {
            console.log("Reading contract values...");
            const [nom, denom] = await this.contractInstance.getAggPredval(block);
            console.log(`Got ${nom} and ${denom}`);
            if (denom === 0) {
                return null;
            }

            const confidence: number = nom / denom
            const dir: number = confidence > 0.5 ? 1 : 0
            const stake: number = denom
        
            return { block, confidence, dir, stake };
        } catch (e) {
            console.log("Failed to call getAggPredval");
            console.log(e);
            return null;
        }
    }
}

export default PredictorContract;