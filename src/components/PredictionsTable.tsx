import { useContractsContext } from '@/contexts/ContractsContext'
import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { useEffect, useState } from 'react'
import { PredictoorContracts } from '../contexts/ContractsContext'
import config from '../metadata/config.json'
import styles from '../styles/PredictionsTable.module.css'
import { TokenData, getTokenData } from '../utils/coin'
import { updatePredictoorSubscriptions } from '../utils/predictoors'
import { getAllInterestingPredictionContracts } from '../utils/subgraph'
import AmountInput from './AmountInput'
import Coin from './Coin'
import Prediction, { PredictionState } from './Prediction'
import Table from './Table'

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

export default function PredictionsTable() {
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

  const loadTableData = async (predictoors: Record<string, any>) => {
    // Get the base configuration ETH-USD, coingecko, kraken/binance, etc..
    const predictoorsConfig = currentConfig.tokenPredictions[0];
    
    console.log("loadTableData: ", predictoors);
    for (const [key, predictoorProps] of Object.entries(predictoors)) {
      console.log("key: ", key);
      console.log("predictoorProps: ", predictoorProps);
      console.log("data: ", data);

      // Instantiate contract wrappers and initialize components
      let predictoorContracts: PredictoorContracts = data[predictoorProps.address];
      if( !predictoorContracts ) {
        predictoorContracts = await addContract(
          predictoorProps.address, 
          provider, 
          predictoorProps.address
        );
      }
      console.log("contracts: ", predictoorContracts);
    
      if(predictoorContracts) {
        let newData: any = []
        let row: any = {}
        let tokenData: TokenData = await getTokenData(predictoorsConfig.cg_id)
        row['coin'] = <Coin coinData={tokenData} />
        
        row['price'] = `$${tokenData.price}`
        row['amount'] = <AmountInput />
        row['next'] = (
          <Prediction
            state={PredictionState.Next}
            epochOffset={+1}
            predictoorContracts={predictoorContracts}
          />
        )
        row['live'] = (
          <Prediction
            state={PredictionState.Live}
            epochOffset={0}
            predictoorContracts={predictoorContracts}
          />
        )
        row['history'] = (
          <Prediction
            state={PredictionState.History}
            epochOffset={-1}
            predictoorContracts={predictoorContracts}
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

  const loadSubgraphTable = async () => {
    await updatePredictoorSubscriptions(
      currentConfig,
      wallet,
      provider
    );

    const predictoorContracts: Record<string, any> = await getAllInterestingPredictionContracts(
      currentConfig.subgraph
    );
    await loadTableData(predictoorContracts);
  }

  useEffect(() => {
    loadSubgraphTable()
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
