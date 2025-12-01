import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        contentFit="contain"
        transition={200}
      />
      <Text style={styles.appName}>SISCOST</Text>
      <Text style={styles.subtitle}>Sistemas de Avaliação de Ativos Costeiros</Text>
      <ActivityIndicator 
        size="large" 
        color="#1976d2" 
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1976d2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    textAlign: 'center',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

