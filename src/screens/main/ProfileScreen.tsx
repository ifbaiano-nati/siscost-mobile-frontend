import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

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

  const handleNotAvailable = (feature: string) => {
    Alert.alert(
      'Em breve',
      `A funcionalidade "${feature}" ainda não está disponível.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <Text style={styles.headerSubtitle}>Gerencie sua conta e preferências</Text>
      </View>

      {/* User Info Card */}
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


      {/* User Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Nome</Text>
          <Text style={styles.infoValue}>{user?.name || '-'}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>E-mail</Text>
          <Text style={styles.infoValue}>{user?.email || '-'}</Text>
        </View>

        {user?.institution && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Instituição</Text>
            <Text style={styles.infoValue}>{user.institution}</Text>
          </View>
        )}

        {user?.user_profile?.profile && (
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Perfil</Text>
            <Text style={styles.infoValue}>
              {user.user_profile.profile.name}
            </Text>
          </View>
        )}
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configurações</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNotAvailable('Editar Perfil')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="account-edit" size={20} color="#1976d2" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Editar Perfil</Text>
            <Text style={styles.menuSubtitle}>Altere suas informações pessoais</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNotAvailable('Notificações')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="bell-outline" size={20} color="#1976d2" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Notificações</Text>
            <Text style={styles.menuSubtitle}>Gerencie suas preferências</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => handleNotAvailable('Ajuda e Suporte')}
        >
          <View style={styles.menuIconContainer}>
            <Icon name="help-circle-outline" size={20} color="#1976d2" />
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 20,
    paddingTop: 20,
    paddingBottom: 30,
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
    marginTop: -20,
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
    backgroundColor: '#1976d2',
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
    color: '#1976d2',
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
  infoItem: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
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