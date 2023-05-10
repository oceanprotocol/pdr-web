import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { epoch as getEpoch, get_agg_predval } from '@/utils/predictoor'
import { useEffect, useState } from 'react'
import styles from '../styles/Prediction.module.css'

// 3 States => Defines how the Prediction component behaves
// Disable eslint because async nature of code, esp. config.forEach(async (data) => {...})
/* eslint-disable no-unused-vars */
export enum PredictionState {
  Next = 'next',
  Live = 'live',
  History = 'history'
}
/* eslint-enable no-unused-vars */

export default function Prediction({
  state,
  epochOffset,
  predictoorContractAddress
}: {
  state: PredictionState
  epochOffset: number // offset from epoch index
  predictoorContractAddress: string // predictoor contract address
}) {
  // Contexts
  const { wallet, provider } = useOPFContext()
  const { epochIndex, incrementEpochIndex } = useLocalEpochContext()

  // Component Params
  const [blockNum, setBlockNum] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [dir, setDir] = useState(0)
  const [stake, setStake] = useState(0)

  // Next State Params
  // Live State Params
  // History State Params

  useEffect(() => {
    if (provider) {
      // If in local mode, we want to use the mock data & implementation
      if (process.env.NEXT_PUBLIC_ENV == 'local') {
        setEpoch(Number(epochIndex) + epochOffset)
        setBlockNum(1)
        setDir(1)
        setConfidence(0.7)
        setStake(100)
        return
      }

      const fetchData = async () => {
        const curEpoch: number = await getEpoch(
          provider,
          predictoorContractAddress
        )
        const newEpoch: number = curEpoch + epochOffset
        setEpoch(newEpoch)

        const aggPredval = await get_agg_predval(
          provider,
          predictoorContractAddress,
          newEpoch
        )

        setBlockNum(Number(aggPredval?.blockNum))
        setDir(Number(aggPredval?.dir))
        setConfidence(Number(aggPredval?.confidence))
        setStake(Number(aggPredval?.stake))
      }
      fetchData()
    }
  }, [wallet, provider, predictoorContractAddress, epochOffset, epochIndex])

  console.log(blockNum, epoch, stake)

  const getDirectionText = (direction: number) => {
    return direction == 1 ? 'BULL' : 'BEAR'
  }

  return (
    <div
      className={styles.container}
      style={{
        backgroundColor: `rgba(${dir == 1 ? 'green' : 'red'}, ${confidence})`
      }}
    >
      <span>{`${confidence}% ${getDirectionText(dir)}`}</span>
      <span>{state === PredictionState.Next ? `BUY NOW` : 'PNL: N/A'}</span>
      {process.env.NEXT_PUBLIC_ENV == 'local' &&
        state === PredictionState.Next && (
          <button onClick={incrementEpochIndex}>BUY NOW</button>
        )}
    </div>
  )
}
