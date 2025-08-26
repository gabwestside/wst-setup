import * as React from 'react'
import * as Toast from '@radix-ui/react-toast'

type ToastType = 'success' | 'error' | 'info'

type ToastState = {
  open: boolean
  title?: string
  description?: string
  type?: ToastType
}

type ToastContextValue = {
  showToast: (opts: {
    title: string
    description?: string
    type?: ToastType
  }) => void
}

const ToastCtx = React.createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = React.useContext(ToastCtx)
  if (!ctx) throw new Error('useToast must be used within <AppToastProvider>')
  return ctx
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ToastState>({ open: false })

  const showToast = React.useCallback(
    (opts: { title: string; description?: string; type?: ToastType }) => {
      setState({ open: false }) // reset
      // pequeno delay para garantir re-render
      setTimeout(() => setState({ open: true, ...opts }), 0)
    },
    []
  )

  const bgByType: Record<ToastType, string> = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    info: 'bg-zinc-700',
  }

  const barByType: Record<ToastType, string> = {
    success: 'bg-emerald-400',
    error: 'bg-red-400',
    info: 'bg-zinc-500',
  }

  const type = state.type ?? 'info'

  return (
    <ToastCtx.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection='right'>
        {children}

        <Toast.Root
          open={state.open}
          onOpenChange={(open) => setState((s) => ({ ...s, open }))}
          className={`fixed right-4 top-4 w-[360px] max-w-[92vw] rounded-2xl text-white shadow-xl border border-zinc-700 ${bgByType[type]}`}
        >
          <div className='p-4'>
            <Toast.Title className='font-semibold'>{state.title}</Toast.Title>
            {state.description ? (
              <Toast.Description className='mt-1 text-sm text-zinc-100/90'>
                {state.description}
              </Toast.Description>
            ) : null}
          </div>

          {/* barra inferior de progresso */}
          <div className={`h-1 w-full ${barByType[type]} rounded-b-2xl`} />
        </Toast.Root>

        <Toast.Viewport className='fixed right-4 top-4 z-[9999] outline-none' />
      </Toast.Provider>
    </ToastCtx.Provider>
  )
}
