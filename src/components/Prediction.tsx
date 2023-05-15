import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { useUserContext } from '@/contexts/UserContext'
import { epoch as getEpoch, get_agg_predval } from '@/utils/predictoor'
import { useEffect, useState } from 'react'
import styles from '../styles/Prediction.module.css'
import Button from './Button'
import ProgressBar from './ProgressBar'

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
  predictoorContractAddress,
  config
}: {
  state: PredictionState
  epochOffset: number // offset from epoch index
  predictoorContractAddress: string // predictoor contract address
  config: any
}) {
  // Contexts
  const { wallet, provider } = useOPFContext()
  const {
    epochIndex,
    price,
    balance: localBalance,
    incrementEpochIndex,
    updatePrice,
    updateBalance
  } = useLocalEpochContext()
  const { balance: userBalance, amount } = useUserContext()

  // Component Params
  const [blockNum, setBlockNum] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [direction, setDirection] = useState(0)
  const [stake, setStake] = useState(0)
  const [timePassed, setTimePassed] = useState(0)
  const maxDurationTime = 300

  const getTimeLeftInSeconds = () => {
    switch (state) {
      case PredictionState.Next:
        return setTimePassed(200)
      case PredictionState.Live:
        return setTimePassed(200)
      case PredictionState.History:
        return setTimePassed(maxDurationTime)
    }
  }

  useEffect(() => {
    getTimeLeftInSeconds()
  }, [])

  useEffect(() => {
    if (provider) {
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

        // If in local mode, we want to use the mock data & implementation
        if (process.env.NEXT_PUBLIC_ENV == 'local') {
          let randomConfidence = parseFloat(Math.random().toFixed(2))
          const epochNum = Number(epochIndex) + epochOffset

          setEpoch(epochNum)
          setBlockNum(epochNum * config.blocks_per_epoch)
          setDirection(randomConfidence > 0.5 ? 1 : -1)
          setConfidence(randomConfidence)
          setStake(100)
        }
        console.log(blockNum, epoch, stake)
      }
      console.log(blockNum, epoch, stake)
      fetchData()
    }
  }, [wallet, provider, predictoorContractAddress, epochOffset, epochIndex])

  const getDirectionText = (direction: number) => {
    return direction == 1 ? 'BULL' : 'BEAR'
  }

  const canBuyPrediction = () => {
    let enabled = userBalance > 0.0 && amount > 0

    if (process.env.NEXT_PUBLIC_ENV === 'local') {
      enabled = true
    }

    return enabled === false
  }

  const buyPrediction = () => {
    //  axios.put(api_key, amount)

    if (process.env.NEXT_PUBLIC_ENV === 'local') {
      let randomConfidence = parseFloat(Math.random().toFixed(2))
      const dir = randomConfidence > 0.5 ? 1 : -1

      incrementEpochIndex()

      let newPrice = price + dir * 5.0
      updatePrice(newPrice)

      let newBalance = localBalance + dir * 5.0
      updateBalance(newBalance)
    }
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
      {/* {process.env.NEXT_PUBLIC_ENV == 'local' && (
        <div>
          Epoch: {epoch}<br/>
          BlockNum: {blockNum}<br/>
          Stake: {stake}<br/>
        </div>
      )} */}
      {state === PredictionState.Next ? (
        <Button
          onClick={buyPrediction}
          text={'BUY NOW'}
          disabled={canBuyPrediction()}
        />
      ) : (
        <span className={styles.position}>PNL: N/A</span>
      )}
      {state !== PredictionState.History &&
        <ProgressBar
          completed={timePassed}
          setCompleted={setTimePassed}
          maxCompleted={maxDurationTime}
          startProgress={state == PredictionState.Live}
        />
      }
    </div>
  )
}
