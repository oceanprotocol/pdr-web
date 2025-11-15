import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Accuracy({ accuracy }: { accuracy: number }) {
  // function receives accuracy as a number and returns a string
  // if accuracy has no decimals, add ".0" to the end
  // if accuracy has decimals, return accuracy with one decimal
  const getFormattedAccuracy = (accuracy: number): string => {
    if (accuracy % 1 === 0) {
      return `${accuracy}.0`
    } else {
      return `${accuracy.toFixed(1)}`
    }
  }

  return (
    <div className={cn(
      "flex items-center gap-1",
      "text-sm font-medium"
    )}>
      {accuracy !== undefined && accuracy !== null ? (
        <span className="font-semibold tabular-nums">
          {getFormattedAccuracy(accuracy)}
        </span>
      ) : (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      )}
      <span className="text-muted-foreground">%</span>
    </div>
  )
}
