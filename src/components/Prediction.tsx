import { useState, useEffect } from "react";
import { useRPCContext } from "@/contexts/RPCContext";
import { epoch, get_agg_predval } from "@/utils/predictoor";

export default function Prediction(
    epochOffset: number, // offset from epoch index
    predictoorContractAddress: string // predictoor contract address
) {
    const { wallet, provider } = useRPCContext();
    const [blockNumResult, setBlockNumResult] = useState(0);
    const [epochResult, setEpochResult] = useState(0);
    const [confidenceResult, setConfidenceResult] = useState(0);
    const [dirResult, setDirResult] = useState(0);
    const [stakeResult, setStakeResult] = useState(0);
    
    useEffect(() => {
        if( provider ) {
            const fetchData = async () => {
                const epochResult = await epoch(provider, predictoorContractAddress);
                setEpochResult(Number(epochResult));

                const aggPredvalResult = await get_agg_predval(
                    provider, 
                    predictoorContractAddress,
                    epochResult + epochOffset
                );

                setBlockNumResult(Number(aggPredvalResult?.blockNum));
                setDirResult(Number(aggPredvalResult?.dir));
                setConfidenceResult(Number(aggPredvalResult?.confidence));
                setStakeResult(Number(aggPredvalResult?.stake));
            };

            fetchData();
        }
    }, [wallet, provider, predictoorContractAddress, epochOffset]);

    return (
        <div>
            Epoch: {epochResult}
            BlockNum: {blockNumResult}
            Dir: {dirResult}
            Confidence: {confidenceResult}
            Stake: {stakeResult}
        </div>
    )
}