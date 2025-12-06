import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  TouchableOpacity, // 🚨 NOVO: Para o botão de voltar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../../../contexts/DataContext';
import { api } from '../../../services/api';
import { IBeachEvaluation } from '../../../types/beach';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function EvaluationDetailScreen({ route }: any) {
  const { evaluationId } = route.params;
  const { getMethodologyById, getBeachById, getEvaluationById } = useData();
  const [evaluation, setEvaluation] = useState<IBeachEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [basicEvaluation, setBasicEvaluation] = useState<IBeachEvaluation | null>(null);
  const navigation = useNavigation(); // ✅ OBTÉM NAVEGAÇÃO

  useEffect(() => {
    // Primeiro, tenta buscar do contexto (dados básicos já carregados)
    const basicData = getEvaluationById(evaluationId);
    if (basicData) {
      setBasicEvaluation(basicData);
    }
    // Depois carrega os dados completos da API
    loadEvaluation();
  }, [evaluationId]);

  async function loadEvaluation() {
    setLoading(true);
    try {
      const data = await api.getEvaluationById(evaluationId);
      setEvaluation(data || null);
    } catch (error) {
      console.error('Error loading evaluation:', error);
      // Se falhar, usa os dados básicos do contexto
      if (!evaluation && basicEvaluation) {
        setEvaluation(basicEvaluation);
      }
    } finally {
      setLoading(false);
    }
  }

  // Usa avaliação completa se disponível, senão usa a básica
  const currentEvaluation = evaluation || basicEvaluation;

  if (!currentEvaluation && !loading) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Avaliação não encontrada</Text>
      </View>
    );
  }

  const methodology = currentEvaluation ? getMethodologyById(currentEvaluation.id_metodologie) : null;
  const beach = currentEvaluation ? getBeachById(currentEvaluation.id_beach) : null;

  // Animação shimmer para skeleton
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [loading]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  // Componente Skeleton
  const SkeletonBox = ({ width, height, style }: { width?: number | string; height: number; style?: any }) => (
    <Animated.View style={[styles.skeletonBox, { width: width || '100%', height, opacity }, style]} />
  );

  const SkeletonCard = () => (
    <View style={styles.card}>
      <SkeletonBox width="60%" height={24} style={{ marginBottom: 10 }} />
      <SkeletonBox width="40%" height={16} style={{ marginBottom: 20 }} />
      <SkeletonBox width="100%" height={16} style={{ marginBottom: 10 }} />
      <SkeletonBox width="80%" height={16} style={{ marginBottom: 10 }} />
      <SkeletonBox width="90%" height={16} />
    </View>
  );

  // Função para obter cor baseada na nota
  const getQualityColor = (nota: number) => {
    if (nota >= 4.5) return { bg: '#e8f5e9', text: '#2e7d32', border: '#4caf50' };
    if (nota >= 3.5) return { bg: '#e3f2fd', text: '#1976d2', border: '#2196f3' };
    if (nota >= 2.5) return { bg: '#fff9c4', text: '#f57f17', border: '#ffc107' };
    return { bg: '#ffebee', text: '#c62828', border: '#f44336' };
  };

  const qualityColor = currentEvaluation ? getQualityColor(currentEvaluation.vl_value) : { bg: '#f5f5f5', text: '#666', border: '#ccc' };

  // Funções para processar dados para gráficos
  const processEvaluationData = () => {
    if (!currentEvaluation) return {
      dimensionAverages: [],
      topIndicators: [],
      totalDimensions: 0,
      totalCategories: 0,
      totalIndicators: 0,
      averageValue: 0,
      allIndicators: [],
    };

    const dimensions = currentEvaluation.json_data?.dimensions || [];
    const categories = currentEvaluation.json_data?.categories || [];

    // Coletar todos os indicadores
    const allIndicators: any[] = [];
    dimensions.forEach((dim: any) => {
      if (dim.categories) {
        dim.categories.forEach((cat: any) => {
          if (cat.indicators) {
            allIndicators.push(...cat.indicators.filter((ind: any) => ind.value !== null && ind.value !== undefined));
          }
        });
      }
    });

    // Se não houver dimensões, usar categorias diretamente
    if (allIndicators.length === 0 && categories.length > 0) {
      categories.forEach((cat: any) => {
        if (cat.indicators) {
          allIndicators.push(...cat.indicators.filter((ind: any) => ind.value !== null && ind.value !== undefined));
        }
      });
    }

    // Calcular média por dimensão
    const dimensionAverages: { name: string; value: number; count: number }[] = [];
    dimensions.forEach((dim: any) => {
      const dimIndicators: any[] = [];
      if (dim.categories) {
        dim.categories.forEach((cat: any) => {
          if (cat.indicators) {
            dimIndicators.push(...cat.indicators.filter((ind: any) => ind.value !== null && ind.value !== undefined));
          }
        });
      }
      if (dimIndicators.length > 0) {
        const avg = dimIndicators.reduce((sum, ind) => sum + ind.value, 0) / dimIndicators.length;
        dimensionAverages.push({ name: dim.name, value: avg, count: dimIndicators.length });
      }
    });

    // Top 5 indicadores (maiores valores)
    const topIndicators = [...allIndicators]
      .sort((a, b) => (b.value || 0) - (a.value || 0))
      .slice(0, 5);

    // Estatísticas gerais
    const totalDimensions = dimensions.length;
    const totalCategories = dimensions.reduce((sum: number, dim: any) =>
      sum + (dim.categories?.length || 0), 0) || categories.length;
    const totalIndicators = allIndicators.length;
    const averageValue = allIndicators.length > 0
      ? allIndicators.reduce((sum, ind) => sum + (ind.value || 0), 0) / allIndicators.length
      : (currentEvaluation?.vl_value || 0);

    return {
      dimensionAverages,
      topIndicators,
      totalDimensions,
      totalCategories,
      totalIndicators,
      averageValue,
      allIndicators,
    };
  };

  const chartData = processEvaluationData();

  // Componente de gráfico de barras horizontal
  const HorizontalBarChart = ({ data, maxValue, color }: { data: { name: string; value: number }[], maxValue: number, color: string }) => {
    return (
      <View style={styles.chartContainer}>
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <View key={index} style={styles.barChartItem}>
              <View style={styles.barChartLabelContainer}>
                <Text style={styles.barChartLabel} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.barChartValue}>{item.value.toFixed(1)}</Text>
              </View>
              <View style={styles.barChartBarContainer}>
                <View style={[styles.barChartBar, { width: `${percentage}%`, backgroundColor: color }]} />
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  // Componente de gráfico de distribuição (donut chart simplificado)
  const DistributionChart = ({ data }: { data: { name: string; count: number }[] }) => {
    const total = data.reduce((sum, item) => sum + item.count, 0);
    const colors = ['#7b1fa2', '#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

    return (
      <View style={styles.distributionContainer}>
        <View style={styles.distributionChart}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.count / total) * 100 : 0;
            const color = colors[index % colors.length];
            return (
              <View key={index} style={styles.distributionItem}>
                <View style={styles.distributionLegend}>
                  <View style={[styles.distributionColorDot, { backgroundColor: color }]} />
                  <Text style={styles.distributionLabel} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <View style={styles.distributionBarContainer}>
                  <View style={[styles.distributionBar, { width: `${percentage}%`, backgroundColor: color }]} />
                  <Text style={styles.distributionPercentage}>
                    {item.count} ({percentage.toFixed(0)}%)
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={'#333'} />
        </TouchableOpacity>
        {/* Header com Nota */}
        <View style={[styles.header, { backgroundColor: qualityColor.bg }]}>
          {currentEvaluation ? (
            <>
              <View style={[styles.ratingCircle, { borderColor: qualityColor.border }]}>
                <Text style={[styles.ratingValue, { color: qualityColor.text }]}>
                  {currentEvaluation.vl_value.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.headerTitle}>Avaliação de Qualidade</Text>
              <Text style={styles.headerSubtitle}>
                {format(new Date(currentEvaluation.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </Text>
            </>
          ) : (
            <>
              <SkeletonBox width={100} height={100} style={{ borderRadius: 50, marginBottom: 15 }} />
              <SkeletonBox width="60%" height={24} style={{ marginBottom: 5 }} />
              <SkeletonBox width="40%" height={16} />
            </>
          )}
        </View>

        <View style={styles.content}>
          {/* Estatísticas Resumidas */}
          {loading && !currentEvaluation ? (
            <SkeletonCard />
          ) : chartData.totalIndicators > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Estatísticas da Avaliação</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Icon name="view-grid" size={24} color="#7b1fa2" />
                  <Text style={styles.statValue}>{chartData.totalDimensions}</Text>
                  <Text style={styles.statLabel}>Dimensões</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="layers" size={24} color="#1976d2" />
                  <Text style={styles.statValue}>{chartData.totalCategories}</Text>
                  <Text style={styles.statLabel}>Categorias</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="target" size={24} color="#4caf50" />
                  <Text style={styles.statValue}>{chartData.totalIndicators}</Text>
                  <Text style={styles.statLabel}>Indicadores</Text>
                </View>
                <View style={styles.statItem}>
                  <Icon name="chart-line" size={24} color="#ff9800" />
                  <Text style={styles.statValue}>{chartData.averageValue.toFixed(1)}</Text>
                  <Text style={styles.statLabel}>Média Geral</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Gráfico: Média por Dimensão */}
          {loading && !currentEvaluation ? (
            <SkeletonCard />
          ) : chartData.dimensionAverages.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Média por Dimensão</Text>
              <Text style={styles.cardSubtitle}>
                Distribuição das médias calculadas por dimensão avaliada
              </Text>
              <HorizontalBarChart
                data={chartData.dimensionAverages}
                maxValue={Math.max(5, ...chartData.dimensionAverages.map(d => d.value))}
                color="#7b1fa2"
              />
            </View>
          ) : null}

          {/* Gráfico: Top 5 Indicadores */}
          {loading && !currentEvaluation ? (
            <SkeletonCard />
          ) : chartData.topIndicators.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Top 5 Indicadores</Text>
              <Text style={styles.cardSubtitle}>
                Indicadores com maiores valores avaliados
              </Text>
              <HorizontalBarChart
                data={chartData.topIndicators.map(ind => ({ name: ind.name, value: ind.value || 0 }))}
                maxValue={Math.max(5, ...chartData.topIndicators.map(ind => ind.value || 0))}
                color="#1976d2"
              />
            </View>
          ) : null}

          {/* Gráfico: Distribuição de Indicadores por Dimensão */}
          {loading && !currentEvaluation ? (
            <SkeletonCard />
          ) : chartData.dimensionAverages.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Distribuição de Indicadores</Text>
              <Text style={styles.cardSubtitle}>
                Quantidade de indicadores avaliados por dimensão
              </Text>
              <DistributionChart
                data={chartData.dimensionAverages.map(dim => ({ name: dim.name, count: dim.count }))}
              />
            </View>
          ) : null}

          {/* Informações Principais */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informações da Avaliação</Text>

            {loading && !currentEvaluation ? (
              <>
                <SkeletonBox width="100%" height={16} style={{ marginBottom: 20 }} />
                <SkeletonBox width="80%" height={16} style={{ marginBottom: 20 }} />
                <SkeletonBox width="90%" height={16} style={{ marginBottom: 20 }} />
              </>
            ) : currentEvaluation ? (
              <>
                <View style={styles.infoRow}>
                  <Icon name="account-circle" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Avaliador</Text>
                    <Text style={styles.infoValue}>
                      {currentEvaluation.user?.name || `Usuário #${currentEvaluation.id_user}`}
                    </Text>
                  </View>
                </View>

                {methodology && (
                  <View style={styles.infoRow}>
                    <Icon name="book-open-variant" size={20} color="#666" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Metodologia</Text>
                      <Text style={styles.infoValue}>{methodology.des_name}</Text>
                      {methodology.des_description && (
                        <Text style={styles.infoDescription}>{methodology.des_description}</Text>
                      )}
                    </View>
                  </View>
                )}

                {beach && (
                  <View style={styles.infoRow}>
                    <Icon name="beach" size={20} color="#666" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Praia Avaliada</Text>
                      <Text style={styles.infoValue}>{beach.des_name}</Text>
                      {beach.municipio && (
                        <Text style={styles.infoDescription}>
                          {beach.municipio.des_name}, {beach.municipio.estado?.uf}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.infoRow}>
                  <Icon name="calendar-clock" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Data de Criação</Text>
                    <Text style={styles.infoValue}>
                      {format(new Date(currentEvaluation.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </Text>
                  </View>
                </View>

                {currentEvaluation.updated_at !== currentEvaluation.created_at && (
                  <View style={styles.infoRow}>
                    <Icon name="calendar-edit" size={20} color="#666" />
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Última Atualização</Text>
                      <Text style={styles.infoValue}>
                        {format(new Date(currentEvaluation.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : null}
          </View>

          {/* Dimensões, Categorias e Indicadores */}
          {loading && !currentEvaluation ? (
            <SkeletonCard />
          ) : currentEvaluation?.json_data?.dimensions && currentEvaluation.json_data.dimensions.length > 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Detalhes da Avaliação</Text>
              <Text style={styles.cardSubtitle}>
                {currentEvaluation.json_data.dimensions.length} dimensão(ões) avaliada(s)
              </Text>

              {currentEvaluation.json_data.dimensions.map((dimension: any, dimIdx: number) => (
                <View key={dimension.id || dimIdx} style={styles.dimensionCard}>
                  <View style={styles.dimensionHeader}>
                    <Icon name="view-grid" size={20} color="#7b1fa2" />
                    <Text style={styles.dimensionName}>{dimension.name}</Text>
                  </View>
                  {dimension.description && (
                    <Text style={styles.dimensionDescription}>{dimension.description}</Text>
                  )}

                  {dimension.categories && dimension.categories.length > 0 && (
                    <View style={styles.categoriesContainer}>
                      {dimension.categories.map((category: any, catIdx: number) => (
                        <View key={category.id || catIdx} style={styles.categoryCard}>
                          <View style={styles.categoryHeader}>
                            <Icon name="layers" size={18} color="#1976d2" />
                            <Text style={styles.categoryName}>{category.name}</Text>
                          </View>
                          {category.description && (
                            <Text style={styles.categoryDescription}>{category.description}</Text>
                          )}

                          {category.indicators && category.indicators.length > 0 && (
                            <View style={styles.indicatorsContainer}>
                              {category.indicators.map((indicator: any, indIdx: number) => (
                                <View key={indicator.id || indIdx} style={styles.indicatorRow}>
                                  <View style={styles.indicatorInfo}>
                                    <Icon name="target" size={16} color="#666" />
                                    <Text style={styles.indicatorName}>{indicator.name}</Text>
                                  </View>
                                  {indicator.value !== null && indicator.value !== undefined && (
                                    <View style={styles.indicatorValue}>
                                      <Text style={styles.indicatorValueText}>
                                        {indicator.value.toFixed(1)}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : null}

          {/* Fallback para categorias sem dimensões */}
          {!loading && currentEvaluation && (!currentEvaluation.json_data?.dimensions || currentEvaluation.json_data.dimensions.length === 0) &&
            currentEvaluation.json_data?.categories && currentEvaluation.json_data.categories.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Categorias e Indicadores</Text>
                {currentEvaluation.json_data.categories.map((category: any, catIdx: number) => (
                  <View key={category.id || catIdx} style={styles.categoryCard}>
                    <View style={styles.categoryHeader}>
                      <Icon name="layers" size={18} color="#1976d2" />
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                    {category.description && (
                      <Text style={styles.categoryDescription}>{category.description}</Text>
                    )}
                    {category.indicators && category.indicators.length > 0 && (
                      <View style={styles.indicatorsContainer}>
                        {category.indicators.map((indicator: any, indIdx: number) => (
                          <View key={indicator.id || indIdx} style={styles.indicatorRow}>
                            <View style={styles.indicatorInfo}>
                              <Icon name="target" size={16} color="#666" />
                              <Text style={styles.indicatorName}>{indicator.name}</Text>
                            </View>
                            {indicator.value !== null && indicator.value !== undefined && (
                              <View style={styles.indicatorValue}>
                                <Text style={styles.indicatorValueText}>
                                  {indicator.value.toFixed(1)}
                                </Text>
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  backButton: {
    position: 'absolute',
    top: 15, // Posição abaixo da barra de status
    left: 15,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  header: {
    padding: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  ratingCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  dimensionCard: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7b1fa2',
  },
  dimensionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimensionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginLeft: 8,
  },
  dimensionDescription: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  categoriesContainer: {
    marginTop: 10,
  },
  categoryCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1976d2',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  categoryDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
  },
  indicatorsContainer: {
    marginTop: 8,
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    marginBottom: 6,
  },
  indicatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicatorName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  indicatorValue: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  indicatorValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartContainer: {
    marginTop: 15,
  },
  barChartItem: {
    marginBottom: 15,
  },
  barChartLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  barChartLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  barChartValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    minWidth: 40,
    textAlign: 'right',
  },
  barChartBarContainer: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  barChartBar: {
    height: '100%',
    borderRadius: 12,
  },
  distributionContainer: {
    marginTop: 15,
  },
  distributionChart: {
    marginTop: 10,
  },
  distributionItem: {
    marginBottom: 12,
  },
  distributionLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distributionColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  distributionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  distributionBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distributionBar: {
    height: 20,
    borderRadius: 10,
    marginRight: 10,
    flex: 1,
  },
  distributionPercentage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    minWidth: 60,
    textAlign: 'right',
  },
  skeletonBox: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

