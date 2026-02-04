import { useMemo } from 'react'

interface RateHistogramProps {
  rates: number[]
  minRate: string
  maxRate: string
  onRangeChange: (min: string, max: string) => void
}

export default function RateHistogram({ rates, minRate, maxRate, onRangeChange }: RateHistogramProps) {
  const { buckets, minVal, maxVal } = useMemo(() => {
    if (rates.length === 0) {
      return { buckets: [], minVal: 0, maxVal: 100 }
    }

    const validRates = rates.filter(r => r > 0)
    if (validRates.length === 0) {
      return { buckets: [], minVal: 0, maxVal: 100 }
    }

    const minVal = Math.floor(Math.min(...validRates))
    const maxVal = Math.ceil(Math.max(...validRates))
    const range = maxVal - minVal || 1
    
    // Create 10 buckets
    const numBuckets = 10
    const bucketSize = range / numBuckets
    const bucketCounts = new Array(numBuckets).fill(0)
    
    validRates.forEach(rate => {
      const bucketIndex = Math.min(
        Math.floor((rate - minVal) / bucketSize),
        numBuckets - 1
      )
      bucketCounts[bucketIndex]++
    })
    
    const maxCount = Math.max(...bucketCounts, 1)
    
    const buckets = bucketCounts.map((count, i) => ({
      start: Math.round(minVal + i * bucketSize),
      end: Math.round(minVal + (i + 1) * bucketSize),
      count,
      height: (count / maxCount) * 100,
    }))
    
    return { buckets, minVal, maxVal }
  }, [rates])

  const selectedMin = minRate ? parseFloat(minRate) : minVal
  const selectedMax = maxRate ? parseFloat(maxRate) : maxVal

  if (buckets.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* Histogram bars */}
      <div className="flex items-end gap-0.5 h-12">
        {buckets.map((bucket, i) => {
          const isInRange = bucket.start >= selectedMin && bucket.end <= selectedMax
          return (
            <div
              key={i}
              className="flex-1 flex flex-col justify-end"
              title={`$${bucket.start}-$${bucket.end}: ${bucket.count} VA${bucket.count !== 1 ? 's' : ''}`}
            >
              <div
                className={`w-full rounded-t transition-all ${
                  isInRange 
                    ? 'bg-[hsl(var(--primary))]' 
                    : 'bg-slate-200'
                }`}
                style={{ height: `${Math.max(bucket.height, 4)}%` }}
              />
            </div>
          )
        })}
      </div>
      
      {/* Range labels */}
      <div className="flex justify-between text-xs text-slate-500">
        <span>${minVal}/hr</span>
        <span>${maxVal}/hr</span>
      </div>
      
      {/* Range inputs */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
          <input
            type="number"
            placeholder={`${minVal}`}
            value={minRate}
            onChange={(e) => onRangeChange(e.target.value, maxRate)}
            className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]"
          />
        </div>
        <span className="text-slate-500">-</span>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
          <input
            type="number"
            placeholder={`${maxVal}`}
            value={maxRate}
            onChange={(e) => onRangeChange(minRate, e.target.value)}
            className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))]/20 focus:border-[hsl(var(--primary))]"
          />
        </div>
      </div>
      
      {/* Quick range buttons */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: 'Any', min: '', max: '' },
          { label: '$5-15', min: '5', max: '15' },
          { label: '$15-25', min: '15', max: '25' },
          { label: '$25+', min: '25', max: '' },
        ].map((preset) => {
          const isActive = minRate === preset.min && maxRate === preset.max
          return (
            <button
              key={preset.label}
              onClick={() => onRangeChange(preset.min, preset.max)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                isActive
                  ? 'border-[hsl(var(--primary))]/40 text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
