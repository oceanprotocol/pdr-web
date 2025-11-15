"use client"

import { useState } from "react"
import { Clock, Zap } from "lucide-react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMarketPriceContext } from "@/contexts/MarketPriceContext"
import { usePredictoorsContext } from "@/contexts/PredictoorsContext"
import { useTimeFrameContext } from "@/contexts/TimeFrameContext"
import { availableTimeFrames } from "@/utils/appconstants"
import { EPredictoorContractInterval } from "@/utils/types/EPredictoorContractInterval"

export function TimeFrameSwitch() {
  const { setTimeFrameInterval } = useTimeFrameContext()
  const { setIsPriceLoading } = useMarketPriceContext()
  const { setIsNewContractsInitialized } = usePredictoorsContext()

  const [value, setValue] = useState(String(availableTimeFrames[0]?.value ?? ""))

  const handleChange = (newValue: string) => {
    if (!newValue) return
    setValue(newValue)
    setIsNewContractsInitialized(false)
    setIsPriceLoading(true)
    setTimeFrameInterval(newValue as EPredictoorContractInterval)
  }

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleChange}
      className="border rounded-lg"
    >
      {availableTimeFrames.map((tf) => {
        const v = String(tf.value)
        const is5m = v === EPredictoorContractInterval.e_5M

        return (
          <ToggleGroupItem
            key={v}
            value={v}
            className="flex items-center gap-2 px-4 h-9"
          >
            {is5m ? (
              <Zap className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4" />
            )}
            {tf.label}
          </ToggleGroupItem>
        )
      })}
    </ToggleGroup>
  )
}
