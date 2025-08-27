// src/pages/Home.tsx
import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import { generateDatesFromYearBeginning } from './utils/generate-dates'
import { api } from './lib/axios'

type SummaryItem = {
  id: string
  date: string | Date
  completed: number
  amount: number
}

type Summary = SummaryItem[]

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
export const DAY_SIZE = 40
const MIN_GRID_CELLS = 18 * 5

const Header: React.FC = () => (
  <header className='flex items-center justify-between'>
    <h1 className='text-xl font-extrabold tracking-tight text-white'>Habits</h1>
  </header>
)

const Loading: React.FC = () => (
  <div className='w-full py-16 text-center text-zinc-400'>Carregando…</div>
)

const HabitDay: React.FC<{
  date: Date
  amountOfHabits?: number
  amountCompleted?: number
  onClick?: () => void
}> = ({ date, amountOfHabits = 0, amountCompleted = 0, onClick }) => {
  const ratio = amountOfHabits > 0 ? amountCompleted / amountOfHabits : 0
  const bg =
    ratio === 0
      ? 'bg-zinc-900 border-zinc-800'
      : ratio < 0.25
      ? 'bg-violet-950 border-violet-900'
      : ratio < 0.5
      ? 'bg-violet-900 border-violet-800'
      : ratio < 0.75
      ? 'bg-violet-800 border-violet-700'
      : 'bg-violet-700 border-violet-600'

  return (
    <button
      type='button'
      onClick={onClick}
      className={`m-1 rounded-lg border-2 ${bg} transition-[transform,box-shadow] hover:shadow-lg active:scale-95`}
      style={{ width: DAY_SIZE, height: DAY_SIZE }}
      title={`${dayjs(date).format(
        'DD/MM/YYYY'
      )} • ${amountCompleted}/${amountOfHabits}`}
    />
  )
}

export const Home: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<Summary | null>(null)

  const datesFromYearStart = useMemo(() => generateDatesFromYearBeginning(), [])

  const amountOfDaysToFill = Math.max(
    0,
    MIN_GRID_CELLS - datesFromYearStart.length
  )

  async function getSummary() {
    try {
      setLoading(true)
      const response = await api.get<Summary>('/summary')
      setSummary(response.data)
    } catch (error) {
      window.alert('Oops! Não foi possível carregar o resumo dos hábitos.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSummary()
  }, [])

  if (loading) return <Loading />

  return (
    <div className='min-h-screen bg-background px-8 pt-16'>
      <div className='mx-auto max-w-5xl'>
        <Header />

        <div className='mt-6 mb-2 flex flex-row'>
          {weekDays.map((wd, i) => (
            <span
              key={`${wd}-${i}`}
              className='mx-1 text-center text-xl font-bold text-zinc-400'
              style={{ width: DAY_SIZE }}
            >
              {wd}
            </span>
          ))}
        </div>

        <div className='max-h-[70vh] overflow-y-auto pb-24'>
          <div className='flex flex-row flex-wrap'>
            {datesFromYearStart.map((date, index) => {
              const dayWithHabits = summary?.find((day) =>
                dayjs(date).isSame(day.date, 'day')
              )

              return (
                <HabitDay
                  key={index}
                  date={date ?? new Date()}
                  amountOfHabits={dayWithHabits?.amount}
                  amountCompleted={dayWithHabits?.completed}
                  onClick={() => {
                    // navigate(
                    //   `/habit?date=${encodeURIComponent(date.toISOString())}`
                    // )
                  }}
                />
              )
            })}

            {amountOfDaysToFill > 0 &&
              Array.from({ length: amountOfDaysToFill }).map((_, index) => (
                <div
                  key={`placeholder-${index}`}
                  className='m-1 rounded-lg border-2 border-zinc-700 bg-zinc-900 opacity-40'
                  style={{ width: DAY_SIZE, height: DAY_SIZE }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
