import { useCallback, useEffect, useState } from 'react'

import { useOPFContext } from '@/contexts/OPFContext'
import { currentConfig } from '@/utils/appconstants'
import { getAllInterestingPredictionContracts } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import styles from '../styles/AssetsTable.module.css'
import { updatePredictoorSubscriptions } from '../utils/predictoors'
import { AssetList } from './AssetList'

type TContractsState = Awaited<
  ReturnType<typeof getAllInterestingPredictionContracts>
>

export const AssetsContainer: React.FC = () => {
  const [contracts, setContracts] = useState<TContractsState>()
  // TODO - Setup WSS/TWAP web3 databinding based on price feed
  const { provider, wallet } = useOPFContext()

  const initTable = useCallback(async () => {
    await updatePredictoorSubscriptions(currentConfig, wallet, provider)

    const contracts = await getAllInterestingPredictionContracts(
      currentConfig.subgraph
    )
    setContracts(contracts)
  }, [provider, wallet])

  useEffect(() => {
    initTable()
  }, [initTable])

  return (
    <div className={styles.container}>
      {contracts ? <AssetList contracts={contracts} /> : <div>Loading</div>}
    </div>
  )
}
