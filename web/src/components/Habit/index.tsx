interface HabitProps {
  completed: number
}

export function Habit({ completed }: HabitProps) {
  return (
    <div className="bg-zinc-300">
      Habits completed: {completed}
    </div>
  )
}