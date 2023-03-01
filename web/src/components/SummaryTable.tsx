import { HabitDay } from './HabitDay'
import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning.ts'

interface SummaryTableProps {}

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const summaryDates = generateDatesFromYearBeginning()

export function SummaryTable(props: SummaryTableProps) {
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
          return <HabitDay key={day.toString()} />
        })}
      </div>
    </div>
  )
}
