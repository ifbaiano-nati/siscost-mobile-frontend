import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Para evitar sobreposição com a barra de status
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../../contexts/DataContext';
import { IBeachEvaluation } from '../../../types/beach';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

const PRIMARY_COLOR = '#1976d2'; 
const SECONDARY_ACCENT = '#7b1fa2'; // Cor de destaque para detalhes metodológicos
const INFO_COLOR = '#2196f3'; // Azul claro para notas médias

export default function EvaluationsScreen() {
  const { evaluations = [], loading, fetchEvaluations, getMethodologyById, getBeachById } = useData();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Busca dados se a lista estiver vazia e não estiver carregando
    if (evaluations.length === 0 && !loading) {
      fetchEvaluations();
    }
  }, [evaluations.length, loading, fetchEvaluations]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvaluations();
    setRefreshing(false);
  };

  // Função para mapear cor da nota
  const getQualityColor = (nota: number) => {
    if (nota >= 4.5) return '#4caf50'; // Excelente (Verde)
    if (nota >= 3.5) return '#2196f3'; // Bom (Azul)
    if (nota >= 2.5) return '#ffc107'; // Razoável (Amarelo)
    return '#f44336'; // Ruim (Vermelho)
  };

  const renderEvaluationItem = ({ item }: { item: IBeachEvaluation }) => {
    const methodology = getMethodologyById(item.id_metodologie);
    const beach = getBeachById(item.id_beach);
    const qualityColor = getQualityColor(item.vl_value);
    const dimensionsCount = item.json_data?.dimensions?.length || 0;
    
    // Simulação do nome do perfil (deveria vir do backend, mas usamos 'user.name' como fallback)
    const profileName = item.user?.user_profile?.profile?.name || 'Avaliação Externa'; 

    return (
      <TouchableOpacity
        style={styles.card}
        // Navegação para o detalhe metodológico (opção do Pesquisador)
        onPress={() => (navigation as any).navigate('EvaluationDetail', { evaluationId: item.id })}
        activeOpacity={0.7}
      >
        {/* INDICADOR VISUAL LATERAL (Barra de cor baseada na nota) */}
        <View style={[styles.qualityIndicator, { backgroundColor: qualityColor }]} />
        
        <View style={styles.contentWrapper}>
            <View style={styles.cardHeader}>
              
              {/* Informações do Avaliador e Perfil */}
              <View style={styles.headerLeft}>
                <View style={styles.headerText}>
                  <Text style={styles.evaluatorName}>
                    {item.user?.name || `Usuário #${item.id_user}`}
                  </Text>
                  {/* Badge de Perfil */}
                  <View style={styles.profileBadge}>
                    <Text style={styles.profileBadgeText}>{profileName}</Text>
                  </View>
                  <Text style={styles.evaluationDate}>
                    {format(new Date(item.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                  </Text>
                </View>
              </View>
              
              {/* Nota em Círculo e Seta */}
              <View style={styles.ratingCircleContainer}>
                  <View style={[styles.ratingCircle, { backgroundColor: qualityColor }]}>
                    <Text style={styles.ratingBadgeText}>{item.vl_value.toFixed(1)}</Text>
                  </View>
                  <Icon name="chevron-right" size={24} color="#999" style={{marginLeft: 10}} />
              </View>
            </View>

            <View style={styles.cardBody}>
              {/* Informações da Praia */}
              {beach && (
                <View style={styles.infoRow}>
                  <Icon name="beach" size={16} color={PRIMARY_COLOR} />
                  <Text style={styles.beachName}>{beach.des_name}</Text>
                  {beach.municipio && (
                    <Text style={styles.location}>
                      {' • '}{beach.municipio.des_name}, {beach.municipio.estado?.uf}
                    </Text>
                  )}
                </View>
              )}

              {/* Informações de Metodologia */}
              {methodology && (
                <View style={styles.infoRow}>
                  <Icon name="book-open-variant" size={16} color={SECONDARY_ACCENT} />
                  <Text style={styles.methodologyName}>{methodology.des_name}</Text>
                </View>
              )}

              {/* Contagem de Dimensões (Relevante para Pesquisador) */}
              {dimensionsCount > 0 && (
                <View style={styles.dimensionsContainer}>
                  <Icon name="view-grid" size={16} color={SECONDARY_ACCENT} />
                  <Text style={styles.dimensionsLabel}>
                    {dimensionsCount} dimensão(ões) avaliada(s)
                  </Text>
                </View>
              )}
            </View>
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
          </View>
        ) : (
          <FlatList
            data={evaluations}
            renderItem={renderEvaluationItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma avaliação encontrada</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', 
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row', // Para a barra lateral
    overflow: 'hidden',
  },
  qualityIndicator: { // Barra de cor lateral
    width: 6,
    height: '100%',
  },
  contentWrapper: {
    flex: 1,
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ratingCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingCircle: { // Círculo de Nota
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerText: {
    flex: 1,
    marginRight: 15,
  },
  evaluatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileBadge: { // Badge de Perfil
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  profileBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    textTransform: 'uppercase',
  },
  evaluationDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  cardBody: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodologyName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  beachName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flexShrink: 1,
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  dimensionsLabel: {
    fontSize: 12,
    color: SECONDARY_ACCENT,
    marginLeft: 6,
    fontWeight: '500',
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