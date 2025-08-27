import { dayjs } from '../lib/dayjs'

export type Week = { days: Date[] }
export type WeeksGrid = Week[]

/**
 * Gera semanas de 01/01 até 31/12 do ano atual, alinhadas Dom..Sáb.
 * A última semana inclui os dias até o sábado final do ano.
 * A lista é retornada com a semana mais RECENTE primeiro (para facilitar a ordenação).
 */
export function buildWeeksFromYearStart(): WeeksGrid {
  const startOfYear = dayjs.utc().startOf('year')
  const endOfYear = dayjs.utc().endOf('year')

  // domingo da semana do primeiro dia do ano
  let start = startOfYear.startOf('week') // Dom
  // sábado da última semana do ano
  const end = endOfYear.endOf('week') // Sáb

  const weeks: Week[] = []
  for (let w = start; w.isBefore(end) || w.isSame(end, 'day'); w = w.add(1, 'week')) {
    const days: Date[] = []
    for (let i = 0; i < 7; i++) {
      days.push(w.add(i, 'day').toDate())
    }
    weeks.push({ days })
  }

  // ordena com a semana mais RECENTE primeiro
  weeks.sort((a, b) => {
    const aStart = a.days[0].getTime()
    const bStart = b.days[0].getTime()
    return bStart - aStart
  })

  return weeks
}

export function keyUTC(d: Date | string) {
  return dayjs.utc(d).format('YYYY-MM-DD')
}
