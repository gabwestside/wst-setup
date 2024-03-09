import { View, Text, ScrollView, Alert } from 'react-native'

import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning'

import { api } from '../lib/axios'
import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { useNavigation } from '@react-navigation/native'
import { HabitDay, DAY_SIZE } from '../components/HabitDay'
import { useEffect, useState } from 'react'
import dayjs from 'dayjs'

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const datesFromYearStart = generateDatesFromYearBeginning()
const minimumSummaryDatesSizes = 18 * 5
const amountOfDaysToFill = minimumSummaryDatesSizes + datesFromYearStart.length

type SummaryProps = Array<{
  id: string
  date: Date
  completed: number
  amount: number
}>

export function Home() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryProps | null>(null)

  const { navigate } = useNavigation()

  async function getSummary() {
    try {
      setLoading(true)
      const response = await api.get('/summary')
      setSummary(response.data)
    } catch (error) {
      Alert.alert('Oops', 'Unable to load habit summary.')
      console.log(JSON.stringify(error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSummary()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <View className='flex-1 bg-background px-8 pt-16'>
      <Header />

      <View className='flex-row mt-6 mb-2'>
        {weekDays.map((weekDay, i) => (
          <Text
            key={`${weekDay}-${i}`}
            className='text-zinc-400 text-xl font-bold text-center mx-1'
            style={{ width: DAY_SIZE }}
          >
            {weekDay}
          </Text>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className='flex-row flex-wrap'>
          {datesFromYearStart.map((date, index) => {
            const dayWithHabits = summary?.find((day) => {
              return dayjs(date).isSame(day.date, 'day')
            })

            return (
              <HabitDay
                key={index}
                date={date ?? new Date()}
                amountOfHabits={dayWithHabits?.amount}
                amountCompleted={dayWithHabits?.completed}
                onPress={() => navigate('habit', { date: date.toISOString() })}
              />
            )
          })}

          {amountOfDaysToFill > 0 &&
            Array.from({ length: amountOfDaysToFill }).map((_, index) => (
              <View
                key={index}
                className='bg-zinc-900 rounded-lg border-2 m-1 border-zinc-700 opacity-40'
                style={{ width: DAY_SIZE, height: DAY_SIZE }}
              />
            ))}
        </View>
      </ScrollView>
    </View>
  )
}
