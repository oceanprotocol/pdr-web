import { useCallback, useEffect, useState } from 'react'

import { getActiveContracts } from '@/services/getActiveContracts'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import styles from '../styles/AssetsTable.module.css'
import { AssetList } from './AssetList'

type TContractsState = Array<TPredictionContract> | undefined

export const AssetsContainer: React.FC = () => {
  const [contracts, setContracts] = useState<TContractsState>()
  // TODO - Setup WSS/TWAP web3 databinding based on price feed

  const initTable = useCallback(async () => {
    getActiveContracts()
      .then((contracts) => {
        if (contracts instanceof Error) return console.error(contracts)

        setContracts(contracts)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    initTable()
  }, [initTable])

  return (
    <div className={styles.container}>
      {contracts ? <AssetList contracts={contracts} /> : <div>Loading</div>}
    </div>
  )
}
