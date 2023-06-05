import { View, Text, ScrollView, Alert } from 'react-native'

import { generateDatesFromYearBeginning } from '../utils/generate-dates-from-year-beginning.ts'

import { api } from '../lib/axios'
import { Header } from '../components/Header'
import { useNavigation } from '@react-navigation/native'
import { HabitDay, DAY_SIZE } from '../components/HabitDay'
import { useEffect, useState } from 'react'
import { Loading } from '../components/Loading'

const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const datesFromYearStart = generateDatesFromYearBeginning()
const minimumSummaryDatesSizes = 18 * 5
const amountOfDaysToFill = minimumSummaryDatesSizes + datesFromYearStart.length

export function Home() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)

  const { navigate } = useNavigation()

  async function fetchData() {
    try {
      setLoading(true)
      const response = await api.get('/summary')
      console.log('2123123', response)
      setSummary(response.data)
    } catch (error) {
      Alert.alert('Oops', 'Unable to load habit summary.')
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
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
          {datesFromYearStart.map((date) => (
            <HabitDay
              key={date.toISOString()}
              onPress={() => navigate('habit', { date: date.toISOString() })}
            />
          ))}

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
