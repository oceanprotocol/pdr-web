"use client"

import { useMemo } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import numeral from "numeral"


export default function Stake({
  totalStake,
  totalStakePreviousDay,
}: {
  totalStake: number
  totalStakePreviousDay: number
}) {
  const delta = useMemo(() => {
    if (totalStakePreviousDay === 0) {
      return totalStake === 0 ? 0 : 100
    }
    return ((totalStake - totalStakePreviousDay) / totalStakePreviousDay) * 100
  }, [totalStake, totalStakePreviousDay])

  const formattedDelta = useMemo(() => {
    const sign = delta >= 0.5 ? "+" : delta < 0 ? "-" : ""
    return `${sign}${Math.abs(delta).toFixed(0)}%`
  }, [delta])

  const deltaColorClass = useMemo(() => {
    if (delta > 0.5) return "text-green-600 dark:text-green-500"
    if (delta < 0) return "text-red-600 dark:text-red-500"
    return "text-muted-foreground"
  }, [delta])

  return (
    <div className="flex flex-col gap-1 px-2 py-1">
      <div className="flex items-center gap-1.5">
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

        <span className="text-sm font-semibold tabular-nums">
          {numeral(totalStake).format('0,0.00')}
        </span>
      </div>

      <span className={cn("text-xs font-medium tabular-nums", deltaColorClass)}>
        {formattedDelta}
      </span>
    </div>
  )
}
