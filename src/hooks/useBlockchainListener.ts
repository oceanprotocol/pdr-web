import { TSocketFeedData } from '@/contexts/SocketContext.types'
import { currentConfig } from '@/utils/appconstants'
import { TGetAggPredvalResult } from '@/utils/contracts/ContractReturnTypes'
import Predictoor from '@/utils/contracts/Predictoor'
import {
  TGetMultiplePredictionsResult,
  getMultiplePredictions
} from '@/utils/contracts/helpers/getMultiplePredictions'
import { networkProvider } from '@/utils/networkProvider'
import { TPredictionContract } from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { DeepNonNullable, calculatePredictionEpochs, omit } from '@/utils/utils'
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useAccount } from 'wagmi'

export type TUseBlockchainListener = {
  providedContracts?: Record<string, TPredictionContract>
  setEpochData: React.Dispatch<React.SetStateAction<TSocketFeedData | null>>
}

export type TUseBlockchainListenerResult = {
  subscribedContracts: Predictoor[]
  predictedEpochs: MutableRefObject<
    Record<string, TPredictedEpochLogItem[]> | undefined
  >
}

export type TPredictedEpochLogItem = TGetAggPredvalResult & {
  epoch: number
  epochStartTsNumber: number
  secondsPerEpoch: number
  currentBlockNumber: number
}

