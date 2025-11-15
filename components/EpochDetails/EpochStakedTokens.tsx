import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SubscriptionStatus } from '../Subscription'
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type TEpochStakedTokensProps = {
  showLabel?: boolean | undefined
  stakedUp?: number | undefined
  direction?: number | undefined
  totalStaked?: number | undefined
  subscription?: SubscriptionStatus
}

export const EpochStakedTokens: React.FC<TEpochStakedTokensProps> = ({
  stakedUp,
  totalStaked,
  direction,
  showLabel
}) => {
  const formatStake = (value: number) => {
    if (value <= 0) return '0'
    if (value >= 0.01) return value.toLocaleString()
    return '<0.01'
  }

  const stakedUpValue = stakedUp && stakedUp > 0 ? stakedUp : 0
  const stakedDownValue = totalStaked && stakedUp !== undefined && totalStaked - stakedUp > 0
    ? totalStaked - stakedUp
    : 0

  return !showLabel ? (
    <div className="flex items-center gap-2">
      {/* Staked Up */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium tabular-nums">
          {formatStake(stakedUpValue)}
        </span>
        <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-500" />
      </div>

      {/* Staked Down */}
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium tabular-nums">
          {formatStake(stakedDownValue)}
        </span>
        <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-500" />
      </div>
    </div>
  ) : (
    <div className={cn(
      "flex items-center gap-2",
      "h-[25px] w-full pt-1.5"
    )}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Image
              src="/ocean-token-logo.svg"
              height={20}
              width={20}
              alt="Ocean token logo"
              className="rounded-full cursor-help"
            />
          </TooltipTrigger>
          <TooltipContent className="px-2 py-1 text-xs">
            OCEAN
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="text-sm font-medium">
        {direction === undefined
          ? '?'
          : totalStaked
          ? totalStaked.toLocaleString()
          : 0}
        {showLabel && ' staked'}
      </span>
    </div>
  )
}
