import * as Dialog from '@radix-ui/react-dialog'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CORRECT_PIN = '0114'
const STORAGE_KEY = 'habits_pin_ok'

type Props = {
  open: boolean
  onGranted: () => void
}

export default function PinGate({ open, onGranted }: Props) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [askPreview, setAskPreview] = useState(false)
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setDigits(['', '', '', ''])
      setError('')
      setAskPreview(false)
      setTimeout(() => inputsRef.current[0]?.focus(), 50)
    }
  }, [open])

  const pin = useMemo(() => digits.join(''), [digits])

  function onChangeDigit(i: number, v: string) {
    const only = v.replace(/\D/g, '').slice(0, 1)
    setDigits((prev) => {
      const next = [...prev]
      next[i] = only
      return next
    })
    if (only && i < 3) inputsRef.current[i + 1]?.focus()
  }
  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputsRef.current[i - 1]?.focus()
    }
  }

  async function submit() {
    if (pin.length < 4) return
    if (pin === CORRECT_PIN) {
      localStorage.setItem(STORAGE_KEY, '1')
      onGranted()
    } else {
      setError('Incorrect PIN.')
      setAskPreview(true)
    }
  }

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className='fixed inset-0 bg-black/60' />
        <Dialog.Content className='fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-zinc-900 p-6 shadow-xl border border-zinc-800'>
          <Dialog.Title className='text-xl font-semibold text-white'>
            Enter your PIN
          </Dialog.Title>
          <p className='text-zinc-400 mt-1'>Four digits</p>

          <div className='mt-5 flex gap-3 justify-center'>
            {[0, 1, 2, 3].map((i) => (
              <input
                key={i}
                ref={(el) => (inputsRef.current[i] = el)}
                value={digits[i]}
                onChange={(e) => onChangeDigit(i, e.target.value)}
                onKeyDown={(e) => onKeyDown(i, e)}
                inputMode='numeric'
                pattern='[0-9]*'
                maxLength={1}
                className='h-14 w-14 rounded-xl bg-zinc-800 border border-zinc-700 text-center text-2xl text-white focus:outline-none focus:ring-2 focus:ring-violet-600'
              />
            ))}
          </div>

          {error && <div className='mt-3 text-red-400 text-center text-sm'>{error}</div>}

          <div className='mt-6 flex justify-end gap-3'>
            <button
              onClick={submit}
              className='px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition text-white'
            >
              Enter
            </button>
          </div>
          
          {askPreview && (
            <div className='mt-6 rounded-lg border border-zinc-700 p-4'>
              <div className='text-zinc-200 font-medium'>
                See an example of how it works?
              </div>
              <div className='mt-3 flex justify-end gap-2'>
                <button
                  onClick={() => {
                    // fica na página, sem carregar nada
                  }}
                  className='px-3 py-2 rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 transition'
                >
                  No
                </button>
                <button
                  onClick={() => navigate('/preview')}
                  className='px-3 py-2 rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition'
                >
                  See preview
                </button>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}