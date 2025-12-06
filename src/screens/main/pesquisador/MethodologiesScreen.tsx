// /src/screens/main/pesquisador/MethodologiesScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  // 🚨 NOVO: Importar SafeAreaView 🚨
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; 
import { useData } from '../../../contexts/DataContext';
import { IMethodology } from '../../../types/beach';

const PRIMARY_COLOR = '#1976d2'; 
const ACCENT_COLOR = '#ff9800'; 

export default function MethodologiesScreen() {
  const { methodologies = [], loading, fetchMethodologies } = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMethodologies = React.useMemo(() => {
    if (!searchQuery) return methodologies;
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    return methodologies.filter((methodology) => {
      return methodology.des_name?.toLowerCase().includes(lowerCaseQuery) ||
             methodology.des_description?.toLowerCase().includes(lowerCaseQuery);
    });
  }, [methodologies, searchQuery]);

  useEffect(() => {
    if (methodologies.length === 0 && !loading) {
        fetchMethodologies();
    }
  }, [methodologies.length, loading, fetchMethodologies]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMethodologies();
    setRefreshing(false);
  };

  const renderMethodologyItem = ({ item }: { item: IMethodology }) => (
    <TouchableOpacity style={styles.methodCard}>
      
      <View style={styles.iconContainer}>
        <Icon name="book-open-variant" size={28} color={ACCENT_COLOR} />
      </View>
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.des_name}</Text>
        
        <View style={styles.detailRow}>
            <Icon name="tag-text-outline" size={14} color="#999" style={{marginRight: 4}} />
            <Text style={styles.detailText}>
                {item.des_description ? 'Detalhes da Metodologia' : 'Sem descrição detalhada'}
            </Text>
        </View>

        <Text style={styles.cardDescription} numberOfLines={3}>
          {item.des_description || 'Nenhuma descrição fornecida para esta metodologia.'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    // 🚨 1. ENVOLVER COM SafeAreaView 🚨
    <SafeAreaView style={styles.safeArea}> 
        <View style={styles.container}>
          
          {/* 🚨 2. BARRA DE BUSCA (AGORA ABAIXO DA BARRA DE STATUS) 🚨 */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar metodologia ou descrição..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Icon name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          {/* ----------------------------------- */}

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
          ) : (
            <FlatList
              data={filteredMethodologies}
              renderItem={renderMethodologyItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>
                    {searchQuery ? 'Nenhuma metodologia encontrada com o filtro.' : 'Nenhuma metodologia cadastrada.'}
                  </Text>
                </View>
              }
            />
          )}
        </View>
    </SafeAreaView> // 🚨 FIM DO SafeAreaView 🚨
  );
}

const styles = StyleSheet.create({
  // 🚨 3. ESTILO PARA SafeAreaView 🚨
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Garante que a área de status seja branca
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  
  // ESTILOS DE BUSCA INTEGRADOS (Removendo padding extra que o SafeAreaView irá adicionar)
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 25,
    zIndex: 1,
  },
  clearButton: {
    position: 'absolute',
    right: 25,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    paddingLeft: 45, 
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
  },
  
  // ESTILOS DO CARD MELHORADO
  methodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 15,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: '#fff9e6',
    borderRadius: 10,
    marginRight: 15,
    borderWidth: 1,
    borderColor: ACCENT_COLOR,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 12,
    color: '#999',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});