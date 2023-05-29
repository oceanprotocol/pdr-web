import { ethers } from 'ethers';
import networksData from '../metadata/networks.json';

export const getNetworkName = async (chainId: number) => {
  return networksData.find((data) => data.chainId == chainId)?.name
}

export const getProvider = (env: string) => {
  let url: string = '';
  let networkName: string = '';
  
  if( env == 'mock' || env == 'development' ) {
    url = 'http://localhost:8545';
    networkName = '';
  } else if( env == 'staging' ) {
    url = process.env.NEXT_PUBLIC_PREDICTOOR_RPC || '';
    networkName = 'goerli';
  }
  else if( env == 'production' ) {
    url = process.env.NEXT_PUBLIC_PREDICTOOR_RPC || '';
    networkName = 'homstead';
  }
  
  return new ethers.providers.JsonRpcProvider("http://localhost:8545");
  
  // TODO - Create appropriate RPC Provider for network
  // const rpcProvider = new ethers.providers.JsonRpcProvider();

  // if (networkName != '') {
  //   // infura provider
  //   const infuraProvider = new ethers.providers.InfuraProvider(
  //     networkName,
  //     rpcProvider
  //   );

  //   return infuraProvider;
  // }
  
  // return rpcProvider;
}