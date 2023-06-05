import { ERC20Template3ABI } from '@/metadata/abis/ERC20Template3ABI';
import { BigNumber, ethers } from 'ethers';
import { getEventFromTx, stringToBytes32 } from "../utils";
import FixedRateExchange from './FixedRateExchange';
import Token from './Token';

class Predictoor {
    public provider: ethers.providers.JsonRpcProvider;
    public address: string;
    public instance: ethers.Contract|null;
    public FRE: FixedRateExchange|null;
    public exchangeId: BigNumber;
    public token: Token|null;

    public constructor(
        address: string, 
        provider: ethers.providers.JsonRpcProvider) {
        this.address = address;
        this.token = null;
        this.provider = provider;
        this.instance = null;
        this.FRE = null;
        this.exchangeId = BigNumber.from(0);
    }

    async init() {
        this.instance = new ethers.Contract(
            this.address,
            ERC20Template3ABI,
            this.provider
        );

        // console.log("init instance: ", this.instance);
          
        const stakeToken = await this.instance?.stakeToken();
        this.token = new Token(stakeToken, this.provider);
        // const blocksPerEpoch = await this.instance?.blocksPerEpoch()
        // console.log("blocksPerEpoch: ", blocksPerEpoch);

        const fixedRates = await this.getExchanges();
        if (fixedRates) {
            const [fixedRateAddress, exchangeId]: [string, BigNumber] = fixedRates[0];
            const exchange = new FixedRateExchange(fixedRateAddress, this.provider);
            this.FRE = exchange;
            this.exchangeId = exchangeId;
        }
    }

    async isValidSubscription(address: string): Promise<boolean> {
        console.log("isValidSubscription: ", this.instance);

        return this.instance?.isValidSubscription(address);
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
        console.log("buyAndStartSubscription: ", this.instance);
        try {
            const dtPrice: any = await this.FRE?.getDtPrice(
                this.exchangeId?.toString()
            );
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
                this.FRE?.address || '',
                ethers.utils.formatEther(baseTokenAmount),
                this.provider
            );
            console.log(">>>> Buy DT Now...! <<<<");
            const result = await this.FRE?.buyDt(
                user,
                this.exchangeId?.toString(), 
                baseTokenAmount
            );
            
            console.log(">>>> Bought DT! <<<<", result);
            const providerFees = this.getEmptyProviderFee();
            
            // TODO - FIX ESTIMATE GAS
            // console.log("call Estimate Gas...");
            // const gasLimit: BigNumber|undefined = await this.instance?.estimateGas.startOrder(
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
            const tx = await this.instance?.connect(user).startOrder(
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
        return this.instance?.getFixedRates();
    }

    getStakeToken(): Promise<string> {
        return this.instance?.stakeToken();
    }

    async getCurrentEpoch(): Promise<number> {
        const curEpoch: BigNumber = await this.instance?.curEpoch();
        const formattedEpoch: number = parseInt(ethers.utils.formatUnits(curEpoch, 0));
        return formattedEpoch;
    }

    async getBlocksPerEpoch(): Promise<number> {
        const blocksPerEpoch: BigNumber = await this.instance?.blocksPerEpoch();
        const formattedBlocksPerEpoch: number = parseInt(ethers.utils.formatUnits(blocksPerEpoch,0));
        return formattedBlocksPerEpoch;
    }

    async getAggPredval(block: number, user: ethers.Wallet): Promise<object | null> {
        try {
            if( this.instance ) {
                console.log("Reading contract values...");
                const [nom, denom] = await this.instance.connect(user).getAggPredval(block);
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
            }

            return null;
        } catch (e) {
            console.log("Failed to call getAggPredval");
            console.log(e);
            return null;
        }
    }
}

export default Predictoor;