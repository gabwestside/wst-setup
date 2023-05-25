import { useRoute } from '@react-navigation/native'
import { ScrollView, View, Text } from 'react-native'
import { BackButton } from '../components/BackButton'
import dayjs from 'dayjs'
import ProgressBar from '../components/ProgressBar'
import { Checkbox } from '../components/Checkbox'

interface Params {
  date: string
}

export function Habit() {
  const route = useRoute()
  const { date } = route.params as Params

  const parsedDate = dayjs(date)
  const dayOfWeek = parsedDate.format('dddd')
  const dayAndMonth = parsedDate.format('DD/MM')

  const habitList = [
    'Read 15 min',
    'Workout',
    'Coding 1 hr',
    'Meditate',
    'Cardio',
  ]

  const randomHabitTracked: string[] = Array(
    Math.round(Math.random() * habitList.length)
  ).fill(habitList)

  return (
    <View className='flex-1 bg-background px-9 pt-16'>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className='mt-6 text-zinc-400 font-semibold text-base lowercase'>
          {dayOfWeek}
        </Text>

        <Text className='text-white font-extrabold text-3xl'>
          {dayAndMonth}
        </Text>

        <ProgressBar progress={Math.round(Math.random() * 100)} />

        <View className='mt-6'>
          {randomHabitTracked.map((habit, index) => (
            <Checkbox
              key={index}
              title={habit[Math.round(Math.random() * 4)]}
              checked={Math.round(Math.random()) === 1 ? true : false}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
