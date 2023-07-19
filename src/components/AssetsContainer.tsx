import { useEffect, useState } from 'react'

import { useSocketContext } from '@/contexts/SocketContext'
import { TSocketFeedItem } from '@/contexts/SocketContext.types'
import { getInitialData } from '@/utils/getInitialData'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import styles from '../styles/AssetsTable.module.css'
import { AssetTable } from './AssetTable'

export const AssetsContainer: React.FC = () => {
  const [contracts, setContracts] = useState<TPredictionContract[]>()
  const { setInitialData, epochData } = useSocketContext()

  useEffect(() => {
    console.log(epochData)
    if (!epochData) return
    let contracts: TPredictionContract[] = []
    epochData?.forEach((contract: TSocketFeedItem) => {
      contracts.push(contract.contractInfo)
    })
    setContracts(contracts)
  }, [epochData])

  useEffect(() => {
    if (!setInitialData) return
    getInitialData().then((data) => {
      setInitialData(data)
    })
  }, [setInitialData])

  return (
    <div className={styles.container}>
      {contracts ? <AssetTable contracts={contracts} /> : <div>Loading</div>}
    </div>
  )
}
