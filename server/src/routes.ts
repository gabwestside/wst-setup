import { FastifyInstance } from 'fastify'
import dayjs from 'dayjs'
import { prisma } from './lib/prisma'
import { z } from 'zod'

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

  // complete or not complete a habit
  app.patch('/habits/:id/toggle', async (request) => {
    // route param => identity parameter

    const toggleHabitParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = toggleHabitParams.parse(request.params)

    const today = dayjs().startOf('day').toDate()

    let day = await prisma.day.findUnique({
      where: {
        date: today,
      },
    })

    if (!day) {
      day = await prisma.day.create({
        data: {
          date: today,
        },
      })
    }

    const dayHabit = await prisma.dayHabit.findUnique({
      where: {
        day_id_habit_id: {
          day_id: day.id,
          habit_id: id,
        },
      },
    })

    if (dayHabit) {
      // remove a completed mark
      await prisma.dayHabit.delete({
        where: {
          id: dayHabit.id,
        },
      })
    } else {
      // complete the habit
      await prisma.dayHabit.create({
        data: {
          day_id: day.id,
          habit_id: id,
        },
      })
    }
  })
  
  app.get('/summary', async () => {
    // Postgres version
    const summary = await prisma.$queryRaw<
      Array<{ id: string; date: Date; completed: number; amount: number }>
    >`
    SELECT 
      d.id,
      d.date,
      (
        SELECT COUNT(*)::int
        FROM day_habits dh
        WHERE dh.day_id = d.id
      ) AS completed,
      (
        SELECT COUNT(*)::int
        FROM habit_week_days hwd
        JOIN habits h ON h.id = hwd.habit_id
        WHERE
          hwd.week_day = EXTRACT(DOW FROM d.date)::int
          AND h.created_at <= d.date
      ) AS amount
    FROM days d
    ORDER BY d.date;
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
