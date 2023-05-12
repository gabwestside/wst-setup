import { Check } from "phosphor-react";

interface NewHabitFormProps {}

export default function NewHabitForm(props: NewHabitFormProps) {
  return (
    <form className='w-full flex flex-col mt-6'>
      <label htmlFor='title' >
        What's your commitment
      </label>

      <input 
        type='text'
        id='title'
        placeholder="ex.: Exercises, sleep well, etc..."
        autoFocus
      />

      <label htmlFor="">
        What's the recurrence?
      </label>

      <button>
        <Check size={20} weight='bold' />
        Confirm
      </button>
    </form>
  )
}
