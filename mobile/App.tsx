import { StyleSheet, Text, View } from 'react-native'

import { StatusBar } from 'expo-status-bar'

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello world!</Text>
      <StatusBar style='auto' />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'purple',
    fontSize: 20,
    fontWeight: 'bold'
  },
})
