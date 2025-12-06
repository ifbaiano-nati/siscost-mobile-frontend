import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IBeach, IBeachEvaluation, IBeachType, IMethodology } from '@/types/beach';

// URL da API - garantindo que o APK sempre use esta URL
//const API_URL = 'https://siscost-backend-2i0s.onrender.com/';
//const API_URL = 'http://192.168.56.1:8000/';
const API_URL = 'http://10.0.2.2:8000/';


interface IGetBeachesResponse {
  message: string;
  data: IBeach[];
}

interface IMetricsResponse {
  total_praias: number;
  total_avaliacoes: number;
  total_metodologias: number;
  avaliacoes_recentes: {
    id_avaliacao: number;
    data_avaliacao: string;
    nome_praia: string;
    nota: number;
    avaliador_nome: string;
    // O tipo de perfil é a string literal retornada pelo backend
    tipo_perfil: 'TURISTA' | 'PESQUISADOR' | 'Sociedade Civil' | 'ONG' | 'Gestor_Publico';
  }[];
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Interceptor para adicionar token
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('@siscost:token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor para tratar erros
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token inválido, limpar storage e redirecionar para login
          await AsyncStorage.multiRemove(['@siscost:token', '@siscost:user']);
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/api/login', { email, password });
    const { user, token } = response.data;

    // Salvar token e usuário
    await AsyncStorage.setItem('@siscost:token', token);
    await AsyncStorage.setItem('@siscost:user', JSON.stringify(user));

    return { user, token };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    profile_id: number;
  }) {
    const response = await this.api.post('/api/register', data);
    return response.data;
  }

  async getMe() {
    const response = await this.api.get('/api/me');
    return response.data.user;
  }

  async forgotPassword(email: string) {
    const response = await this.api.post('/api/forgot-password', { email });
    return response.data;
  }

  async resetPassword(data: {
    password: string;
    password_confirmation: string;
    token: string;
  }) {
    const response = await this.api.post('/api/reset-password', data);
    return response.data;
  }

  // Beach endpoints
  async getBeaches(): Promise<IBeach[]> {
    try {
      const response = await this.api.get('/api/beaches');
      return response.data.data;
    } catch (error) {
      console.error('Error in getBeaches:', error);
      return [];
    }
  }


  async getBeachById(id: number) {
    try {
      const response = await this.api.get(`/api/beaches/${id}`);
      return response.data?.data || response.data || null;
    } catch (error: any) {
      console.error('Error in getBeachById:', error);
      return null;
    }
  }

  async createBeach(data: any) {
    const response = await this.api.post('/api/beaches', data);
    return response.data?.data || response.data;
  }

  // Beach Types endpoints
  async getBeachTypes(): Promise<IBeachType[]> {
    try {
      const response = await this.api.get('/api/beach-types');
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch {
      return [];
    }
  }


  // Methodology endpoints
  async getMethodologies(): Promise<IMethodology[]> {
    try {
      const response = await this.api.get('/api/methodologies');
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch {
      return [];
    }
  }


  async getMethodologyById(id: number) {
    try {
      const response = await this.api.get(`/api/methodologies/${id}`);
      return response.data?.data || response.data || null;
    } catch (error: any) {
      console.error('Error in getMethodologyById:', error);
      return null;
    }
  }

  // Evaluation endpoints
  async getEvaluations(): Promise<IBeachEvaluation[]> {
    try {
      const response = await this.api.get('/api/evaluations');
      return Array.isArray(response.data) ? response.data : (response.data.data || []);
    } catch {
      return [];
    }
  }

  async getEvaluationById(id: number) {
    try {
      const response = await this.api.get(`/api/beach-avaliation/${id}/complete`);
      return response.data?.data || response.data || null;
    } catch (error: any) {
      console.error('Error in getEvaluationById:', error);
      return null;
    }
  }

  async createEvaluation(data: any) {
    const response = await this.api.post('/api/evaluations', data);
    return response.data;
  }

  // Profile endpoints
  async getProfiles() {
    const response = await this.api.get('/api/profiles');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put('/api/profile', data);
    return response.data;
  }
  async getPesquisadorMetrics(): Promise<IMetricsResponse> {
    const response = await this.api.get('/api/pesquisador/metricas_dashboard');
    return response.data;
  }
}

export const api = new ApiService();

