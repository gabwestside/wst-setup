import { ScrollView, View, Text, TextInput } from 'react-native'
import { BackButton } from '../components/BackButton'
import { Checkbox } from '../components/Checkbox'
import { useState } from 'react'

const availableWeekDays = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function New() {
  const [weekDays, setWeekDays] = useState<number[]>([])

  function handleToggleWeekDay(weekDayIndex: number) {
    if (weekDays.includes(weekDayIndex)) {
      setWeekDays((prevState) =>
        prevState.filter((day) => day !== weekDayIndex)
      )
    } else {
      setWeekDays((prevState) => [...prevState, weekDayIndex])
    }
  }

  return (
    <View className='flex-1 bg-background px-9 pt-16'>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackButton />

        <Text className='mt-6 text-white font-extrabold text-3xl'>
          Create habit
        </Text>

        <Text className='mt-6 text-white font-semibold text-base'>
          What's your commitment?
        </Text>

        <TextInput className='h-12 pl-4 rounded-lg mt-3 bg-zinc-800 text-white focus:border-2 focus:border-green-600' />

        <Text className='font-semibold mt-4 mb-3 text-white text-base'>
          What's the recurrence?
        </Text>

        {availableWeekDays.map((weekDay, index) => (
          <Checkbox
            key={index}
            title={weekDay}
            checked={weekDays.includes(index)}
            onPress={() => handleToggleWeekDay(index)}
          />
        ))}
      </ScrollView>
    </View>
  )
}
