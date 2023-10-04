import { currentConfig } from '@/utils/appconstants'
import { Maybe } from '@/utils/utils'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { Socket, io } from 'socket.io-client'
import {
  TSocketContext,
  TSocketFeedData,
  TSocketProviderProps
} from './SocketContext.types'
import { useTimeFrameContext } from './TimeFrameContext'

// SocketContext
const SocketContext = createContext<TSocketContext>({
  socket: null,
  epochData: null,
  initialEpochData: null,
  setInitialData: (data) => {},
  handleEpochData: (data) => {}
})

// Custom hook to use the SocketContext
export const useSocketContext = () => {
  return useContext(SocketContext)
}

// SocketProvider component
export const SocketProvider: React.FC<TSocketProviderProps> = ({
  children
}) => {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [epochData, setEpochData] = useState<TSocketFeedData | null>(null)
  const [initialEpochData, setInitialEpochData] =
    useState<TSocketFeedData | null>(null)

  const { timeFrameInterval } = useTimeFrameContext()

  const isFirstDataEnter = useRef<boolean>(false)

  const handleEpochData = useCallback((data: Maybe<TSocketFeedData>) => {
    if (!data) return
    setEpochData((prev) => {
      if (!prev) return data

      const dataContractAddresses = data.map((d) => d.contractInfo?.address)

      const prevItems = prev.filter(
        (item) => !dataContractAddresses.includes(item.contractInfo?.address)
      )

      return [...prevItems, ...data]
    })
  }, [])

  const setInitialData = useCallback((data: Maybe<TSocketFeedData>) => {
    if (isFirstDataEnter.current || !data) return
    // transform TInitialData to TSocketFeedData
    console.log(data)
    setInitialEpochData(data)
    setEpochData(data)
  }, [])

  useEffect(() => {
    if (currentConfig.opfProvidedPredictions.length === 0) return
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_IO_URL || currentConfig.websocketURL

    const newSocket = io(socketUrl, {
      path: '/api/datafeed',
      transports: ['websocket'],
      query: {}
    })

    setSocket(newSocket)

    newSocket.on(
      `newEpoch-${timeFrameInterval}`,
      (data: Maybe<TSocketFeedData>) => {
        console.log(data)
        if (!data) return

        if (!isFirstDataEnter.current) {
          setInitialData(data)
          isFirstDataEnter.current = true
        }

        handleEpochData(data)
      }
    )

    return () => {
      newSocket.close()
    }
  }, [timeFrameInterval, handleEpochData, setInitialData])

  return (
    <SocketContext.Provider
      value={{
        socket,
        epochData,
        initialEpochData,
        handleEpochData,
        setInitialData
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
