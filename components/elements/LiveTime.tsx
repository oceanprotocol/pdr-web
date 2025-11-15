"use client";

import { useEffect, useState } from "react";

export default function LiveTime() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const seconds = currentTime.getSeconds().toString().padStart(2, "0");

  return (
    <span className="flex items-baseline font-mono text-sm">
      <span>{hours}:{minutes}</span>
      <span className="text-muted-foreground ml-0.5">:{seconds}</span>
    </span>
  );
}
