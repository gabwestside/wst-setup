import { HabitDay } from './HabitDay'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning.ts'

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const summaryDates = generateDatesFromYearBeginning()

const minimumSummaryDatesSize = 18 * 9 // this logic it's change
const amountOfDaysToFill = minimumSummaryDatesSize - summaryDates.length

export function SummaryTable() {
  return (
    <div className='w-full flex'>
      <div className='grid grid-rows-7 grid-flow-row gap-3'>
        {weekDays.map((weekDay, index) => {
          return (
            <div
              key={index}
              className='text-zinc-400 text-xl h-10 w-10 font-bold flex items-center justify-center'
            >
              {weekDay}
            </div>
          )
        })}
      </div>

      <div className='grid grid-rows-7 grid-flow-col gap-3'>
        {summaryDates.map((day) => {
          return (
            <HabitDay
              key={day.toString()}
              amount={5}
              completed={Math.round(Math.random() * 5)}
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
