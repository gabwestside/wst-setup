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

  while (
    currentDate.isBefore(endOfMonth) ||
    currentDate.isSame(endOfMonth, 'day')
  ) {
    dates.push(currentDate.toDate())
    currentDate = currentDate.add(1, 'day')
  }

  return dates
}

export function generateDatesForMonth(year: number, month0: number) {
  const start = dayjs.utc().year(year).month(month0).date(1).startOf('month')
  const end = start.endOf('month')

  const dates: Date[] = []
  for (
    let d = start;
    d.isBefore(end) || d.isSame(end, 'day');
    d = d.add(1, 'day')
  ) {
    dates.push(d.toDate())
  }
  return dates
}

export function generateDatesByOffset(offset: number) {
  const base = dayjs.utc().add(offset, 'month')
  return generateDatesForMonth(base.year(), base.month())
}

export function dateKeyUTC(d: Date | string) {
  return dayjs.utc(d).format('YYYY-MM-DD')
}
