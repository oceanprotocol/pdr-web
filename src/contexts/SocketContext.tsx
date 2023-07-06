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

  const setInitialData = useCallback((data: Maybe<TSocketFeedData>) => {
    if (isFirstDataEnter.current || !data) return
    // transform TInitialData to TSocketFeedData
    setEpochData(data)
  }, [])

  useEffect(() => {
    const socketUrl = process.env.SOCKET_IO_URL || ''
    console.log('socketUrl', socketUrl)
    const newSocket = io(socketUrl, {
      path: '/api/datafeed',
      transports: ['websocket']
    })

    setSocket(newSocket)

    newSocket.on('newEpoch', (data: Maybe<TSocketFeedData>) => {
      if (!data) return
      if (!isFirstDataEnter.current) {
        isFirstDataEnter.current = true
      }
      setEpochData(data)
    })

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, epochData, setInitialData }}>
      {children}
    </SocketContext.Provider>
  )
}
