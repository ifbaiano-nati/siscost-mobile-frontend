import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  // Não precisamos mais de Platform/StatusBar com esta estrutura
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../../contexts/AuthContext';

const PRIMARY_COLOR = '#1976d2'; 
const ACCENT_COLOR = '#4caf50'; 

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  const userProfileName = user?.user_profile?.profile?.name;
  const isPesquisador = userProfileName === 'Pesquisador'; 

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const goToMyEvaluations = () => {
      // Implemente a navegação para a tela que lista apenas as avaliações do usuário logado.
      Alert.alert('Funcionalidade', 'Indo para Minhas Avaliações!');
  };

  return (
    // 🚨 1. ENVOLVER COM SafeAreaView com fundo neutro 🚨
    <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Meu Perfil</Text>
            <Text style={styles.headerSubtitle}>Gerencie sua conta e preferências</Text>
          </View>

          {/* User Info Card (Agora com espaçamento corrigido) */}
          <View style={styles.userCard}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.institution && (
                <Text style={styles.userInstitution}>{user.institution}</Text>
              )}
              {user?.user_profile?.profile && (
                <View style={styles.profileBadge}>
                  <Text style={styles.profileBadgeText}>
                    {user.user_profile.profile.name}
                  </Text>
                </View>
              )}
            </View>
          </View>


          {/* Minhas Contribuições (Funcionalidade) */}
          {user && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minhas Contribuições</Text>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={goToMyEvaluations}
              >
                <View style={[styles.menuIconContainer, {backgroundColor: isPesquisador ? '#eaf7e9' : '#f0f0f0'}]}>
                  <Icon 
                    name={isPesquisador ? "clipboard-list-outline" : "star-outline"} 
                    size={20} 
                    color={isPesquisador ? ACCENT_COLOR : PRIMARY_COLOR} 
                  />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>Minhas Avaliações</Text>
                  <Text style={styles.menuSubtitle}>
                    {isPesquisador ? 'Ver avaliações metodológicas criadas' : 'Ver suas notas e comentários de percepção'}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>
          )}

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configurações</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('Em breve', 'Notificações ainda não disponível.')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="bell-outline" size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notificações</Text>
                <Text style={styles.menuSubtitle}>Gerencie suas preferências</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => Alert.alert('Em breve', 'Ajuda e Suporte ainda não disponível.')}
            >
              <View style={styles.menuIconContainer}>
                <Icon name="help-circle-outline" size={20} color={PRIMARY_COLOR} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Ajuda e Suporte</Text>
                <Text style={styles.menuSubtitle}>Central de ajuda e contato</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚨 CORREÇÃO DE SOBREPOSIÇÃO: Fundo neutro para a Safe Area
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5', 
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20, // Mantém o padding inicial abaixo da barra de status
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  userCard: {
    backgroundColor: '#fff',
    margin: 20,
    // 🚨 CORREÇÃO DE ESPAÇAMENTO: Espaço entre o subtítulo e o cartão
    marginTop: 15, 
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userInstitution: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  profileBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  profileBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  // Item de Menu (Reutilizado para Minhas Avaliações e Configurações)
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  // 🚨 CORREÇÃO DE COR: Fundo light gray/transparent para os ícones
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#d32f2f',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});