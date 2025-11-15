import { Loader2, ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EpochStakedTokens } from './EpochStakedTokens'

export type TEpochPredictionProps = {
  direction: number | undefined
  stakedUp: number | undefined
  totalStaked: number | undefined
  loading: boolean
}

export const getPredictionBackgroundColor = (
  direction: number | undefined,
  totalStaked: number | undefined
) => {
  if (direction === undefined || totalStaked === 0) {
    return 'bg-green-500/10'
  }
  return direction === 1 ? 'bg-muted' : 'bg-red-500/10'
}

export const EpochPrediction: React.FC<TEpochPredictionProps> = ({
  direction,
  stakedUp,
  totalStaked,
  loading
}) => {
  const isPredictionUnknown = direction === undefined || totalStaked === 0
  const showCentered = isPredictionUnknown || loading

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg p-2",
        showCentered && "justify-center"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium">
          Pred{isPredictionUnknown && !loading ? '?' : ''}
        </span>

        {loading && (
          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
        )}

        {direction !== undefined && totalStaked !== 0 && !loading && (
          <>
            {direction === 1 ? (
              <ArrowUp className="h-4 w-4 text-green-600 dark:text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-600 dark:text-red-500" />
            )}
          </>
        )}
      </div>

      {direction !== undefined && !loading && (
        <EpochStakedTokens stakedUp={stakedUp} totalStaked={totalStaked} />
      )}
    </div>
  )
}
