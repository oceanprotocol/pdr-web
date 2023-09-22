import { useEffect, useState } from 'react'

export function calculateTimeRemaining(futureTimestampInSeconds: number) {
  const targetTime = new Date(futureTimestampInSeconds * 1000).getTime()
  const currentTime = new Date().getTime()
  return Math.max(targetTime - currentTime, 0)
}

function CountdownTimer({
  futureTimestampInSeconds
}: {
  futureTimestampInSeconds: number
}) {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(futureTimestampInSeconds)
  )

  useEffect(() => {
    if (!futureTimestampInSeconds) return
    const timer = setInterval(() => {
      const timeRemaining = calculateTimeRemaining(futureTimestampInSeconds)
      setTimeRemaining(timeRemaining)

      if (timeRemaining <= 0) {
        clearInterval(timer)
        // You can add a callback or perform some action when the countdown expires.
      }
    }, 60000) // Update every 1 second

    return () => {
      clearInterval(timer)
    }
  }, [futureTimestampInSeconds])

  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60)
  const hours = Math.floor((timeRemaining / 1000 / 3600) % 24)

  return (
    <div>
      {timeRemaining > 0 ? (
        <p
          style={{
            color: 'rgb(0, 153, 0)',
            fontSize: 'var(--font-size-small)'
          }}
        >
          {hours}h {minutes}min left
        </p>
      ) : (
        <p>Subscription expired!</p>
      )}
    </div>
  )
}

export default CountdownTimer
