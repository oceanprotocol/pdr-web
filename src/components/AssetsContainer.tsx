import { useEffect, useRef } from 'react'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import {
  TSocketFeedData,
  TSocketFeedItem
} from '@/contexts/SocketContext.types'
import { currentConfig } from '@/utils/appconstants'
import { getInitialData } from '@/utils/getInitialData'
import { Maybe } from '@/utils/utils'
import styles from '../styles/AssetsTable.module.css'
import { AssetTable } from './AssetTable'

export const AssetsContainer: React.FC = () => {
  const { contracts } = usePredictoorsContext()
  const { handleEpochData } = useSocketContext()
  const containerRef = useRef<Maybe<HTMLDivElement>>(null)

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

  useEffect(() => {
    if (!containerRef.current) return
    // I keep this here because of the calculation,
    // we divide by 3 because we have 3 columns in screen and
    // we will scroll to the 3rd column, It may be 4th column in future
    const columnWidth = window.innerWidth / 3
    const leftPosition = columnWidth * 3
    containerRef.current.scrollTo({
      left: leftPosition,
      behavior: 'smooth'
    })
  }, [])

  return (
    <div
      className={styles.container}
      ref={(ref) => (containerRef.current = ref)}
    >
      <AssetTable contracts={contracts} />
    </div>
  )
}
