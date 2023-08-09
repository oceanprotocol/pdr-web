import { useEthersSigner } from '@/hooks/useEthersSigner'
import { AuthorizationData } from '@/utils/AuthorizationData'
import {
  PREDICTION_FETCH_EPOCHS_DELAY,
  currentConfig
} from '@/utils/appconstants'
import { authorize } from '@/utils/authorize'
import { TGetAggPredvalResult } from '@/utils/contracts/ContractReturnTypes'
import Predictoor, { TAuthorizationUser } from '@/utils/contracts/Predictoor'
import {
  TGetMultiplePredictionsResult,
  getMultiplePredictions
} from '@/utils/contracts/helpers/getMultiplePredictions'
import { networkProvider } from '@/utils/networkProvider'
import {
  TPredictionContract,
  getAllInterestingPredictionContracts
} from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { DeepNonNullable, calculatePredictionEpochs, omit } from '@/utils/utils'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useAccount } from 'wagmi'
import {
  TPredictoorsContext,
  TPredictoorsContextProps
} from './PredictoorsContext.types'
import {
  detectNewEpochs,
  filterAllowedContracts
} from './PredictoorsContextHelper'
import { useSocketContext } from './SocketContext'

type TContractsState = Awaited<
  ReturnType<typeof getAllInterestingPredictionContracts>
>

export type TPredictedEpochLogItem = TGetAggPredvalResult & {
  epoch: number
  epochStartTs: number
  secondsPerEpoch: number
  currentTs: number
}

// OPFOwnerPredictoorsContext
export const PredictoorsContext = createContext<TPredictoorsContext>({
  predictoorInstances: [],
  checkAndAddInstance: (data) => {},
  getPredictorInstanceByAddress: (data) => undefined,
  runCheckContracts: () => {},
  subscribedPredictoors: [],
  contracts: undefined
})

// Custom hook to use the OPFOwnerPredictoorsContext
export const usePredictoorsContext = () => {
  return useContext(PredictoorsContext)
}

