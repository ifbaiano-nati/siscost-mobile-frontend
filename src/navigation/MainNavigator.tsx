// /src/navigation/MainNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../contexts/AuthContext';
import { UserRoleNames } from '../types/user'; 

// Telas do Turista
import HomeScreen from '../screens/main/turista/HomeScreen'; 
import BeachesScreen from '../screens/main/turista/BeachesScreen';
import BeachDetailScreen from '../screens/main/turista/BeachDetailScreen'; // Tela de Detalhes Base

// Telas do Pesquisador
import DashboardScreen from '../screens/main/pesquisador/dashboardScreen'; 
import EvaluationsScreen from '../screens/main/pesquisador/EvaluationsScreen';
import EvaluationDetailScreen from '../screens/main/pesquisador/EvaluationDetailScreen';
import MethodologiesScreen from '../screens/main/pesquisador/MethodologiesScreen';

// Telas Comuns
import ProfileScreen from '../screens/main/turista/ProfileScreen'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BeachesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BeachesList" component={BeachesScreen} options={{ title: 'Praias' }} />
      <Stack.Screen name="BeachDetail" component={BeachDetailScreen} options={{ title: 'Detalhes da Praia' }} />
      <Stack.Screen name="PesquisadorBeachDetail" component={BeachDetailScreen} options={{ title: 'Análise da Praia' }} />
    </Stack.Navigator>
  );
}

function EvaluationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EvaluationsList" component={EvaluationsScreen} options={{ title: 'Avaliações' }} />
      <Stack.Screen name="EvaluationDetail" component={EvaluationDetailScreen} options={{ title: 'Detalhes da Avaliação' }} />
    </Stack.Navigator>
  );
}

// ----------------------------------------------------
// MainNavigator COM LÓGICA DE PERFIL CORRIGIDA
// ----------------------------------------------------

export default function MainNavigator() { 
  const { user } = useAuth();

  const userProfileName = user?.user_profile?.profile?.name;
  const profileIs = (role: string) => userProfileName && userProfileName.trim().toUpperCase() === role.toUpperCase();

  const showFullGestaoTabs = 
      profileIs(UserRoleNames.PESQUISADOR) || 
      profileIs('ADMINISTRADOR') || 
      profileIs('GESTOR_PUBLICO') || 
      profileIs('ONG'); 

  const activeColor = '#1976d2';

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Home"
        component={showFullGestaoTabs ? DashboardScreen : HomeScreen}
        options={{
          tabBarLabel: showFullGestaoTabs ? 'Painel' : 'Início',
          tabBarIcon: ({ color, size }) => (
            <Icon name={showFullGestaoTabs ? "view-dashboard" : "home-variant"} size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Beaches"
        component={BeachesStack}
        options={{
          tabBarLabel: 'Praias',
          tabBarIcon: ({ color, size }) => (
            <Icon name="beach" size={size} color={color} />
          ),
        }}
      />

      {/* ABAS DE GESTÃO (RENDERIZAÇÃO CONDICIONAL) */}
      {showFullGestaoTabs && (
        <Tab.Screen
          name="Methodologies"
          component={MethodologiesScreen}
          options={{
            tabBarLabel: 'Metodologias',
            tabBarIcon: ({ color, size }) => (
              <Icon name="book-open-variant" size={size} color={color} />
            ),
          }}
        />
      )}

      {showFullGestaoTabs && (
        <Tab.Screen
          name="Evaluations"
          component={EvaluationsStack}
          options={{
            tabBarLabel: 'Avaliações',
            tabBarIcon: ({ color, size }) => (
              <Icon name="clipboard-list" size={size} color={color} />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}