"use client";

import { useEffect, useState } from "react";

export function calculateTimeRemaining(futureTimestampInSeconds: number) {
  const targetTime = new Date(futureTimestampInSeconds * 1000).getTime();
  const currentTime = Date.now();
  return Math.max(targetTime - currentTime, 0);
}

type CountdownTimerProps = {
  futureTimestampInSeconds: number;
};

function CountdownTimer({ futureTimestampInSeconds }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(futureTimestampInSeconds)
  );

  useEffect(() => {
    if (!futureTimestampInSeconds) return;

    const timer = setInterval(() => {
      const next = calculateTimeRemaining(futureTimestampInSeconds);
      setTimeRemaining(next);

      if (next <= 0) {
        clearInterval(timer);
      }
    }, 1000); // update every second

    return () => clearInterval(timer);
  }, [futureTimestampInSeconds]);

  const minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
  const hours = Math.floor(timeRemaining / 1000 / 3600);

  if (timeRemaining <= 0) {
    return (
      <p className="text-xs font-medium text-destructive">
        Subscription expired
      </p>
    );
  }

  return (
    <p className="text-xs font-medium text-emerald-500">
      {hours}h {minutes}min left
    </p>
  );
}

export default CountdownTimer;