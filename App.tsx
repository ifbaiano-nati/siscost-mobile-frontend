import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import Navigation from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Navigation />
        <StatusBar style="auto" />
      </DataProvider>
    </AuthProvider>
  );
}
