import './src/lib/dayjs'

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter'
import { StatusBar } from 'react-native'

import { Loading } from './src/components/Loading'
import { Routes } from './src/routes'

export default function App() {
  const [fontLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  })

  if (!fontLoaded) {
    return <Loading />
  }

  return (
    <>
      <Routes />
      <StatusBar
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
    </>
  )
}
