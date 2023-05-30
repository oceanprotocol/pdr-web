import { ERC20Template3ABI } from '@/metadata/abis/ERC20Template3ABI';
import { BigNumber, ethers } from 'ethers';
import { getEventFromTx, stringToBytes32 } from "../utils";
import FixedRate from './FixedRate';
import Token from './Token';

class PredictorContract {
    public provider: ethers.providers.JsonRpcProvider;
    public contractAddress: string;
    public contractInstance: ethers.Contract|null;
    public token: Token|null;

    public constructor(
        address: string, 
        provider: ethers.providers.JsonRpcProvider) {
        this.token = null;
        this.provider = provider;
        this.contractAddress = address;
        this.contractInstance = null;
    }

    async init() {
        this.contractInstance = new ethers.Contract(
            this.contractAddress,
            ERC20Template3ABI,
            this.provider
        );

        // console.log("init contractInstance: ", this.contractInstance);
          
        const stakeToken = await this.contractInstance?.stakeToken();
        this.token = new Token(stakeToken, this.provider);
        // const blocksPerEpoch = await this.contractInstance?.blocksPerEpoch()
        // console.log("blocksPerEpoch: ", blocksPerEpoch);
    }

    async isValidSubscription(address: string): Promise<boolean> {
        console.log("isValidSubscription: ", this.contractInstance);

        return this.contractInstance?.isValidSubscription(address);
    }

    getEmptyProviderFee(): any {
        return {
            providerFeeAddress: ethers.constants.AddressZero,
            providerFeeToken: ethers.constants.AddressZero,
            providerFeeAmount: 0,
            v: 0,
            r: 0,
            s: 0,
            validUntil: 0,
            providerData: 0,
        };
    }

    // TODO - Change to buyDT & startOrder, then offer a wrapper
    async buyAndStartSubscription(user: ethers.Wallet): Promise<any> {
        console.log("buyAndStartSubscription: ", this.contractInstance);

        const fixedRates = await this.getExchanges();
        if (!fixedRates) {
            return;
        }
        console.log("FREs: ", fixedRates);
        
        try {
            const [fixedRateAddress, exchangeId]: [string, number] = fixedRates[0];
            const exchange = new FixedRate(fixedRateAddress, this.provider);
            const dtPrice: any = await exchange.getDtPrice(exchangeId.toString());
            const baseTokenAmount = dtPrice.baseTokenAmount;
            
            if( !baseTokenAmount || 
                baseTokenAmount instanceof Error ||
                !this.token ) {
                return Error("Assert token requirements.");
            }
            
            console.log("dtPrice: ", dtPrice);
            console.log("Buying 1.0 DT with price: ", ethers.utils.formatEther(baseTokenAmount));
            await this.token.approve(
                user,
                fixedRateAddress,
                ethers.utils.formatEther(baseTokenAmount),
                this.provider
            );
            console.log(">>>> Buy DT Now...! <<<<");
            const result = await exchange.buyDt(
                user,
                exchangeId.toString(), 
                baseTokenAmount
            );
            
            console.log(">>>> Bought DT! <<<<", result);
            const providerFees = this.getEmptyProviderFee();
            
            // TODO - FIX ESTIMATE GAS
            // console.log("call Estimate Gas...");
            // const gasLimit: BigNumber|undefined = await this.contractInstance?.estimateGas.startOrder(
            //     user, 
            //     0, 
            //     [
            //         ZERO_ADDRESS, 
            //         ZERO_ADDRESS, 
            //         0, 
            //         0, 
            //         stringToBytes32(''), 
            //         stringToBytes32(''),
            //         providerFees.validUntil,
            //         ethers.constants.HashZero
            //     ],
            //     [
            //         ZERO_ADDRESS, 
            //         ZERO_ADDRESS, 
            //         0
            //     ], 
            //     { gasPrice }
            // );
    
            console.log(">>> startOrder");
            const tx = await this.contractInstance?.connect(user).startOrder(
                user.address, 
                0,
                [
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero,
                    0, 
                    0, 
                    stringToBytes32(''), 
                    stringToBytes32(''),
                    providerFees.validUntil,
                    ethers.constants.HashZero
                ],
                [
                    ethers.constants.AddressZero,
                    ethers.constants.AddressZero,
                    0
                ]
            );
            
            console.log("Subscription tx:", tx.hash);
            const receipt = await tx.wait();
            console.log("Receipt receipt: ", receipt);
            let event = getEventFromTx(receipt, 'OrderStarted')
            console.log("event: ", event);
            
            return receipt;
        } catch (e: any) {
            console.error(e);
            return null;
        }
    }

    getExchanges(): Promise<[string, BigNumber][]> {
        return this.contractInstance?.getFixedRates();
    }

    getStakeToken(): Promise<string> {
        return this.contractInstance?.stakeToken();
    }

    getCurrentEpoch(): Promise<BigNumber> {
        return this.contractInstance?.curEpoch();
    }

    getBlocksPerEpoch(): Promise<BigNumber> {
        return this.contractInstance?.blocksPerEpoch();
    }

    async getAggPredval(block: number, user: ethers.Wallet): Promise<object | null> {
        try {
            console.log("Reading contract values...");
            const [nom, denom] = await this.contractInstance?.connect(user).getAggPredval(block);
            console.log(`Got ${nom} and ${denom}`);
            
            if (denom === 0) {
                return null;
            }

            const confidence: number = nom / denom
            const dir: number = confidence > 0.5 ? 1 : 0
            const stake: number = denom
        
            return { 
                nom: nom,
                denom: denom,
                confidence: confidence,
                dir: dir,
                stake: stake
            };
        } catch (e) {
            console.log("Failed to call getAggPredval");
            console.log(e);
            return null;
        }
    }
}

export default PredictorContract;