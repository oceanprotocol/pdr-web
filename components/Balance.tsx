"use client";

import Image from "next/image";
import { useUserContext } from "@/contexts/UserContext";

export default function Balance() {
  const { balance } = useUserContext();

  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <span className="text-xs font-semibold text-muted-foreground tracking-wide">
        BALANCE
      </span>

      <div className="flex items-center gap-2">
        <Image
          src="/oceanToken.png"
          alt="Token icon"
          width={20}
          height={20}
          className="rounded-full"
        />
        <span className="font-medium text-foreground">
          {balance.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
