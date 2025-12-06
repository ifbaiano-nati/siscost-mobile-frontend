import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform, // Necessário para usar a barra de status de forma robusta
  StatusBar, // Necessário para usar a barra de status de forma robusta
} from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { SafeAreaView } from 'react-native-safe-area-context'; // 🚨 REINTRODUZINDO SAFES AREAS
import { useNavigation } from '@react-navigation/native'; // 🚨 REINTRODUZINDO NAVEGAÇÃO

import { useData } from '../../../contexts/DataContext';
import { IBeach, IBeachEvaluation } from '../../../types/beach.d';

const PRIMARY_COLOR = '#1976d2';
const SUCCESS_COLOR = '#4caf50';
const ALERT_COLOR = '#f44336';

const getQualityColor = (nota: number) => {
  if (nota >= 4.5) return SUCCESS_COLOR;
  if (nota >= 3.5) return PRIMARY_COLOR;
  if (nota >= 2.5) return '#ff9800';
  return ALERT_COLOR;
};

// Calcula a altura da barra de status para uso no posicionamento do botão
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight || 20);

export default function BeachDetailScreen({ route }: any) {
  const { beachId } = route.params;
  const { getBeachById, getEvaluationsByBeachId, getMethodologyById } = useData();
  const navigation = useNavigation(); // ✅ Instancia o hook de navegação
  const [beach, setBeach] = useState<IBeach>({} as IBeach);
  const [loading, setLoading] = useState(true);
  const [beachEvaluations, setBeachEvaluations] = useState<IBeachEvaluation[]>([]);

  const API_URL = 'https://siscost-backend-2i0s.onrender.com';

  const getImageUrl = useCallback((path: string | null | undefined) => {
    if (!path) return null;
    // Usa a constante API_URL para montar o caminho
    return path.startsWith('http') ? path : `${API_URL}/${path}`;
  }, []);
  
  const imageUrl = getImageUrl(beach?.foto_principal_path);

  useEffect(() => {
    loadBeachData();
  }, [beachId]);

  async function loadBeachData() {
    setLoading(true);
    const data = getBeachById(beachId);
    setBeach(data as IBeach | {} as IBeach);

    if (data?.id) {
      const evaluations = getEvaluationsByBeachId(data.id);
      evaluations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setBeachEvaluations(evaluations);
    }

    setLoading(false);
  }

  // Componente de renderização de cada item de avaliação do histórico
  const renderEvaluationCard = ({ item }: { item: IBeachEvaluation }) => {
    const methodology = getMethodologyById(item.id_metodologie);
    const ratingColor = getQualityColor(item.vl_value);

    const evaluatorName = item.user?.name || item.id_user ? `Usuário #${item.id_user}` : 'Avaliador Anônimo';
    const evaluationType = methodology?.des_name ? 'Metodológica' : 'Percepção';

    return (
      <View style={styles.evaluationCard}>
        <View style={styles.evaluationHeaderRow}>

          <View style={styles.evaluationMeta}>
            <Text style={styles.evaluatorName}>
              {item.user?.name}
            </Text>
            <Text style={styles.evaluationDate}>
              Avaliado em {format(new Date(item.created_at), 'dd/MM/yyyy')}
            </Text>
          </View>

          <View style={[styles.evaluationScore, { borderColor: ratingColor }]}>
            <Text style={[styles.evaluationScoreText, { color: ratingColor }]}>
              {item.vl_value.toFixed(1)}
            </Text>
          </View>

        </View>

        {item.ds_comment && (
          <Text style={styles.evaluationComment} numberOfLines={2}>
            "{item.ds_comment}"
          </Text>
        )}

        <Text style={[styles.evaluationMethodologyTag, { color: ratingColor }]}>
          Tipo: {evaluationType}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!beach || !beach.id) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Praia não encontrada</Text>
      </View>
    );
  }


  return (
    // 🚨 1. SafeAreaView com fundo cinza claro para evitar sobreposição 🚨
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      <ScrollView style={styles.container}>
        {/* 🚨 BOTÃO DE VOLTAR FLUTUANTE 🚨 
               Posicionado abaixo da barra de status usando o padding do SafeAreaView
            */}
        <TouchableOpacity
          style={[styles.backButton, { top: STATUS_BAR_HEIGHT + 10 }]} // Ajuste o 'top'
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color={'#333'} />
        </TouchableOpacity>

        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
            priority="high"
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>Sem imagem</Text>
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>{beach.des_name}</Text>
          <Text style={styles.location}>
            {beach.municipio?.des_name}, {beach.municipio?.estado?.uf}
          </Text>

          {/* Descrição */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>{beach.des_description}</Text>
          </View>

          {/* Grid de Informações Chave */}
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo de Praia</Text>
              <Text style={styles.infoValue}>{beach.beach_type?.des_name}</Text>
            </View>

            {beach.nota_qualidade_atual !== null && (
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nota de Qualidade</Text>
                <Text style={styles.infoValue}>{beach.nota_qualidade_atual.toFixed(1)}</Text>
              </View>
            )}

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status de Monitoramento</Text>
              <Text style={styles.infoValue}>{beach.status_monitoramento}</Text>
            </View>

            {/* Botão de Avaliar para o Turista (Adicionado) */}
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Sua Contribuição</Text>
              <TouchableOpacity style={styles.reviewButton}>
                <Text style={styles.reviewButtonText}>+ Avaliar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* HISTÓRICO DE AVALIAÇÕES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Histórico de Avaliações ({beachEvaluations.length})
            </Text>
            {beachEvaluations.length > 0 ? (
              <FlatList
                data={beachEvaluations}
                renderItem={renderEvaluationCard}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            ) : (
              <Text style={styles.emptyHistoryText}>Seja o primeiro a avaliar esta praia!</Text>
            )}
          </View>

          {/* Cadastrado por (Mantido do original) */}
          {beach.cadastrador && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cadastrado por</Text>
              <Text style={styles.description}>{beach.cadastrador.name}</Text>
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
  // 🚨 NOVO ESTILO: Botão de Voltar 🚨
  backButton: {
    position: 'absolute',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  image: {
    width: '100%',
    height: 300,
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoItem: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  reviewButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  reviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // ESTILOS DE HISTÓRICO DE AVALIAÇÃO
  evaluationCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
  },
  evaluationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 8,
    paddingBottom: 5,
  },
  evaluationScore: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 15,
  },
  evaluationScoreText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  evaluationMeta: {
    flex: 1,
  },
  evaluatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  evaluationDate: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  evaluationComment: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    marginTop: 5,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f0f0f0',
    paddingLeft: 10,
  },
  evaluationMethodologyTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
    backgroundColor: '#e3f2fd',
    marginLeft: 10,
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});