export const PredictoorsProvider: React.FC<TPredictoorsContextProps> = ({
  children
}) => {
  const { address } = useAccount()
  const signer = useEthersSigner({})
  const { setEpochData, initialEpochData } = useSocketContext()

  const [predictoorInstances, setPredictorInstances] = useState<
    TPredictoorsContext['predictoorInstances']
  >([])
  const [subscribedPredictoors, setSubscribedPredictoors] = useState<
    Predictoor[]
  >([])
  const [contracts, setContracts] = useState<TContractsState>()

  const lastCheckedEpoch = useRef<number>(0)
  const predictedEpochs =
    useRef<Record<string, Array<TPredictedEpochLogItem>>>()

  const authorizationDataInstance =
    useRef<AuthorizationData<TAuthorizationUser>>()

  const initializeAuthorizationData = useCallback(async (address: string) => {
    const initialData = await authorize(address, 86400)
    const authorizationData = new AuthorizationData<TAuthorizationUser>({
      initialData,
      createCallback: () => authorize(address, 86400)
    })
    authorizationDataInstance.current = authorizationData
  }, [])

  useEffect(() => {
    if (!address) return undefined
    initializeAuthorizationData(address)
  }, [address, initializeAuthorizationData])

  const checkIfContractIsSubscribed = useCallback(
    (contractAddress: string) => {
      return predictoorInstances.some(
        (predictorInstance) => predictorInstance.address === contractAddress
      )
    },
    [predictoorInstances]
  )

  const getPredictorInstanceByAddress = useCallback(
    (contractAddress: string) => {
      return predictoorInstances.find(
        (predictorInstance) => predictorInstance.address === contractAddress
      )
    },
    [predictoorInstances]
  )

  const checkAndAddInstance = useCallback(
    (predictorInstance: Predictoor) => {
      if (!checkIfContractIsSubscribed(predictorInstance.address)) {
        setPredictorInstances((prevState) => [...prevState, predictorInstance])
      }
    },
    [checkIfContractIsSubscribed]
  )

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

  const checkAllContractsForSubscriptions = useCallback<
    (args: {
      predictoorInstances: Array<Predictoor>
      address: string
    }) => Promise<Array<Predictoor>>
  >(async ({ predictoorInstances, address }) => {
    const validSubscriptionResult = await Promise.all(
      predictoorInstances.map((predictorInstance) =>
        predictorInstance.isValidSubscription(address)
      )
    )

    const validSubscriptions = predictoorInstances.filter(
      (contract, index) => validSubscriptionResult[index]
    )

    return validSubscriptions
  }, [])

  const runCheckContracts = useCallback(async () => {
    if (!address) return

    const validSubscriptions = await checkAllContractsForSubscriptions({
      predictoorInstances: predictoorInstances,
      address
    })

    setSubscribedPredictoors(validSubscriptions)
  }, [address, checkAllContractsForSubscriptions, predictoorInstances])

  const initializeContracts = useCallback(
    async (contracts: Record<string, TPredictionContract>) => {
      if (!address) return

      const contractsToWatch = eleminateFreeContracts(contracts)

      const contractsResult = await Promise.all(
        contractsToWatch.map(async (contract) => {
          const predictoor = new Predictoor(
            contract.address,
            networkProvider.getProvider(),
            contract
          )
          await predictoor.init()
          return predictoor
        })
      )

      setPredictorInstances(contractsResult)
      const validSubscriptions = await checkAllContractsForSubscriptions({
        predictoorInstances: contractsResult,
        address
      })

      setSubscribedPredictoors(validSubscriptions)
    },
    [eleminateFreeContracts, address, checkAllContractsForSubscriptions]
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

  const addChainListener = useCallback(async () => {
    if (!setEpochData || !address || !contracts || !signer) return

    const SPE = await subscribedPredictoors[0]?.getSecondsPerEpoch()
    const provider = networkProvider.getProvider()
    provider.on('block', async (blockNumber) => {
      const block = await provider.getBlock(blockNumber)
      const currentTs = block.timestamp
      const currentEpoch = Math.floor(currentTs / SPE)
      if (
        blockNumber - lastCheckedEpoch.current * SPE <
        SPE + PREDICTION_FETCH_EPOCHS_DELAY
      )
        return
      lastCheckedEpoch.current = currentEpoch
      const predictionEpochs = calculatePredictionEpochs(currentEpoch, SPE)

      const newEpochs = detectNewEpochs({
        subscribedPredictoors,
        predictionEpochs,
        predictedEpochs: predictedEpochs.current
      })

      const subscribedContractAddresses = subscribedPredictoors.map(
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

      getMultiplePredictions({
        currentTs: currentTs,
        epochs: newEpochs,
        contracts: subscribedPredictoors,
        userWallet: signer,
        registerPrediction: addItemToPredictedEpochs,
        authorizationData:
          authorizationDataInstance.current?.getAuthorizationData()
      }).then((result) => {
        console.log(result)
        subscribedPredictoors.forEach((contract) => {
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
            contractInfo: contracts[contract.address],
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
    contracts,
    subscribedPredictoors,
    getPredictedEpochsByContract,
    addItemToPredictedEpochs,
    signer
  ])

  useEffect(() => {
    if (!contracts) return
    initializeContracts(contracts)
  }, [initializeContracts, contracts])

  useEffect(() => {
    if (subscribedPredictoors.length === 0) return
    const provider = networkProvider.getProvider()
    addChainListener()
    return () => {
      provider.removeAllListeners('block')
    }
  }, [subscribedPredictoors, addChainListener])

  useEffect(() => {
    getAllInterestingPredictionContracts(currentConfig.subgraph).then(
      (contracts) => {
        const filteredContracts = filterAllowedContracts({
          contracts,
          opfOwnerAddress: currentConfig.opfOwnerAddress
        })
        setContracts(filteredContracts)
      }
    )
  }, [setContracts])

  useEffect(() => {
    if (!initialEpochData) return
    let serverContracts = contracts || {}
    initialEpochData.forEach((data) => {
      serverContracts[data.contractInfo.address] = {
        ...data.contractInfo,
        owner: currentConfig.opfOwnerAddress
      }
    })
    setContracts(serverContracts)
  }, [initialEpochData])

  return (
    <PredictoorsContext.Provider
      value={{
        predictoorInstances,
        runCheckContracts,
        checkAndAddInstance,
        getPredictorInstanceByAddress,
        contracts,
        subscribedPredictoors
      }}
    >
      {children}
    </PredictoorsContext.Provider>
  )
}
