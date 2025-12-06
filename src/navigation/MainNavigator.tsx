// /src/navigation/MainNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAuth } from '../contexts/AuthContext';
// Certifique-se de que este import está correto:
import { UserRoleNames } from '../types/user'; 

// Telas do Turista
import HomeScreen from '../screens/main/turista/HomeScreen'; 
import BeachesScreen from '../screens/main/turista/BeachesScreen';
import BeachDetailScreen from '../screens/main/turista/BeachDetailScreen';

// Telas do Pesquisador
import DashboardScreen from '../screens/main/pesquisador/dashboardScreen'; 
import EvaluationsScreen from '../screens/main/pesquisador/EvaluationsScreen';
import EvaluationDetailScreen from '../screens/main/pesquisador/EvaluationDetailScreen';
import MethodologiesScreen from '../screens/main/pesquisador/MethodologiesScreen';

// Telas Comuns
import ProfileScreen from '../screens/main/turista/ProfileScreen'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();


// --- Stacks (Comuns/Base) ---

// Stack para a navegação da lista de Praias
function BeachesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BeachesList" component={BeachesScreen} options={{ title: 'Praias' }} />
      {/* 🚨 NOTA: O nome da tela de Detalhes deve ser ajustado aqui (BeachDetail vs PesquisadorBeachDetail) 🚨 */}
      <Stack.Screen name="BeachDetail" component={BeachDetailScreen} options={{ title: 'Detalhes da Praia' }} />
    </Stack.Navigator>
  );
}

// Stack para a navegação da lista de Avaliações
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

  // Função auxiliar para comparação de perfil, robusta contra erros de capitalização ou espaços
  const profileIs = (role: string) => userProfileName && userProfileName.trim().toUpperCase() === role.toUpperCase();

  // Variáveis booleanas baseadas nos perfis
  const isPesquisador = profileIs(UserRoleNames.PESQUISADOR);
  
  // 🚨 ONDE MUDAR 🚨: Condição que decide se as abas de Gestão serão mostradas.
  // Baseado nos perfis do banco: Administrador (1), Gestor Público (2), Pesquisador (3) e ONG (4).
  const showFullGestaoTabs = isPesquisador || profileIs('ADMINISTRADOR') || profileIs('GESTOR_PUBLICO') || profileIs('ONG'); 

  const activeColor = '#1976d2';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: '#666',
      }}
    >
      {/* --------------------------- ABA 1: HOME / PAINEL --------------------------- */}
      <Tab.Screen
        name="Home"
        // O Turista vê HomeScreen, o Pesquisador/Gestão vê DashboardScreen
        component={showFullGestaoTabs ? DashboardScreen : HomeScreen}
        options={{
          tabBarLabel: showFullGestaoTabs ? 'Painel' : 'Início',
          tabBarIcon: ({ color, size }) => (
            <Icon name={showFullGestaoTabs ? "view-dashboard" : "home-variant"} size={size} color={color} />
          ),
        }}
      />

      {/* --------------------------- ABA 2: PRAIAS (Comum para ambos) --------------------------- */}
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

      {/* --------------------------- ABA 3: METODOLOGIAS (SOMENTE PERFIS DE GESTÃO) --------------------------- */}
      {/* 🚨 CORREÇÃO: Renderiza condicionalmente 🚨 */}
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

      {/* --------------------------- ABA 4: AVALIAÇÕES (SOMENTE PERFIS DE GESTÃO) --------------------------- */}
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

      {/* --------------------------- ABA 5: PERFIL (Comum) --------------------------- */}
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