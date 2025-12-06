// /src/screens/main/pesquisador/DashboardScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { useAuth } from '../../../contexts/AuthContext'; 
import { usePesquisadorData } from '../../../contexts/PesquisadorContext'; 
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// --- TIPAGEM COMPLETA ---
// Nota: Essas interfaces DEVEM ser importadas de um arquivo de tipos real (e.g., ../types/metrics)
// Aqui elas são definidas localmente para que o código seja copiado e colado em um só lugar.
interface IEvaluationResumo {
  id_avaliacao: number;
  data_avaliacao: string;
  nome_praia: string;
  nota: number;
  avaliador_nome: string;
  tipo_perfil: 'TURISTA' | 'PESQUISADOR';
}

interface IDashboardMetrics {
  total_praias: number;
  total_avaliacoes: number;
  total_metodologias: number;
  avaliacoes_recentes: IEvaluationResumo[];
}

// Cor principal do APP (Azul)
const PRIMARY_COLOR = '#1976d2'; 
const SECONDARY_COLOR = '#4caf50'; // Verde para Avaliações/Controle
const PESQUISADOR_PROFILE_COLOR = '#4caf50'; // Verde para o badge de Pesquisador

// --- FUNÇÃO DE UTILIDADE PARA AVATAR ---
const getAvaliadorAvatarLetter = (name: string) => name.charAt(0).toUpperCase();

