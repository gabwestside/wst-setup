import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/axios'
import { generateDatesFromCurrentMonth } from '../utils/generate-dates'
import { HabitDay } from './HabitDay'

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const summaryDates = generateDatesFromCurrentMonth()

const minimumSummaryDatesSize = 18 * 7
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length

type SummaryItem = {
  id: string
  date: string
  amount: number
  completed: number
}
type Summary = SummaryItem[]

export function SummaryTable() {
  const [summary, setSummary] = useState<Summary>([])

  useEffect(() => {
    api.get('/summary').then((response) => setSummary(response.data))
  }, [])

  const summaryByKey = useMemo(() => {
    const m = new Map<string, SummaryItem>()
    for (const s of summary) m.set(dayjs(s.date).format('YYYY-MM-DD'), s)
    return m
  }, [summary])

  function handleDayCompletedChange(date: Date, delta: number) {
    const key = dayjs(date).format('YYYY-MM-DD')

    setSummary((prev) => {
      const idx = prev.findIndex(
        (s) => dayjs(s.date).format('YYYY-MM-DD') === key
      )
      if (idx === -1) return prev

      const next = [...prev]
      const item = next[idx]
      next[idx] = {
        ...item,
        completed: Math.max(
          0,
          Math.min(item.amount, (item.completed ?? 0) + delta)
        ),
      }
      return next
    })
  }

  return (
    <div className='w-full flex flex-col h-full max-h-[30rem] md:flex-row'>
      <div className='grid gap-3 mb-3 md:mb-0 grid-cols-7 grid-flow-col md:grid-cols-1 md:grid-rows-7 md:grid-flow-row'>
        {weekDays.map((w, i) => (
          <div
            key={i}
            className='text-zinc-400 text-sm md:text-xl h-8 w-8 md:h-10 md:w-10 font-bold flex items-center justify-center'
          >
            {w}
          </div>
        ))}
      </div>

      <div className='grid gap-3 md:ml-4 grid-cols-7 grid-flow-row md:grid-cols-none md:grid-rows-7 md:grid-flow-col'>
        {summaryDates.map((date) => {
          const key = dayjs(date).format('YYYY-MM-DD')
          const s = summaryByKey.get(key)

          return (
            <HabitDay
              key={date.toString()}
              date={date}
              amount={s?.amount ?? 0}
              completed={s?.completed ?? 0}
              onCompletedChange={handleDayCompletedChange}
            />
          )
        })}

        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, i) => (
            <div
              key={i}
              className='w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed'
            />
          ))}
      </div>
    </div>
  )
}
