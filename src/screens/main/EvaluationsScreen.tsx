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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useData } from '../../contexts/DataContext';
import { IBeachEvaluation } from '../../types/beach.d';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function EvaluationsScreen() {
  const { evaluations, loading, fetchEvaluations, getMethodologyById, getBeachById } = useData();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvaluations();
    setRefreshing(false);
  };

  const getQualityColor = (nota: number) => {
    if (nota >= 4.5) return '#4caf50';
    if (nota >= 3.5) return '#2196f3';
    if (nota >= 2.5) return '#ffc107';
    return '#f44336';
  };

  const renderEvaluationItem = ({ item }: { item: IBeachEvaluation }) => {
    const methodology = getMethodologyById(item.id_metodologie);
    const beach = getBeachById(item.id_beach);
    const qualityColor = getQualityColor(item.vl_value);
    const dimensionsCount = item.json_data?.dimensions?.length || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => (navigation as any).navigate('EvaluationDetail', { evaluationId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.ratingBadge, { backgroundColor: qualityColor }]}>
              <Text style={styles.ratingBadgeText}>{item.vl_value.toFixed(1)}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.evaluatorName}>
                {item.user?.name || `Usuário #${item.id_user}`}
              </Text>
              <Text style={styles.evaluationDate}>
                {format(new Date(item.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#999" />
        </View>

        <View style={styles.cardBody}>
          {methodology && (
            <View style={styles.infoRow}>
              <Icon name="book-open-variant" size={18} color="#666" />
              <Text style={styles.methodologyName}>{methodology.des_name}</Text>
            </View>
          )}

          {beach && (
            <View style={styles.infoRow}>
              <Icon name="beach" size={18} color="#666" />
              <Text style={styles.beachName}>{beach.des_name}</Text>
              {beach.municipio && (
                <Text style={styles.location}>
                  {' • '}{beach.municipio.des_name}, {beach.municipio.estado?.uf}
                </Text>
              )}
            </View>
          )}

          {dimensionsCount > 0 && (
            <View style={styles.dimensionsContainer}>
              <Icon name="view-grid" size={16} color="#7b1fa2" />
              <Text style={styles.dimensionsLabel}>
                {dimensionsCount} dimensão(ões) avaliada(s)
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    )
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <FlatList
          data={evaluations}
          renderItem={renderEvaluationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma avaliação encontrada</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
  ratingBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ratingBadgeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerText: {
    flex: 1,
  },
  evaluatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  evaluationDate: {
    fontSize: 12,
    color: '#666',
  },
  cardBody: {
    marginTop: 8,
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
  },
  location: {
    fontSize: 12,
    color: '#666',
  },
  dimensionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dimensionsLabel: {
    fontSize: 12,
    color: '#7b1fa2',
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

