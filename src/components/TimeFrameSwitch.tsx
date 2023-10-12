import { useMarketPriceContext } from '@/contexts/MarketPriceContext'
import { usePredictoorsContext } from '@/contexts/PredictoorsContext'
import { useTimeFrameContext } from '@/contexts/TimeFrameContext'
import { Switcher } from '@/elements/Switcher'
import { availableTimeFrames } from '@/utils/appconstants'
import { useState } from 'react'
import styles from '../styles/TimeFrameSwitch.module.css'

export const TimeFrameSwitch = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const { setTimeFrameInterval } = useTimeFrameContext()
  const { setIsPriceLoading } = useMarketPriceContext()
  const { setIsNewContractsInitialized } = usePredictoorsContext()
  return (
    <Switcher
      activeIndex={activeIndex}
      icon={
        <div className={styles.leftIcon}>
          <svg
            width="20px"
            height="20px"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g id="Calendar / Timer">
              <path
                id="Vector"
                d="M12 13V9M21 6L19 4M10 2H14M12 21C7.58172 21 4 17.4183 4 13C4 8.58172 7.58172 5 12 5C16.4183 5 20 8.58172 20 13C20 17.4183 16.4183 21 12 21Z"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
          </svg>
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
  )
}
