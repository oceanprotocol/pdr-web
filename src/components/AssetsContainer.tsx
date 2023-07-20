import { useCallback, useEffect, useState } from 'react'

import { useSocketContext } from '@/contexts/SocketContext'
import useBlockchainListener from '@/hooks/useBlockchainListener'
import { currentConfig } from '@/utils/appconstants'
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

  const filterAllowedContracts = useCallback<
    (contracts: TContractsState) => Record<string, TPredictionContract>
  >((contracts) => {
    const filteredContracts: Record<string, TPredictionContract> = {}
    Object.keys(contracts).forEach((contractKey) => {
      if (
        !currentConfig.opfProvidedPredictions.includes(contractKey) &&
        contracts[contractKey].owner === currentConfig.opfOwnerAddress
      ) {
        filteredContracts[contractKey] = contracts[contractKey]
      }
    })

    return filteredContracts
  }, [])

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
