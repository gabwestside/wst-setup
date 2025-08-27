import { useState } from 'react'
import { Header } from '../components/Header'
import { SummaryTable } from '../components/SummaryTable'
import { LoadingSquares } from '../components/Loading'

export function Home() {
  const [loading, setLoading] = useState(true)

  return (
    <div className='w-screen h-screen flex justify-center items-center'>
      <div className='w-full max-w-5xl px-6 flex flex-col gap-16'>
        <Header />
        <SummaryTable onLoading={setLoading} />
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
    </div>
  )
}
