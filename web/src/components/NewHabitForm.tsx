import { FormEvent, useState } from 'react'
import { Check } from 'phosphor-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { api } from '../lib/axios'

const availableWeekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export default function NewHabitForm() {
  const [title, setTitle] = useState('')
  const [weekDays, setWeekDays] = useState<number[]>([])

  async function createNewHabit(event: FormEvent) {
    event.preventDefault()

    if (!title || weekDays.length === 0) return

    await api.post('habits', {
      title,
      weekDays,
    })

    setTitle('')
    setWeekDays([])

    alert('habit created successfully!')
  }

  function handleToggleWeekDay(weekDay: number) {
    if (weekDays.includes(weekDay)) {
      const weekDaysWithRemoveOne = weekDays.filter((day) => day !== weekDay)

      setWeekDays(weekDaysWithRemoveOne)
    } else {
      const weekDaysWithAddedOne = [...weekDays, weekDay]

      setWeekDays(weekDaysWithAddedOne)
    }
  }

  return (
    <form onSubmit={createNewHabit} className='w-full flex flex-col mt-6'>
      <label htmlFor='title' className='font-semibold leading-tight'>
        What's your commitment
      </label>

      <input
        type='text'
        id='title'
        placeholder='ex.: Exercises, sleep well, etc...'
        className='p-4 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400'
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />

      <label htmlFor='' className='font-semibold leading-tight mt-4'>
        What's the recurrence?
      </label>

      <div className='flex flex-col gap-2 mt-3'>
        {availableWeekDays.map((day, index) => {
          return (
            <Checkbox.Root
              key={day}
              className='flex items-center gap-3 group'
              checked={weekDays.includes(index)}
              onCheckedChange={() => handleToggleWeekDay(index)}
            >
              <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-700 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500'>
                <Checkbox.Indicator>
                  <Check size={20} className='text-whit' />
                </Checkbox.Indicator>
              </div>

              <span className='text-white leading-tight'>{day}</span>
            </Checkbox.Root>
          )
        })}
      </div>
      <button
        type='submit'
        className='mt-6 rounded-lg p-4 flex items-center justify-center gap-3 font-semibold bg-green-600 transition duration-300 ease-out hover:bg-green-500 hover:ease-in'
      >
        <Check size={20} weight='bold' />
        Confirm
      </button>
    </form>
  )
}
