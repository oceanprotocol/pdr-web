import { useContractsContext } from '@/contexts/ContractsContext'
import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { useEffect, useState } from 'react'
import Predictoor from '../utils/contracts/Predictoor'
// import { PredictoorContracts } from '../contexts/ContractsContext'
import Table from '../elements/Table'
import config from '../metadata/config.json'
import styles from '../styles/AssetsTable.module.css'
import { TokenData, getTokenData } from '../utils/coin'
import { updatePredictoorSubscriptions } from '../utils/predictoors'
import { getAllInterestingPredictionContracts } from '../utils/subgraph'
import AmountInput from './AmountInput'
import Coin from './Coin'
import Slot, { SlotState } from './Slot'

const tableColumns = [
  {
    Header: 'Coin',
    accessor: 'coin'
  },
  {
    Header: 'Price',
    accessor: 'price'
  },
  {
    Header: 'Amount',
    accessor: 'amount'
  },
  {
    Header: 'Next',
    accessor: 'next'
  },
  {
    Header: 'Live',
    accessor: 'live'
  },
  {
    Header: 'History',
    accessor: 'history'
  }
]

export default function AssetsTable() {
  interface TableData {
    [key: string]: any
  }

  const currentConfig = process.env.NEXT_PUBLIC_ENV
    ? config[process.env.NEXT_PUBLIC_ENV as keyof typeof config]
    : config['staging']

  const [tableData, setTableData] = useState<TableData[]>()

  // TODO - Setup WSS/TWAP web3 databinding based on price feed
  const { price, updatePrice } = useLocalEpochContext()
  const { provider, wallet } = useOPFContext();
  const { data, addContract } = useContractsContext();

  const loadAssets = async (contracts: Record<string, any>) => {
    // Get the base configuration ETH-USD, coingecko, kraken/binance, etc..
    const predictoorsConfig = currentConfig.tokenPredictions[0];
    
    console.log("contracts: ", contracts);
    for (const [key, contract] of Object.entries(contracts)) {
      console.log("key: ", key);
      console.log("contract: ", contract);
      
      // Instantiate contract wrappers and initialize components
      let predictoor: Predictoor = data[contract.address];
      if( !predictoor ) {
        predictoor = await addContract(
          contract.address, 
          provider, 
          contract.address
        );
      }
      console.log("predictoor: ", predictoor);
    
      if(predictoor) {
        let newData: any = []
        let row: any = {}
        let tokenData: TokenData = await getTokenData(predictoorsConfig.cg_id)
        row['coin'] = <Coin coinData={tokenData} />
        
        row['price'] = `$${tokenData.price}`
        row['amount'] = <AmountInput />
        row['next'] = (
          <Slot
            state={SlotState.NextPrediction}
            epochOffset={+1}
            predictoor={predictoor}
          />
        )
        row['live'] = (
          <Slot
            state={SlotState.LivePrediction}
            epochOffset={0}
            predictoor={predictoor}
          />
        )
        row['history'] = (
          <Slot
            state={SlotState.HistoricalPrediction}
            epochOffset={-1}
            predictoor={predictoor}
          />
        )

        newData.push(row)
        setTableData(newData)

        // If in local mode, we want to use the mock data & implementation
        if (process.env.NEXT_PUBLIC_ENV == 'mock') {
          // Init the app w/ fresh CG data each time
          updatePrice(tokenData.price);
        }
      }
    }
    
    console.log("complete loadTableData");
  }

  const initTable = async () => {
    await updatePredictoorSubscriptions(
      currentConfig,
      wallet,
      provider
    );

    const predictoorContracts: Record<string, any> = await getAllInterestingPredictionContracts(
      currentConfig.subgraph
    );
    await loadAssets(predictoorContracts);
  }

  useEffect(() => {
    initTable()
  }, [])

  useEffect(() => {
    // console.log(tableData)
  }, [tableData])

  useEffect(() => {
    if (tableData) {
      tableData?.forEach(async (tableRow) => {
        let newData: any = []
        let row: any = {}
        row['coin'] = tableRow['coin']
        row['price'] = price
        row['amount'] = tableRow['amount']
        row['next'] = tableRow['next']
        row['live'] = tableRow['live']
        row['history'] = tableRow['history']
        newData.push(row)
        setTableData(newData)
      })
    }
  }, [price])

  return tableData ? (
    <div className={styles.container}>
      <Table columns={tableColumns} data={tableData} />
    </div>
  ) : (
    <div>Loading</div>
  )
}
