import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { useUserContext } from '@/contexts/UserContext'
import { setTrade } from '@/utils/kraken'
import { ethers } from 'ethers'
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
  
  // This is used in mock-implementation only.
  const cBLOCKS_PER_EPOCH = 20;

  // Trigger: A new block is mined
  const updateBlockParams = async () => {
    const curEpoch: number = await predictoor.getCurrentEpoch();
    const BPE: number = await predictoor.getBlocksPerEpoch();
    
    const calculatedEpoch: number = curEpoch + epochOffset;
    const blockNumber:number = await provider.getBlockNumber() + (BPE * epochOffset);
    
    setEpoch(calculatedEpoch)
    setBlockNum(blockNumber)
    setBlocksPerEpoch(BPE);
    
    const nextEpochBlockNum = BPE * (calculatedEpoch+1);
    const nBlocksLeft = nextEpochBlockNum - blockNumber
    setBlocksLeft(nBlocksLeft > BPE ? nBlocksLeft - BPE : nBlocksLeft);
  }

  // Trigger: A new epoch has started
  const updateEpochParams = async () => {
    // TODO - Cleanup epoch/epochOffset/blockNum/blockNumOffset
    const curEpoch: number = await predictoor.getCurrentEpoch();
    const BPE: number = await predictoor.getBlocksPerEpoch();
    
    const calculatedEpoch: number = curEpoch + epochOffset;
    const epochOffsetBlockNum = BPE * calculatedEpoch;
    
    // TODO - Just keep reviewing these numbers until live
    const aggPredval: any = await predictoor.getAggPredval(
      epochOffsetBlockNum,
      wallet
    );
    
    setConfidence(Number(aggPredval?.confidence))
    setDirection(Number(aggPredval?.dir))
    setStake(Number(ethers.utils.formatUnits(aggPredval?.stake, 18)))
  }

  // Trigger: An update to the mocked component takes place
  const resetMockComponentParams = async () => {
    // If in local mode, we want to use the mock data & implementation
    let randomConfidence = parseFloat(Math.random().toFixed(2))
    const epochNum = Number(epochIndex) + epochOffset
    
    setEpoch(epochNum)
    setBlockNum(epochNum * 60)
    setDirection(randomConfidence > 0.5 ? 1 : -1)
    setConfidence(randomConfidence)
    setStake(randomConfidence)
    setBlocksPerEpoch(cBLOCKS_PER_EPOCH);
    setBlocksLeft(cBLOCKS_PER_EPOCH);
  }
  
  const updateComponent = async () => {
    if (process.env.NEXT_PUBLIC_ENV != 'mock') {
      await updateBlockParams();
      await updateEpochParams();
    } else {
      await resetMockComponentParams();
    }
  }

  const mockProgress = () => {
    const randomDir = parseFloat(Math.random().toFixed(2)) > 0.5 ? 1 : 0

    incrementEpochIndex()

    let newPrice = price + randomDir * 5.0
    updatePrice(newPrice)

    let newBalance = localBalance + randomDir * 5.0
    updateBalance(newBalance)
  }

  const initComponent = async () => {
    await updateComponent();
    setLoading(false);
        
    // Fixing mocking vs. barge
    // If we're not mocking, then we're going to use the chain data
    // If we're mocking, then we want to use a timer to handle progress
    if ( process.env.NEXT_PUBLIC_ENV != 'mock') {
      provider.on('block', async (blockNumber) => {
        await updateBlockParams();
      });
    } else {
      const intervalId = setInterval(() => {
        setBlocksLeft((prevBlocksLeft) => {
          if (prevBlocksLeft > 1) {
            return prevBlocksLeft - 1;
          }
          return 0;
        });
      }, 1000);
      return () => clearInterval(intervalId)
    }
  }

  // Trigger: Initialization
  // We want to initialize the component
  // We want to update the component whenever the block changes
  useEffect(() => {
    try{
      initComponent()
    } catch (e) {
      console.log("Error initializing slot component:", e);
    }
  }, [])

  // Trigger: epoch changes
  useEffect(() => {
    if( loading || process.env.NEXT_PUBLIC_ENV == 'mock' )
      return;
    
    try{
      updateEpochParams()
    } catch (e) {
      console.log("Error updating slot component:", e);
    }
  }, [epoch])

  // Trigger: blocksLeft changes
  useEffect(() => {
    // Check loading so it doesn't get hit during init
    if( loading || process.env.NEXT_PUBLIC_ENV != 'mock')
      return;
      
    try{
      if(blocksLeft <= 0)
        mockProgress();
    } catch (e) {
      console.log("Error updating slot component:", e);
    }
  }, [blocksLeft])

  // Trigger: core components and data updated
  useEffect(() => {
    // Check loading so it doesn't get hit during init
    if( loading )
      return;
      
    try{
      updateComponent()
    } catch (e) {
      console.log("Error updating slot component:", e);
    }
  }, [wallet, provider, epochOffset, epochIndex])

  const getDirectionText = (direction: number) => {
    return direction == 1 ? 'BULL' : 'BEAR'
  }

  const canBuyPrediction = () => {
    let enabled = userBalance > 0.0 && amount > 0

    if (process.env.NEXT_PUBLIC_ENV == 'mock') {
      enabled = localBalance > 0.0 && amount > 0
    }

    return enabled
  }

  const buyPrediction = () => {
    //  axios.put(api_key, amount)

    if (process.env.NEXT_PUBLIC_ENV === 'mock') {
      mockProgress()
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
          // TODO - Verify confidence right now it's either 0 or 1
          // TODO - Perhaps multiply confidence by stake?
          backgroundColor: `rgba(${direction == 1 ? '124,252,0' : '220,20,60'}, ${stake})`
        }}
      ></div>
      <span>{`${confidence}% ${getDirectionText(direction)}`}</span>
      {(process.env.NEXT_PUBLIC_ENV === 'mock' || process.env.NEXT_PUBLIC_ENV === 'barge') && (
        // Code to execute if environment is either "mock" or "barge"
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
