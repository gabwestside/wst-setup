import { Check } from 'phosphor-react'

interface NewHabitFormProps {}

export default function NewHabitForm(props: NewHabitFormProps) {
  return (
    <form className='w-full flex flex-col mt-6'>
      <label htmlFor='title' className='font-semibold leading-tight'>
        What's your commitment
      </label>

      <input
        type='text'
        id='title'
        placeholder='ex.: Exercises, sleep well, etc...'
        className='p-4 rounded-lg mt-3 bg-zinc-800 text-white placeholder:text-zinc-400'
        autoFocus
      />

      <label htmlFor='' className='font-semibold leading-tight mt-4'>
        What's the recurrence?
      </label>

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
