'use client'

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
import { AssetTable } from './AssetTable'
import { SearchFilters } from './SearchBar'

type AssetsContainerProps = {
  filters: SearchFilters
}

export const AssetsContainer: React.FC<AssetsContainerProps> = ({ filters }) => {
  const { contracts } = usePredictoorsContext()
  const { handleEpochData } = useSocketContext()
  const containerRef = useRef<Maybe<HTMLDivElement>>(null)

  useEffect(() => {
    if (currentConfig.opfProvidedPredictions.length === 0) return
    if (!handleEpochData) return
    getInitialData().then((data) => {
      if (!data) return
      const dataRecord = data as unknown as Record<string, TSocketFeedItem[]>
      const dataArray: TSocketFeedData = []

      Object.keys(dataRecord).forEach((key: string) => {
        dataRecord[key].forEach((item: TSocketFeedItem) => {
          dataArray.push(item)
        })
      })
      handleEpochData(dataArray)
    })
  }, [handleEpochData])

  useEffect(() => {
    if (!containerRef.current) return
    const columnWidth = window.innerWidth / 3
    const leftPosition = columnWidth * 3
    containerRef.current.scrollTo({
      left: leftPosition,
      behavior: 'smooth'
    })
  }, [])

  return (
    <div
      className="w-full overflow-x-auto"
      ref={(ref) => {
        containerRef.current = ref
      }}
    >
      <AssetTable contracts={contracts} filters={filters} />
    </div>
  )
}
