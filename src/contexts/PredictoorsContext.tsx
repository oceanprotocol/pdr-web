import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useIsCorrectChain } from '@/hooks/useIsCorrectChain'
import { AuthorizationData } from '@/utils/AuthorizationData'
import {
  PREDICTION_FETCH_EPOCHS_DELAY,
  currentConfig
} from '@/utils/appconstants'
import {
  TAuthorization,
  authorizeWithWallet,
  getValidSignedMessageFromLS
} from '@/utils/authorize'
import { TGetAggPredvalResult } from '@/utils/contracts/ContractReturnTypes'
import Predictoor from '@/utils/contracts/Predictoor'
import {
  TGetMultiplePredictionsResult,
  getMultiplePredictions
} from '@/utils/contracts/helpers/getMultiplePredictions'
import { networkProvider } from '@/utils/networkProvider'
import {
  TPredictionContract,
  getAllInterestingPredictionContracts
} from '@/utils/subgraphs/getAllInterestingPredictionContracts'
import { EPredictoorContractInterval } from '@/utils/types/EPredictoorContractInterval'
import {
  DeepNonNullable,
  calculatePredictionEpochs,
  isSapphireNetwork,
  omit
} from '@/utils/utils'
import { ethers } from 'ethers'
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
  filterAllowedContracts,
  filterIntervalContracts
} from './PredictoorsContextHelper'
import { useSocketContext } from './SocketContext'
import { useTimeFrameContext } from './TimeFrameContext'
import { useUserContext } from './UserContext'

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
  setCurrentEpoch: (data) => {},
  setIsNewContractsInitialized: (data) => {},
  getUserSignature: () => {},
  subscribedPredictoors: [],
  contracts: undefined,
  secondsPerEpoch: 0,
  fetchingPredictions: false,
  currentEpoch: 0,
  isNewContractsInitialized: false,
  contractPrices: {}
})

// Custom hook to use the OPFOwnerPredictoorsContext
export const usePredictoorsContext = () => {
  return useContext(PredictoorsContext)
}

