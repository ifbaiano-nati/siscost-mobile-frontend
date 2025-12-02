import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useData } from '../../contexts/DataContext';
import { useNavigation } from '@react-navigation/native';

export default function BeachesScreen() {
  const { beaches, loading, fetchBeaches, getBeachTypeById } = useData();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredBeaches = beaches.filter((beach) => {
    return beach.des_name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBeaches();
    setRefreshing(false);
  };


  const getImageUrl = useCallback((path: string | null | undefined) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${process.env.EXPO_PUBLIC_API_URL}/${path}`;
  }, []);

  const renderBeachItem = useCallback(({ item }: { item: any }) => {
    const imageUrl = getImageUrl(item.foto_principal_path);
    
    return (
      <TouchableOpacity
        style={styles.beachCard}
        onPress={() => {
          (navigation as any).navigate('BeachDetail', { beachId: item.id });
        }}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.beachImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            placeholderContentFit="cover"
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
            recyclingKey={item.id.toString()}
          />
        ) : (
          <View style={[styles.beachImage, styles.placeholderImage]}>
            <Text style={styles.placeholderText}>Sem imagem</Text>
          </View>
        )}
      <View style={styles.beachInfo}>
        <Text style={styles.beachName}>{item.des_name}</Text>
        <Text style={styles.beachLocation}>
          {item.municipio?.des_name}, {item.municipio?.estado?.uf}
        </Text>
        <Text style={styles.beachType}>{getBeachTypeById(item.id_beach_type)?.des_name}</Text>
        {item.nota_qualidade_atual !== null && (
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Nota: </Text>
            <Text style={styles.ratingValue}>
              {item.nota_qualidade_atual.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
    );
  }, [navigation, getImageUrl]);

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar praias..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
        </View>
      ) : (
        <FlatList
          data={filteredBeaches}
          renderItem={renderBeachItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhuma praia encontrada' : 'Nenhuma praia cadastrada'}
              </Text>
            </View>
          }
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={(data, index) => ({
            length: (200 + 15), // altura da imagem + padding
            offset: (200 + 15) * index,
            index,
          })}
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
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#fff',
    color: '#000',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContent: {
    padding: 15,
  },
  beachCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  beachImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
  beachInfo: {
    padding: 15,
  },
  beachName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  beachLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  beachType: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
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

