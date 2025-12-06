// App.tsx

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/contexts/AuthContext';
import { DataProvider } from './src/contexts/DataContext';
import { PesquisadorDataProvider } from './src/contexts/PesquisadorContext';
import Navigation from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <PesquisadorDataProvider>
          <Navigation />
        </PesquisadorDataProvider>
        <StatusBar style="auto" />
      </DataProvider>
    </AuthProvider>
  );
}