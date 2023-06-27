import { TInitialData } from '@/utils/getInitialData'
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

// SocketContext
const SocketContext = createContext<TSocketContext>({
  socket: null,
  epochData: null,
  setInitialData: (data) => {}
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

  const isFirstDataEnter = useRef<boolean>(false)

  useEffect(() => {
    const newSocket = io('http://localhost:8888', {
      path: '/api/datafeed',
      transports: ['websocket']
    })

    setSocket(newSocket)

    newSocket.on('newEpoch', (data: TSocketFeedData) => {
      if (!isFirstDataEnter.current) {
        isFirstDataEnter.current = true
      }
      setEpochData(data)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const setInitialData = useCallback((data: TInitialData | undefined) => {
    if (isFirstDataEnter.current || !data) return
    // transform TInitialData to TSocketFeedData
    const transformedData: TSocketFeedData = data.results.map((item) => ({
      ...item.aggPredVal,
      contractInfo: item.contractInfo
    }))
    setEpochData(transformedData)
  }, [])

  return (
    <SocketContext.Provider value={{ socket, epochData, setInitialData }}>
      {children}
    </SocketContext.Provider>
  )
}
