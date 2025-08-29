import { PrismaClient as PgClient } from '@prisma/client'
import Database from 'better-sqlite3'

// ajuste o caminho do seu dev.db
const sqlite = new Database('./prisma/dev.db', { readonly: true })
const pg = new PgClient()

async function main() {
  await pg.$connect()

  // Exemplo básico: copia tables habits, days, day_habits, habit_week_days
  // Ajuste os nomes exatos conforme seu schema.

  // HABITS
  const habitsRows = sqlite
    .prepare('SELECT id, title, created_at FROM habits')
    .all()
  for (const row of habitsRows) {
    await pg.habit.upsert({
      where: { id: row.id },
      update: {},
      create: {
        id: row.id,
        title: row.title,
        created_at: new Date(row.created_at),
      },
    })
  }

  // DAYS
  const daysRows = sqlite.prepare('SELECT id, date FROM days').all()
  for (const row of daysRows) {
    await pg.day.upsert({
      where: { id: row.id },
      update: {},
      create: {
        id: row.id,
        date: new Date(row.date),
      },
    })
  }

  // DAY_HABITS
  const dhRows = sqlite
    .prepare('SELECT id, day_id, habit_id FROM day_habits')
    .all()
  for (const row of dhRows) {
    await pg.dayHabit.upsert({
      where: { id: row.id },
      update: {},
      create: {
        id: row.id,
        day_id: row.day_id,
        habit_id: row.habit_id,
      },
    })
  }

  // HABIT_WEEK_DAYS
  const hwdRows = sqlite
    .prepare('SELECT id, habit_id, week_day FROM habit_week_days')
    .all()
  for (const row of hwdRows) {
    await pg.habitWeekDays.upsert({
      where: { id: row.id },
      update: {},
      create: {
        id: row.id,
        habit_id: row.habit_id,
        week_day: row.week_day,
      },
    })
  }

  console.log('Migração concluída!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await pg.$disconnect()
  })
