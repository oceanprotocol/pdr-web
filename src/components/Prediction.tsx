import { useState, useEffect } from "react";
import { useRPCContext } from "@/contexts/RPCContext";
import { epoch, get_agg_predval } from "@/utils/predictoor";

export default function Prediction(props: {
    epochOffset: number, // offset from epoch index
    predictoorContractAddress: string // predictoor contract address
}) {
    const { wallet, provider } = useRPCContext();
    const [blockNumResult, setBlockNumResult] = useState(0);
    const [epochResult, setEpochResult] = useState(0);
    const [confidenceResult, setConfidenceResult] = useState(0);
    const [dirResult, setDirResult] = useState(0);
    const [stakeResult, setStakeResult] = useState(0);
    
    useEffect(() => {
        if( provider ) {
            const fetchData = async () => {
                const epochResult = await epoch(provider, props.predictoorContractAddress);
                setEpochResult(Number(epochResult));

                const aggPredvalResult = await get_agg_predval(
                    provider, 
                    props.predictoorContractAddress,
                    epochResult + props.epochOffset
                );

                setBlockNumResult(Number(aggPredvalResult?.blockNum));
                setDirResult(Number(aggPredvalResult?.dir));
                setConfidenceResult(Number(aggPredvalResult?.confidence));
                setStakeResult(Number(aggPredvalResult?.stake));
            };

            fetchData();
        }
    }, [wallet, provider, props.predictoorContractAddress, props.epochOffset]);

    return (
        <div>
            Epoch: {epochResult} <br/><br/>
            epochOffset: {props.epochOffset} <br/><br/>
            predictoorContractAddress: {props.predictoorContractAddress} <br/><br/>
            BlockNum: {blockNumResult} <br/><br/>
            Dir: {dirResult} <br/><br/>
            Confidence: {confidenceResult} <br/><br/>
            Stake: {stakeResult} <br/><br/>
        </div>
    )
}