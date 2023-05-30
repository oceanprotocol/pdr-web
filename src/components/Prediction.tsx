import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { useUserContext } from '@/contexts/UserContext'
// import { getCurrentEpoch, get_agg_predval } from '@/utils/predictoor'
import { BigNumber, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { PredictoorContracts } from '../contexts/ContractsContext'
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
  predictoorContracts
}: {
  state: PredictionState
  epochOffset: number // offset from epoch index
  predictoorContracts: PredictoorContracts // predictoor contract address
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
  const [loading, setLoading] = useState(true)
  const [blockNum, setBlockNum] = useState(0)
  const [blocksLeft, setBlocksLeft] = useState(0)
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

  const updateComponent = async () => {
    console.log("fetching data from predictoor contract");
    const curEpoch: BigNumber = await predictoorContracts.predictoorContract.getCurrentEpoch();
    const blocksPerEpoch: BigNumber = await predictoorContracts.predictoorContract.getBlocksPerEpoch();
    const calculatedEpoch = parseInt(ethers.utils.formatUnits(curEpoch,0)) + epochOffset;
    const calculatedEpochNum = calculatedEpoch * parseInt(ethers.utils.formatUnits(blocksPerEpoch,0));
    
    setEpoch(calculatedEpoch)
    setBlockNum(calculatedEpochNum)
    
    const blockNumber = await provider.getBlockNumber();
    const nextEpochBlockNum = parseInt(ethers.utils.formatUnits(blocksPerEpoch,0))*(calculatedEpoch+1);
    setBlocksLeft(nextEpochBlockNum-blockNumber);

    // TODO - Enable this once we have the predictoors submitting predVals
    // const aggPredval: any = await predictoorContracts.predictoorContract.getAggPredval(
    //   blockNum,
    //   wallet
    // );
    // console.log("aggPredval:", aggPredval);
    // console.log("aggPredval nom:", ethers.utils.formatUnits(aggPredval.nom, 0));
    // console.log("aggPredval denom:", ethers.utils.formatUnits(aggPredval.denom, 0));
    // console.log("aggPredval confidence:", aggPredval.confidence);
    // console.log("aggPredval dir:", aggPredval.dir, 0);
    // console.log("aggPredval stake:", ethers.utils.formatUnits(aggPredval.stake, 0));
    
    // setConfidence(Number(aggPredval?.confidence))
    // setDirection(Number(aggPredval?.dir))
    // setStake(Number(aggPredval?.stake))

    // If in local mode, we want to use the mock data & implementation
    if (process.env.NEXT_PUBLIC_ENV == 'mock') {
      let randomConfidence = parseFloat(Math.random().toFixed(2))
      const epochNum = Number(epochIndex) + epochOffset
      
      setEpoch(epochNum)
      setBlockNum(epochNum * 60)
      setDirection(randomConfidence > 0.5 ? 1 : -1)
      setConfidence(randomConfidence)
      setStake(100)
    }
  }

  // We want to update the component when the epoch index changes
  useEffect(() => {
    try{
      getTimeLeftInSeconds()
      updateComponent()

      provider.on('block', async (blockNumber) => {
        const curEpoch: BigNumber = await predictoorContracts.predictoorContract.getCurrentEpoch();
        const blocksPerEpoch: BigNumber = await predictoorContracts.predictoorContract.getBlocksPerEpoch();
        const calculatedEpoch = parseInt(ethers.utils.formatUnits(curEpoch,0)) + epochOffset;
        setEpoch(calculatedEpoch);
        setBlockNum(blockNumber);
        
        const nextEpochBlockNum = parseInt(ethers.utils.formatUnits(blocksPerEpoch,0))*(calculatedEpoch+1);
        setBlocksLeft(nextEpochBlockNum-blockNumber);
      });

      setLoading(false);
    } catch (e) {
      console.log("Error initializing prediction component:", e);
    }
  }, [])

  useEffect(() => {
    // Check loading. This gets hit many times when starting up.
    if( !loading ) {
      updateComponent()
    }
  }, [wallet, provider, epochOffset, epochIndex])

  const getDirectionText = (direction: number) => {
    return direction == 1 ? 'BULL' : 'BEAR'
  }

  const canBuyPrediction = () => {
    let enabled = userBalance > 0.0 && amount > 0

    if (process.env.NEXT_PUBLIC_ENV === 'mock') {
      enabled = localBalance > 0.0 && amount > 0
    }

    return enabled
  }

  const buyPrediction = () => {
    //  axios.put(api_key, amount)

    if (process.env.NEXT_PUBLIC_ENV === 'mock') {
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
      {process.env.NEXT_PUBLIC_ENV == 'mock' ||
       process.env.NEXT_PUBLIC_ENV == 'barge' && (
        <div>
          Epoch: {epoch}<br/>
          BlockNum: {blockNum}<br/>
          Left: {blocksLeft}<br/>
          Stake: {stake}<br/>
        </div>
      )}
      {state === PredictionState.Next ? (
        <Button
          onClick={buyPrediction}
          text={'BUY NOW'}
          disabled={canBuyPrediction() === false}
        />
      ) : (
        <span className={styles.position}>PNL: N/A</span>
      )}
      {state !== PredictionState.History &&
        <ProgressBar
          completed={timePassed}
          setCompleted={setTimePassed}
          maxCompleted={maxDurationTime}
          startProgress={
            state === PredictionState.Next ||
            state == PredictionState.Live
          }
        />
      }
    </div>
  )
}
