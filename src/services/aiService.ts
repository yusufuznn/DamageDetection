// AI Model Entegrasyon Servisi
// Bu dosya gerçek AI modelinizi uygulamaya entegre etmek için hazırlanmıştır.

import { RoadDamage, DamageStatistics, DamageHeatZone } from '../types/DamageTypes';
import * as FileSystem from 'expo-file-system';

// ============================================================================
// API KONFIGÜRASYONU
// Gerçek backend URL'nizi buraya ekleyin
// ============================================================================
const API_CONFIG = {
    // Örnek: 'https://your-api-server.com/api/v1'
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',

    // API endpoint'leri
    ENDPOINTS: {
        ANALYZE_IMAGE: '/analyze',
        GET_DAMAGES: '/damages',
        GET_STATISTICS: '/statistics',
        GET_HEAT_ZONES: '/heat-zones',
    },

    // İstek timeout süresi (ms)
    TIMEOUT: 30000,
};

// ============================================================================
// AI MODEL YANIT TİPLERİ
// ============================================================================
export interface AIModelPrediction {
    damageType: 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage';
    severity: 'none' | 'moderate' | 'severe';
    confidence: number; // 0-100 arası
    boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface ImageAnalysisResult {
    success: boolean;
    predictions: AIModelPrediction[];
    processingTime: number; // ms cinsinden
    imageId: string;
    error?: string;
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ============================================================================
// AI SERVİS SINIFI
// ============================================================================
class AIService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_CONFIG.BASE_URL;
    }

    /**
     * API URL'ini değiştirmek için kullanılır
     */
    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    /**
     * Görüntüyü AI modeline gönderir ve analiz sonucunu alır
     * @param imageUri - Analiz edilecek görüntünün yerel URI'si
     * @param location - Görüntünün çekildiği konum (opsiyonel)
     */
    async analyzeImage(
        imageUri: string,
        location?: { latitude: number; longitude: number }
    ): Promise<ImageAnalysisResult> {
        try {
            // Görüntüyü base64'e çevir
            const base64Image = await FileSystem.readAsStringAsync(imageUri, {
                encoding: 'base64',
            });

            const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.ANALYZE_IMAGE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    location: location,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result as ImageAnalysisResult;
        } catch (error) {
            console.error('Görüntü analizi hatası:', error);
            return {
                success: false,
                predictions: [],
                processingTime: 0,
                imageId: '',
                error: error instanceof Error ? error.message : 'Bilinmeyen hata',
            };
        }
    }

    /**
     * Sunucudan tüm hasar verilerini çeker
     * @param filters - Opsiyonel filtreler (severity, damageType, dateRange vb.)
     */
    async getDamages(filters?: {
        severity?: 'none' | 'moderate' | 'severe';
        damageType?: string;
        startDate?: string;
        endDate?: string;
        limit?: number;
    }): Promise<APIResponse<RoadDamage[]>> {
        try {
            const queryParams = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, String(value));
                    }
                });
            }

            const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_DAMAGES}?${queryParams}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data: data.damages };
        } catch (error) {
            console.error('Hasar verileri çekme hatası:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Bilinmeyen hata',
            };
        }
    }

    /**
     * Sunucudan istatistik verilerini çeker
     */
    async getStatistics(): Promise<APIResponse<DamageStatistics>> {
        try {
            const response = await fetch(
                `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_STATISTICS}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data: data.statistics };
        } catch (error) {
            console.error('İstatistik verileri çekme hatası:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Bilinmeyen hata',
            };
        }
    }

    /**
     * Sunucudan hasar yoğunluk alanlarını çeker
     */
    async getHeatZones(): Promise<APIResponse<DamageHeatZone[]>> {
        try {
            const response = await fetch(
                `${this.baseUrl}${API_CONFIG.ENDPOINTS.GET_HEAT_ZONES}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data: data.heatZones };
        } catch (error) {
            console.error('Heat zone verileri çekme hatası:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Bilinmeyen hata',
            };
        }
    }

    /**
     * AI modelinin sunucu bağlantısını test eder
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
}

// Singleton instance
export const aiService = new AIService();

// ============================================================================
// MOCK/OFFLINE MODU
// API erişilemez olduğunda mock data kullanmak için
// ============================================================================
export const USE_MOCK_DATA = true; // Gerçek API'ye geçince false yapın

/**
 * Mock veya gerçek veriyi döndüren yardımcı fonksiyon
 */
export async function fetchDamages(
    mockData: RoadDamage[],
    filters?: Parameters<typeof aiService.getDamages>[0]
): Promise<RoadDamage[]> {
    if (USE_MOCK_DATA) {
        // Filtreleri mock dataya uygula
        let result = [...mockData];
        if (filters?.severity) {
            result = result.filter(d => d.severity === filters.severity);
        }
        if (filters?.damageType) {
            result = result.filter(d => d.damageType === filters.damageType);
        }
        if (filters?.limit) {
            result = result.slice(0, filters.limit);
        }
        return result;
    }

    const response = await aiService.getDamages(filters);
    if (response.success && response.data) {
        return response.data;
    }

    // API başarısız olursa mock dataya fallback
    console.warn('API başarısız, mock data kullanılıyor');
    return mockData;
}

export async function fetchStatistics(
    mockStats: DamageStatistics
): Promise<DamageStatistics> {
    if (USE_MOCK_DATA) {
        return mockStats;
    }

    const response = await aiService.getStatistics();
    if (response.success && response.data) {
        return response.data;
    }

    console.warn('API başarısız, mock istatistikler kullanılıyor');
    return mockStats;
}

export async function fetchHeatZones(
    mockZones: DamageHeatZone[]
): Promise<DamageHeatZone[]> {
    if (USE_MOCK_DATA) {
        return mockZones;
    }

    const response = await aiService.getHeatZones();
    if (response.success && response.data) {
        return response.data;
    }

    console.warn('API başarısız, mock heat zones kullanılıyor');
    return mockZones;
}
