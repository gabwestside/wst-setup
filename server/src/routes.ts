import { FastifyInstance } from 'fastify'
import { prisma } from './lib/prisma'
import { z } from 'zod'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export async function appRoutes(app: FastifyInstance) {
  app.post('/habits', async (request) => {
    const createHabitBody = z.object({
      title: z.string(),
      weekDays: z.array(z.number().min(0).max(6)),
    })

    const { title, weekDays } = createHabitBody.parse(request.body)

    const today = dayjs().startOf('day').toDate()

    await prisma.habit.create({
      data: {
        title,
        created_at: today,
        weekDays: {
          create: weekDays.map((weekDay) => {
            return {
              week_day: weekDay,
            }
          }),
        },
      },
    })
  })

  app.get('/day', async (request) => {
    const getDayParams = z.object({
      date: z.coerce.date(),
    })

    const { date } = getDayParams.parse(request.query)

    const parsedDate = dayjs(date).startOf('day')
    const weekDay = parsedDate.get('day')

    const possibleHabits = await prisma.habit.findMany({
      where: {
        created_at: {
          lte: date,
        },
        weekDays: {
          some: {
            week_day: weekDay,
          },
        },
      },
    })

    const day = await prisma.day.findUnique({
      where: {
        date: parsedDate.toDate(),
      },
      include: {
        dayHabits: true,
      },
    })

    const completedHabits =
      day?.dayHabits.map((dayHabit: { habit_id: string }) => {
        return dayHabit.habit_id
      }) ?? []

    return {
      possibleHabits,
      completedHabits,
    }
  })

  app.patch('/habits/:id/toggle', async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() })
    const querySchema = z.object({ date: z.string().datetime().optional() })

    const { id } = paramsSchema.parse(request.params)
    const { date } = querySchema.safeParse(request.query).success
      ? querySchema.parse(request.query)
      : { date: undefined }

    const target = date ? dayjs(date) : dayjs()
    const targetUtcStart = target.utc().startOf('day').toDate()

    let day = await prisma.day.findUnique({ where: { date: targetUtcStart } })
    if (!day) {
      day = await prisma.day.create({ data: { date: targetUtcStart } })
    }

    const existing = await prisma.dayHabit.findUnique({
      where: { day_id_habit_id: { day_id: day.id, habit_id: id } },
    })

    if (existing) {
      await prisma.dayHabit.delete({ where: { id: existing.id } })
      return reply.status(200).send({ completed: false, date: targetUtcStart })
    } else {
      await prisma.dayHabit.create({ data: { day_id: day.id, habit_id: id } })
      return reply.status(200).send({ completed: true, date: targetUtcStart })
    }
  })

  app.get('/summary', async () => {
    // [ { date: 17/01, amount: 5, completed: 1 }, { date: 18/01, amount: 2, completed: 2 }, {}]
    // Query mais complexas, mais condições, relacionamentos => SQL na mão (RAW)
    // Prisma ORM: RAW SQL => SQLite

    const summary = await prisma.$queryRaw`
      SELECT 
        D.id, 
        D.date,
        (
          SELECT
            cast(count(*) as float)
          FROM day_habits DH
          WHERE DH.day_id = D.id
        ) as completed,
        (
          SELECT 
            cast(count(*) as float)
          FROM habit_week_days HWD
          JOIN habits H
            ON H.id = HWD.habit_id
          WHERE
            HWD.week_day = cast(strftime('%w', D.date/1000.0, 'unixepoch') as int)
            AND H.created_at <= D.date
        ) as amount
      FROM days D
    `

    return summary
  })

  app.delete('/habits/:id', async (request, reply) => {
    const deleteHabitParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteHabitParams.parse(request.params)

    // Verificar se o hábito existe
    const habit = await prisma.habit.findUnique({
      where: { id },
    })

    if (!habit) {
      return reply.status(404).send({ error: 'Habit not found' })
    }

    // Deletar os registros relacionados na tabela day_habits
    await prisma.dayHabit.deleteMany({
      where: { habit_id: id },
    })

    // Deletar os registros relacionados na tabela habit_week_days
    await prisma.habitWeekDays.deleteMany({
      where: { habit_id: id },
    })

    // Deletar o hábito
    await prisma.habit.delete({
      where: { id },
    })

    return reply.status(204).send() // Retorna 204 No Content
  })
}
