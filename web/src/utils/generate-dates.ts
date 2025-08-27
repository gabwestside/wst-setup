import dayjs from 'dayjs'

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

  while (currentDate.isBefore(endOfMonth) || currentDate.isSame(endOfMonth, 'day')) {
    dates.push(currentDate.toDate())
    currentDate = currentDate.add(1, 'day')
  }

  return dates
}

export function generateMonthGridDates(base = dayjs()) {
  const startOfMonth = base.startOf('month')
  const endOfMonth = base.endOf('month')

  // Domingo = 0 ... Sábado = 6
  const startPadding = startOfMonth.day()           // quantos dias do mês anterior entram
  const endPadding = 6 - endOfMonth.day()           // quantos dias do próximo mês entram

  const firstCell = startOfMonth.subtract(startPadding, 'day')
  const lastCell  = endOfMonth.add(endPadding, 'day')

  const dates: Date[] = []
  let cursor = firstCell

  while (cursor.isBefore(lastCell) || cursor.isSame(lastCell, 'day')) {
    dates.push(cursor.toDate())
    cursor = cursor.add(1, 'day')
  }

  return dates
}