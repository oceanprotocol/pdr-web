import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useTimeFrameContext } from '@/contexts/TimeFrameContext'
import { Switcher } from '@/elements/Switcher'
import { availableTimeFrames } from '@/utils/appconstants'
import Image from 'next/image'
import { useState } from 'react'
import styles from '../styles/TimeFrameSwitch.module.css'

export const TimeFrameSwitch = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const { setTimeFrameInterval } = useTimeFrameContext()
  const { setIsPriceLoading } = useMarketPriceContext()
  const { setIsNewContractsInitialized } = usePredictoorsContext()
  return (
    <div>
      <Switcher
        activeIndex={activeIndex}
        icon={
          <div className={styles.leftIcon}>
            <Image
              src="assets/svg/timer.svg"
              alt="timer"
              className="timer-icon"
              width={20}
              height={20}
            />
          </div>
        }
      >
        {availableTimeFrames.map((timeFrame, index) => (
          <span
            key={index}
            onClick={() => {
              setActiveIndex(index)
              setIsNewContractsInitialized(false)
              setIsPriceLoading(true)
              setTimeFrameInterval(timeFrame.value)
            }}
          >
            {timeFrame.label}
          </span>
        ))}
      </Switcher>
    </div>
  )
}
