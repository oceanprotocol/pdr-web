import { SocketProvider } from '@/contexts/SocketContext'
import '@/styles/globals.css'

import type { AppProps } from 'next/app'

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SocketProvider>
        <Component {...pageProps} />
      </SocketProvider>
    </>
  )
}

export default App
