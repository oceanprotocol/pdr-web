import { Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import numeral from 'numeral'

export type TEpochPriceProps = {
  delta: number | undefined
  price: number
  isPriceLoading: boolean
}

export const EpochPrice: React.FC<TEpochPriceProps> = ({
  delta,
  price,
  isPriceLoading
}) => {
  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <span className="text-muted-foreground">$</span>
      {isPriceLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      ) : (
        <>
          <span className="font-semibold tabular-nums">{numeral(price).format('0,0.00')}</span>
          {delta === undefined ? (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          ) : delta === 0 ? null : (
            <>
              {delta > 0 ? (
                <ArrowUp className="h-3 w-3 text-green-600 dark:text-green-500" />
              ) : (
                <ArrowDown className="h-3 w-3 text-red-600 dark:text-red-500" />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
