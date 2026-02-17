import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { TokenStorage } from '../storage/TokenStorage';

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = TokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        // ✅ AJOUT : Log pour debug
        console.log('📤 [HTTP] Requête:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          data: config.data,
          headers: config.headers,
        });
        
        return config;
      },
      (error) => {
        console.error('❌ [HTTP] Erreur requête:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // ✅ AJOUT : Log pour debug
        console.log('📥 [HTTP] Réponse:', {
          status: response.status,
          data: response.data,
        });
        
        return response;
      },
      (error) => {
        console.error('❌ [HTTP] Erreur réponse:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        
        if (error.response?.status === 401) {
          TokenStorage.clear();
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const httpClient = new HttpClient().getClient();
