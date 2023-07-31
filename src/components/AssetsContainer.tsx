import { useCallback, useEffect, useState } from 'react'

import { useSocketContext } from '@/contexts/SocketContext'
import { TSocketFeedItem } from '@/contexts/SocketContext.types'
import useBlockchainListener from '@/hooks/useBlockchainListener'
import { currentConfig } from '@/utils/appconstants'
import { getInitialData } from '@/utils/getInitialData'
import {
  TPredictionContract,
  getAllInterestingPredictionContracts
} from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import styles from '../styles/AssetsTable.module.css'
import { AssetTable } from './AssetTable'

export const AssetsContainer: React.FC = () => {
  const [contracts, setContracts] =
    useState<Record<string, TPredictionContract>>()
  const { initialEpochData, setInitialData, epochData, setEpochData } =
    useSocketContext()

  useEffect(() => {
    console.log(epochData)
    if (!epochData) return
    let contracts: Record<string, TPredictionContract> = {}
    epochData?.forEach((contract: TSocketFeedItem) => {
      contracts[contract.contractInfo.address] = contract.contractInfo
    })
    setContracts(contracts)
  }, [epochData])

  const filterAllowedContracts = useCallback<
    (
      contracts: Record<string, TPredictionContract>
    ) => Record<string, TPredictionContract>
  >((contracts) => {
    const filteredContracts: Record<string, TPredictionContract> =
      contracts || {}
    Object.keys(contracts).forEach((contractKey) => {
      if (contracts[contractKey].owner === currentConfig.opfOwnerAddress) {
        filteredContracts[contractKey] = contracts[contractKey]
      }
    })

    return filteredContracts
  }, [])

  const { subscribedContracts } = useBlockchainListener({
    providedContracts: contracts && filterAllowedContracts(contracts),
    setEpochData
  })

  useEffect(() => {
    getAllInterestingPredictionContracts(currentConfig.subgraph).then(
      (contracts) => {
        const filteredContracts = filterAllowedContracts(contracts)
        setContracts(filteredContracts)
      }
    )
  }, [filterAllowedContracts, setContracts])

  useEffect(() => {
    if (!setInitialData) return
    getInitialData().then((data) => {
      console.log('initialData', data)
      setInitialData(data)
    })
  }, [setInitialData])

  useEffect(() => {
    if (!initialEpochData) return
    let serverContracts = contracts || {}
    initialEpochData.forEach((data) => {
      serverContracts[data.contractInfo.address] = {
        ...data.contractInfo,
        owner: currentConfig.opfOwnerAddress
      }
    })
    setContracts(serverContracts)
  }, [initialEpochData])

  return (
    <div className={styles.container}>
      {contracts ? (
        <AssetTable
          contracts={contracts}
          subscribedContracts={subscribedContracts}
        />
      ) : (
        <div>Loading</div>
      )}
    </div>
  )
}