const useBlockchainListener = ({
  providedContracts,
  setEpochData
}: TUseBlockchainListener): TUseBlockchainListenerResult => {
  const { address } = useAccount()
  const [subscribedContracts, setSubscribedContracts] = useState<Predictoor[]>(
    []
  )

  const lastCheckedEpoch = useRef<number>(0)
  const predictedEpochs =
    useRef<Record<string, Array<TPredictedEpochLogItem>>>()

  const eleminateFreeContracts = useCallback<
    (contracts: Record<string, TPredictionContract>) => TPredictionContract[]
  >(
    (contracts) =>
      Object.values(contracts).filter(
        (contract) =>
          !currentConfig.opfProvidedPredictions.includes(contract.address)
      ),
    []
  )

  const initializeContracts = useCallback(
    async (contracts: Record<string, TPredictionContract>) => {
      if (!address) return

      const contractsToWatch = eleminateFreeContracts(contracts)

      console.log('contractsToWatch', contractsToWatch)
      const contractsResult = await Promise.all(
        contractsToWatch.map(async (contract) => {
          const predictoor = new Predictoor(
            contract.address,
            networkProvider.getProvider()
          )
          await predictoor.init()
          return predictoor
        })
      )

      const validSubscriptionResult = await Promise.all(
        contractsResult.map((predictorContract) =>
          predictorContract.isValidSubscription(address)
        )
      )

      const validSubscriptions = contractsResult.filter(
        (contract, index) => validSubscriptionResult[index]
      )

      setSubscribedContracts(validSubscriptions)
    },
    [eleminateFreeContracts, address]
  )

  const getPredictedEpochsByContract = useCallback(
    (contractAddress: string) => {
      const tempData = predictedEpochs.current?.[contractAddress]
      if (tempData) {
        const sortedEpochs = tempData.sort((a, b) => a.epoch - b.epoch)
        const lastTwoEpochs = sortedEpochs.slice(-2)
        return lastTwoEpochs
      }
      return []
    },
    []
  )

  const addItemToPredictedEpochs = useCallback<
    (args: { contractAddress: string; item: TPredictedEpochLogItem }) => void
  >(({ contractAddress, item }) => {
    if (!predictedEpochs.current) {
      predictedEpochs.current = {}
    }
    if (!predictedEpochs.current[contractAddress]) {
      predictedEpochs.current[contractAddress] = []
    }
    if (
      predictedEpochs.current[contractAddress].filter(
        (pItem) => pItem.epoch === item.epoch
      ).length > 0
    ) {
      return
    }
    predictedEpochs.current[contractAddress].push(item)
  }, [])

  const detectNewEpochs = useCallback<
    (args: {
      subscribedContracts: Predictoor[]
      predictionEpochs: Array<number>
    }) => Array<number>
  >(({ subscribedContracts, predictionEpochs }) => {
    const newEpochsSet = new Set<number>()
    subscribedContracts.forEach((contract) => {
      predictionEpochs.forEach((epoch) => {
        if (
          !predictedEpochs.current?.[contract.address]
            ?.map((item) => item.epoch)
            .includes(epoch)
        ) {
          newEpochsSet.add(epoch)
        }
      })
    })
    return Array.from(newEpochsSet)
  }, [])

  const addChainListener = useCallback(async () => {
    if (!setEpochData || !address || !providedContracts) return
    console.log('herre')
    const SPE = await subscribedContracts[0]?.getSecondsPerEpoch()
    const provider = networkProvider.getProvider()
    provider.on('block', (blockNumber) => {
      const currentEpoch = Math.floor(Date.UTC() / 1000 / SPE)
      if (currentEpoch === lastCheckedEpoch.current) return
      lastCheckedEpoch.current = currentEpoch
      const predictionEpochs = calculatePredictionEpochs(currentEpoch, SPE)

      const newEpochs = detectNewEpochs({
        subscribedContracts,
        predictionEpochs
      })

      const subscribedContractAddresses = subscribedContracts.map(
        (contract) => contract.address
      )

      const cachedValues = subscribedContractAddresses.flatMap(
        (contractAddress) => {
          const cachedValue = getPredictedEpochsByContract(contractAddress)
          return cachedValue.map((item) => {
            return {
              ...item,
              contractAddress
            }
          })
        }
      )

      console.log('newEpochs', newEpochs)
      getMultiplePredictions({
        currentBlockNumber: blockNumber,
        epochs: newEpochs,
        contracts: subscribedContracts,
        userWallet: address,
        registerPrediction: addItemToPredictedEpochs
      }).then((result) => {
        console.log('result', result)
        subscribedContracts.forEach((contract) => {
          const pickedResults = result.filter(
            (item) => item !== null && item.contractAddress === contract.address
          ) as DeepNonNullable<Awaited<TGetMultiplePredictionsResult>>

          //get the epoch numbers from pickedResults
          const pickedResultsEpochs = pickedResults.map((item) => item?.epoch)

          //clear the same epoch data from pickedCache
          const pickedCaches = cachedValues.filter(
            (cachedValue) =>
              cachedValue.contractAddress === contract.address &&
              !pickedResultsEpochs.includes(cachedValue.epoch)
          )

          const items = [...pickedCaches, ...pickedResults]

          const dataPredictions = items.map((item) =>
            omit(item, ['contractAddress'])
          )

          const blockchainFeedData: any = {
            contractInfo: providedContracts[contract.address],
            predictions: dataPredictions
          }

          setEpochData((prev) => {
            console.log('prev', prev)
            console.log('FeedData From Blockchain', blockchainFeedData)
            if (!prev) return [blockchainFeedData]

            const prevItems = prev.filter(
              (item) => item.contractInfo.address !== contract.address
            )

            return [...prevItems, blockchainFeedData]
          })
        })
      })
      //await contract.getAggPredval(epoch, predictoorWallet)
    })
  }, [
    setEpochData,
    address,
    subscribedContracts,
    providedContracts,
    addItemToPredictedEpochs,
    getPredictedEpochsByContract,
    detectNewEpochs
  ])

  useEffect(() => {
    if (!providedContracts) return
    initializeContracts(providedContracts)
  }, [initializeContracts, providedContracts])

  useEffect(() => {
    if (subscribedContracts.length === 0) return
    const provider = networkProvider.getProvider()
    addChainListener()
    return () => {
      provider.removeAllListeners('block')
    }
  }, [subscribedContracts, addChainListener])

  return {
    subscribedContracts,
    predictedEpochs
  }
}
export default useBlockchainListener
