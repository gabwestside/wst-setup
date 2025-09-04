import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/axios'
import { generateMonthGridDates, monthsOfYear } from '../utils/generate-dates'
import { HabitDay } from './HabitDay'
import clsx from 'clsx'

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

interface SummaryTableProps extends React.HTMLAttributes<HTMLDivElement> {
  onLoading?: React.Dispatch<React.SetStateAction<boolean>>
  /** If true, does not load from API or allow interaction; only displays */
  readOnly?: boolean
  /** Starting month (default = current UTC month). Useful in preview */
  currentMonthProp?: Date
  /** Summary data to display (ignores API if provided) */
  summaryData?: Summary
}

/** "Mute" square (without popover) for readOnly mode */
function ReadonlyDay({
  date,
  completed = 0,
  amount = 0,
  dimmed = false,
}: {
  date: Date
  completed?: number
  amount?: number
  dimmed?: boolean
}) {
  const pct = amount > 0 ? Math.round((completed / amount) * 100) : 0
  return (
    <div
      className={clsx(
        'w-10 h-10 border-2 rounded-lg',
        dimmed && 'opacity-60 cursor-not-allowed',
        pct === 0 && !dimmed && 'bg-zinc-900 border-zinc-800',
        pct > 0 && pct < 20 && 'bg-violet-900 border-violet-700',
        pct >= 20 && pct < 40 && 'bg-violet-800 border-violet-600',
        pct >= 40 && pct < 60 && 'bg-violet-700 border-violet-500',
        pct >= 60 && pct < 80 && 'bg-violet-600 border-violet-500',
        pct >= 80 && 'bg-violet-500 border-violet-400'
      )}
      title={`${dayjs.utc(date).format('DD/MM')}${
        amount ? ` • ${completed}/${amount}` : ''
      }`}
      aria-hidden
    />
  )
}

export function SummaryTable({
  onLoading,
  readOnly = false,
  currentMonthProp,
  summaryData,
}: SummaryTableProps) {
  const [summary, setSummary] = useState<Summary>(summaryData ?? [])
  // selected month (UTC)
  const [currentMonth, setCurrentMonth] = useState(() =>
    dayjs.utc(currentMonthProp ?? dayjs.utc().toDate()).startOf('month')
  )

  // loads summary once (only if it wasn't injected and isn't readOnly)
  useEffect(() => {
    if (readOnly || summaryData) return
    onLoading?.(true)
    api
      .get('/summary')
      .then((res) => setSummary(res.data))
      .finally(() => onLoading?.(false))
  }, [readOnly, summaryData])

  // if the injected data changes, it synchronizes
  useEffect(() => {
    if (summaryData) setSummary(summaryData)
  }, [summaryData])

  // indexa summary por chave UTC YYYY-MM-DD
  const summaryByKey = useMemo(() => {
    const m = new Map<string, SummaryItem>()
    for (const s of summary) m.set(dayjs.utc(s.date).format('YYYY-MM-DD'), s)
    return m
  }, [summary])

  // grid dates for the selected month
  const summaryDates = useMemo(
    () => generateMonthGridDates(currentMonth.toDate()),
    [currentMonth]
  )

  function handleDayCompletedChange(date: Date, delta: number) {
    if (readOnly) return
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
      {/* Month navigation */}
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

      {/* Day header (S M T W T F S) */}
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

      {/* Day grid */}
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

          // Em readOnly: SEM overlay (pode abrir popover para ver lista do dia)
          if (!readOnly && isFuture) {
            return (
              <div key={date.toString()} className='relative'>
                <div className='opacity-60'>
                  <HabitDay
                    date={date}
                    amount={s?.amount ?? 0}
                    completed={s?.completed ?? 0}
                    onCompletedChange={handleDayCompletedChange}
                    readOnly={false}
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
              onCompletedChange={
                readOnly ? undefined : handleDayCompletedChange
              }
              readOnly={readOnly}
            />
          )
        })}
      </div>
    </div>
  )
}
