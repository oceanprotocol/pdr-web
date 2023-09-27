import React, { ReactElement, useEffect, useState } from 'react'
import styles from '../styles/Switcher.module.css'

type TSwitcherProps = {
  activeIndex: number
  children: ReactElement[]
  icon?: ReactElement
}

export const Switcher: React.FC<TSwitcherProps> = ({
  activeIndex,
  children,
  icon
}) => {
  const [currentIndex, setCurrentIndex] = useState(activeIndex)

  useEffect(() => {
    setCurrentIndex(activeIndex)
  }, [activeIndex])

  return (
    <div className={styles.switcherMain}>
      {icon && <div className={styles.leftIcon}>{icon}</div>}
      <div
        className={`${styles.switcherContainer} ${
          icon ? styles.withLeftIcon : ''
        }`}
      >
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
