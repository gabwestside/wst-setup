import * as Popover from '@radix-ui/react-popover'
import clsx from 'clsx'
import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useEffect, useState } from 'react'
import { HabitsList } from './HabitsList'
import { ProgressBar } from './ProgressBar'

dayjsOrig.extend(utc)
const dayjs = dayjsOrig

interface HabitDayProps {
  date: Date
  completed?: number
  amount?: number
  onCompletedChange?: (date: Date, delta: number) => void
}

export function HabitDay({
  completed = 0,
  amount = 0,
  date,
  onCompletedChange,
}: HabitDayProps) {
  const [localCompleted, setLocalCompleted] = useState(completed)

  useEffect(() => setLocalCompleted(completed), [completed])

  const completedPercentage =
    amount > 0 ? Math.round((localCompleted / amount) * 100) : 0

  function handleDelta(delta: number) {
    setLocalCompleted((c) => Math.max(0, Math.min(amount, c + delta)))
    onCompletedChange?.(date, delta)
  }

  const dayAndMonth = dayjs.utc(date).format('DD/MM')
  const dayOfWeek = dayjs.utc(date).format('dddd')
  const todayUtc = dayjs.utc().startOf('day')
  const isCurrentDay = dayjs.utc(date).isSame(todayUtc)

  return (
    <Popover.Root>
      <Popover.Trigger
        className={clsx('w-10 h-10 border-2 rounded-lg', {
          'bg-zinc-900 border-zinc-800': completedPercentage === 0,
          'bg-violet-900 border-violet-700':
            completedPercentage > 0 && completedPercentage < 20,
          'bg-violet-800 border-violet-600':
            completedPercentage >= 20 && completedPercentage < 40,
          'bg-violet-700 border-violet-500':
            completedPercentage >= 40 && completedPercentage < 60,
          'bg-violet-600 border-violet-500':
            completedPercentage >= 60 && completedPercentage < 80,
          'bg-violet-500 border-violet-400': completedPercentage >= 80,
          'border-white border-4': isCurrentDay,
        })}
      />

      <Popover.Portal>
        <Popover.Content className='min-w-[320px] p-6 rounded-2xl bg-zinc-800 flex flex-col'>
          <span className='font-semibold text-zinc-400'>{dayOfWeek}</span>
          <span className='mt-1 font-extrabold leading-tight text-3xl'>
            {dayAndMonth}
          </span>

          <ProgressBar progress={completedPercentage} />

          <HabitsList date={date} onChangeCompleted={handleDelta} />

          <Popover.Arrow height={8} width={16} className='fill-zinc-800' />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