export default function DashboardScreen() {
  const { user } = useAuth();
  const { metrics, loading, refreshMetrics } = usePesquisadorData(); 
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!metrics) refreshMetrics();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMetrics();
    setRefreshing(false);
  }, [refreshMetrics]);

  const goToEvaluations = () => {
    (navigation as any).navigate('Evaluations'); 
  };

  const goToNewEvaluation = () => {
    (navigation as any).navigate('NovaAvaliacaoMetodologica' as never); 
  };
  
  const goToMethodologies = () => {
    (navigation as any).navigate('Methodologies');
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
      }
    >
      <SafeAreaView style={styles.safeArea}>
      
        {/* 3. Header Personalizado (Azul) - Começa logo abaixo da barra de status */}
        <View style={[styles.header, { backgroundColor: PRIMARY_COLOR }]}>
          <Text style={styles.headerTitle}>Painel de Controle</Text>
          <Text style={styles.headerSubtitle}>Bem-vindo, {user?.name}!</Text>
        </View>

        {/* Cartão de Métricas */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Contadores de Métricas</Text>
          
          <View style={styles.statsGrid}>
            {/* Total Praias */}
            <View style={styles.statItem}>
              <Icon name="beach" size={24} color={PRIMARY_COLOR} />
              <Text style={styles.statValue}>{metrics?.total_praias || 0}</Text>
              <Text style={styles.statLabel}>Total Praias</Text>
            </View>
            
            {/* Total Avaliações */}
            <View style={styles.statItem}>
              <Icon name="clipboard-list" size={24} color={SECONDARY_COLOR} />
              <Text style={styles.statValue}>{metrics?.total_avaliacoes || 0}</Text>
              <Text style={styles.statLabel}>Total Avaliações</Text>
            </View>
            
            {/* Metodologias (Tipos de Praia) */}
            <View style={styles.statItem}>
              <Icon name="book-open-variant" size={24} color="#ff9800" />
              <Text style={styles.statValue}>{metrics?.total_metodologias || 0}</Text>
              <Text style={styles.statLabel}>Metodologias</Text>
            </View>
          </View>
        </View>
        
        {/* Acesso Rápido a Funções Chave */}
        <View style={styles.cardSection}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          {/* Nova Avaliação */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={goToNewEvaluation}
          >
            <Icon name="plus-circle-outline" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Nova Avaliação Metodológica</Text>
          </TouchableOpacity>
          
          {/* Ver Metodologias */}
          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={goToMethodologies}
          >
            <Icon name="book-search-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.actionButtonTextSecondary}>Ver Metodologias</Text>
          </TouchableOpacity>
        </View>


        {/* Feed de Últimas Avaliações */}
        <View style={styles.cardSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Feed de Avaliações Recentes</Text>
            <TouchableOpacity onPress={goToEvaluations}>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {metrics?.avaliacoes_recentes?.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma avaliação recente</Text>
            </View>
          ) : (
            metrics?.avaliacoes_recentes?.map((evaluation) => (
              <TouchableOpacity
                key={evaluation.id_avaliacao}
                style={styles.evaluationCard}
                onPress={() => (navigation as any).navigate('Evaluations', { screen: 'EvaluationDetail', params: { evaluationId: evaluation.id_avaliacao } })}
              >
                <View style={styles.cardContent}>
                    
                    {/* 1. IMAGEM/AVATAR DO AVALIADOR */}
                    <View style={[styles.avatarContainer, { backgroundColor: evaluation.tipo_perfil === 'PESQUISADOR' ? PESQUISADOR_PROFILE_COLOR : PRIMARY_COLOR }]}>
                        <Text style={styles.avatarText}>
                            {getAvaliadorAvatarLetter(evaluation.avaliador_nome)}
                        </Text>
                    </View>

                    {/* 2. INFORMAÇÕES DA AVALIAÇÃO */}
                    <View style={styles.evaluationInfo}>
                        
                        {/* Linha do Avaliador e Tipo de Perfil */}
                        <View style={styles.evaluatorRow}>
                            <Text style={styles.evaluatorName}>{evaluation.avaliador_nome}</Text>
                            <View style={styles.profileBadge}>
                                <Text style={[styles.profileBadgeText, {color: evaluation.tipo_perfil === 'PESQUISADOR' ? PESQUISADOR_PROFILE_COLOR : PRIMARY_COLOR}]}>
                                    {evaluation.tipo_perfil === 'PESQUISADOR' ? 'PESQUISADOR' : 'TURISTA'}
                                </Text>
                            </View>
                        </View>

                        {/* Linha da Praia e Nota */}
                        <View style={styles.beachRow}>
                            <Text style={styles.evaluationBeach}>{evaluation.nome_praia}</Text>
                            <View style={styles.ratingContainer}>
                                <Text style={styles.ratingText}>Nota: </Text>
                                <Text style={styles.ratingValue}>{evaluation.nota.toFixed(1)}</Text>
                            </View>
                        </View>
                        
                        {/* Data */}
                        <Text style={styles.evaluationDate}>
                            Avaliado em: {format(new Date(evaluation.data_avaliacao), "dd/MM/yyyy", { locale: ptBR })}
                        </Text>
                    </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
        
      </SafeAreaView>
    </ScrollView>
  );
}

// -------------------------------------------------------------------------------------
// ESTILOS REVISADOS
// -------------------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 20,
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
  cardSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
  },
  
  // STATS GRID
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    width: '33%', 
    padding: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },

  // AÇÕES RÁPIDAS
  actionButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextSecondary: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },

  // CARDS DE AVALIAÇÃO (FEED)
  evaluationCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // 🚨 NOVO ESTILO: AVATAR DA AVALIAÇÃO 🚨
  avatarContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  
  evaluationInfo: {
    flex: 1,
  },
  
  // Linha 1: Avaliador e Perfil
  evaluatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  evaluatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  profileBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#e3f2fd', // Fundo claro para o badge
  },
  profileBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    // A cor é definida inline para usar PRIMARY_COLOR ou PESQUISADOR_PROFILE_COLOR
  },
  
  // Linha 2: Praia e Nota
  beachRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  evaluationBeach: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  
  // Data (abaixo de tudo)
  evaluationDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  // Rodapé (Nota)
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
    color: PRIMARY_COLOR,
  },

  // Estilos de fallback (manter para evitar conflitos com a antiga estrutura)
  evaluationHeader: { display: 'none' }, 
  evaluationFooter: { display: 'none' },
  evaluationMethodology: { display: 'none' },
});