import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useIsCorrectChain } from '@/hooks/useIsCorrectChain'
import { AuthorizationData } from '@/utils/AuthorizationData'
import {
  PREDICTION_FETCH_EPOCHS_DELAY,
  currentConfig
} from '@/utils/appconstants'
import { TAuthorization, authorizeWithWallet } from '@/utils/authorize'
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
  filterAllowedContracts
} from './PredictoorsContextHelper'
import { useSocketContext } from './SocketContext'

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
  setCurrentChainTime: (data) => {},
  setCurrentEpoch: (data) => {},
  subscribedPredictoors: [],
  contracts: undefined,
  secondsPerEpoch: 0,
  currentEpoch: 0,
  currentChainTime: 0,
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

  const { setEpochData, initialEpochData } = useSocketContext()
  const [currentChainTime, setCurrentChainTime] = useState<number>(0)
  const [currentEpoch, setCurrentEpoch] = useState<number>(0)
  const [secondsPerEpoch, setSecondsPerEpoch] = useState<number>(0)

  const [predictoorInstances, setPredictorInstances] = useState<
    TPredictoorsContext['predictoorInstances']
  >([])

  const [subscribedPredictoors, setSubscribedPredictoors] = useState<
    TPredictoorsContext['subscribedPredictoors']
  >([])
  const [contracts, setContracts] = useState<TPredictoorsContext['contracts']>()

  const [contractPrices, setContractPrices] = useState<
    TPredictoorsContext['contractPrices']
  >({})

  const contractPricesRef = useRef(contractPrices)

  const lastCheckedEpoch = useRef<number>(0)
  const predictedEpochs =
    useRef<Record<string, Array<TPredictedEpochLogItem>>>()

  const authorizationDataInstance = useRef<AuthorizationData<TAuthorization>>()

  const initializeAuthorizationData = useCallback(
    async (signer: ethers.providers.JsonRpcSigner) => {
      const initialData = await authorizeWithWallet(signer, 86400)

      const authorizationData = new AuthorizationData<TAuthorization>({
        initialData,
        createCallback: () => authorizeWithWallet(signer, 86400)
      })
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
    if (!signer || subscribedPredictoors.length === 0) return undefined
    initializeAuthorizationData(signer)
  }, [signer, subscribedPredictoors.length, initializeAuthorizationData])

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
            setCurrentEpoch(cEpoch)
            setSecondsPerEpoch(sPerEpoch)
          }
          return predictoor
        })
      )

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
    (contractAddress: string) => {
      const tempData = predictedEpochs.current?.[contractAddress]
      if (tempData) {
        const sortedEpochs = tempData.sort((a, b) => a.epoch - b.epoch)
        const lastThreeEpochs = sortedEpochs.slice(-2)
        return lastThreeEpochs
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

  const addChainListener = useCallback(
    async (secondsPerEpoch: number, currentEpoch: number) => {
      if (!predictoorInstances || currentEpoch == 0) return
      const SPE = secondsPerEpoch
      const provider = networkProvider.getProvider()
      let cEpoch = currentEpoch
      provider.on('block', async (blockNumber) => {
        const block = await provider.getBlock(blockNumber)
        const currentTs = block.timestamp
        const newCurrentEpoch = Math.floor(currentTs / SPE)
        if (
          currentTs - lastCheckedEpoch.current * SPE <
          SPE + PREDICTION_FETCH_EPOCHS_DELAY
        )
          return

        if (currentTs > cEpoch + SPE) {
          cEpoch = newCurrentEpoch * SPE
          setCurrentEpoch(cEpoch)
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

        lastCheckedEpoch.current = newCurrentEpoch
        const predictionEpochs = calculatePredictionEpochs(newCurrentEpoch, SPE)

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
          authorizationData
        }).then((result) => {
          subscribedPredictoors.forEach((contract) => {
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

            setEpochData((prev) => {
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
    },
    [
      setEpochData,
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
    addChainListener(secondsPerEpoch, currentEpoch)
    return () => {
      provider.removeAllListeners('block')
    }
  }, [
    predictoorInstances,
    secondsPerEpoch,
    currentEpoch,
    subscribedPredictoors
  ])

  useEffect(() => {
    getAllInterestingPredictionContracts(
      currentConfig.subgraph,
      currentConfig.blacklistedPredictions
    ).then(
      (contracts) => {
        const filteredContracts = filterAllowedContracts({
          contracts,
          opfOwnerAddress: currentConfig.opfOwnerAddress,
          allowedPredConfig: currentConfig.allowedPredictions
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
        setCurrentChainTime,
        setCurrentEpoch,
        contracts,
        currentEpoch,
        secondsPerEpoch,
        subscribedPredictoors,
        contractPrices,
        currentChainTime
      }}
    >
      {children}
    </PredictoorsContext.Provider>
  )
}
