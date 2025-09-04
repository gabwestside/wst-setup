import { useEffect, useState } from 'react'
import { Header } from '../components/ui/Header'
import { SummaryTable } from '../components/SummaryTable'
import { LoadingSquares } from '../components/ui/Loading'
import { hasPin } from '../utils/has-pin'
import PinGate from '../components/ui/PinGate'

export function HomePage() {
  const [loading, setLoading] = useState(true)
  const [granted, setGranted] = useState<boolean>(hasPin())
  const [gateOpen, setGateOpen] = useState<boolean>(!hasPin())

  useEffect(() => {
    if (granted) setGateOpen(false)
  }, [granted])

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      {granted ? (
        <>
          <div className='w-full max-w-5xl px-6 flex flex-col gap-16'>
            <Header />
            <SummaryTable onLoading={setLoading} />

            <a href="/share" className='text-zinc-600 ml-auto hover:underline'>
              Share
            </a>
          </div>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10'>
              <LoadingSquares
                count={6}
                size={10}
                gap={2}
                speedMs={1100}
                delayMs={120}
              />
            </div>
          )}
        </>
      ) : (
        <div className='text-zinc-400'>
          <p>Faça login com o PIN para continuar.</p>
        </div>
      )}

      <PinGate open={gateOpen} onGranted={() => setGranted(true)} />
    </div>
  )
}
