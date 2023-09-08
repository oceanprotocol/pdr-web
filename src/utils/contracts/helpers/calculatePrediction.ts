import { PredictionResult } from "../Predictoor";

// Helper function to calculate the prediction direction and confidence
export const calculatePrediction = (nom: string, denom: string): PredictionResult => {
    let confidence: number = parseFloat(nom) / parseFloat(denom);
    let dir: number = confidence >= 0.5 ? 1 : 0;
    if (confidence > 0.5) {
        confidence -= 0.5;
    } else {
        confidence = 0.5 - confidence;
    }
    confidence = (confidence / 0.5) * 100;
  
    return {
        nom: nom,
        denom: denom,
        confidence: confidence,
        dir: dir,
        stake: parseFloat(denom),
    };
  }
  