export const PredictoorsProvider: React.FC<TPredictoorsContextProps> = ({
  children
}) => {
  const { address } = useAccount()

  const signer = useEthersSigner({
    chainId: parseInt(currentConfig.chainId)
  })
  const { isCorrectNetwork } = useIsCorrectChain()
  const { timeFrameInterval } = useTimeFrameContext()
  const { setUserSignature } = useUserContext()

  const { handleEpochData, initialEpochData } = useSocketContext()
  const [currentEpoch, setCurrentEpoch] = useState<number>(0)
  const currentEpochRef = useRef(currentEpoch)

  const [secondsPerEpoch, setSecondsPerEpoch] = useState<number>(0)
  const [fetchingPredictions, setFetcingPredictions] = useState<boolean>(false)

  const [predictoorInstances, setPredictorInstances] = useState<
    TPredictoorsContext['predictoorInstances']
  >([])

  const [subscribedPredictoors, setSubscribedPredictoors] = useState<
    TPredictoorsContext['subscribedPredictoors']
  >([])
  const [previousSubscribedPredictoors, setPreviousSubscribedPredictoors] =
    useState<TPredictoorsContext['subscribedPredictoors']>([])
  const previousSubscribedPredictoorsRef = useRef(previousSubscribedPredictoors)
  const [contracts, setContracts] = useState<TPredictoorsContext['contracts']>()

  const [contractPrices, setContractPrices] = useState<
    TPredictoorsContext['contractPrices']
  >({})

  const [isNewContractsInitialized, setIsNewContractsInitialized] =
    useState<boolean>(false)

  const contractPricesRef = useRef(contractPrices)

  const lastCheckedEpoch = useRef<number>(0)
  const lastTimeframe = useRef<EPredictoorContractInterval>(
    EPredictoorContractInterval.e_5M
  )
  const predictedEpochs =
    useRef<Record<string, Array<TPredictedEpochLogItem>>>()

  const authorizationDataInstance = useRef<AuthorizationData<TAuthorization>>()

  const checkAndSetCurrentEpoch = useCallback((epoch: number) => {
    if (currentEpochRef.current === epoch) return
    console.log('current epoch changed', epoch)
    setCurrentEpoch(epoch)
    currentEpochRef.current = epoch
  }, [])

  const initializeAuthorizationData = useCallback(
    async (signer: ethers.providers.JsonRpcSigner) => {
      const initialData = await authorizeWithWallet(signer, 86400)

      if (!initialData) {
        setUserSignature(false)
        return
      }

      const authorizationData = new AuthorizationData<TAuthorization>({
        initialData,
        createCallback: async () => authorizeWithWallet(signer, 86400)
      })
      setUserSignature(true)
      authorizationDataInstance.current = authorizationData
    },
    []
  )

  useEffect(() => {
    if (predictoorInstances.length === 0) return

    const contractAddresses = predictoorInstances.map(
      (predictorInstance) => predictorInstance.address
    )

    const alreadyFetchedPrices = Object.keys(contractPricesRef.current)

    const contractsToFetch = contractAddresses.filter(
      (contractAddress) => !alreadyFetchedPrices.includes(contractAddress)
    )

    if (contractsToFetch.length === 0) return

    Promise.all(
      predictoorInstances
        .filter((predictorInstance) =>
          contractsToFetch.includes(predictorInstance.address)
        )
        .map((predictorInstance) =>
          predictorInstance.getReadableContractPrice()
        )
    ).then(
      (
        prices: Array<
          Awaited<ReturnType<Predictoor['getReadableContractPrice']>>
        >
      ) => {
        const contractPricesObject = predictoorInstances.reduce(
          (acc, contract, index) => {
            return {
              ...acc,
              [contract.address]: prices[index]
            }
          },
          {}
        )

        setContractPrices((prev) => {
          const newStateValue = {
            ...prev,
            ...contractPricesObject
          }
          contractPricesRef.current = newStateValue
          return newStateValue
        })
      }
    )
  }, [predictoorInstances])

  useEffect(() => {
    if (!signer || subscribedPredictoors.length === 0) return
    getValidSignedMessageFromLS(signer).then((lsSignedMessage) => {
      if (lsSignedMessage) {
        const authorizationData = new AuthorizationData<TAuthorization>({
          initialData: lsSignedMessage,
          createCallback: async () => authorizeWithWallet(signer, 86400)
        })
        authorizationDataInstance.current = authorizationData
        setUserSignature(true)
        return
      } else {
        setUserSignature(false)
      }
    })
  }, [signer, subscribedPredictoors.length, initializeAuthorizationData])

  const getUserSignature = () => {
    if (!signer || subscribedPredictoors.length === 0) return undefined
    initializeAuthorizationData(signer)
  }

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
    async (
      contracts: Record<string, TPredictionContract>,
      signer: ethers.providers.JsonRpcSigner | undefined
    ) => {
      if (typeof window === 'undefined') return

      let tempSigner = signer

      if (!tempSigner || !isCorrectNetwork) {
        const randomSigner = ethers.Wallet.createRandom().connect(
          networkProvider.getProvider()
        )
        tempSigner = randomSigner as any as ethers.providers.JsonRpcSigner
      }

      var cEpoch: number
      var sPerEpoch: number

      const contractsToWatch = Object.values(contracts)

      const contractsResult = await Promise.all(
        contractsToWatch.map(async (contract, key) => {
          const predictoor = new Predictoor(
            contract.address,
            networkProvider.getProvider(),
            contract,
            tempSigner as ethers.providers.JsonRpcSigner,
            isSapphireNetwork()
          )
          await predictoor.init()

          if (key == 0) {
            cEpoch = await predictoor.getCurrentEpoch()
            sPerEpoch = await predictoor.getSecondsPerEpoch()
            checkAndSetCurrentEpoch(cEpoch)
            setSecondsPerEpoch(sPerEpoch)
          }
          return predictoor
        })
      )

      setIsNewContractsInitialized(true)
      setPredictorInstances(contractsResult)

      const address = await tempSigner.getAddress()

      if (!address) return

      const validSubscriptions = await checkAllContractsForSubscriptions({
        predictoorInstances: contractsResult,
        address
      })

      setSubscribedPredictoors(validSubscriptions)
    },
    [checkAllContractsForSubscriptions, isCorrectNetwork]
  )

  const getPredictedEpochsByContract = useCallback(
    (contractAddress: string, epoch: number, sPerEpoch: number) => {
      const tempData = predictedEpochs.current?.[contractAddress]
      if (tempData) {
        const sortedEpochs = tempData.sort((a, b) => a.epoch - b.epoch)
        const validEpochs = sortedEpochs.filter(
          (d) => epoch - d.epoch <= sPerEpoch
        )
        return validEpochs
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

  function arraysAreSame(x: any, y: any) {
    if (x.length != y.length) return false

    for (let index = 0; index < x.length; index++) {
      if (x[index].address !== y[index].address) {
        return false
      }
    }

    return true
  }

  const addChainListener = useCallback(
    async (
      secondsPerEpoch: number,
      currentEpoch: number,
      subscribedPredictoorsNew: TPredictoorsContext['subscribedPredictoors']
    ) => {
      if (!predictoorInstances || currentEpoch == 0) return
      const SPE = secondsPerEpoch
      const provider = networkProvider.getProvider()
      let cEpoch = currentEpoch
      provider.on('block', async (blockNumber) => {
        let block = await provider.getBlock(blockNumber)
        const currentTs = block.timestamp
        const newCurrentEpoch = Math.floor(currentTs / SPE)
        if (
          currentTs - lastCheckedEpoch.current * SPE <
            SPE + PREDICTION_FETCH_EPOCHS_DELAY &&
          timeFrameInterval == lastTimeframe.current &&
          arraysAreSame(
            subscribedPredictoorsNew,
            previousSubscribedPredictoorsRef.current
          )
        )
          return

        if (currentTs > cEpoch + SPE) {
          cEpoch = newCurrentEpoch * SPE
          checkAndSetCurrentEpoch(cEpoch)
        }

        const authorizationData =
          authorizationDataInstance.current?.getAuthorizationData()

        if (
          subscribedPredictoors.length === 0 ||
          !address ||
          !signer ||
          !authorizationData
        )
          return

        setFetcingPredictions(true)
        setPreviousSubscribedPredictoors([...subscribedPredictoorsNew])

        lastCheckedEpoch.current = newCurrentEpoch
        lastTimeframe.current = timeFrameInterval
        const predictionEpochs = calculatePredictionEpochs(newCurrentEpoch, SPE)

        const newEpochs = detectNewEpochs({
          subscribedPredictoors: subscribedPredictoorsNew,
          predictionEpochs,
          predictedEpochs: predictedEpochs.current
        })

        const subscribedContractAddresses = subscribedPredictoorsNew.map(
          (contract) => contract.address
        )

        const cachedValues = subscribedContractAddresses.flatMap(
          (contractAddress) => {
            const cachedValue = getPredictedEpochsByContract(
              contractAddress,
              cEpoch,
              SPE
            )
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
          contracts: subscribedPredictoorsNew,
          userWallet: signer,
          registerPrediction: addItemToPredictedEpochs,
          authorizationData
        }).then((result) => {
          subscribedPredictoorsNew.forEach((contract) => {
            const pickedResults = result.filter(
              (item) =>
                item !== null && item.contractAddress === contract.address
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
              contractInfo: contracts ? contracts[contract.address] : null,
              predictions: dataPredictions
            }

            handleEpochData([blockchainFeedData])
          })
          setFetcingPredictions(false)
        })
        //await contract.getAggPredval(epoch, predictoorWallet)
      })
    },
    [
      handleEpochData,
      address,
      contracts,
      subscribedPredictoors.length,
      getPredictedEpochsByContract,
      addItemToPredictedEpochs,
      signer
    ]
  )

  useEffect(() => {
    if (!contracts) return
    initializeContracts(contracts, signer)
  }, [initializeContracts, contracts, signer])

  useEffect(() => {
    if (
      predictoorInstances.length == 0 ||
      secondsPerEpoch == 0 ||
      currentEpoch == 0
    )
      return
    const provider = networkProvider.getProvider()
    addChainListener(secondsPerEpoch, currentEpoch, subscribedPredictoors)
    return () => {
      provider.removeAllListeners('block')
    }
  }, [subscribedPredictoors, currentEpoch])

  useEffect(() => {
    getAllInterestingPredictionContracts(
      currentConfig.subgraph,
      currentConfig.blacklistedPredictions
    ).then((contracts) => {
      const allowedContracts: Record<string, TPredictionContract> =
        filterAllowedContracts({
          contracts,
          opfOwnerAddress: currentConfig.opfOwnerAddress,
          allowedPredConfig: currentConfig.allowedPredictions
        })

      const contractsOfTheTimeframe = filterIntervalContracts({
        contracts: allowedContracts,
        interval: timeFrameInterval
      })
      setContracts(contractsOfTheTimeframe)
    })
  }, [setContracts, timeFrameInterval])

  useEffect(() => {
    if (!initialEpochData) return
    let serverContracts = contracts || {}
    initialEpochData.forEach((data) => {
      serverContracts[data.contractInfo?.address] = {
        ...data?.contractInfo,
        owner: currentConfig.opfOwnerAddress
      }
    })
    setContracts(serverContracts)
  }, [initialEpochData])

  useEffect(() => {
    previousSubscribedPredictoorsRef.current = previousSubscribedPredictoors
  }, [previousSubscribedPredictoors])

  return (
    <PredictoorsContext.Provider
      value={{
        predictoorInstances,
        runCheckContracts,
        checkAndAddInstance,
        getPredictorInstanceByAddress,
        setCurrentEpoch,
        setIsNewContractsInitialized,
        getUserSignature,
        contracts,
        currentEpoch,
        secondsPerEpoch,
        subscribedPredictoors,
        fetchingPredictions,
        contractPrices,
        isNewContractsInitialized
      }}
    >
      {children}
    </PredictoorsContext.Provider>
  )
}
