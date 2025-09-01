import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/axios'
import { generateMonthGridDates } from '../utils/generate-dates'
import { HabitDay } from './HabitDay'
dayjs.extend(utc)

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const summaryDates = generateMonthGridDates()

type SummaryItem = {
  id: string
  date: string
  amount: number
  completed: number
}
type Summary = SummaryItem[]

interface SummaryTableProps {
  onLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export function SummaryTable({ onLoading }: SummaryTableProps) {
  const [summary, setSummary] = useState<Summary>([])

  useEffect(() => {
    onLoading(true)
    api
      .get('/summary')
      .then((response) => setSummary(response.data))
      .finally(() => onLoading(false))
  }, [])

  const summaryByKey = useMemo(() => {
    const m = new Map<string, SummaryItem>()
    for (const s of summary) m.set(dayjs.utc(s.date).format('YYYY-MM-DD'), s) // 👈 UTC
    return m
  }, [summary])

  function handleDayCompletedChange(date: Date, delta: number) {
    const key = dayjs.utc(date).format('YYYY-MM-DD') // 👈 UTC

    setSummary((prev) => {
      const idx = prev.findIndex(
        (s) => dayjs.utc(s.date).format('YYYY-MM-DD') === key
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

  const monthNow = dayjs().month()
  const yearNow = dayjs().year()

  return (
    <div className='w-full flex flex-col h-full max-h-[30rem] md:flex-row md:justify-center relative'>
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
          const d = dayjs(date)
          const isOutsideMonth = d.month() !== monthNow || d.year() !== yearNow
          const key = d.format('YYYY-MM-DD')
          const s = summaryByKey.get(key)

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
            <HabitDay
              key={date.toString()}
              date={date}
              amount={s?.amount ?? 0}
              completed={s?.completed ?? 0}
              onCompletedChange={handleDayCompletedChange}
            />
          )
        })}
      </div>
    </div>
  )
}
