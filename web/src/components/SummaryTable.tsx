import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/axios'
import { generateMonthGridDates, monthsOfYear } from '../utils/generate-dates'
import { HabitDay } from './HabitDay'

dayjsOrig.extend(utc)
const dayjs = dayjsOrig

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

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
  // mês selecionado (UTC) — começa no mês atual
  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs.utc().startOf('month')
  )

  // carrega summary uma vez
  useEffect(() => {
    onLoading(true)
    api
      .get('/summary')
      .then((res) => setSummary(res.data))
      .finally(() => onLoading(false))
  }, [])

  // indexa summary por chave UTC YYYY-MM-DD
  const summaryByKey = useMemo(() => {
    const m = new Map<string, SummaryItem>()
    for (const s of summary) m.set(dayjs.utc(s.date).format('YYYY-MM-DD'), s)
    return m
  }, [summary])

  // datas da grade do mês selecionado
  const summaryDates = useMemo(
    () => generateMonthGridDates(currentMonth.toDate()),
    [currentMonth]
  )

  function handleDayCompletedChange(date: Date, delta: number) {
    const key = dayjs.utc(date).format('YYYY-MM-DD')
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
  
  const monthsOptions = useMemo(
    () => monthsOfYear(currentMonth.toDate()),
    [currentMonth]
  )

  const todayUtc = dayjs.utc().startOf('day')
  const monthNow = currentMonth.month()
  const yearNow = currentMonth.year()

  function goPrevMonth() {
    setCurrentMonth((m) => m.subtract(1, 'month').startOf('month'))
  }

  function goNextMonth() {
    setCurrentMonth((m) => m.add(1, 'month').startOf('month'))
  }

  function onSelectMonth(e: React.ChangeEvent<HTMLSelectElement>) {
    const [y, m] = e.target.value.split('-').map(Number)
    setCurrentMonth(dayjs.utc().year(y).month(m).startOf('month'))
  }

  return (
    <div className='w-full flex flex-col h-full max-h-[30rem] md:flex-row md:justify-center relative'>
      <div className='mb-4 w-full flex justify-center items-center gap-3 md:absolute md:-top-12'>
        <button
          onClick={goPrevMonth}
          className='px-3 py-1 rounded-lg border border-violet-500 hover:border-violet-300 transition'
          aria-label='Previous month'
          title='Previous month'
        >
          ←
        </button>

        <select
          className='border border-violet-500 hover:border-violet-300 font-semibold bg-zinc-900 text-white rounded-md px-3 py-1.5 text-sm'
          value={`${yearNow}-${monthNow}`}
          onChange={onSelectMonth}
        >
          {monthsOptions.map((m) => (
            <option
              key={m.format('YYYY-MM')}
              value={`${m.year()}-${m.month()}`}
              className='bg-zinc-900 text-white'
            >
              {m.format('MMMM YYYY')}
            </option>
          ))}
        </select>

        <button
          onClick={goNextMonth}
          className='px-3 py-1 rounded-lg border border-violet-500 hover:border-violet-300 transition'
          aria-label='Next month'
          title='Next month'
        >
          →
        </button>
      </div>

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
          const d = dayjs.utc(date)
          const isOutsideMonth = d.month() !== monthNow || d.year() !== yearNow
          const key = d.format('YYYY-MM-DD')
          const s = summaryByKey.get(key)
          const isFuture = d.isAfter(todayUtc)
          
          if (isOutsideMonth) {
            return (
              <div
                key={date.toString()}
                className='w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed'
                aria-hidden
              />
            )
          }

          if (isFuture) {
            return (
              <div key={date.toString()} className='relative'>
                <div className='opacity-60'>
                  <HabitDay
                    date={date}
                    amount={s?.amount ?? 0}
                    completed={s?.completed ?? 0}
                    onCompletedChange={handleDayCompletedChange}
                  />
                </div>
                <div
                  className='absolute inset-0 rounded-lg border-2 border-zinc-800 bg-zinc-900/60 cursor-not-allowed'
                  aria-hidden
                />
              </div>
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
