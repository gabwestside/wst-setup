import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useMemo } from 'react'
import { generateMonthGridDates } from '../utils/generate-dates'
import { SummaryTable } from '../components/SummaryTable'

dayjsOrig.extend(utc)
const dayjs = dayjsOrig

function seededRand(seed: number) {
  // Simple PRNG just to make the preview consistent
  let t = (seed + 0x6d2b79f5) | 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

type SummaryItem = {
  id: string
  date: string
  amount: number
  completed: number
}

export default function PreviewPage() {
  // current month grid (UTC)
  const dates = generateMonthGridDates(new Date())
  const monthNow = dayjs.utc().month()
  const yearNow = dayjs.utc().year()

  // Generates a stable fake summary for the current month (read-only)
  const summaryFake = useMemo<SummaryItem[]>(() => {
    const items: SummaryItem[] = []

    for (const d of dates) {
      const jd = dayjs.utc(d)
      if (jd.month() !== monthNow || jd.year() !== yearNow) continue

      const key = jd.format('YYYY-MM-DD')
      const r = seededRand(jd.date() * 97 + monthNow * 37 + yearNow)

      // amount between 3 and 6 (stable per day)
      const amount = 3 + Math.floor(r * 4) // 3..6
      // percentual 0...100
      const pct = Math.floor(r * 100)
      // completed coerente com amount
      const completed = Math.max(
        0,
        Math.min(amount, Math.round((amount * pct) / 100))
      )

      items.push({
        id: key, // sufficient for viewing
        date: jd.startOf('day').toDate().toISOString(), // ISO em UTC 00:00
        amount,
        completed,
      })
    }

    return items
  }, [dates, monthNow, yearNow])

  return (
    <div className='flex gap-10 flex-col mx-auto max-w-5xl px-6 py-8'>
      <h1 className='text-3xl font-extrabold text-white'>habits (preview)</h1>

      <SummaryTable
        className='mt-10'
        readOnly
        currentMonthProp={dayjs.utc().toDate()}
        summaryData={summaryFake}
      />

      <p className='mt-6 text-sm text-zinc-500'>
        This is a demonstration with no interaction and no real data.
      </p>
      <a
        className='text-sm absolute bottom-5 right-10 underline text-zinc-500'
        href='/'
      >
        Back to login
      </a>
    </div>
  )
}
