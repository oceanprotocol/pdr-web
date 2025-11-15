"use client"

import { useState } from "react"
import { TimeFrameSwitch } from "@/components/TimeFrameSwitch"
import { AssetsContainer } from "@/components/AssetsContainer"
import { SearchBar, SearchFilters } from "@/components/SearchBar"

export default function Home() {
  const [filters, setFilters] = useState<SearchFilters>({
    ticker: "",
    platform: "all"
  })

  return (
    <main className="w-full">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-bold">
          Accurate price predictions for your favorite crypto assets
        </p>
        <TimeFrameSwitch />
      </div>

      <SearchBar filters={filters} onFiltersChange={setFilters} />

      <AssetsContainer filters={filters} />
    </main>
  )
}
