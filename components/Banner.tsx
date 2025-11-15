"use client";

import { useAccount, useChains, useSwitchChain } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";

import { Button } from "@/components/ui/button";
import { usePredictoorsContext } from "@/contexts/PredictoorsContext";
import { useUserContext } from "@/contexts/UserContext";
import { useIsCorrectChain } from "@/hooks/useIsCorrectChain";
import { currentConfig } from "@/utils/appconstants";
import { checkForBannerMessage } from "@/utils/utils";

const REQUIRED_CHAIN_ID = Number(currentConfig.chainId);

export enum BannerType {
  WARNING = "warning",
  ERROR = "error",
}

export type BannerState = {
  message: string;
  type: BannerType;
};

export default function Banner() {
  const { userSignature } = useUserContext();
  const { getUserSignature } = usePredictoorsContext();
  const { isCorrectNetwork } = useIsCorrectChain();

  const { openChainModal } = useChainModal();
  const { address } = useAccount();
  const chains = useChains();
  const { isPending: isSwitchingNetwork, variables } = useSwitchChain();
  const pendingChainId = variables?.chainId;

  let bannerState: BannerState | null = null;

  if (address && !isCorrectNetwork) {
    const expectedChain = chains.find((c) => c.id === REQUIRED_CHAIN_ID);
    const chainName = expectedChain?.name;

    const message = chainName
      ? `Connected to wrong network. Please switch to ${chainName}.`
      : `Connected to wrong network. Please switch to chain ID ${REQUIRED_CHAIN_ID}.`;

    bannerState = {
      message,
      type: BannerType.WARNING,
    };
  }
  else if (!userSignature && address) {
    bannerState = {
      message:
        "Signature not provided. A signature is required to authorize and fetch private predictions.",
      type: BannerType.ERROR,
    };
  }
  else {
    const fromUtils = checkForBannerMessage(address, isCorrectNetwork);

    if (fromUtils && fromUtils.message) {
      bannerState = {
        message: fromUtils.message,
        type:
          fromUtils.type === BannerType.ERROR
            ? BannerType.ERROR
            : BannerType.WARNING,
      };
    }
  }

  // Aucun message → pas de banner
  if (!bannerState) {
    return null;
  }

  const isWarning = bannerState.type === BannerType.WARNING;

  const baseClasses =
    "flex w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm";

  const variantClasses = isWarning
    ? "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-100"
    : "border-red-500/50 bg-red-500/10 text-red-900 dark:text-red-100";

  const switchNetworkLabel = (() => {
    if (isSwitchingNetwork && pendingChainId === REQUIRED_CHAIN_ID) {
      return "Switching...";
    }

    const expectedChain = chains.find((c) => c.id === REQUIRED_CHAIN_ID);
    return expectedChain?.name
      ? `Switch network to ${expectedChain.name}`
      : "Switch network";
  })();

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <span className="flex-1">{bannerState.message}</span>

      <div className="flex flex-wrap items-center gap-2">
        {!userSignature && address && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => getUserSignature()}
          >
            Provide signature
          </Button>
        )}

        {!isCorrectNetwork && address && (
          <Button
            variant="outline"
            size="sm"
            disabled={
              !openChainModal ||
              (isSwitchingNetwork && pendingChainId === REQUIRED_CHAIN_ID)
            }
            onClick={() => openChainModal?.()}
          >
            {switchNetworkLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
