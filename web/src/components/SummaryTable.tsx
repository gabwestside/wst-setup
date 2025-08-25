import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { api } from '../lib/axios'
import { generateDatesFromCurrentMonth } from '../utils/generate-dates'
import { HabitDay } from './HabitDay'

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const summaryDates = generateDatesFromCurrentMonth()

const minimumSummaryDatesSize = 18 * 7
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length

type Summary = {
  id: string
  date: Date
  amount: number
  completed: number
}[]

export function SummaryTable() {
  const [summary, setSummary] = useState<Summary>([])

  useEffect(() => {
    api.get('summary').then((response) => {
      setSummary(response.data)
    })
  }, [])

  return (
    <div className='w-full flex flex-col h-full max-h-[30rem] md:flex-row'>
      <div
        className='
          grid gap-3 mb-3 md:mb-0
          grid-cols-7 grid-flow-col
          md:grid-cols-1 md:grid-rows-7 md:grid-flow-row
        '
      >
        {weekDays.map((weekDay, index) => (
          <div
            key={index}
            className='
              text-zinc-400 text-sm md:text-xl
              h-8 w-8 md:h-10 md:w-10
              font-bold flex items-center justify-center
            '
          >
            {weekDay}
          </div>
        ))}
      </div>
      
      <div
        className='
          grid gap-3 md:ml-4
          grid-cols-7 grid-flow-row
          md:grid-cols-none md:grid-rows-7 md:grid-flow-col
        '
      >
        {summaryDates.map((date) => {
          const dayInSummary = summary.find((day) =>
            dayjs(date).isSame(day.date, 'day')
          )

          return (
            <HabitDay
              key={date.toString()}
              date={date}
              amount={dayInSummary?.amount}
              completed={dayInSummary?.completed}
            />
          )
        })}

        {amountOfDaysToFill > 0 &&
          Array.from({ length: amountOfDaysToFill }).map((_, index) => {
            return (
              <div
                key={index}
                className='w-10 h-10 bg-zinc-900 border-2 border-zinc-800 rounded-lg opacity-40 cursor-not-allowed'
              />
            )
          })}
      </div>
    </div>
  )
}
