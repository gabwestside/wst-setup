import { dayjs } from '../lib/dayjs'

export type Week = { days: Date[]; labelMonth?: string }
export type Grid = { weeks: Week[] }

export function buildContribGrid(options?: {
  extraWeeksLeft?: number // quantas semanas a mais para trás
}): Grid {
  const extra = options?.extraWeeksLeft ?? 20 // ~5 meses

  const startOfMonth = dayjs.utc().startOf('month')
  let start = startOfMonth.startOf('week')        // Domingo
  const end = startOfMonth.endOf('month').endOf('week') // Sábado

  start = start.subtract(extra, 'week')

  const weeks: Week[] = []

  for (let w = start; w.isBefore(end) || w.isSame(end, 'day'); w = w.add(1, 'week')) {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) days.push(w.add(i, 'day').toDate())

    // mostra rótulo do mês somente na coluna que contém o dia 1
    const firstOfMonthInThisWeek = days.find(d => dayjs.utc(d).date() === 1)
    const labelMonth = firstOfMonthInThisWeek
      ? dayjs.utc(firstOfMonthInThisWeek).format('MMM') // Sep, Oct, ...
      : undefined

    weeks.push({ days, labelMonth })
  }

  return { weeks }
}

export function dateKeyUTC(d: Date | string) {
  return dayjs.utc(d).format('YYYY-MM-DD')
}
