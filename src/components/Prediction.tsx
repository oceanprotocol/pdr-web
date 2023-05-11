import { useLocalEpochContext } from '@/contexts/LocalEpochContext'
import { useOPFContext } from '@/contexts/OPFContext'
import { epoch as getEpoch, get_agg_predval } from '@/utils/predictoor'
import { useEffect, useState } from 'react'

// 3 States => Defines how the Prediction component behaves
// Disable eslint because async nature of code, esp. config.forEach(async (data) => {...})
/* eslint-disable no-unused-vars */
export enum PredictionState {
  Next = 'next',
  Live = 'live',
  History = 'history'
}
/* eslint-enable no-unused-vars */

export default function Prediction(props: {
  state: PredictionState
  epochOffset: number // offset from epoch index
  predictoorContractAddress: string // predictoor contract address
}) {
  // Contexts
  const { wallet, provider } = useOPFContext()
  const { 
    epochIndex, 
    incrementEpochIndex, 
    price, 
    updatePrice,
    balance,
    updateBalance
  } = useLocalEpochContext()

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
      const fetchData = async () => {
        const curEpoch: number = await getEpoch(
          provider,
          props.predictoorContractAddress
        )
        const newEpoch: number = curEpoch + props.epochOffset
        setEpoch(newEpoch)

        const aggPredval = await get_agg_predval(
          provider,
          props.predictoorContractAddress,
          newEpoch
        )

        setBlockNum(Number(aggPredval?.blockNum))
        setDir(Number(aggPredval?.dir))
        setConfidence(Number(aggPredval?.confidence))
        setStake(Number(aggPredval?.stake))

        // If in local mode, we want to use the mock data & implementation
        if (process.env.NEXT_PUBLIC_ENV == 'local') {
          let randomConfidence = parseFloat(Math.random().toFixed(2));
          
          setEpoch(Number(epochIndex) + props.epochOffset)
          setBlockNum(1)
          setDir(randomConfidence > 0.5 ? 1 : -1);
          setConfidence(randomConfidence);
          setStake(100)

          let newPrice = price + (dir * 5.0);
          updatePrice(newPrice);

          let newBalance = balance + (dir * 5.0);
          updateBalance(newBalance);
        }       
      }
      fetchData()
    }
  }, [
    wallet,
    provider,
    props.predictoorContractAddress,
    props.epochOffset,
    epochIndex
  ])

  return (
    <div>
      State: {props.state} <br />
      <br />
      Epoch: {epoch} <br />
      <br />
      epochOffset: {props.epochOffset} <br />
      <br />
      BlockNum: {blockNum} <br />
      <br />
      Dir: {dir} <br />
      <br />
      Confidence: {confidence} <br />
      <br />
      Stake: {stake} <br />
      <br />
      {process.env.NEXT_PUBLIC_ENV == 'local' &&
        props.state === PredictionState.Next && (
          <button onClick={incrementEpochIndex}>BUY</button>
        )}
      {props.state === PredictionState.History && <span>PnL: N/A</span>}
    </div>
  )
}
