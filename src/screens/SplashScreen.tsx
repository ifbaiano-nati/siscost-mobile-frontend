import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY_COLOR = '#1976d2';
const ACCENT_COLOR = '#fff';
const WHITE_BACKGROUND = '#fff'; // Nova cor de fundo

export default function SplashScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/logoCompleta.png')}
          style={styles.logo}
          contentFit="contain"
          transition={500}
        />

        <Text style={styles.slogan}>Sistema de Gerenciamento de Ambientes Costeiros</Text>

        <ActivityIndicator
          size="large"
          color={PRIMARY_COLOR}
          style={styles.loader}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: WHITE_BACKGROUND, // 🚨 Fundo Branco para contraste 🚨
  },
  container: {
    flex: 1,
    backgroundColor: WHITE_BACKGROUND,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: '80%',
    height: 120,
    marginBottom: 20,
  },
  slogan: {
    fontSize: 16,
    color: PRIMARY_COLOR, // Tonalidade forte para contraste no fundo branco
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 40,
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
    transform: [{ scale: 1.2 }],
  },
});