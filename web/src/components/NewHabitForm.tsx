import { FormEvent, useMemo, useState } from 'react'
import { Check } from 'phosphor-react'
import * as Checkbox from '@radix-ui/react-checkbox'
import { api } from '../lib/axios'
import { useToast } from './ui/ToastProvider'

const availableWeekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const ALL = [0, 1, 2, 3, 4, 5, 6]
const WEEKDAYS = [1, 2, 3, 4, 5]
const WEEKENDS = [0, 6]

export default function NewHabitForm() {
  const [title, setTitle] = useState('')
  const [weekDays, setWeekDays] = useState<number[]>([])
  const { showToast } = useToast()

  const masterChecked: boolean | 'indeterminate' = useMemo(() => {
    if (weekDays.length === 0) return false
    if (weekDays.length === 7) return true
    return 'indeterminate'
  }, [weekDays])

  function setUniqueSorted(arr: number[]) {
    setWeekDays([...new Set(arr)].sort((a, b) => a - b))
  }

  function selectAll() {
    setWeekDays(ALL)
  }
  function selectNone() {
    setWeekDays([])
  }
  function selectWeekdays() {
    setUniqueSorted(WEEKDAYS)
  }
  function selectWeekends() {
    setUniqueSorted(WEEKENDS)
  }

  function toggleMaster() {
    if (weekDays.length === 7) selectNone()
    else selectAll()
  }

  function handleToggleWeekDay(weekDay: number) {
    setWeekDays((prev) =>
      prev.includes(weekDay)
        ? prev.filter((d) => d !== weekDay)
        : [...prev, weekDay]
    )
  }

  async function createNewHabit(event: FormEvent) {
    event.preventDefault()
    if (!title || weekDays.length === 0) {
      showToast({
        title: 'Fill in the fields',
        description: 'Enter a title and at least one day.',
        type: 'error',
      })
      return
    }

    try {
      await api.post('habits', { title, weekDays })
      const createdTitle = title
      setTitle('')
      setWeekDays([])

      showToast({
        title: 'Habit created!',
        description: `“${createdTitle}” has been added.`,
        type: 'success',
      })
    } catch (err) {
      console.error(err)
      showToast({
        title: 'Habit-forming mistake',
        description: 'Try again.',
        type: 'error',
      })
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
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className='font-semibold leading-tight mt-4'>
        What's the recurrence?
      </label>

      <div className='mt-3 flex flex-wrap items-center gap-2'>
        <label
          className='flex items-center gap-2 px-3 h-9 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 cursor-pointer'
          aria-label='Select all'
        >
          <Checkbox.Root
            checked={masterChecked}
            onCheckedChange={() => toggleMaster()}
            className='h-5 w-5 rounded bg-zinc-700 border-2 border-zinc-600 
                       data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500
                       data-[state=indeterminate]:bg-amber-500 data-[state=indeterminate]:border-amber-500
                       flex items-center justify-center'
          >
            <Checkbox.Indicator>
              <Check size={14} className='text-white' />
            </Checkbox.Indicator>
          </Checkbox.Root>
          <span className='text-sm select-none'>Select all</span>
        </label>
        
        <button
          type='button'
          onClick={selectAll}
          className='px-3 h-9 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-sm'
        >
          All
        </button>
        <button
          type='button'
          onClick={selectNone}
          className='px-3 h-9 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-sm'
        >
          None
        </button>
        <button
          type='button'
          onClick={selectWeekdays}
          className='px-3 h-9 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-sm'
        >
          Working days
        </button>
        <button
          type='button'
          onClick={selectWeekends}
          className='px-3 h-9 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 text-sm'
        >
          Weekend
        </button>
      </div>
      
      <div className='flex flex-col gap-2 mt-3'>
        {availableWeekDays.map((day, index) => (
          <Checkbox.Root
            key={day}
            className='flex items-center gap-3 group'
            checked={weekDays.includes(index)}
            onCheckedChange={() => handleToggleWeekDay(index)}
          >
            <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-700 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500'>
              <Checkbox.Indicator>
                <Check size={20} className='text-white' />
              </Checkbox.Indicator>
            </div>
            <span className='text-white leading-tight'>{day}</span>
          </Checkbox.Root>
        ))}
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
