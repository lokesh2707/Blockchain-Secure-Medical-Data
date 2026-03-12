import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.client.interceptors.request.use((config) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth endpoints
  login(email: string, password: string, role: string) {
    return this.client.post('/auth/login', { email, password, role });
  }

  register(name: string, email: string, password: string, role: string) {
    return this.client.post('/auth/register', { name, email, password, role });
  }

  // Patient endpoints
  uploadRecord(formData: FormData) {
    return this.client.post('/records/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }

  getPatientRecords() {
    return this.client.get('/records/patient');
  }

  shareRecord(recordId: string, targetId: string, targetRole: string) {
    return this.client.post('/records/share', { recordId, targetId, targetRole });
  }

  revokeRecordAccess(recordId: string, targetId: string) {
    return this.client.post('/records/revoke', { recordId, targetId });
  }

  // Doctor endpoints
  getAccessibleRecords() {
    return this.client.get('/records/access');
  }

  getRecord(recordId: string) {
    return this.client.get(`/records/${recordId}`);
  }

  // Researcher endpoints
  getResearchData() {
    return this.client.get('/ai/research/data');
  }

  downloadResearchMetadata(datasetId: string) {
    return this.client.get(`/ai/research/download/${datasetId}`, {
      responseType: 'blob',
    });
  }

  // Blockchain endpoints
  getBlockchainLedger() {
    return this.client.get('/blockchain/ledger');
  }

  getBlockchainVerification(recordId: string) {
    return this.client.get(`/blockchain/verify/${recordId}`);
  }
}

export const apiClient = new ApiClient();
