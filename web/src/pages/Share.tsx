// src/pages/SharePage.tsx
import { useEffect, useState } from 'react'
import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { SummaryTable } from '../components/SummaryTable'
import { api } from '../lib/axios'
import { Header } from '../components/ui/Header'
import { LoadingSquares } from '../components/ui/Loading'

dayjsOrig.extend(utc)
const dayjs = dayjsOrig

type SummaryItem = {
  id: string
  date: string
  amount: number
  completed: number
}

export function SharePage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    setError(null)

    api
      .get<SummaryItem[]>('/summary')
      .then((res) => {
        if (!alive) return
        setSummary(res.data ?? [])
      })
      .catch((e) => {
        if (!alive) return
        setError('Could not load data.')
        console.error(e)
      })
      .finally(() => alive && setLoading(false))

    return () => {
      alive = false
    }
  }, [])

  return (
    <div className='flex flex-col gap-10 mx-auto max-w-5xl px-6 py-8'>
      <Header readOnly />

      {loading ? (
        // Skeleton simples enquanto carrega
        <div className='space-y-3'>
          <div className='h-8 w-48 rounded bg-zinc-800 animate-pulse' />
          <div className='grid grid-cols-7 gap-3'>
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className='h-10 rounded-lg bg-zinc-800 animate-pulse'
              />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className='rounded-lg border border-zinc-800 p-4 text-zinc-300'>
          {error}
        </div>
      ) : (
        <SummaryTable
          readOnly
          currentMonthProp={dayjs.utc().toDate()}
          summaryData={summary}
        />
      )}

      {loading && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10'>
          <LoadingSquares
            count={6}
            size={10}
            gap={2}
            speedMs={1100}
            delayMs={120}
          />
        </div>
      )}
    </div>
  )
}
