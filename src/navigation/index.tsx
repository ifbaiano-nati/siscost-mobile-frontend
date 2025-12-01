import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import SplashScreen from '../screens/SplashScreen';

export default function Navigation() {
  const { isAuthenticated, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Mostra splash por pelo menos 1.5 segundos
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    // Se o loading terminar antes, ainda espera o mínimo
    if (!loading) {
      return () => clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [loading]);

  // Mostra splash enquanto está carregando ou durante o tempo mínimo
  if (loading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

