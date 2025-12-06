import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Platform, 
  StatusBar, // 🚨 NOVO: Para cálculo do espaçamento superior
} from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../../contexts/DataContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../contexts/AuthContext'; 

const PRIMARY_COLOR = '#1976d2'; 
const ALERT_COLOR = '#f44336'; 
const SUCCESS_COLOR = '#4caf50'; 

// Funções utilitárias (usadas apenas no modo Pesquisador, mas definidas globalmente)
const getStatusIndicator = (status: string | null) => {
  if (status === 'MONITORADA') return { icon: 'check-circle', color: SUCCESS_COLOR };
  if (status === 'ALERTA') return { icon: 'alert-circle', color: ALERT_COLOR };
  return { icon: 'help-circle', color: '#ff9800' };
};

// Altura da barra de status (aproximada para Android/iOS)
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 20);

export default function BeachesScreen() {
  const { user } = useAuth();
  const { beaches = [], loading, fetchBeaches, getBeachTypeById, evaluations = [] } = useData();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de Filtro (AGORA ACESSÍVEL PELO TURISTA)
  const [filterType, setFilterType] = useState<number | null>(null);
  const [filterRating, setFilterRating] = useState<'ALERTA' | 'SUCESSO' | null>(null);

  const userProfileName = user?.user_profile?.profile?.name;
  const isPesquisador = userProfileName === 'Pesquisador';

  useEffect(() => {
    if (beaches.length === 0 && !loading) {
      fetchBeaches();
    }
  }, [beaches.length, loading, fetchBeaches]);

  const evaluationsByBeach = useMemo(() => {
    const map = new Map();
    (evaluations || []).forEach(e => {
      map.set(e.id_beach, (map.get(e.id_beach) || 0) + 1);
    });
    return map;
  }, [evaluations]);

  // Lógica de Filtragem CONDICIONAL (AGORA TODOS USAM)
  const filteredBeaches = useMemo(() => {
    let list = beaches; 
    const lowerCaseQuery = searchQuery.toLowerCase();

    // 1. Filtragem por busca
    if (searchQuery) {
      list = list.filter((beach) => {
        const matchesName = beach.des_name?.toLowerCase().includes(lowerCaseQuery);
        const matchesCity = beach.municipio?.des_name?.toLowerCase().includes(lowerCaseQuery);
        return matchesName || matchesCity;
      });
    }

    // 2. Filtros Avançados (Ativos para AMBOS, mas a exibição é opcional)
    if (filterType !== null) {
        list = list.filter(beach => beach.id_beach_type === filterType);
    }
    if (filterRating === 'ALERTA') {
        list = list.filter(beach => beach.nota_qualidade_atual !== null && beach.nota_qualidade_atual < 3.0);
    } else if (filterRating === 'SUCESSO') {
        list = list.filter(beach => beach.nota_qualidade_atual !== null && beach.nota_qualidade_atual >= 4.5);
    }

    return list;
  }, [beaches, searchQuery, filterType, filterRating]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBeaches();
    setRefreshing(false);
  };

  const getImageUrl = useCallback((path: string | null | undefined) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${process.env.EXPO_PUBLIC_API_URL}/${path}`;
  }, []);


  // FUNÇÃO DE RENDERIZAÇÃO OTIMIZADA E CONDICIONAL
  const renderBeachItem = useCallback(({ item }: { item: any }) => {
    const imageUrl = getImageUrl(item.foto_principal_path);
    const status = getStatusIndicator(item.status_monitoramento);
    const evaluationCount = evaluationsByBeach.get(item.id) || 0;
    
    // NAVEGAÇÃO CONDICIONAL
    const detailScreenName = isPesquisador ? 'PesquisadorBeachDetail' : 'BeachDetail';

    // Lógica para colorir a nota
    const ratingColor = item.nota_qualidade_atual >= 4.5 ? SUCCESS_COLOR : (item.nota_qualidade_atual < 3.0 ? ALERT_COLOR : PRIMARY_COLOR);

    return (
      <TouchableOpacity
        style={styles.beachCard}
        onPress={() => {
          (navigation as any).navigate(detailScreenName, { beachId: item.id }); 
        }}
      >
        <View style={styles.cardHeader}>
          {/* Imagem ou Placeholder */}
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.beachImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.beachImage, styles.placeholderImage]}>
              <Icon name="waves" size={50} color="#999" />
              <Text style={styles.placeholderText}>Sem imagem</Text>
            </View>
          )}

          {/* NOTA VISUAL EM DESTAQUE SOBRE A IMAGEM (Comum a ambos) */}
          {item.nota_qualidade_atual !== null && (
            <View style={[styles.ratingBadgeImage, { backgroundColor: ratingColor }]}>
                <Icon name="star" size={16} color="#fff" />
                <Text style={styles.ratingBadgeImageValue}>
                    {item.nota_qualidade_atual.toFixed(1)}
                </Text>
            </View>
          )}
          
          {/* Botão de Análise Rápida (APENAS PESQUISADOR) */}
          {isPesquisador && (
              <TouchableOpacity 
                style={styles.analyzeButton}
                onPress={() => (navigation as any).navigate(detailScreenName, { beachId: item.id })}
              >
                <Icon name="chart-bar" size={24} color="#FFF" />
              </TouchableOpacity>
          )}
        </View>

        <View style={styles.beachInfo}>
          
          <View style={styles.titleRow}> 
            <Text style={styles.beachName}>{item.des_name}</Text>
          </View>
          
          {/* Localização e Tipo */}
          <View style={styles.locationRow}>
              <Icon name="map-marker" size={14} color="#666" style={{marginRight: 4}} />
              <Text style={styles.beachLocation}>
                {item.municipio?.des_name}, {item.municipio?.estado?.uf}
              </Text>
          </View>
          
          <Text style={styles.beachType}>{getBeachTypeById(item.id_beach_type)?.des_name}</Text>
          
          {/* Status e Contagem (Rodapé) */}
          <View style={styles.footerRow}>
             {/* Indicador de Status (APENAS PESQUISADOR) */}
             {isPesquisador && (
                <View style={styles.statusBadge}>
                    <Icon name={status.icon} size={14} color={status.color} />
                    <Text style={[styles.statusText, { color: status.color }]}>
                        {item.status_monitoramento || 'NÃO CLASSIFICADO'}
                    </Text>
                </View>
             )}
             
             {/* Contagem de Avaliações (Visível para Turista e Pesquisador) */}
             <Text style={styles.evaluationCountText}>
                {evaluationCount} Avaliaç{(evaluationCount === 1) ? 'ão' : 'ões'}
             </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation, getImageUrl, getBeachTypeById, evaluationsByBeach, isPesquisador]);

  const toggleFilterRating = (rating: 'ALERTA' | 'SUCESSO') => {
    setFilterRating(filterRating === rating ? null : rating);
  };

  // 🚨 CORREÇÃO PRINCIPAL DE ESPAÇAMENTO: O Top View Contém o Padding 🚨
  return (
    <View style={[styles.container, { paddingTop: STATUS_BAR_HEIGHT }]}>
      
      {/* SearchBar é comum a ambos */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar praia, cidade, ou termo..."
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

      {/* BARRA DE FILTROS AVANÇADOS (Agora visível para o Turista, se ele clicar) */}
      {/* 🚨 Lógica de exibição simples: se a barra de busca estiver vazia, mostra os filtros rápidos 🚨 */}
      {!searchQuery && (
          <View style={styles.filterBar}>
            <Text style={styles.filterTitle}>Filtros Rápidos:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterPill, filterRating === 'ALERTA' && styles.filterPillActive, {backgroundColor: filterRating === 'ALERTA' ? PRIMARY_COLOR : '#f0f0f0'}]}
                onPress={() => toggleFilterRating('ALERTA')}
              >
                <Icon name="fire" size={16} color={filterRating === 'ALERTA' ? '#fff' : ALERT_COLOR} />
                <Text style={[styles.filterPillText, filterRating === 'ALERTA' && styles.filterPillTextActive, {color: filterRating === 'ALERTA' ? '#fff' : ALERT_COLOR}]}>
                  Abaixo de 3.0
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterPill, filterRating === 'SUCESSO' && styles.filterPillActive, {backgroundColor: filterRating === 'SUCESSO' ? PRIMARY_COLOR : '#f0f0f0'}]}
                onPress={() => toggleFilterRating('SUCESSO')}
              >
                <Icon name="star-check" size={16} color={filterRating === 'SUCESSO' ? '#fff' : SUCCESS_COLOR} />
                <Text style={[styles.filterPillText, filterRating === 'SUCESSO' && styles.filterPillTextActive, {color: filterRating === 'SUCESSO' ? '#fff' : SUCCESS_COLOR}]}>
                  Acima de 4.5
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterPill, filterType === 1 && styles.filterPillActive]}
                onPress={() => setFilterType(filterType === 1 ? null : 1)}
              >
                <Icon name="city" size={16} color={filterType === 1 ? '#fff' : '#333'} />
                <Text style={[styles.filterPillText, filterType === 1 && styles.filterPillTextActive]}>Tipo Urbana</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
      )}

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <FlatList
          data={filteredBeaches}
          renderItem={renderBeachItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery || filterRating || filterType ? 'Nenhum resultado encontrado para os filtros.' : 'Nenhuma praia cadastrada no sistema.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// Estilos Otimizados (Substitua os estilos antigos na sua folha)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
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
  listContent: {
    padding: 15,
  },
  beachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    position: 'relative',
  },
  beachImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    marginTop: 8,
  },
  analyzeButton: { 
    position: 'absolute',
    top: 10,
    right: 70, // Ajuste para dar espaço ao novo badge
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 5,
  },
  
  // 🚨 BADGE DE NOTA SOBRE A IMAGEM 🚨
  ratingBadgeImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomLeftRadius: 12,
    zIndex: 6,
  },
  ratingBadgeImageValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // ------------------------------------------

  beachInfo: {
    padding: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  beachName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
    marginRight: 10,
  },
  
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  beachLocation: {
    fontSize: 14,
    color: '#666',
  },
  beachType: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '500',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 5,
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  evaluationCountText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
    fontWeight: '600',
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
  // Estilos de Filtro (Mantidos)
  filterBar: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterPillActive: {
    backgroundColor: PRIMARY_COLOR,
    borderColor: PRIMARY_COLOR,
  },
  filterPillText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 5,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: '#fff',
  },
});
