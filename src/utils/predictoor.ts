// import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { ethers } from 'ethers';
import { IERC20ABI } from '../metadata/abis/IERC20ABI';
import { predictoorABI } from '../metadata/abis/predictoorABI';
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

async function epoch(
  rpcProvider: ethers.providers.JsonRpcProvider,
  address: string
) {
  try {
    const contract = new ethers.Contract(address, predictoorABI, rpcProvider)
    const epoch = await contract.epoch()
    return epoch
  } catch (e: any) {
    console.log(`ERROR: Failed to get epoch: ${e.message}`)
  }
}

async function get_agg_predval(
  rpcProvider: ethers.providers.JsonRpcProvider,
  address: string,
  epoch: number
) {
  try {
    const contract = new ethers.Contract(address, predictoorABI, rpcProvider)
    const blocks_per_epoch: number = await contract.blocks_per_epoch
    const blockNum: number = epoch * blocks_per_epoch

    const {
      predvalNumer,
      predvalDenom
    }: { predvalNumer: number; predvalDenom: number } =
      await contract.get_agg_predval(blockNum)

    const confidence: number = predvalNumer / predvalDenom
    const dir: number = confidence > 0.5 ? 1 : 0
    const stake: number = predvalDenom

    return { blockNum, confidence, dir, stake }
  } catch (e: any) {
    console.log(`ERROR: Failed to get epoch: ${e.message}`)
  }
}

interface OrderStartedEvent {
  datatoken: string;
  consumer: string;
  payer: string;
  amount: number;
  serviceIndex: number;
  timestamp: number;
  publishMarketAddress: string;
  blockNumber: number;
}

async function signMessage(message: string, address: string) {
  let signedMessage = await web3.eth.sign(message, address)
  signedMessage = signedMessage.substr(2) // remove 0x
  const r = '0x' + signedMessage.slice(0, 64)
  const s = '0x' + signedMessage.slice(64, 128)
  const v = '0x' + signedMessage.slice(128, 130)
  const vDecimal = web3.utils.hexToNumber(v)
  return { v, r, s };
}

function getEventFromTx(txReceipt: any, eventName: string) {
  return txReceipt.events.filter((log: any) => {
      return log.event === eventName
  })[0]
}

// ERC20Templat3.test.js
// it("#startOrder - user should succeed to call startOrder on a ERC20 with 5 USDC publishFee, providerFee is ZERO and 5 USDC consumeFee", async () => {
async function startOrder(
  config: any, 
  user: ethers.Wallet, 
  provider: ethers.providers.Provider
  ): Promise<OrderStartedEvent|Error> {

const datatoken = new ethers.Contract(
    config.datatokenAddress, 
    predictoorABI, 
    provider
  );
  const balance = await datatoken.balanceOf(user.address) >= web3.utils.toWei("1")
      
  const predictoorWithPublishFee = new ethers.Contract(
    config.predictoorAddressWithPublishFee, 
    predictoorABI,
    provider
  );
  
  const publishFee = await predictoorWithPublishFee
      .connect(user)
      .getPublishingMarketFee();
  
  const IERC20Contract = new ethers.Contract(
    publishFee[1],
    IERC20ABI,
    provider
  );

  const consumer = user.address; // from pk in .env
  const serviceIndex = config.serviceIndex; // deployed predictoor service index
  const providerFeeAddress = config.OPFCommunityFeeCollector; // marketplace fee Collector
  const providerFeeAmount = 0; // fee to be collected on top, requires approval
  const providerFeeToken = config.oceanAddress; // token address for providerFeeToken
  const consumeMarketFeeAddress = config.OPFCommunityFeeCollector; // marketplace fee Collector
  const consumeMarketFeeAmount = publishFee[2]; // fee to be collected on top, requires approval
  const consumeMarketFeeToken = IERC20Contract.address; // token address for consumeMarketFeeToken

  // we approve the erc20Token contract to pull feeAmount
  await IERC20Contract
      .connect(user)
      .approve(predictoorWithPublishFee.address, publishFee[2].add(consumeMarketFeeAmount));

  //sign provider data
  const providerData = JSON.stringify({ "timeout": 0 })
  const providerValidUntil = 0;
  const message = ethers.utils.solidityKeccak256(
      ["bytes", "address", "address", "uint256", "uint256"],
      [
          ethers.utils.hexlify(ethers.utils.toUtf8Bytes(providerData)),
          providerFeeAddress,
          providerFeeToken,
          providerFeeAmount,
          providerValidUntil
      ]
  );

  const signedMessage = await signMessage(message, providerFeeAddress);

  const tx = await predictoorWithPublishFee
      .connect(user)
      .startOrder(
          consumer,
          serviceIndex,
          {
              providerFeeAddress: providerFeeAddress,
              providerFeeToken: providerFeeToken,
              providerFeeAmount: providerFeeAmount,
              v: signedMessage.v,
              r: signedMessage.r,
              s: signedMessage.s,
              providerData: ethers.utils.hexlify(ethers.utils.toUtf8Bytes(providerData)),
              validUntil: providerValidUntil
          },
          {
              consumeMarketFeeAddress: consumeMarketFeeAddress,
              consumeMarketFeeToken: consumeMarketFeeToken,
              consumeMarketFeeAmount: consumeMarketFeeAmount,
          }
      );

  const txReceipt: any = await tx.wait();
  const orderStartedEvent: OrderStartedEvent = getEventFromTx(txReceipt, 'OrderStarted')
  
  if( orderStartedEvent ) {
    return {
      datatoken: config.datatokenAddress,
      consumer: orderStartedEvent.consumer,
      payer: orderStartedEvent.payer,
      amount: orderStartedEvent.amount,
      serviceIndex: orderStartedEvent.serviceIndex,
      timestamp: orderStartedEvent.timestamp,
      publishMarketAddress: orderStartedEvent.publishMarketAddress,
      blockNumber: orderStartedEvent.blockNumber
    }
  } else {
    // Handle any errors that occurred during the query
    console.error('Error starting order.');
    return Error('Error starting order.')
  }
}

