import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function HomeScreen() {
  const { user } = useAuth();
  const { beaches, evaluations, loading, refreshData, fetchBeaches, fetchEvaluations, getBeachById, getMethodologyById} = useData();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchBeaches();
    fetchEvaluations();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, []);

  const recentEvaluations = evaluations?.length > 0 ? evaluations.slice(0, 5) : [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bem-vindo, {user?.name}!</Text>
        <Text style={styles.subtitle}>Sistemas de Avaliação de Ativos Costeiros</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{beaches?.length || 0}</Text>
          <Text style={styles.statLabel}>Praias</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{evaluations?.length || 0}</Text>
          <Text style={styles.statLabel}>Avaliações</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Avaliações Recentes</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Evaluations' as never)}
          >
            <Text style={styles.seeAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#1976d2" />
        ) : recentEvaluations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma avaliação encontrada</Text>
          </View>
        ) : (
          recentEvaluations.map((evaluation) => {
            return (
            <TouchableOpacity
              key={evaluation.id}
              style={styles.evaluationCard}
            >
              <View style={styles.evaluationHeader}>
                <Text style={styles.evaluationBeach}>
                  {getBeachById(evaluation.id_beach)?.des_name || 'Praia desconhecida'}
                </Text>
                <Text style={styles.evaluationDate}>
                  {format(new Date(evaluation.created_at), "dd 'de' MMMM, yyyy", {
                    locale: ptBR,
                  })}
                </Text>
              </View>
              <View style={styles.evaluationFooter}>
                <Text style={styles.evaluationMethodology}>
                  {getMethodologyById(evaluation.id_metodologie)?.des_name || 'Sem metodologia'}
                </Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingText}>Nota: </Text>
                  <Text style={styles.ratingValue}>{evaluation.vl_value.toFixed(1)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )})
        )}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Beaches' as never)}
        >
          <Text style={styles.actionButtonText}>Ver Praias</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => navigation.navigate('Evaluations' as never)}
        >
          <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
            Nova Avaliação
          </Text>
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
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#e3f2fd',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCard: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginTop: 20,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#1976d2',
  },
  evaluationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  evaluationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  evaluationBeach: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  evaluationDate: {
    fontSize: 12,
    color: '#666',
  },
  evaluationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evaluationMethodology: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    padding: 20,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#1976d2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1976d2',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: '#1976d2',
  },
});

