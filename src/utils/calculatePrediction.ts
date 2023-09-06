import { PredictionResult } from '@/contexts/PredictionHistoryContext.types'

const calculateConfidence = (nom: string, denom: string): number => {
  // calculate confidence based on the ratio of the two inputs
  let confidence: number = parseFloat(nom) / parseFloat(denom)
  // calculate the difference from 0.5
  if (confidence > 0.5) {
    confidence -= 0.5
  } else {
    confidence = 0.5 - confidence
  }
  // scale the difference to a percentage
  confidence = (confidence / 0.5) * 100

  return confidence
}

const calculateDirection = (nom: string, denom: string): number => {
  // calculate direction based on whether the result is greater than 0.5
  let dir: number = parseFloat(nom) / parseFloat(denom)
  return dir >= 0.5 ? 1 : 0
}

export const calculatePrediction = (
  nom: string,
  denom: string
): PredictionResult => {
  const confidence: number = calculateConfidence(nom, denom)
  const dir: number = calculateDirection(nom, denom)
  return {
    nom: nom,
    denom: denom,
    confidence: confidence,
    dir: dir,
    stake: parseFloat(denom)
  }
}
