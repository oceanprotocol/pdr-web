import { useEffect } from 'react'

import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useSocketContext } from '@/contexts/SocketContext'
import { getInitialData } from '@/utils/getInitialData'
import styles from '../styles/AssetsTable.module.css'
import { AssetTable } from './AssetTable'

export const AssetsContainer: React.FC = () => {
  const { contracts } = usePredictoorsContext()
  const { setInitialData } = useSocketContext()

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
