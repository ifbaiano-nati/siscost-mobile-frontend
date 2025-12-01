import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from '../screens/main/HomeScreen';
import BeachesScreen from '../screens/main/BeachesScreen';
import BeachDetailScreen from '../screens/main/BeachDetailScreen';
import MethodologiesScreen from '../screens/main/MethodologiesScreen';
import EvaluationsScreen from '../screens/main/EvaluationsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BeachesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="BeachesList"
        component={BeachesScreen}
        options={{ title: 'Praias' }}
      />
      <Stack.Screen
        name="BeachDetail"
        component={BeachDetailScreen}
        options={{ title: 'Detalhes da Praia' }}
      />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
          headerTitle: 'SISCOST',
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
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Methodologies"
        component={MethodologiesScreen}
        options={{
          tabBarLabel: 'Metodologias',
          tabBarIcon: ({ color, size }) => (
            <Icon name="book-open-variant" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Metodologias',
        }}
      />
      <Tab.Screen
        name="Evaluations"
        component={EvaluationsScreen}
        options={{
          tabBarLabel: 'Avaliações',
          tabBarIcon: ({ color, size }) => (
            <Icon name="clipboard-check" size={size} color={color} />
          ),
          headerShown: true,
          headerTitle: 'Avaliações',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-circle" size={size} color={color} />
          ),
          headerTitle: 'Meu Perfil',
        }}
      />
    </Tab.Navigator>
  );
}

