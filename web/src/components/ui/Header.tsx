import { Plus, X } from 'phosphor-react'
import * as Dialog from '@radix-ui/react-dialog'
import logo from '../../assets/logo.svg'
import NewHabitForm from '../NewHabitForm'

interface HeaderProps {
  readOnly?: boolean
}

export function Header({ readOnly = false }: HeaderProps) {
  return (
    <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
      <img src={logo} alt="Habits" />

      {!readOnly && (
        <Dialog.Root>
          <Dialog.Trigger
            type="button"
            className="border border-violet-500 font-semibold rounded-lg px-6 py-4 flex items-center gap-3 hover:border-violet-300"
          >
            <Plus size={20} className="text-violet-500" />
            New habit
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/80" />
            <Dialog.Content className="absolute p-10 bg-zinc-900 rounded-2xl w-full max-w-md top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Dialog.Close className="absolute right-6 top-6 text-zinc-400 hover:text-zinc-200">
                <X size={24} aria-label="Close" />
              </Dialog.Close>

              <Dialog.Title className="text-3xl leading-tight font-extrabold">
                Create habit
              </Dialog.Title>

              <NewHabitForm />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  )
}
