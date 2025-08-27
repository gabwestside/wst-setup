import { useEffect, useMemo, useRef, useState } from 'react'
import { dayjs } from '../lib/dayjs'
import { api } from '../lib/axios'
import { HabitDay } from './HabitDay'
import { buildWeeksFromYearStart, keyUTC } from '../utils/dates-grid'

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
  const weeks = useMemo(() => buildWeeksFromYearStart(), [])
  const mobileScrollRef = useRef<HTMLDivElement>(null)
  const desktopScrollRef = useRef<HTMLDivElement>(null)

  // busca summary uma vez
  useEffect(() => {
    api.get('/summary').then((r) => setSummary(r.data))
  }, [])

  // index por chave UTC
  const byKey = useMemo(() => {
    const m = new Map<string, SummaryItem>()
    for (const s of summary) m.set(keyUTC(s.date), s)
    return m
  }, [summary])

  // callback para sincronizar deltas (toggle)
  function handleDayCompletedChange(date: Date, delta: number) {
    const k = keyUTC(date)
    setSummary((prev) => {
      const idx = prev.findIndex((s) => keyUTC(s.date) === k)
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

  // centraliza a SEMANA atual no topo (mobile) / esquerda (desktop)
  useEffect(() => {
    const today = dayjs.utc().startOf('day')
    const isInWeek = (weekDates: Date[]) =>
      weekDates.some((d) => dayjs.utc(d).isSame(today, 'week'))

    const weekIndex = weeks.findIndex((w) => isInWeek(w.days))
    if (weekIndex === -1) return

    // Mobile: scroll vertical — cada semana é uma "linha" empilhada
    if (mobileScrollRef.current) {
      const parent = mobileScrollRef.current
      const row =
        parent.querySelectorAll<HTMLElement>('[data-week-row]')[weekIndex]
      if (row) parent.scrollTop = row.offsetTop
    }

    // Desktop: scroll horizontal — cada semana é uma coluna
    if (desktopScrollRef.current) {
      const parent = desktopScrollRef.current
      const col =
        parent.querySelectorAll<HTMLElement>('[data-week-col]')[weekIndex]
      if (col) parent.scrollLeft = col.offsetLeft
    }
  }, [weeks])

  const todayUtc = dayjs.utc().startOf('day')

  return (
    <div className='w-full'>
      {/* ---------- MOBILE (vertical) ---------- */}
      <div className='md:hidden'>
        {/* Cabeçalho S M T W T F S no topo */}
        <div className='mb-2 flex justify-between px-1'>
          {weekDaysHeader.map((d, i) => (
            <span key={i} className='text-xs text-zinc-500 w-10 text-center'>
              {d}
            </span>
          ))}
        </div>

        <div
          ref={mobileScrollRef}
          className='max-h-[70vh] overflow-y-auto pr-1'
        >
          {/* semanas empilhadas (mais recentes em cima) */}
          <div className='grid grid-cols-7 gap-1'>
            {weeks.map((week, wi) => (
              <div
                key={wi}
                data-week-row
                className='contents' // permite renderizar 7 células por linha mantendo o grid
              >
                {week.days.map((date, di) => {
                  const k = keyUTC(date)
                  const s = byKey.get(k)
                  const isFuture = dayjs.utc(date).isAfter(todayUtc)

                  return (
                    <div key={di} className='h-10 w-10 relative'>
                      <HabitDay
                        date={date}
                        amount={s?.amount ?? 0}
                        completed={s?.completed ?? 0}
                        onCompletedChange={handleDayCompletedChange}
                      />
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
            ))}
          </div>
        </div>
      </div>

      {/* ---------- DESKTOP (horizontal) ---------- */}
      <div className='hidden md:flex'>
        {/* coluna S..S à esquerda */}
        <div className='grid grid-rows-7 grid-flow-row gap-1 mr-2'>
          {weekDaysHeader.map((d, i) => (
            <div
              key={i}
              className='h-10 w-8 text-sm text-zinc-500 flex items-center justify-center'
            >
              {d}
            </div>
          ))}
        </div>

        <div ref={desktopScrollRef} className='overflow-x-auto pb-2'>
          <div className='flex gap-1'>
            {/* colunas de semanas (mais recentes à esquerda) */}
            {weeks.map((week, wi) => (
              <div key={wi} data-week-col className='flex flex-col gap-1'>
                {week.days.map((date, di) => {
                  const k = keyUTC(date)
                  const s = byKey.get(k)
                  const isFuture = dayjs.utc(date).isAfter(todayUtc)

                  return (
                    <div key={di} className='h-10 w-10 relative'>
                      <HabitDay
                        date={date}
                        amount={s?.amount ?? 0}
                        completed={s?.completed ?? 0}
                        onCompletedChange={handleDayCompletedChange}
                      />
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
