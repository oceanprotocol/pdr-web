import { useEffect } from 'react'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import {
  TSocketFeedData,
  TSocketFeedItem
} from '@/contexts/SocketContext.types'
import { currentConfig } from '@/utils/appconstants'
import { getInitialData } from '@/utils/getInitialData'
import styles from '../styles/AssetsTable.module.css'
import { AssetTable } from './AssetTable'

export const AssetsContainer: React.FC = () => {
  const { contracts } = usePredictoorsContext()
  const { handleEpochData } = useSocketContext()

  useEffect(() => {
    if (currentConfig.opfProvidedPredictions.length === 0) return
    if (!handleEpochData) return
    getInitialData().then((data: any) => {
      if (!data) return
      let dataArray: TSocketFeedData = []
      Object.keys(data).forEach((key: any) => {
        data[key].forEach((a: TSocketFeedItem) => {
          dataArray.push(a)
        })
      })
      handleEpochData(dataArray)
    })
  }, [handleEpochData])

  return (
    <div className={styles.container}>
      <AssetTable contracts={contracts} />
    </div>
  )
}
