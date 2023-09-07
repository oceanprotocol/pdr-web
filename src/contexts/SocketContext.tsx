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
import { usePredictoorsContext } from './PredictoorsContext'
import {
  TSocketContext,
  TSocketFeedData,
  TSocketProviderProps
} from './SocketContext.types'

// SocketContext
const SocketContext = createContext<TSocketContext>({
  socket: null,
  epochData: null,
  initialEpochData: null,
  setInitialData: (data) => {},
  setEpochData: (data) => {}
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
  const { setCurrentChainTime } = usePredictoorsContext()

  const isFirstDataEnter = useRef<boolean>(false)

  const setInitialData = useCallback((data: Maybe<TSocketFeedData>) => {
    if (isFirstDataEnter.current || !data) return
    // transform TInitialData to TSocketFeedData
    setInitialEpochData(data)
    setEpochData(data)
  }, [])

  useEffect(() => {
    if (currentConfig.opfProvidedPredictions.length === 0) return
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL || ''
    console.log('socketUrl', socketUrl)
    const newSocket = io(socketUrl, {
      path: '/api/datafeed',
      transports: ['websocket']
    })

    setSocket(newSocket)

    newSocket.on('newEpoch', (data: Maybe<TSocketFeedData>) => {
      if (!data) return
      if (!isFirstDataEnter.current) {
        setInitialData(data)
        isFirstDataEnter.current = true
      }
      setCurrentChainTime(data[0].predictions[0].currentTs)
      setEpochData(data)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <SocketContext.Provider
      value={{
        socket,
        epochData,
        initialEpochData,
        setEpochData,
        setInitialData
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
