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
import { useData } from '../../contexts/DataContext';
import { IBeachEvaluation } from '../../types/beach.d';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function EvaluationsScreen() {
  const { evaluations, loading, fetchEvaluations, getMethodologyById } = useData();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEvaluations();
    setRefreshing(false);
  };

  const renderEvaluationItem = ({ item }: { item: IBeachEvaluation }) => {
    return (
      <TouchableOpacity style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.evaluatorName}>
            {item.user?.name || `Usuário #${item.id_user}`}
          </Text>
          <Text style={styles.evaluationDate}>
            {format(new Date(item.created_at), "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.methodologyName}>
            {getMethodologyById(item.id_metodologie)?.des_name || 'Sem metodologia'}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Nota: </Text>
            <Text style={styles.ratingValue}>{item.vl_value.toFixed(1)}</Text>
          </View>
        </View>
        {item.json_data && item.json_data.dimensions && item.json_data.dimensions.length > 0 && (
          <View style={styles.dimensionsContainer}>
            <Text style={styles.dimensionsLabel}>
              {item.json_data?.dimensions?.length} dimensão(ões) avaliada(s)
            </Text>
          </View>
        )}
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
    marginBottom: 10,
  },
  evaluatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  evaluationDate: {
    fontSize: 12,
    color: '#666',
  },
  cardBody: {
    marginBottom: 10,
  },
  methodologyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  dimensionsContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  dimensionsLabel: {
    fontSize: 12,
    color: '#999',
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

