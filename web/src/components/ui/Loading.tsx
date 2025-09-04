// components/LoadingSquares.tsx
import React from 'react'

type Props = {
  count?: number // quantidade de quadrados
  size?: number // tailwind size (ex.: 10 => w-10 h-10)
  gap?: number // tailwind gap (ex.: 2 => gap-2)
  speedMs?: number // duração do ciclo
  delayMs?: number // atraso incremental entre quadrados
}

export function LoadingSquares({
  count = 6,
  size = 10,
  gap = 2,
  speedMs = 1200,
  delayMs = 120,
}: Props) {
  const squares = Array.from({ length: count })

  return (
    <div
      className={`flex items-center gap-${gap}`}
      role='status'
      aria-label='loading'
    >
      {squares.map((_, i) => (
        <div
          key={i}
          className={`w-${size} h-${size} rounded-lg border-2 animate-[violetWave_var(--speed)_ease-in-out_infinite]`}
          style={
            {
              '--speed': `${speedMs}ms`,
              animationDelay: `${i * delayMs}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
