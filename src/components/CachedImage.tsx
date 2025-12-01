import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image, ImageProps } from 'expo-image';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
  placeholder?: string;
  fallback?: string;
}

export default function CachedImage({
  uri,
  placeholder,
  fallback,
  style,
  ...props
}: CachedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // URL completa da imagem
  const imageUrl = uri?.startsWith('http') ? uri : `${process.env.EXPO_PUBLIC_API_URL}/${uri}`;

  // Placeholder padrão usando blurhash
  const defaultPlaceholder = placeholder || { blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' };

  return (
    <View style={[styles.container, style]}>
      <Image
        source={{ uri: imageUrl }}
        style={[StyleSheet.absoluteFill, style]}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
        placeholder={defaultPlaceholder}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => {
          setIsLoading(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        {...props}
      />
      
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
          <ActivityIndicator size="small" color="#1976d2" />
        </View>
      )}
      
      {hasError && (
        <View style={[StyleSheet.absoluteFill, styles.errorContainer]}>
          <Text style={styles.errorText}>Erro ao carregar imagem</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#999',
    fontSize: 14,
  },
});

