import axios from 'axios';

async function querySubgraph(subgraphUrl: string, query: string): Promise<any> {
  try {
    const response = await axios.post(subgraphUrl, { query });
    return response.data;
  } catch (error: any) {
    console.error(`Query failed. Url: ${subgraphUrl}. Error: ${error}`);
    throw new Error('Failed to query subgraph');
  }
}

async function getAllInterestingPredictionContracts(
  subgraphURL: string,
): Promise<Record<string, any>> {
    const chunkSize = 1000;
    let offset = 0;
    const contracts: Record<string, any> = {};
    
    const getAllContracts = true;
    while (getAllContracts === true) {
      const query = `
        {
          predictContracts(skip: ${offset}, first: ${chunkSize}) {
            id
            token {
              id
              name
              symbol
            }
            blocksPerEpoch
            blocksPerSubscription
            truevalSubmitTimeoutBlock
          }
        }
      `;
      offset += chunkSize;
      
      try {
        const result = await querySubgraph(subgraphURL, query);
        const predictContracts = result.data.predictContracts;
        
        if (predictContracts.length === 0) {
          break;
        }
        
        for (const item of predictContracts) {
          contracts[item.id] = {
            name: item.token.name,
            address: item.id,
            symbol: item.token.symbol,
            blocksPerEpoch: item.blocksPerEpoch,
            blocksPerSubscription: item.blocksPerSubscription,
            last_submitted_epoch: 0
          };
        }
      } catch (e: any) {
        console.error(e);
        return {};
      }
    }
    
    return contracts;
  }

async function getFilteredOrders(
    subgraphURL: string,
    datatokenId:string, 
    userId:string
): Promise<string|undefined> {
    const query = `
        query GetFilteredOrders {
            orders(
                where: {
                datatoken_in: ["$datatokenId"]
                consumer_in: ["$userId"]
                }
                orderBy: createdTimestamp
                orderDirection: desc
                first: 1000
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
    let finalQuery = query.replace('$datatokenId', datatokenId.toLowerCase());
    finalQuery = finalQuery.replace('$userId', userId.toLowerCase());

    try {
        const result = await querySubgraph(subgraphURL, finalQuery);
        const orders: any = result.data.orders;
        return orders;
    } catch (e: any) {
    console.error(e);
    }
    
    return undefined;
}

export {
  getAllInterestingPredictionContracts,
  getFilteredOrders
};

