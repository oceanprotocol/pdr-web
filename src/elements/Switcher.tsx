import React, { ReactElement, useEffect, useState } from 'react'
import styles from '../styles/Switcher.module.css'

type TSwitcherProps = {
  activeIndex: number
  children: ReactElement[]
  leftIcon?: ReactElement
}

export const Switcher: React.FC<TSwitcherProps> = ({
  activeIndex,
  children,
  leftIcon
}) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex)

  useEffect(() => {
    setCurrentIndex(activeIndex)
  }, [activeIndex])

  return (
    <div className={styles.switcherMain}>
      {leftIcon && <div className={styles.leftIcon}>{leftIcon}</div>}
      <div
        className={`${styles.switcherContainer} ${
          leftIcon ? styles.withLeftIcon : ''
        }`}
      >
        <div
          className={styles.switcherOverlay}
          style={{ left: `${currentIndex * 50 + 3}px` }}
        ></div>
        {React.Children.map(children, (child, index) => (
          <div
            className={`${styles.switcherItem} ${
              currentIndex === index ? styles.switcherItemActive : ''
            }`}
            key={index}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
