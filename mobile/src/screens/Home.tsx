import { View } from 'react-native'

import { Header } from '../components/Header'
import { HabitDay } from '../components/HabitDay'

export function Home() {
  return (
    <View className='flex-1 bg-background px-8 pt-16'>
      <Header />

      <HabitDay />
    </View>
  )
}
