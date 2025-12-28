// API Servisi - Flask Backend Bağlantısı
// Komuta merkezi backend'ine bağlanır

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// KONFİGÜRASYON
// ============================================================================

// Backend API URL'i (Geliştirme ortamında değiştirin)
const API_CONFIG = {
    // Localhost için Android emülatörde 10.0.2.2, iOS simülatörde localhost
    // Gerçek cihazda bilgisayarın IP adresini kullanın
    BASE_URL: __DEV__
        ? 'http://10.0.2.2:5000/api'  // Android emülatör
        : 'https://your-production-api.com/api', // Production

    TIMEOUT: 30000,
};

// Token storage key
const TOKEN_KEY = '@hasar_tespit_token';

// ============================================================================
// TİPLER
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface LoginResponse {
    token: string;
    user: {
        teamId: number;
        teamCode: string;
        teamName: string;
        memberId: number;
        memberName: string;
        role: string;
    };
}

export interface Team {
    id: number;
    team_code: string;
    name: string;
    status: string;
    current_latitude: number | null;
    current_longitude: number | null;
    created_at: string;
}

export interface TeamMember {
    id: number;
    team_id: number;
    name: string;
    role: string;
}

export interface Damage {
    id: string;
    team_id: number;
    reported_by: number;
    latitude: number;
    longitude: number;
    damage_type: string;
    severity: string;
    description: string;
    image_url?: string;
    confidence: number;
    road_name?: string;
    status: string;
    created_at: string;
}

export interface Prediction {
    id: string;
    filename: string;
    predicted_label: string;
    confidence: number;
    probabilities: string;
    exif_lat: number | null;
    exif_lng: number | null;
    created_at: string;
}

// ============================================================================
// API SERVİS SINIFI
// ============================================================================

class ApiService {
    private baseUrl: string;
    private token: string | null = null;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
        this.loadToken();
    }

    // ==================== TOKEN YÖNETİMİ ====================

    private async loadToken(): Promise<void> {
        try {
            this.token = await AsyncStorage.getItem(TOKEN_KEY);
        } catch (error) {
            console.error('Token yükleme hatası:', error);
        }
    }

    async setToken(token: string): Promise<void> {
        this.token = token;
        await AsyncStorage.setItem(TOKEN_KEY, token);
    }

    async clearToken(): Promise<void> {
        this.token = null;
        await AsyncStorage.removeItem(TOKEN_KEY);
    }

    getToken(): string | null {
        return this.token;
    }

    // ==================== BASE REQUEST ====================

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        try {
            const url = `${this.baseUrl}${endpoint}`;

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Token varsa ekle
            if (this.token) {
                headers['Authorization'] = `Bearer ${this.token}`;
            }

            const response = await fetch(url, {
                ...options,
                headers: {
                    ...headers,
                    ...(options.headers as Record<string, string>),
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    success: false,
                    error: data.error || data.message || `HTTP ${response.status}`,
                };
            }

            return {
                success: true,
                data: data.data || data,
                message: data.message,
            };
        } catch (error) {
            console.error('API isteği hatası:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Bağlantı hatası',
            };
        }
    }

    // ==================== AUTH ====================

    /**
     * Ekip kodu ve üye numarası ile giriş yap
     */
    async login(teamCode: string, memberId: number): Promise<ApiResponse<LoginResponse>> {
        const response = await this.request<LoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ team_code: teamCode, member_id: memberId }),
        });

        if (response.success && response.data?.token) {
            await this.setToken(response.data.token);
        }

        return response;
    }

    /**
     * Çıkış yap
     */
    async logout(): Promise<void> {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch {
            // Ignore errors
        }
        await this.clearToken();
    }

    /**
     * Aktif kullanıcı bilgisini getir
     */
    async getMe(): Promise<ApiResponse<LoginResponse['user']>> {
        return this.request('/auth/me');
    }

    // ==================== TEAMS ====================

    /**
     * Ekip koduna göre ekip bilgisi getir
     */
    async getTeamByCode(teamCode: string): Promise<ApiResponse<Team>> {
        return this.request(`/teams/by-code/${teamCode}`);
    }

    /**
     * Ekip üyelerini getir
     */
    async getTeamMembers(teamId: number): Promise<ApiResponse<TeamMember[]>> {
        return this.request(`/teams/${teamId}/members`);
    }

    /**
     * Ekip konumunu güncelle
     */
    async updateTeamLocation(
        teamId: number,
        latitude: number,
        longitude: number
    ): Promise<ApiResponse<void>> {
        return this.request(`/teams/${teamId}/location`, {
            method: 'PUT',
            body: JSON.stringify({ latitude, longitude }),
        });
    }

    // ==================== DAMAGES ====================

    /**
     * Tüm hasarları getir (filtreli)
     */
    async getDamages(filters?: {
        severity?: string;
        damage_type?: string;
        status?: string;
        limit?: number;
    }): Promise<ApiResponse<Damage[]>> {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined) {
                    params.append(key, String(value));
                }
            });
        }
        return this.request(`/damages?${params}`);
    }

    /**
     * Yeni hasar bildir
     */
    async reportDamage(damage: {
        latitude: number;
        longitude: number;
        damage_type: string;
        severity: string;
        description: string;
        image_url?: string;
        road_name?: string;
    }): Promise<ApiResponse<Damage>> {
        return this.request('/damages', {
            method: 'POST',
            body: JSON.stringify(damage),
        });
    }

    /**
     * Hasar durumunu güncelle
     */
    async updateDamageStatus(
        damageId: string,
        status: string
    ): Promise<ApiResponse<Damage>> {
        return this.request(`/damages/${damageId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    /**
     * Hasar istatistikleri
     */
    async getDamageStatistics(): Promise<ApiResponse<{
        total: number;
        today: number;
        severe: number;
        moderate: number;
        none: number;
    }>> {
        return this.request('/damages/statistics');
    }

    // ==================== PREDICTIONS ====================

    /**
     * AI tahminlerini getir
     */
    async getPredictions(): Promise<ApiResponse<Prediction[]>> {
        return this.request('/predictions');
    }

    /**
     * Görüntü analizi yap
     */
    async analyzeImage(
        imageBase64: string,
        location?: { latitude: number; longitude: number }
    ): Promise<ApiResponse<{
        predicted_label: string;
        confidence: number;
        probabilities: Array<{ label: string; score: number }>;
    }>> {
        return this.request('/predictions/analyze', {
            method: 'POST',
            body: JSON.stringify({
                image: imageBase64,
                location,
            }),
        });
    }

    // ==================== BAĞLANTI TESTİ ====================

    /**
     * Backend bağlantısını test et
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000),
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * API URL'ini değiştir (dinamik sunucu seçimi için)
     */
    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    getBaseUrl(): string {
        return this.baseUrl;
    }
}

// Singleton instance
export const apiService = new ApiService();

// ============================================================================
// OFFLINE/FALLBACK MODU
// ============================================================================

// API erişilemezse yerel veritabanını kullan
export const USE_LOCAL_DB = true; // API hazır olunca false yapın