function buildQuery(datatokenId: string, userId: string): string {
  const query = `
    query GetFilteredOrders() {
      orders(
        orderBy: createdTimestamp
        orderDirection: desc
        first: 1000
        filter: {
          datatoken: { id: $datatokenId }
          consumer: { id: $userId }
        }
      ) {
        datatoken {
          id
        }
        consumer {
          id
        }
        createdTimestamp
      }
    }
  `;
  
  // Replace the variables in the query string
  let finalQuery = query.replace('$datatokenId', datatokenId);
  finalQuery = finalQuery.replace('$userId', process.env.NEXT_PUBLIC_PREDICTOOR_ADDRESS?.toString() || '');

  return finalQuery;
}

const deltaTimeInHours = 24;
const deltaTimeInMillis = deltaTimeInHours * 60 * 60 * 1000;
const scheduleOverlapInMillis = 5 * 60 * 1000;

function canStartOrder(lastOrderTimestamp: number, deltaTime: number): boolean {
  const currentTime = Date.now();
  return currentTime - lastOrderTimestamp >= deltaTime;
}

async function consumePredictoor(
  chainConfig: any,
  tokenprediction: any,
  user: ethers.Wallet, 
  provider: ethers.providers.JsonRpcProvider
  ): Promise<OrderStartedEvent|Error|null|object> {
    
    const query = buildQuery(tokenprediction.predictoorAddress, user.address);

    // const client = new ApolloClient({
    //   uri: chainConfig.subgraph,
    //   cache: new InMemoryCache(),
    // });
  
    // const { data } = await client.query({
    //   query: gql(query)
    // });

    // const orders: any = data.orders; // Replace `Order` with your specific type

    // // Find the latest order from the user
    // const latestOrder: any = orders.find((order: any) => order.consumer.id === user.address);
    // const lastOrderTimestamp: any = latestOrder ? latestOrder.createdTimestamp : 0;

    // const canStartAnotherOrder: boolean = canStartOrder(lastOrderTimestamp, deltaTimeInMillis);
    // if (canStartAnotherOrder) {
    //   // Calculate the time remaining until the next order can be placed with the overlap
    //   const nextOrderTimestamp = lastOrderTimestamp + deltaTimeInMillis + scheduleOverlapInMillis;
    //   const timeRemainingInMillis = nextOrderTimestamp - Date.now();

    //   if (timeRemainingInMillis <= 0) {
    //     const results = await startOrder(
    //       tokenprediction.predictoorAddress,
    //       user,
    //       provider
    //     );

    //     return results;
    //   }
    // }

    return {
      query: query,
      data: null,
      chainConfig: chainConfig,
      tokenprediction: tokenprediction,
    };
}

export {
  epoch,
  get_agg_predval,
  consumePredictoor
};
