import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { useUserContext } from '@/contexts/UserContext'
import { epoch as getEpoch, get_agg_predval } from '@/utils/predictoor'
import { useEffect, useState } from 'react'
import styles from '../styles/Prediction.module.css'
import Button from './Button'
import ProgressBar from './PreogressBar'

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
  const { balance, amount } = useUserContext()

  // Component Params
  const [blockNum, setBlockNum] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [direction, setDirection] = useState(0)
  const [stake, setStake] = useState(0)
  const [timePassed, setTimePassed] = useState(0)
  const maxDurationTime = 300

  // Next State Params
  // Live State Params
  // History State Params

  const getTimeLeftInSeconds = () => {
    switch (state) {
      case PredictionState.Next:
        return setTimePassed(0)
      case PredictionState.History:
        return setTimePassed(maxDurationTime)
      case PredictionState.Live:
        return setTimePassed(200)
    }
  }

  useEffect(() => {
    getTimeLeftInSeconds()
  }, [])

  useEffect(() => {
    if (provider) {
      // If in local mode, we want to use the mock data & implementation
      if (process.env.NEXT_PUBLIC_ENV == 'local') {
        let randomConfidence = parseFloat(Math.random().toFixed(2))
        setEpoch(Number(epochIndex) + epochOffset)
        setBlockNum(1)
        setDirection(randomConfidence > 0.5 ? 1 : 0)
        setConfidence(randomConfidence)
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
        setDirection(Number(aggPredval?.dir))
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
    <div className={styles.container}>
      <div
        className={styles.confidence}
        style={{
          backgroundColor: `rgba(${
            direction == 1 ? '124,252,0' : '220,20,60'
          }, ${confidence})`
        }}
      ></div>
      <span>{`${confidence}% ${getDirectionText(direction)}`}</span>
      {state === PredictionState.Next ? (
        <Button
          onClick={incrementEpochIndex}
          text={'BUY NOW'}
          disabled={balance == 0 || amount <= 0}
        />
      ) : (
        <span className={styles.position}>PNL: N/A</span>
      )}
      <ProgressBar
        completed={timePassed}
        setCompleted={setTimePassed}
        maxCompleted={maxDurationTime}
      />
    </div>
  )
}
