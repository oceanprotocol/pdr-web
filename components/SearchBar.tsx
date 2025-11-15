"use client"

import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export type SearchFilters = {
  ticker: string
  platform: string
}

type SearchBarProps = {
  filters: SearchFilters
  onFiltersChange: (filters: SearchFilters) => void
}

export function SearchBar({ filters, onFiltersChange }: SearchBarProps) {
  const handleTickerChange = (value: string) => {
    onFiltersChange({ ...filters, ticker: value })
  }

  const handlePlatformChange = (value: string) => {
    onFiltersChange({ ...filters, platform: value })
  }

  const handleClearFilters = () => {
    onFiltersChange({ ticker: "", platform: "all" })
  }

  const hasActiveFilters = filters.ticker !== "" || filters.platform !== "all"

  return (
    <div className="mb-6 rounded-lg lg:border-none border lg:bg-transparent bg-card p-4">
      <div className="flex flex-col gap-3">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticker (BTC, ETH...)"
            value={filters.ticker}
            onChange={(e) => handleTickerChange(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        {/* Platform selector and clear button */}
        <div className="flex gap-2 items-center">
          <Select value={filters.platform} onValueChange={handlePlatformChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              <SelectItem value="binance">Binance</SelectItem>
              <SelectItem value="kraken">Kraken</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              className="gap-1 shrink-0"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
