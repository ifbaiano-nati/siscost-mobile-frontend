import * as FileSystem from 'expo-file-system';
import { Image } from 'expo-image';

/**
 * Utilitário para gerenciar cache de imagens
 */
export class ImageCacheManager {
  /**
   * Limpa o cache de imagens
   */
  static async clearCache(): Promise<void> {
    try {
      // Limpa o cache do expo-image
      await Image.clearMemoryCache();
      await Image.clearDiskCache();
    } catch (error) {
      console.error('Erro ao limpar cache de imagens:', error);
    }
  }

  /**
   * Obtém o tamanho do cache em MB
   */
  static async getCacheSize(): Promise<number> {
    try {
      const cacheDir = FileSystem.cacheDirectory + 'ImageCache';
      const info = await FileSystem.getInfoAsync(cacheDir);
      if (info.exists && info.isDirectory) {
        // Aqui você pode implementar uma lógica para calcular o tamanho
        // Por enquanto retorna 0
        return 0;
      }
      return 0;
    } catch (error) {
      console.error('Erro ao obter tamanho do cache:', error);
      return 0;
    }
  }

  /**
   * Pré-carrega uma imagem no cache
   */
  static async preloadImage(uri: string): Promise<void> {
    try {
      await Image.prefetch(uri, {
        cachePolicy: 'memory-disk',
      });
    } catch (error) {
      console.error('Erro ao pré-carregar imagem:', error);
    }
  }

  /**
   * Pré-carrega múltiplas imagens
   */
  static async preloadImages(uris: string[]): Promise<void> {
    try {
      await Promise.all(uris.map(uri => this.preloadImage(uri)));
    } catch (error) {
      console.error('Erro ao pré-carregar imagens:', error);
    }
  }
}

