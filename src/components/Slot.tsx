import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { useUserContext } from '@/contexts/UserContext'
import { setTrade } from '@/utils/kraken'
// import { getCurrentEpoch, get_agg_predval } from '@/utils/predictoor'
import { useEffect, useState } from 'react'
import Button from '../elements/Button'
import ProgressBar from '../elements/ProgressBar'
import styles from '../styles/Slot.module.css'
import Predictoor from '../utils/contracts/Predictoor'

// 3 States => Defines how the Slot component behaves
// Disable eslint because async nature of code, esp. config.forEach(async (data) => {...})
/* eslint-disable no-unused-vars */
export enum SlotState {
  NextPrediction = 'next',
  LivePrediction = 'live',
  HistoricalPrediction = 'history'
}
/* eslint-enable no-unused-vars */

export default function Slot({
  state,
  epochOffset,
  predictoor,
  tokenName,
  pairName
}: {
  state: SlotState
  epochOffset: number // offset from epoch index
  predictoor: Predictoor // predictoor contract address
  tokenName: string
  pairName: string
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
  const { 
    balance: userBalance, 
    amount,
    krakenApiKey,
    krakenSecretKey,
    getBalance
  } = useUserContext()

  // Component Params
  const [loading, setLoading] = useState(true)
  const [blockNum, setBlockNum] = useState(0)
  const [blocksPerEpoch, setBlocksPerEpoch] = useState(0)
  const [blocksLeft, setBlocksLeft] = useState(0)
  const [epoch, setEpoch] = useState(0)
  const [confidence, setConfidence] = useState(0)
  const [direction, setDirection] = useState(0)
  const [stake, setStake] = useState(0)
  // const [timePassed, setTimePassed] = useState(0)
  // const maxDurationTime = 300

  // const getTimeLeftInSeconds = () => {
  //   switch (state) {
  //     case SlotState.NextPrediction:
  //       return setTimePassed(0)
  //     case SlotState.LivePrediction:
  //       return setTimePassed(0)
  //     case SlotState.HistoricalPrediction:
  //       return setTimePassed(0)
  //   }
  // }

  const updateComponentParams = async () => {
    const curEpoch: number = await predictoor.getCurrentEpoch();
    const BPE: number = await predictoor.getBlocksPerEpoch();
    
    const calculatedEpoch: number = curEpoch + epochOffset;
    const blockNumber:number = await provider.getBlockNumber();
    
    setEpoch(calculatedEpoch)
    setBlockNum(blockNumber)
    setBlocksPerEpoch(BPE);
    
    const nextEpochBlockNum = BPE * (calculatedEpoch+1);
    const nBlocksLeft = nextEpochBlockNum - blockNumber
    setBlocksLeft(nBlocksLeft > BPE ? nBlocksLeft - BPE : nBlocksLeft);

    // TODO - Enable this once we have the predictoors submitting predVals
    // const aggPredval: any = await predictoor.predictoorContract.getAggPredval(
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
  }

  const updateMockComponentParams = async () => {
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

  const updateComponent = async () => {
    await updateComponentParams();
    await updateMockComponentParams();
  }

  // We want to update the component when the epoch index changes
  useEffect(() => {
    try{
      // getTimeLeftInSeconds()
      updateComponent()

      provider.on('block', async (blockNumber) => {
        await updateComponentParams();
      });

      setLoading(false);
    } catch (e) {
      console.log("Error initializing slot component:", e);
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
    } else {
      setTrade(
        process.env.NEXT_PUBLIC_EXCHANGE_KEY || krakenApiKey,
        process.env.NEXT_PUBLIC_PRIVATE_EXCHANGE_KEY || krakenSecretKey,
        `${tokenName}${pairName}`,
        'buy',
        amount
      ).then((resp) => {
        console.log(resp)
        getBalance && getBalance()
      })
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
      {state === SlotState.NextPrediction ? (
        <Button
          onClick={buyPrediction}
          text={'BUY NOW'}
          disabled={canBuyPrediction() === false}
        />
      ) : (
        <span className={styles.position}>PNL: N/A</span>
      )}
      {state === SlotState.NextPrediction &&
        <ProgressBar
          progress={blocksLeft}
          max={blocksPerEpoch}
        />
      }
    </div>
  )
}