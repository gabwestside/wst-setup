// src/pages/PreviewPage.tsx
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { generateMonthGridDates } from '../utils/generate-dates'
import clsx from 'clsx'

function seededRand(seed: number) {
  // PRNG simples só pra deixar o preview consistente
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export default function PreviewPage() {
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const dates = generateMonthGridDates(new Date())
  const monthNow = dayjs().month()
  const yearNow = dayjs().year()

  const previewData = useMemo(() => {
    // gera um “percentual de completude” fake para cada dia do mês atual
    const m = new Map<string, number>()
    for (const d of dates) {
      const jd = dayjs(d)
      if (jd.month() !== monthNow || jd.year() !== yearNow) continue
      const key = jd.format('YYYY-MM-DD')
      const r = seededRand(jd.date() * 97 + monthNow * 37 + yearNow)
      m.set(key, Math.floor(r * 100))
    }
    return m
  }, [dates, monthNow, yearNow])

  return (
    <div className='mx-auto max-w-5xl px-6 py-8'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-extrabold text-white'>habits (preview)</h1>
        <span className='text-zinc-400'>Visualization only at this time</span>
      </div>

      <div className='mt-6 grid gap-3 md:mb-0 grid-cols-7 grid-flow-col md:grid-cols-1 md:grid-rows-7 md:grid-flow-row'>
        {weekDays.map((w, i) => (
          <div
            key={i}
            className='text-zinc-400 text-sm md:text-xl h-8 w-8 md:h-10 md:w-10 font-bold flex items-center justify-center'
          >
            {w}
          </div>
        ))}
      </div>

      <div className='grid gap-3 md:ml-4 grid-cols-7 grid-flow-row md:grid-cols-none md:grid-rows-7 md:grid-flow-col mt-2'>
        {dates.map((date) => {
          const d = dayjs(date)
          const isOutsideMonth = d.month() !== monthNow || d.year() !== yearNow
          const key = d.format('YYYY-MM-DD')
          const pct = previewData.get(key) ?? 0
          const today = dayjs().startOf('day')
          const isFuture = d.isAfter(today, 'day')

          if (isOutsideMonth) {
            return (
              <div
                key={date.toString()}
                className='w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed'
                aria-hidden
              />
            )
          }

          return (
            <div
              key={date.toString()}
              title={`${d.format('DD/MM')}: ${pct}%`}
              className={clsx(
                'w-10 h-10 rounded-lg border-2',
                isFuture
                  ? 'bg-zinc-900 border-zinc-800 opacity-40 cursor-not-allowed'
                  : pct === 0
                  ? 'bg-zinc-900 border-zinc-800'
                  : pct < 20
                  ? 'bg-violet-900 border-violet-700'
                  : pct < 40
                  ? 'bg-violet-800 border-violet-600'
                  : pct < 60
                  ? 'bg-violet-700 border-violet-500'
                  : pct < 80
                  ? 'bg-violet-600 border-violet-500'
                  : 'bg-violet-500 border-violet-400'
              )}
            />
          )
        })}
      </div>

      <p className='mt-6 text-sm text-zinc-500'>
        This is a demonstration with no interaction and no real data.
      </p>
      <a className='text-sm absolute bottom-5 right-10 underline text-zinc-500' href='/'>Back to login</a>
    </div>
  )
}
