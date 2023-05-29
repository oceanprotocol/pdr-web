import PredictorContract from '@/utils/contracts/predictoor';
import { ethers } from 'ethers';
import moment from 'moment';
import { NextApiRequest, NextApiResponse } from 'next';
import chainConfig from '../../../metadata/config.json';
import { getProvider } from '../../../utils/network';
import { getAllInterestingPredictionContracts, getFilteredOrders } from '../../../utils/subgraph';

const scheduleOverlapInMillis = 5 * 60 * 1000;

function canStartOrder(lastOrderTimestamp: number, deltaTime: number): boolean {
  if(lastOrderTimestamp === null) {
    return true;
  }

  const currentTime = Date.now();
  return currentTime - lastOrderTimestamp >= deltaTime;
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

async function consumePredictoor(
  chainConfig: any,
  predictoorProps: any,
  user: ethers.Wallet, 
  provider: ethers.providers.JsonRpcProvider
  ): Promise<OrderStartedEvent|Error|null|object> {
    
    try {
      // console.log("init PredictoorContract: ", predictoorProps, provider ); 
      const predictorContract = new PredictorContract(
        predictoorProps.address,
        provider
      );
      
      await predictorContract.init();
      const subscriptionValid = await predictorContract.isValidSubscription(user.address);
      console.log("subscriptionValid: ", subscriptionValid);

      if( !subscriptionValid ) {
        const receipt = await predictorContract.buyAndStartSubscription(user)
          
        return {
          tx: receipt.hash,
          lastOrderTimestamp: moment.now(),
        }
      }
      
      console.log("chainConfig: ", chainConfig.subgraph);
      console.log("predictoorProps: ", predictoorProps);
      console.log("user: ", user.address);
      const orders: any = await getFilteredOrders(
        chainConfig.subgraph,
        predictoorProps.address,
        user.address
      );

      console.log("orders: ", orders);
            
      // Find the latest order from the user
      const latestOrder: any = orders.find((order: any) => 
        ethers.utils.getAddress(order.consumer.id) === user.address
      );
      const lastOrderTimestamp: any = latestOrder ? moment.unix(latestOrder.createdTimestamp) : null;
      
      console.log("latestOrder: ", latestOrder);
      console.log("lastOrderTimestamp: ", lastOrderTimestamp);

      // Calculate next consume based on predictoorProps.subscription_lifetime_hours
      const deltaTimeInMillis = predictoorProps.blocksPerSubscription * 60 * 60 * 1000;
      console.log("blockPerSubscription: ", predictoorProps.blocksPerSubscription);
      console.log("deltaTimeInMillis: ", deltaTimeInMillis);
      
      const canStartAnotherOrder: boolean = canStartOrder(lastOrderTimestamp, deltaTimeInMillis);
      console.log("canStartAnotherOrder: ", canStartAnotherOrder);
      
      if (canStartAnotherOrder) {
        // Calculate the time remaining until the next order can be placed with the overlap
        const nextOrderTimestamp = moment(lastOrderTimestamp).add(deltaTimeInMillis, 'milliseconds').subtract(scheduleOverlapInMillis, 'milliseconds');
        const timeRemainingInMillis = nextOrderTimestamp.diff(moment(), 'milliseconds');

        if (timeRemainingInMillis <= 0) {

          console.log("buyAndStartSubscrption: ", user);
          const receipt = await predictorContract.buyAndStartSubscription(user)
          
          return {
            tx: receipt.hash,
            orders: orders,
            latestOrder: latestOrder,
            lastOrderTimestamp: moment.now(),
            nextOrderTimestamp: nextOrderTimestamp,
            canStartAnotherOrder: canStartAnotherOrder,
            timeRemainingInHours: timeRemainingInMillis / (60 * 60 * 1000),
            timeRemainingInDays: timeRemainingInMillis / deltaTimeInMillis
          }
        }
      } else {
        return {
          orders: orders,
          latestOrder: latestOrder,
          lastOrderTimestamp: lastOrderTimestamp,
          canStartAnotherOrder: canStartAnotherOrder,
          timeRemainingInHours: null,
          timeRemainingInDays: null
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }    

    return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Set appropriate CORS headers to allow external requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    // Check if the admin password is provided
    const adminPassword = req.body.adminPassword || req.headers['x-admin-password'];
    if (adminPassword !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD ) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const env = process.env.NEXT_PUBLIC_ENV?.toString() as keyof typeof chainConfig;
    const config = chainConfig[env];

    const predictoorPK = process.env.NEXT_PUBLIC_PREDICTOOR_PK || '';
    const provider = getProvider(env);
    
    const predictoorWallet = new ethers.Wallet(predictoorPK, provider);
    const predictoorContract: Record<string, any> = await getAllInterestingPredictionContracts(
      config.subgraph
    );

    console.log("predictoorContract: ", predictoorContract);

    // get data from record inside predictoorContracts and call consumePredictoor
    let results = [];
    for (const [key, predictoorProps] of Object.entries(predictoorContract)) {
      const result = await consumePredictoor(
        config,
        predictoorProps,
        predictoorWallet, 
        provider
      );
      
      if(result) {
        results.push(result);
      }
    }

    // Send a JSON response
    res.status(200).json({ 
      message: 'Feeds consumed successfully',
      // predictoorRPC: predictoorRPC, 
      // predictoorPK: predictoorPK,
      // provider: provider,
      // infuraProviderETH: infuraProviderETH,
      // predictoorWallet: predictoorWallet,
      results: results
    });

  } catch (error) {
    // Handle any errors that occurred during the process
    console.error('Error consuming feeds:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}