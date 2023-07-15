import { useCallback, useEffect, useState } from 'react'

import { useSocketContext } from '@/contexts/SocketContext'
import useBlockchainListener from '@/hooks/useBlockchainListener'
import { currentConfig, getAllowedPredictions } from '@/utils/appconstants'
import { getInitialData } from '@/utils/getInitialData'
import {
  TPredictionContract,
  getAllInterestingPredictionContracts
} from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import styles from '../styles/AssetsTable.module.css'
import { AssetTable } from './AssetTable'

type TContractsState = Awaited<
  ReturnType<typeof getAllInterestingPredictionContracts>
>

export const AssetsContainer: React.FC = () => {
  const [contracts, setContracts] = useState<TContractsState>()
  const { setInitialData, setEpochData } = useSocketContext()

  const { subscribedContracts } = useBlockchainListener({
    providedContracts: contracts,
    setEpochData
  })

  console.log('subscribedContracts11', subscribedContracts)

  const filterContractsWithAllowedPredictions = useCallback<
    (contracts: TContractsState) => Record<string, TPredictionContract>
  >((contracts) => {
    const allowedContracts = getAllowedPredictions()
    const filteredContracts: Record<string, TPredictionContract> = {}

    Object.keys(contracts).forEach((contractKey) => {
      if (allowedContracts.includes(contractKey)) {
        filteredContracts[contractKey] = contracts[contractKey]
      }
    })

    return filteredContracts
  }, [])

  useEffect(() => {
    getAllInterestingPredictionContracts(currentConfig.subgraph).then(
      (contracts) => {
        const filteredContracts =
          filterContractsWithAllowedPredictions(contracts)
        setContracts(filteredContracts)
      }
    )
  }, [filterContractsWithAllowedPredictions, setContracts])

  useEffect(() => {
    if (!setInitialData) return
    getInitialData().then((data) => {
      setInitialData(data)
    })
  }, [setInitialData])

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
