import { ScrollView, View, Text, TextInput } from 'react-native'
import { BackButton } from '../components/BackButton'

export function New() {
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

        <TextInput 
          className='h-12 pl-4 rounded-lg mt-3 bg-zinc-800 text-white focus:border-2 focus:border-green-600'
        />
      </ScrollView>
    </View>
  )
}
