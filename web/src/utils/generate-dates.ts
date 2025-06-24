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