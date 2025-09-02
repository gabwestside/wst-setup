import * as Checkbox from '@radix-ui/react-checkbox'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import { Check, Trash } from 'phosphor-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/axios'
import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useToast } from './ToastProvider'

dayjsOrig.extend(utc)
const dayjs = dayjsOrig

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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingToggle, setPendingToggle] = useState<{
    habitId: string
    willCheck: boolean
  } | null>(null)
  
  const isPastOrToday = useMemo(() => {
    const target = dayjs.utc(date).startOf('day')
    const today = dayjs.utc().startOf('day')
    return target.isBefore(today) || target.isSame(today)
  }, [date])
  
  const isPastOnly = useMemo(() => {
    const target = dayjs.utc(date).startOf('day')
    const today = dayjs.utc().startOf('day')
    return target.isBefore(today)
  }, [date])

  useEffect(() => {
    api
      .get('day', { params: { date: dayjs.utc(date).toDate().toISOString() } })
      .then((r) => setHabitsInfo(r.data))
  }, [date])
  
  async function applyToggle(habitId: string, willCheck: boolean) {
    if (!habitsInfo) return
    const delta = willCheck ? +1 : -1
    
    const snapshot = habitsInfo
    const next: HabitsInfo = {
      ...snapshot,
      completedHabits: willCheck
        ? [...snapshot.completedHabits, habitId]
        : snapshot.completedHabits.filter((id) => id !== habitId),
    }
    setHabitsInfo(next)
    onChangeCompleted?.(delta)

    try {
      await api.patch(
        `/habits/${habitId}/toggle`,
        {},
        {
          params: { date: dayjs.utc(date).toDate().toISOString() },
          headers: { 'Content-Type': 'application/json' },
        }
      )

      showToast({
        title: willCheck ? 'Habit completed' : 'Habit unchecked',
        description: dayjs.utc(date).format('[Day] dddd, DD/MM'),
        type: 'success',
      })
    } catch (e) {
      // rollback
      setHabitsInfo(snapshot)
      onChangeCompleted?.(-delta)
      showToast({
        title: 'Failed to toggle habit',
        description: 'Try again soon.',
        type: 'error',
      })
      console.error('Failed to toggle habit', e)
    }
  }
  
  async function handleToggleClick(habitId: string) {
    if (!habitsInfo) return
    const checked = habitsInfo.completedHabits.includes(habitId)
    const willCheck = !checked
    
    if (isPastOnly) {
      setPendingToggle({ habitId, willCheck })
      setConfirmOpen(true)
      return
    }
    
    applyToggle(habitId, willCheck)
  }
  
  async function confirmPastToggle() {
    if (!pendingToggle) return
    const { habitId, willCheck } = pendingToggle
    setConfirmOpen(false)
    setPendingToggle(null)
    await applyToggle(habitId, willCheck)
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
    <>
      <div className='mt-6 flex flex-col gap-3'>
        {habitsInfo?.possibleHabits.map((habit) => {
          const checked = habitsInfo.completedHabits.includes(habit.id)

          return (
            <div key={habit.id} className='flex items-center gap-3 group'>
              <Checkbox.Root
                checked={checked}
                onCheckedChange={() => handleToggleClick(habit.id)}
                disabled={!isPastOrToday}
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
      </div>
      
      <AlertDialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className='fixed inset-0 bg-black/60' />
          <AlertDialog.Content className='fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-zinc-900 p-6 shadow-xl border border-zinc-800'>
            <AlertDialog.Title className='text-lg font-semibold text-white'>
              Confirm change on past day
            </AlertDialog.Title>
            <AlertDialog.Description className='mt-2 text-sm text-zinc-400'>
              You are changing a habit on{' '}
              <b>{dayjs.utc(date).format('dddd, DD/MM/YYYY')}</b>. Do you want
              to continue?
            </AlertDialog.Description>

            <div className='mt-6 flex justify-end gap-3'>
              <AlertDialog.Cancel asChild>
                <button
                  onClick={() => {
                    setPendingToggle(null)
                  }}
                  className='px-4 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition'
                >
                  Cancel
                </button>
              </AlertDialog.Cancel>

              <AlertDialog.Action asChild>
                <button
                  onClick={confirmPastToggle}
                  className='px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition'
                >
                  Confirm
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
