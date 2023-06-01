import Predictor from '@/utils/contracts/Predictoor';
import { ethers } from 'ethers';
import moment from 'moment';
import { getAllInterestingPredictionContracts, getFilteredOrders } from './subgraph';

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

// TODO - Harden this function.
// TODO - Split it into smaller parts.
// TODO - Add more tests around possible (dependency: queries subgraph)
async function consumePredictoorSubscription(
  chainConfig: any,
  predictoorProps: any,
  user: ethers.Wallet, 
  provider: ethers.providers.JsonRpcProvider
  ): Promise<OrderStartedEvent|Error|null|object> {
    
    try {
      // console.log("init PredictoorContract: ", predictoorProps, provider ); 
      const predictorContract = new Predictor(
        predictoorProps.address,
        provider
      );
      
      await predictorContract.init();
      const subscriptionValid = await predictorContract.isValidSubscription(user.address);
      // console.log("subscriptionValid: ", subscriptionValid);

      if( !subscriptionValid ) {
        const receipt = await predictorContract.buyAndStartSubscription(user)
          
        return {
          tx: receipt.hash,
          lastOrderTimestamp: moment.now(),
        }
      }
      
      // console.log("chainConfig: ", chainConfig.subgraph);
      // console.log("predictoorProps: ", predictoorProps);
      // console.log("user: ", user.address);
      const orders: any = await getFilteredOrders(
        chainConfig.subgraph,
        predictoorProps.address,
        user.address
      );

      // console.log("orders: ", orders);
            
      // Find the latest order from the user
      const latestOrder: any = orders.find((order: any) => 
        ethers.utils.getAddress(order.consumer.id) === user.address
      );
      const lastOrderTimestamp: any = latestOrder ? moment.unix(latestOrder.createdTimestamp) : null;
      
      // console.log("latestOrder: ", latestOrder);
      // console.log("lastOrderTimestamp: ", lastOrderTimestamp);

      // Calculate next consume based on predictoorProps.subscription_lifetime_hours
      const deltaTimeInMillis = predictoorProps.blocksPerSubscription * 60 * 60 * 1000;
      // console.log("blockPerSubscription: ", predictoorProps.blocksPerSubscription);
      // console.log("deltaTimeInMillis: ", deltaTimeInMillis);
      
      const canStartAnotherOrder: boolean = canStartOrder(lastOrderTimestamp, deltaTimeInMillis);
      // console.log("canStartAnotherOrder: ", canStartAnotherOrder);
      
      if (canStartAnotherOrder) {
        // Calculate the time remaining until the next order can be placed with the overlap
        const nextOrderTimestamp = moment(lastOrderTimestamp).add(deltaTimeInMillis, 'milliseconds').subtract(scheduleOverlapInMillis, 'milliseconds');
        const timeRemainingInMillis = nextOrderTimestamp.diff(moment(), 'milliseconds');

        if (timeRemainingInMillis <= 0) {

          // console.log("buyAndStartSubscrption: ", user);
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

async function updatePredictoorSubscriptions(
  config: any,
  user: ethers.Wallet, 
  provider: ethers.providers.JsonRpcProvider
): Promise<OrderStartedEvent|Error|null|object> {   
    try {
      // retrieve all contract details from subgraph
      const predictoorContract: Record<string, any> = await getAllInterestingPredictionContracts(
        config.subgraph
      );

      // iterate through all deployed predictoors and buy a subscription
      let results = [];
      for (const [key, predictoorProps] of Object.entries(predictoorContract)) {
        const result = await consumePredictoorSubscription(
          config,
          predictoorProps,
          user, 
          provider
        );
        
        if(result) {
          results.push(result);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }    

    return null;
}

export {
  consumePredictoorSubscription,
  updatePredictoorSubscriptions
};

