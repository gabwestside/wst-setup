import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native'
import { BackButton } from '../components/BackButton'
import { Checkbox } from '../components/Checkbox'
import { Feather } from '@expo/vector-icons'
import { useState } from 'react'

import colors from 'tailwindcss/colors'
import { api } from '../lib/axios'

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
  const [title, setTitle] = useState('')
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

  async function handleCreateNewHabit() {
    try {
      if (!title.trim() || weekDays.length === 0) {
        Alert.alert('New Habit', 'Enter the habit name and its frequency.')
      }

      await api.post('/habits', { title, weekDays })

      setTitle('')
      setWeekDays([])

      Alert.alert('New Habit', 'Habit successfully created.')
    } catch (error) {
      console.log(error)
      Alert.alert('Oops', "It wasn't possible to create a new habit.")
    }
  }

  return (
    <View className='flex-1 bg-background px-9 pt-16'>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <BackButton />

        <Text className='mt-6 text-white font-extrabold text-3xl'>
          Create habit
        </Text>

        <Text className='mt-6 text-white font-semibold text-base'>
          What's your commitment?
        </Text>

        <TextInput 
          className='h-12 pl-4 rounded-lg mt-3 bg-zinc-900 text-white border-2 border-zinc-800 focus:border-2 focus:border-green-600' 
          placeholder='Exercises, sleep well, etc...'
          placeholderTextColor={colors.zinc['400']}
          onChangeText={setTitle}
          value={title}
        />

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

        <TouchableOpacity
          className='w-full h-14 flex-row items-center justify-center bg-green-600 rounded-md mt-6'
          activeOpacity={0.7}
          onPress={handleCreateNewHabit}
        >
          <Feather 
            name='check'
            size={20}
            color={colors.white}
          />

          <Text className='font-semibold text-base text-white ml-2'>
            Confirm
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}
