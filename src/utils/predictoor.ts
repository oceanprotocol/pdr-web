import { ethers } from 'ethers';
import predictoorABI from '../metadata/abis/predictoorABI';

export async function epoch(
  rpcProvider: ethers.providers.JsonRpcProvider,
  address: string
) {
  try {
    const contract = new ethers.Contract(address, predictoorABI, rpcProvider);
    const epoch = await contract.epoch();
    return epoch;
  } catch (e: any) {
    console.log(`ERROR: Failed to get epoch: ${e.message}`)
  }
}

export async function get_agg_predval(
  rpcProvider: ethers.providers.JsonRpcProvider,
  address: string,
  epoch: number
) {
  try {
    const contract = new ethers.Contract(address, predictoorABI, rpcProvider);
    const blocks_per_epoch: number = await contract.blocks_per_epoch;
    const blockNum: number = epoch * blocks_per_epoch;

    const {
      predvalNumer,
      predvalDenom
    }: { predvalNumer: number; predvalDenom: number } = await contract.get_agg_predval(blockNum);

    const confidence: number = predvalNumer / predvalDenom;
    const dir: number = confidence > 0.5 ? 1 : 0
    const stake: number = predvalDenom

    return { blockNum, confidence, dir, stake }
  } catch (e: any) {
    console.log(`ERROR: Failed to get epoch: ${e.message}`)
  }
}
