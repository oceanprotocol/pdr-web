import { useEpochContext } from "@/contexts/EpochContext";
import { useOPFContext } from "@/contexts/OPFContext";
import { epoch as getEpoch, get_agg_predval } from "@/utils/predictoor";
import { useEffect, useState } from "react";

// 3 States => Defines how the Prediction component behaves
enum PredictionState {
    Next = 'next',
    Live = 'live',
    History = 'history',
}

function Prediction(props: {
    state: PredictionState,
    epochOffset: number, // offset from epoch index
    predictoorContractAddress: string // predictoor contract address
}) {
    // Contexts
    const {wallet, provider} = useOPFContext();
    const {epochIndex, incrementEpochIndex} = useEpochContext();
                
    // Component Params
    const [blockNum, setBlockNum] = useState(0);
    const [epoch, setEpoch] = useState(0);
    const [confidence, setConfidence] = useState(0);
    const [dir, setDir] = useState(0);
    const [stake, setStake] = useState(0);
    
    // Next State Params
    // Live State Params
    // History State Params
    
    useEffect(() => {
        if( provider ) {
            /// If in local mode, we want to use the mock data & implementation
            if( process.env.NEXT_PUBLIC_ENV == 'local' ) {
                setEpoch(Number(epochIndex) + props.epochOffset);
                setBlockNum(1);
                setDir(0.7);
                setConfidence(1);
                setStake(100);
                return;
            }
            
            const fetchData = async () => {
                const curEpoch:Number = await getEpoch(provider, props.predictoorContractAddress);
                setEpoch(Number(curEpoch) + props.epochOffset);

                const aggPredval = await get_agg_predval(
                    provider, 
                    props.predictoorContractAddress,
                    epoch + props.epochOffset
                );
                
                setBlockNum(Number(aggPredval?.blockNum));
                setDir(Number(aggPredval?.dir));
                setConfidence(Number(aggPredval?.confidence));
                setStake(Number(aggPredval?.stake));             
            };
            fetchData();
        }
    }, [wallet, provider, props.predictoorContractAddress, props.epochOffset, epochIndex]);

    return (
        <div>
            {props.state === PredictionState.Next && (
            <div>
                State: {props.state} <br/><br/>
                Epoch: {epoch} <br/><br/>
                epochOffset: {props.epochOffset} <br/><br/>
                BlockNum: {blockNum} <br/><br/>
                Dir: {dir} <br/><br/>
                Confidence: {confidence} <br/><br/>
                Stake: {stake} <br/><br/>
                {process.env.NEXT_PUBLIC_ENV == 'local' && (
                    <button onClick={incrementEpochIndex}>BUY</button>
                )}
            </div>
            )}
            {props.state === PredictionState.Live && (
            <div>
                State: {props.state} <br/><br/>
                Epoch: {epoch} <br/><br/>
                epochOffset: {props.epochOffset} <br/><br/>
                BlockNum: {blockNum} <br/><br/>
                Dir: {dir} <br/><br/>
                Confidence: {confidence} <br/><br/>
            </div>
            )}
            {props.state === PredictionState.History && (
            <div>
                State: {props.state} <br/><br/>
                Epoch: {epoch} <br/><br/>
                epochOffset: {props.epochOffset} <br/><br/>
                BlockNum: {blockNum} <br/><br/>
                PnL: N/A <br/><br/>
            </div>
            )}
        </div>
    )          
}

export {
    Prediction,
    PredictionState
};
