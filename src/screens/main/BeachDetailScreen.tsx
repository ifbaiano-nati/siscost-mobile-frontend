import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useData } from '../../contexts/DataContext';
import { IBeach } from '../../types/beach.d';

export default function BeachDetailScreen({ route }: any) {
  const { beachId } = route.params;
  const { getBeachById } = useData();
  const [beach, setBeach] = useState<IBeach>({} as IBeach);
  const [loading, setLoading] = useState(true);

  const getImageUrl = useCallback((path: string | null | undefined) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${process.env.EXPO_PUBLIC_API_URL}/${path}`;
  }, []);

  const imageUrl = getImageUrl(beach?.foto_principal_path);

  useEffect(() => {
    loadBeach();
  }, [beachId]);

  async function loadBeach() {
    setLoading(true);
    const data = getBeachById(beachId);
    setBeach(data as IBeach | {} as IBeach);
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!beach) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Praia não encontrada</Text>
      </View>
    );
  }


  return (
    <ScrollView style={styles.container}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          cachePolicy="memory-disk"
          placeholderContentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{beach.des_description}</Text>
        </View>

        {beach.descricao_socioambiental && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição Socioambiental</Text>
            <Text style={styles.description}>{beach.descricao_socioambiental}</Text>
          </View>
        )}

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
        </View>

        {beach.cadastrador && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cadastrado por</Text>
            <Text style={styles.description}>{beach.cadastrador.name}</Text>
          </View>
        )}
      </View>
    </ScrollView>
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
    color: '#1976d2',
  },
});

