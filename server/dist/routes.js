"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appRoutes = appRoutes;
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = require("./lib/prisma");
const zod_1 = require("zod");
async function appRoutes(app) {
    app.post('/habits', async (request) => {
        const createHabitBody = zod_1.z.object({
            title: zod_1.z.string(),
            weekDays: zod_1.z.array(zod_1.z.number().min(0).max(6)),
        });
        const { title, weekDays } = createHabitBody.parse(request.body);
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        await prisma_1.prisma.habit.create({
            data: {
                title,
                created_at: today,
                weekDays: {
                    create: weekDays.map((weekDay) => {
                        return {
                            week_day: weekDay,
                        };
                    }),
                },
            },
        });
    });
    app.get('/day', async (request) => {
        var _a;
        const getDayParams = zod_1.z.object({
            date: zod_1.z.coerce.date(),
        });
        const { date } = getDayParams.parse(request.query);
        const parsedDate = (0, dayjs_1.default)(date).startOf('day');
        const weekDay = parsedDate.get('day');
        const possibleHabits = await prisma_1.prisma.habit.findMany({
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
        });
        const day = await prisma_1.prisma.day.findUnique({
            where: {
                date: parsedDate.toDate(),
            },
            include: {
                dayHabits: true,
            },
        });
        const completedHabits = (_a = day === null || day === void 0 ? void 0 : day.dayHabits.map((dayHabit) => {
            return dayHabit.habit_id;
        })) !== null && _a !== void 0 ? _a : [];
        return {
            possibleHabits,
            completedHabits,
        };
    });
    // complete or not complete a habit
    app.patch('/habits/:id/toggle', async (request) => {
        // route param => identity parameter
        const toggleHabitParams = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = toggleHabitParams.parse(request.params);
        const today = (0, dayjs_1.default)().startOf('day').toDate();
        let day = await prisma_1.prisma.day.findUnique({
            where: {
                date: today,
            },
        });
        if (!day) {
            day = await prisma_1.prisma.day.create({
                data: {
                    date: today,
                },
            });
        }
        const dayHabit = await prisma_1.prisma.dayHabit.findUnique({
            where: {
                day_id_habit_id: {
                    day_id: day.id,
                    habit_id: id,
                },
            },
        });
        if (dayHabit) {
            // remove a completed mark
            await prisma_1.prisma.dayHabit.delete({
                where: {
                    id: dayHabit.id,
                },
            });
        }
        else {
            // complete the habit
            await prisma_1.prisma.dayHabit.create({
                data: {
                    day_id: day.id,
                    habit_id: id,
                },
            });
        }
    });
    app.get('/summary', async () => {
        // [ { date: 17/01, amount: 5, completed: 1 }, { date: 18/01, amount: 2, completed: 2 }, {}]
        // Query mais complexas, mais condições, relacionamentos => SQL na mão (RAW)
        // Prisma ORM: RAW SQL => SQLite
        const summary = await prisma_1.prisma.$queryRaw `
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
    `;
        return summary;
    });
    app.delete('/habits/:id', async (request, reply) => {
        const deleteHabitParams = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = deleteHabitParams.parse(request.params);
        // Verificar se o hábito existe
        const habit = await prisma_1.prisma.habit.findUnique({
            where: { id },
        });
        if (!habit) {
            return reply.status(404).send({ error: 'Habit not found' });
        }
        // Deletar os registros relacionados na tabela day_habits
        await prisma_1.prisma.dayHabit.deleteMany({
            where: { habit_id: id },
        });
        // Deletar os registros relacionados na tabela habit_week_days
        await prisma_1.prisma.habitWeekDays.deleteMany({
            where: { habit_id: id },
        });
        // Deletar o hábito
        await prisma_1.prisma.habit.delete({
            where: { id },
        });
        return reply.status(204).send(); // Retorna 204 No Content
    });
}
