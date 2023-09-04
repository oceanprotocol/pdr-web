import { useEffect, useState } from 'react'
import styles from '../styles/Table.module.css'

function LiveTime() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Update every second

    return () => {
      clearInterval(interval)
    }
  }, [])

  const formatTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${hours}:${minutes}`
  }

  return (
    <>
      {formatTime(currentTime)}
      <span className={styles.greyText}>{`:${String(
        currentTime.getSeconds()
      ).padStart(2, '0')}`}</span>
    </>
  )
}

export default LiveTime
