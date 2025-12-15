import { RoadDamage, DamageReport, DamageStatistics, RoadSegment, DamageHeatZone } from '../types/DamageTypes';

// Kırıkkale Üniversitesi civarı mock hasarlar
export const mockRoadDamages: RoadDamage[] = [
  {
    id: '1',
    coordinate: { latitude: 39.8355, longitude: 33.5195 }, // Üniversite ana giriş
    damageType: 'pothole',
    severity: 'severe',
    confidence: 95,
    detectedAt: '2025-12-15T09:30:00Z',
    roadName: 'Kırıkkale Üniversitesi Ana Yol',
    description: 'Büyük çukur - Acil müdahale gerekli',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '2',
    coordinate: { latitude: 39.8342, longitude: 33.5210 }, // Mühendislik Fakültesi civarı
    damageType: 'crack',
    severity: 'moderate',
    confidence: 88,
    detectedAt: '2025-12-15T10:15:00Z',
    roadName: 'Mühendislik Fakültesi Yolu',
    description: 'Asfalt çatlağı - Onarım gerekiyor',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '3',
    coordinate: { latitude: 39.8368, longitude: 33.5175 }, // Rektörlük binası civarı
    damageType: 'surface_wear',
    severity: 'none',
    confidence: 78,
    detectedAt: '2025-12-15T08:45:00Z',
    roadName: 'Rektörlük Binası Önü',
    description: 'Hafif aşınma - Rutin kontrol yapıldı',
    processed: true,
    priority: 1,
    weatherCondition: 'clear',
    trafficLevel: 'low'
  },
  {
    id: '4',
    coordinate: { latitude: 39.8330, longitude: 33.5165 }, // Kütüphane civarı
    damageType: 'edge_damage',
    severity: 'moderate',
    confidence: 82,
    detectedAt: '2025-12-15T11:20:00Z',
    roadName: 'Merkez Kütüphane Yolu',
    description: 'Kenar çöküntüsü - Orta seviye hasar',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '5',
    coordinate: { latitude: 39.8380, longitude: 33.5220 }, // Yurt bölgesi
    damageType: 'pothole',
    severity: 'severe',
    confidence: 91,
    detectedAt: '2025-12-15T12:45:00Z',
    roadName: 'Öğrenci Yurtları Yolu',
    description: 'Derin çukur - Araç hasarı riski',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '6',
    coordinate: { latitude: 39.8315, longitude: 33.5200 }, // Spor tesisleri
    damageType: 'water_damage',
    severity: 'moderate',
    confidence: 75,
    detectedAt: '2025-12-15T07:30:00Z',
    roadName: 'Spor Kompleksi Girişi',
    description: 'Su birikintisi hasarı - Drenaj sorunu',
    processed: false,
    priority: 3,
    weatherCondition: 'rainy',
    trafficLevel: 'low'
  }
];

// Mock raporlar
export const mockDamageReports: DamageReport[] = [];

// Mock yol segmentleri
export const mockRoadSegments: RoadSegment[] = [];

// Mock hasar yoğunluk alanları
export const mockDamageHeatZones: DamageHeatZone[] = [
  {
    id: 'zone-1',
    center: { latitude: 39.8355, longitude: 33.5195 },
    radius: 150,
    damageCount: 2,
    severity: 'severe',
    damages: [mockRoadDamages[0], mockRoadDamages[4]],
    averageConfidence: 93,
    dominantDamageType: 'pothole'
  },
  {
    id: 'zone-2',
    center: { latitude: 39.8340, longitude: 33.5190 },
    radius: 120,
    damageCount: 2,
    severity: 'moderate',
    damages: [mockRoadDamages[1], mockRoadDamages[3]],
    averageConfidence: 85,
    dominantDamageType: 'crack'
  }
];

// Mock istatistikler
export const mockStatistics: DamageStatistics = {
  totalDamages: 6,
  todayDamages: 6,
  weeklyDamages: 15,
  monthlyDamages: 42,
  averageConfidence: 85,
  noneCount: 1,
  moderateCount: 3,
  severeCount: 2,
  mostCommonType: 'pothole',
  totalRoadLength: 3.5,
  damagedRoadLength: 2.8
};

// Hasar tipi için Türkçe isimler
export const damageTypeNames = {
  pothole: 'Çukur',
  crack: 'Çatlak',
  surface_wear: 'Aşınma',
  edge_damage: 'Kenar Hasarı',
  water_damage: 'Su Hasarı'
};

// Hasar seviyesi için renkler
export const severityColors = {
  none: '#388e3c', // Yeşil - Hasarsız
  moderate: '#f57c00', // Turuncu - Orta Hasarlı
  severe: '#d32f2f' // Kırmızı - Ağır Hasarlı
};

// Hasar seviyesi için Türkçe isimler
export const severityNames = {
  none: 'Hasarsız',
  moderate: 'Orta Hasarlı',
  severe: 'Ağır Hasarlı'
};