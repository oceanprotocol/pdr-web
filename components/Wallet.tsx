"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useChainId, useChains, useDisconnect } from "wagmi";
import { Button } from "@/components/ui/button";


export default function Wallet() {
  const [showPopup, setShowPopup] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const chainId = useChainId();
  const chains = useChains();
  const { openConnectModal } = useConnectModal();
  const { disconnect } = useDisconnect();
  const { address, isConnected } = useAccount();

const networkName = useMemo((): string | undefined => {
  if (!isConnected || !address || !chainId || chainId <= 0) return undefined;

  const chain = chains.find((c) => "id" in c && c.id === chainId);

  return typeof chain?.name === "string"
    ? chain.name
    : `Chain ${chainId}`;
}, [isConnected, address, chainId, chains]);

  const buttonLabel = useMemo(() => {
    if (!isConnected || !address) return "Connect Wallet";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [isConnected, address]);

  useEffect(() => {
    if (!showPopup) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  const handleButtonClick = () => {
    if (isConnected && address) {
      setShowPopup((prev) => !prev);
    } else {
      openConnectModal?.();
    }
  };

  const handleDisconnect = async () => {
    try {
      setShowPopup(false);
      await disconnect();
    } catch (error: unknown) {
        let errorMessage = "";

        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = String(error);
        }

      // WalletConnect encryption errors
      if (
        errorMessage.includes("aes/gcm") ||
        errorMessage.includes("ghash tag") ||
        errorMessage.includes("invalid ghash") ||
        errorMessage.includes("decryption failed") ||
        errorMessage.includes("ciphertext")
      ) {
        console.warn(
          "WalletConnect encryption error during disconnect, clearing session data",
        );

        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (
              key &&
              (key.startsWith("wc@") ||
                key.startsWith("walletconnect") ||
                key.includes("walletconnect"))
            ) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((key) => localStorage.removeItem(key));
        } catch (clearError) {
          console.error("Failed to clear WalletConnect data:", clearError);
        }

        setTimeout(() => {
          window.location.reload();
        }, 500);
      } else {
        console.error("Error disconnecting wallet:", error);
      }
    }
  };

  return (
    <div className="flex w-full items-center justify-end">
      <div className="flex items-center gap-3">
        {isConnected && address && chainId && networkName && (
          <span className="rounded-md border bg-popover px-2 py-1 text-xs md:text-sm">
            {networkName}
          </span>
        )}

        <div ref={containerRef} className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={handleButtonClick}
            className="font-mono"
          >
            {buttonLabel}
          </Button>

          {showPopup && isConnected && address && (
            <div className="absolute right-0 z-50 mt-2 w-40 rounded-md border bg-popover p-2 shadow-md">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
