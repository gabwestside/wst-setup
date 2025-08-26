import * as Checkbox from '@radix-ui/react-checkbox'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Check, Trash, X } from 'phosphor-react'
import { useEffect, useState } from 'react'
import { api } from '../lib/axios'
import dayjs from 'dayjs'
import { useToast } from './ToastProvider'
import * as Dialog from '@radix-ui/react-dialog'

interface HabitsListProps {
  date: Date
  onChangeCompleted?: (delta: number) => void
}

type HabitsInfo = {
  possibleHabits: {
    id: string
    title: string
    created_at: string
  }[]
  completedHabits: string[]
}

export function HabitsList({ date, onChangeCompleted }: HabitsListProps) {
  const { showToast } = useToast()

  const [habitsInfo, setHabitsInfo] = useState<HabitsInfo>()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string
    title: string
  } | null>(null)
  const [confirmBusy, setConfirmBusy] = useState(false)

  const isFuture = dayjs(date).startOf('day').isAfter(dayjs().startOf('day'))
  const isPast = dayjs(date).startOf('day').isBefore(dayjs().startOf('day'))

  useEffect(() => {
    api
      .get('day', { params: { date: date.toISOString() } })
      .then((r) => setHabitsInfo(r.data))
  }, [date])

  useEffect(() => {
    api
      .get('day', { params: { date: date.toISOString() } })
      .then((r) => setHabitsInfo(r.data))
  }, [date])

  async function reallyToggle(habitId: string) {
    if (!habitsInfo) return
    const isCompleted = habitsInfo.completedHabits.includes(habitId)
    const delta = isCompleted ? -1 : +1

    const next: HabitsInfo = {
      ...habitsInfo,
      completedHabits: isCompleted
        ? habitsInfo.completedHabits.filter((id) => id !== habitId)
        : [...habitsInfo.completedHabits, habitId],
    }
    setHabitsInfo(next)
    onChangeCompleted?.(delta)

    try {
      await api.patch(`/habits/${habitId}/toggle`, undefined, {
        params: { date: date.toISOString() }
      })
      showToast({
        title: isCompleted ? 'Habit unchecked' : 'Habit completed',
        type: 'success',
      })
    } catch (e) {
      setHabitsInfo(habitsInfo)
      onChangeCompleted?.(-delta)
      showToast({ title: 'Failure to update habit', type: 'error' })
      console.error(e)
    }
  }

  function handleToggleClick(habitId: string, title: string) {
    if (isPast) {
      setConfirmTarget({ id: habitId, title })
    } else {
      void reallyToggle(habitId)
    }
  }

  async function confirmToggle() {
    if (!confirmTarget) return
    setConfirmBusy(true)
    await reallyToggle(confirmTarget.id)
    setConfirmBusy(false)
    setConfirmTarget(null)
  }

  async function handleDeleteHabit(habitId: string) {
    try {
      setDeletingId(habitId)
      await api.delete(`/habits/${habitId}`)
      setHabitsInfo((prev) =>
        prev
          ? {
              ...prev,
              possibleHabits: prev.possibleHabits.filter(
                (h) => h.id !== habitId
              ),
              completedHabits: prev.completedHabits.filter(
                (id) => id !== habitId
              ),
            }
          : prev
      )

      const deletedHabit = habitsInfo?.possibleHabits.find(
        (h) => h.id === habitId
      )
      showToast({
        title: 'Habit excluded',
        description: `“${deletedHabit?.title ?? habitId}” has been removed.`,
        type: 'success',
      })
    } catch (err) {
      showToast({
        title: 'Error when deleting habit',
        description: 'Check your connection or try again.',
        type: 'error',
      })
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className='mt-6 flex flex-col gap-3'>
      {habitsInfo?.possibleHabits.map((habit) => {
        const checked = habitsInfo.completedHabits.includes(habit.id)

        return (
          <div key={habit.id} className='flex items-center gap-3 group'>
            <Checkbox.Root
              key={habit.id}
              checked={checked}
              onCheckedChange={() => handleToggleClick(habit.id, habit.title)}
              disabled={isFuture}
              className='flex items-center gap-3 group disabled:opacity-50'
            >
              <div className='h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-700 border-2 border-zinc-800 group-data-[state=checked]:bg-green-500 group-data-[state=checked]:border-green-500'>
                <Checkbox.Indicator>
                  <Check size={20} className='text-white' />
                </Checkbox.Indicator>
              </div>
              <span className='font-semibold text-xl text-white leading-tight group-data-[state=checked]:line-through group-data-[state=checked]:text-zinc-400'>
                {habit.title}
              </span>
              {isPast && (
                <span className='ml-auto text-xs text-zinc-400'>
                  last day
                </span>
              )}
            </Checkbox.Root>
            
            <AlertDialog.Root>
              <AlertDialog.Trigger asChild>
                <button
                  aria-label={`Remover hábito ${habit.title}`}
                  className='ml-auto text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50'
                  disabled={deletingId === habit.id}
                >
                  <Trash size={20} />
                </button>
              </AlertDialog.Trigger>

              <AlertDialog.Portal>
                <AlertDialog.Overlay className='fixed inset-0 bg-black/60' />
                <AlertDialog.Content className='fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-zinc-900 p-6 shadow-xl border border-zinc-800'>
                  <AlertDialog.Title className='text-lg font-semibold text-white'>
                    Remove habit?
                  </AlertDialog.Title>
                  <AlertDialog.Description className='mt-2 text-sm text-zinc-400'>
                    This action cannot be undone. The habit{' '}
                    <span className='text-zinc-200 font-medium'>
                      “{habit.title}”
                    </span>{' '}
                    will be permanently deleted.
                  </AlertDialog.Description>

                  <div className='mt-6 flex justify-end gap-3'>
                    <AlertDialog.Cancel asChild>
                      <button className='px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition'>
                        Cancel
                      </button>
                    </AlertDialog.Cancel>

                    <AlertDialog.Action asChild>
                      <button
                        onClick={() => handleDeleteHabit(habit.id)}
                        disabled={deletingId === habit.id}
                        className='px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50'
                      >
                        {deletingId === habit.id ? 'Removing…' : 'Remove'}
                      </button>
                    </AlertDialog.Action>
                  </div>
                </AlertDialog.Content>
              </AlertDialog.Portal>
            </AlertDialog.Root>
          </div>
        )
      })}

      <Dialog.Root
        open={!!confirmTarget}
        onOpenChange={(open) => !open && !confirmBusy && setConfirmTarget(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className='fixed inset-0 bg-black/60' />
          <Dialog.Content className='fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-900 p-6 shadow-xl border border-zinc-800'>
            <div className='flex items-start justify-between'>
              <Dialog.Title className='text-lg font-semibold text-white'>
                Confirm a change in the past day?
              </Dialog.Title>
              <Dialog.Close
                disabled={confirmBusy}
                className='text-zinc-400 hover:text-zinc-200'
                aria-label='Fechar'
              >
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className='mt-2 text-sm text-zinc-400'>
              {confirmTarget
                ? `You will ${
                    /* heurística simples */ ''
                  }change the status of the habit “${
                    confirmTarget.title
                  }” in ${dayjs(date).format('dddd, DD/MM')}.`
                : null}
            </Dialog.Description>

            <div className='mt-6 flex justify-end gap-3'>
              <Dialog.Close
                disabled={confirmBusy}
                className='px-4 h-10 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50'
              >
                Cancel
              </Dialog.Close>
              <button
                onClick={confirmToggle}
                disabled={confirmBusy}
                className='px-4 h-10 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50'
              >
                {confirmBusy ? 'Applying...' : 'Confirm'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
