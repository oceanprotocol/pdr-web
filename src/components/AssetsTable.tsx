import { useCallback, useEffect, useState } from 'react'

import { useOPFContext } from '@/contexts/OPFContext'
import { currentConfig } from '@/utils/appconstants'
import styles from '../styles/AssetsTable.module.css'
import { updatePredictoorSubscriptions } from '../utils/predictoors'
import { getAllInterestingPredictionContracts } from '../utils/subgraph'
import { AssetList } from './AssetList'

type TConractsState = Awaited<
  ReturnType<typeof getAllInterestingPredictionContracts>
>

export default function AssetsTable() {
  const [contracts, setContracts] = useState<TConractsState>()
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
