import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/inter'
import { StatusBar, StyleSheet, Text, View } from 'react-native'

import { Loading } from './src/components/Loading'

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
    <View style={styles.container}>
      <Text style={styles.text}>Hello world!</Text>
      <StatusBar
        barStyle='light-content'
        backgroundColor='transparent'
        translucent
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#7C3AED',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter_800ExtraBold',
  },
})
