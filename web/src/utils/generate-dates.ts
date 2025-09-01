import dayjsOrig from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjsOrig.extend(utc)
const dayjs = dayjsOrig

export function generateDatesFromYearBeginning() {
  const firstDayOfTheYear = dayjs().startOf('year')
  const today = new Date()

  const dates = []
  let compareDate = firstDayOfTheYear

  while (compareDate.isBefore(today)) {
    dates.push(compareDate.toDate())
    compareDate = compareDate.add(1, 'day')
  }

  return dates
}

export function generateDatesFromCurrentMonth() {
  const startOfMonth = dayjs().startOf('month')
  const endOfMonth = dayjs().endOf('month')

  const dates = []
  let currentDate = startOfMonth

  while (
    currentDate.isBefore(endOfMonth) ||
    currentDate.isSame(endOfMonth, 'day')
  ) {
    dates.push(currentDate.toDate())
    currentDate = currentDate.add(1, 'day')
  }

  return dates
}

// export function generateMonthGridDates(base = dayjs()) {
//   const startOfMonth = base.startOf('month')
//   const endOfMonth = base.endOf('month')

//   // Domingo = 0 ... Sábado = 6
//   const startPadding = startOfMonth.day()           // quantos dias do mês anterior entram
//   const endPadding = 6 - endOfMonth.day()           // quantos dias do próximo mês entram

//   const firstCell = startOfMonth.subtract(startPadding, 'day')
//   const lastCell  = endOfMonth.add(endPadding, 'day')

//   const dates: Date[] = []
//   let cursor = firstCell

//   while (cursor.isBefore(lastCell) || cursor.isSame(lastCell, 'day')) {
//     dates.push(cursor.toDate())
//     cursor = cursor.add(1, 'day')
//   }

//   return dates
// }

/**
 * Gera uma grade de datas (Dom..Sáb) para o mês de `baseDate`.
 * Inclui os "cinzas" do começo/fim para completar a semana.
 * Tudo em UTC.
 */
export function generateMonthGridDates(baseDate: Date) {
  const monthStart = dayjs.utc(baseDate).startOf('month')
  const monthEnd = dayjs.utc(baseDate).endOf('month')

  const gridStart = monthStart.startOf('week') // domingo
  const gridEnd = monthEnd.endOf('week') // sábado

  const dates: Date[] = []
  let cur = gridStart

  while (cur.isBefore(gridEnd) || cur.isSame(gridEnd, 'day')) {
    dates.push(cur.toDate())
    cur = cur.add(1, 'day')
  }
  return dates
}

/** Lista de meses do ano da `base` (ex.: Jan..Dec de 2025) como objetos dayjs UTC */
export function monthsOfYear(base = new Date()) {
  const start = dayjs.utc(base).startOf('year')
  return Array.from({ length: 12 }, (_, i) => start.add(i, 'month'))
}
