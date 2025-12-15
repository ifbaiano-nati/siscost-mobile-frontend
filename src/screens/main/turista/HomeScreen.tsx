import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar, // 🚨 NOVO: Importar StatusBar 🚨
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';

// Cor principal
const PRIMARY_COLOR = '#1976d2';
const ALERT_COLOR = '#f44336';
const SUCCESS_COLOR = '#4caf50';
const INFO_ACCENT = '#ff9800';

// Função auxiliar para cor da nota
const getQualityColor = (nota: number) => {
  if (nota >= 4.5) return SUCCESS_COLOR;
  if (nota >= 3.5) return PRIMARY_COLOR;
  if (nota >= 2.5) return '#ff9800';
  return ALERT_COLOR;
};


export default function HomeScreen() {
  const { user } = useAuth();
  const { beaches = [], evaluations = [], loading, refreshData, getBeachById } = useData();
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  // MOCK DE DADOS TURISTA 
  const topBeaches = beaches.slice(0, 3); // Destaque das Praias (Mock)
  const recentEvaluations = evaluations.slice(0, 5); // Feed (Mock)

  const [initialLoad, setInitialLoad] = React.useState(true);

  useEffect(() => {
    if (initialLoad) {
      refreshData().finally(() => {
        setInitialLoad(false);
      });
    }
  }, [refreshData, initialLoad]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const API_URL = 'https://siscost-backend-2i0s.onrender.com';

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${API_URL}/${path}`;
  };

  const myAvaliationsCount = evaluations.filter(
    (item) => item.id_user === user?.id
  ).length;

  return (
    // 🚨 CORREÇÃO DA BARRA DE STATUS 🚨
    // 1. Define a cor do texto da barra de status (para o fundo branco)
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.container}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
          }
        >
          {/* HEADER (Ocupa o espaço da Safe Area) */}
          <View style={[styles.header, styles.headerNoPadding]}>
            <Text style={styles.welcomeText}>Olá, {user?.name}!</Text>
            <Text style={styles.subtitle}>Pronto para avaliar?</Text>
          </View>

          {/* ESTATÍSTICA DE CONTRIBUIÇÃO PESSOAL (Contadores) */}
          <View style={styles.statsContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitleAvaliations}>Sua Atividade no SISCOST</Text>
            </View>
            <View style={styles.statsAvaliationRow}>
              <View style={styles.statCard}>
                <Icon name="star-face" size={32} color={PRIMARY_COLOR} />
                <Text style={styles.statNumber}>{myAvaliationsCount}</Text>
                <Text style={styles.statLabel}>Minhas Avaliações</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="medal" size={32} color={SUCCESS_COLOR} />
                <Text style={styles.statNumber}>4°</Text>
                <Text style={styles.statLabel}>Meu Ranking</Text>
              </View>
            </View>
          </View>

          {/* DESTAQUE DAS PRAIAS DE ALTA AVALIAÇÃO */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Praias em Destaque 🥇</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.highlightScroll}>
              {topBeaches.map((beach) => {
                const imageUrl = getImageUrl(beach.foto_principal_path);

                return (
                  <TouchableOpacity
                    key={beach.id}
                    style={styles.highlightCard}
                    onPress={() => navigation.navigate('Beaches', {
                      screen: 'BeachDetail',
                      params: { beachId: beach.id }
                    })}
                  >
                    {imageUrl ? (
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.highlightImage} // Novo estilo
                        contentFit="cover"
                        transition={300}
                      />
                    ) : (
                      <View style={styles.highlightImagePlaceholder}>
                        <Text style={styles.highlightImageText}>{beach.des_name.charAt(0)}</Text>
                      </View>
                    )}

                    <Text style={styles.highlightName} numberOfLines={1}>{beach.des_name}</Text>
                    <View style={styles.highlightRatingRow}>
                      <Icon name="star" size={14} color={SUCCESS_COLOR} />
                      <Text style={styles.highlightRatingValue}>
                        {beach.nota_qualidade_atual?.toFixed(1) || 'N/A'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* SEÇÃO DE NOTÍCIAS/DICAS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dicas Rápidas</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <Icon name="lightbulb-on-outline" size={24} color={INFO_ACCENT} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Aprenda a Avaliar</Text>
                <Text style={styles.infoDescription}>
                  Sua opinião é valiosa! Saiba quais critérios considerar para uma avaliação completa.
                </Text>
              </View>
              <Icon name="chevron-right" size={24} color="#ccc" />
            </View>
          </View>


          {/* FEED DE ÚLTIMAS AVALIAÇÕES GLOBAIS */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Últimas Avaliações dos Pesquisadores</Text>
            </View>

            {loading ? (
              <ActivityIndicator size="small" color={PRIMARY_COLOR} />
            ) : recentEvaluations.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhuma avaliação recente</Text>
              </View>
            ) : (
              recentEvaluations.map((evaluation) => {
                const beach = getBeachById(evaluation.id_beach);
                const ratingColor = getQualityColor(evaluation.vl_value);

                return (
                  <TouchableOpacity
                    key={evaluation.id}
                    style={styles.evaluationCard}
                    onPress={() => (navigation as any).navigate('Beaches', { screen: 'BeachDetail', params: { beachId: evaluation.id_beach } })}
                  >
                    <View style={styles.evaluationRow}>
                      <Text style={styles.evaluationBeach}>
                        {beach?.des_name || 'Praia desconhecida'}
                      </Text>
                      <View style={styles.ratingContainer}>
                        <Text style={[styles.ratingValue, { color: ratingColor }]}>{evaluation.vl_value.toFixed(1)}</Text>
                        <Icon name="star" size={16} color={ratingColor} style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                    <Text style={styles.evaluationDate}>
                      Avaliado em: {format(new Date(evaluation.created_at), "dd 'de' MMM", { locale: ptBR })}
                    </Text>
                  </TouchableOpacity>
                )
              })
            )}
          </View>

          {/* AÇÕES RÁPIDAS (APENAS VER PRAIAS) */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: PRIMARY_COLOR }]}
              // Navega para a aba 'Beaches' e garante que abra a tela 'BeachesList'
              onPress={() => navigation.navigate('Beaches', { screen: 'BeachesList' })}
            >
              <Text style={styles.actionButtonText}>Ver Todas as Praias</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  // 🚨 CORREÇÃO FINAL: Fundo da Safe Area é branco/fundo do app 🚨
  safeArea: {
    flex: 1,
    backgroundColor: '#fff', // Fundo branco para a barra de status
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5', // Fundo do conteúdo
  },
  // 🚨 NOVO ESTILO: Header Sem o Padding Superior Fixo (SafeAreaView já faz isso)
  header: {
    backgroundColor: PRIMARY_COLOR,
    padding: 20,
    paddingBottom: 30,
    // Garante que o Header Azul comece logo abaixo da barra branca
  },
  headerNoPadding: {
    paddingTop: 20, // Mantemos o padding interno do header, mas não o de status
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
  // Container principal (agora em coluna para empilhar Título e Cartões)
  statsContainer: {
    flexDirection: 'column', // Mudado de 'row' para 'column'
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
  // Estilo para o título que fica no topo do container
  sectionHeaderRow: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  // Nova regra para a linha que segura os dois cards lado a lado
  statsAvaliationRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
  statCard: {
    alignItems: 'center',
    width: '45%',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: PRIMARY_COLOR,
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  // Seções de Conteúdo (Geral)
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleAvaliations: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: PRIMARY_COLOR,
  },
  // Card de Dicas/Notícias
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: INFO_ACCENT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
  },
  infoIconContainer: {
    marginRight: 15,
    backgroundColor: '#fffbe3',
    padding: 8,
    borderRadius: 8,
  },
  infoContent: {
    flex: 1,
    marginRight: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  infoDescription: {
    fontSize: 13,
    color: '#666',
  },
  // Destaques de Praia (Carrossel)
  highlightScroll: {
    paddingVertical: 5,
    paddingRight: 10,
    marginBottom: 10,
  },
  highlightImage: {
    width: 100,              // Largura fixa
    height: 100,             // Altura igual à largura
    borderRadius: 50,       // Metade do valor (80 / 2 = 40)
    marginBottom: 8,
    borderWidth: 2,         // Opcional: borda ao redor
    borderColor: '#1976d2', // Opcional: cor da borda
  },
  highlightCard: {
    width: 140,      // Defina uma largura fixa para os cards do carrossel
    marginRight: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 8,
    // Sombra para o card
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  highlightImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightImageText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  highlightName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  highlightRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  highlightRatingValue: {
    fontSize: 14,
    fontWeight: '600',
    color: SUCCESS_COLOR,
    marginLeft: 5,
  },
  // Feed de Avaliações
  evaluationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  evaluationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
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
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Ações
  actionsContainer: {
    padding: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
  },
});