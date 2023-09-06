import { usePredictionHistoryContext } from '@/contexts/PredictionHistoryContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { getAssetPairPrice } from '@/utils/marketPrices'
import {
  compareSplittedNames,
  splitContractName
} from '@/utils/splitContractName'
import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from '../styles/Epoch.module.css'
import { EpochPrediction } from './EpochDetails/EpochPrediction'
import { EpochPrice } from './EpochDetails/EpochPrice'
import { EpochStakedTokens } from './EpochDetails/EpochStakedTokens'

//TODO: Fix Eslint
export enum EEpochDisplayStatus {
  'NextEpoch' = 'next',
  'LiveEpoch' = 'live',
  'PastEpoch' = 'history'
}

export type TEpochDisplayProps = {
  status: EEpochDisplayStatus
  price: number
  market: string
  tokenName: string
  pairName: string
  epochStartTs: number
  secondsPerEpoch: number
  contractAddress: string
}

export const EpochDisplay: React.FC<TEpochDisplayProps> = ({
  status,
  price,
  market,
  tokenName,
  pairName,
  epochStartTs,
  secondsPerEpoch,
  contractAddress
}) => {
  const { epochData } = useSocketContext()
  const [delta, setDelta] = useState<number>()
  const [initialPrice, setInitialPrice] = useState<number>()
  const [finalPrice, setFinalPrice] = useState<number>(0)
  const { getDataFromHistoryByContractAddress, historyData } =
    usePredictionHistoryContext()
  const isNextEpoch = useMemo(
    () => status === EEpochDisplayStatus.NextEpoch,
    [status]
  )

  const relatedPredictionIndex = useMemo(() => {
    switch (status) {
      case EEpochDisplayStatus.NextEpoch:
        return 2
      case EEpochDisplayStatus.LiveEpoch:
        return 1
      case EEpochDisplayStatus.PastEpoch:
        return 0
    }
  }, [status])

  const getNextEpochData = useCallback(() => {
    return Array.isArray(epochData)
      ? epochData
          ?.find((data) =>
            compareSplittedNames(splitContractName(data.contractInfo.name), [
              tokenName,
              pairName
            ])
          )
          ?.predictions.sort((a, b) => a.epoch - b.epoch)[
          relatedPredictionIndex
        ]
      : null
  }, [epochData, tokenName, pairName, relatedPredictionIndex])

  const relatedData = useMemo(() => {
    if (isNextEpoch) {
      return getNextEpochData()
    }
    const data = getDataFromHistoryByContractAddress({
      contractAddress
    })

    return data?.[relatedPredictionIndex]
  }, [isNextEpoch, relatedPredictionIndex, getNextEpochData, historyData])

  useEffect(() => {
    if (
      status !== EEpochDisplayStatus.NextEpoch ||
      !relatedData ||
      relatedData.stake == 0
    )
      return
    if (!initialPrice) {
      getAssetPairPrice({
        assetPair: tokenName + pairName,
        timestamp: epochStartTs,
        market: market
      }).then((p) => {
        setInitialPrice(parseFloat(p))
        setDelta(parseFloat(p) - price)
      })
    } else {
      setDelta((100 * (price - initialPrice)) / ((price + initialPrice) / 2))
    }
  }, [price])

  const getHistoryEpochPriceDelta = async () => {
    const [initialPrice, finalPrice] = await Promise.all([
      getAssetPairPrice({
        assetPair: tokenName + pairName,
        timestamp: epochStartTs - secondsPerEpoch,
        market: market
      }),
      getAssetPairPrice({
        assetPair: tokenName + pairName,
        timestamp: epochStartTs,
        market: market
      })
    ])
    setFinalPrice(parseFloat(finalPrice))
    const delta =
      (100 * (parseFloat(finalPrice) - parseFloat(initialPrice))) /
      ((parseFloat(finalPrice) + parseFloat(initialPrice)) / 2)
    setDelta(delta)
  }

  useEffect(() => {
    if (
      status === EEpochDisplayStatus.NextEpoch ||
      !secondsPerEpoch ||
      !epochStartTs
    )
      return
    getHistoryEpochPriceDelta()
  }, [relatedData, secondsPerEpoch, epochStartTs])

  return (
    <div
      className={styles.container}
      style={{
        boxShadow: isNextEpoch ? '0px 0px 3px 1px var(--dark-grey)' : ''
      }}
    >
      {isNextEpoch ? (
        <EpochStakedTokens
          stakedUp={relatedData?.nom ? parseFloat(relatedData?.nom) : undefined}
          totalStaked={
            relatedData?.denom ? parseFloat(relatedData?.denom) : undefined
          }
          direction={relatedData?.dir}
          showLabel
        />
      ) : (
        <EpochPrice price={finalPrice} delta={delta} />
      )}
      <EpochPrediction
        stakedUp={relatedData?.nom ? parseFloat(relatedData?.nom) : undefined}
        totalStaked={
          relatedData?.nom ? parseFloat(relatedData?.denom) : undefined
        }
        status={status}
        direction={relatedData?.dir}
      />
    </div>
  )
}
