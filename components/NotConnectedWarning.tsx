"use client"

import { EEthereumClientStatus } from '@/hooks/useEthereumClient'
import React, { useMemo } from 'react'

export type TNotConnectedWarningProps = {
  clientStatus:
    | EEthereumClientStatus.DISCONNECTED
    | EEthereumClientStatus.LOADING
}

export const NotConnectedWarning: React.FC<TNotConnectedWarningProps> = ({
  clientStatus
}) => {
  // Check if we're on the client side (SSR safe)
  const isClient = useMemo(() => typeof window !== 'undefined', [])

  const isClientLoading =
    isClient && clientStatus === EEthereumClientStatus.LOADING

  const isClientDisconnected =
    isClient && clientStatus === EEthereumClientStatus.DISCONNECTED

  return (
    <>
      {(!isClient || isClientLoading) && null}
      {isClientDisconnected && (
        <div className="flex items-center justify-center py-10">
          <div className="rounded-lg border border-destructive bg-destructive/10 px-6 py-4">
            <p className="text-sm text-destructive">
              Couldn&apos;t connect to the network&apos;s RPC. Try again later.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
