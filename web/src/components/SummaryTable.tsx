import { useEffect, useMemo, useRef, useState } from 'react'
import { dayjs } from '../lib/dayjs'
import { api } from '../lib/axios'
import { HabitDay } from './HabitDay'
import { buildContribGrid, dateKeyUTC } from '../utils/contrib-grid'

const weekDaysHeader = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

type SummaryItem = {
  id: string
  date: string
  amount: number
  completed: number
}
type Summary = SummaryItem[]

export function SummaryTable() {
  const [summary, setSummary] = useState<Summary>([])
  const { weeks } = useMemo(() => buildContribGrid({ extraWeeksLeft: 20 }), [])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    api.get('/summary').then((r) => setSummary(r.data))
  }, [])

  const summaryByKey = useMemo(() => {
    const m = new Map<string, SummaryItem>()
    for (const s of summary) m.set(dateKeyUTC(s.date), s)
    return m
  }, [summary])

  function handleDayCompletedChange(date: Date, delta: number) {
    const key = dateKeyUTC(date)
    setSummary((prev) => {
      const idx = prev.findIndex((s) => dateKeyUTC(s.date) === key)
      if (idx === -1) return prev
      const next = [...prev]
      const it = next[idx]
      next[idx] = {
        ...it,
        completed: Math.max(
          0,
          Math.min(it.amount, (it.completed ?? 0) + delta)
        ),
      }
      return next
    })
  }

  // centraliza a coluna em que começa o mês atual (desktop / scroll-x)
  useEffect(() => {
    const parent = scrollRef.current
    if (!parent) return
    const col = parent.querySelector<HTMLDivElement>(
      '[data-month-start="true"]'
    )
    if (col) {
      const targetLeft =
        col.offsetLeft + col.offsetWidth / 2 - parent.clientWidth / 2
      parent.scrollLeft = Math.max(0, targetLeft)
    }
  }, [weeks.length])

  const todayUtc = dayjs.utc().startOf('day')

  return (
    <div className='w-full'>
      {/* Header S M T W T F S – mobile no topo */}
      <div className='mb-2 flex md:hidden justify-between px-1'>
        {weekDaysHeader.map((d, i) => (
          <span key={i} className='text-xs text-zinc-500 w-8 text-center'>
            {d}
          </span>
        ))}
      </div>

      <div
        ref={scrollRef}
        className='
          relative
          overflow-y-auto md:overflow-x-auto
          max-h-[80vh]
          pb-2
        '
      >
        {/* rótulos de mês (somente desktop, topo) */}
        <div className='hidden md:block sticky top-0 z-[1]'>
          <div className='flex gap-1 px-1'>
            {weeks.map((w, i) => (
              <div key={i} className='w-10 text-xs text-zinc-400 text-left'>
                {w.labelMonth ?? ''}
              </div>
            ))}
          </div>
        </div>

        {/* grade: mobile = grid vertical (7 colunas); desktop = flex horizontal */}
        <div
          className='
            grid gap-1 px-1
            grid-cols-7 auto-rows-max
            md:flex md:gap-1
          '
        >
          {/* coluna S..S (somente desktop, na esquerda) */}
          <div className='hidden md:flex md:flex-col md:gap-1 md:mr-1'>
            {weekDaysHeader.map((d, i) => (
              <div
                key={i}
                className='h-10 w-8 text-sm text-zinc-500 flex items-center justify-center'
              >
                {d}
              </div>
            ))}
          </div>

          {/* colunas de semanas */}
          {weeks.map((week, wi) => {
            const isMonthStart = Boolean(week.labelMonth)
            return (
              <div
                key={wi}
                data-month-start={isMonthStart ? 'true' : undefined}
                className='flex flex-col gap-1'
              >
                {week.days.map((date, di) => {
                  const key = dateKeyUTC(date)
                  const s = summaryByKey.get(key)
                  const isFuture = dayjs.utc(date).isAfter(todayUtc)

                  return (
                    <div key={di} className='h-10 w-10 relative'>
                      <HabitDay
                        date={date}
                        amount={s?.amount ?? 0}
                        completed={s?.completed ?? 0}
                        onCompletedChange={handleDayCompletedChange}
                      />
                      {/* overlay para bloquear interação com datas futuras */}
                      {isFuture && (
                        <div
                          className='pointer-events-auto absolute inset-0 rounded-lg bg-zinc-900/60 border-2 border-zinc-800 cursor-not-allowed'
                          aria-hidden
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
