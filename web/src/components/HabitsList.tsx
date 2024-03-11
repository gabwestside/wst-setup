import * as Checkbox from '@radix-ui/react-checkbox'
import { Check } from 'phosphor-react'
import { useEffect } from 'react'
import { api } from '../lib/axios'

interface HabitsListProps {
  date: Date
}

export function HabitsList({ date }: HabitsListProps) {
  useEffect(() => {
    api
      .get('day', {
        params: {
          date: date.toISOString(),
        },
      })
      .then(response => {
        console.log(response)
      })
  }, [])

  return (
    <div>
      <div className='mt-6 flex flex-col gap-3'>
        <Checkbox.Root className='flex items-center gap-3 group'>
          <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-700 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500'>
            <Checkbox.Indicator>
              <Check size={20} className='text-whit' />
            </Checkbox.Indicator>
          </div>

          <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
            Drink 2L of water
          </span>
        </Checkbox.Root>
      </div>
    </div>
  )
}
