import { RoadDamage, DamageReport, DamageStatistics, RoadSegment, DamageHeatZone } from '../types/DamageTypes';

// Merkez konum: 39.881697, 33.443401
const CENTER_LAT = 39.881697;
const CENTER_LNG = 33.443401;

// Mock hasarlar - Ana konum civarında
export const mockRoadDamages: RoadDamage[] = [
  {
    id: '1',
    coordinate: { latitude: CENTER_LAT, longitude: CENTER_LNG },
    damageType: 'pothole',
    severity: 'severe',
    confidence: 95,
    detectedAt: '2025-12-15T09:30:00Z',
    roadName: 'Ana Cadde',
    description: 'Büyük çukur - Acil müdahale gerekli',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '2',
    coordinate: { latitude: CENTER_LAT + 0.0008, longitude: CENTER_LNG - 0.0012 },
    damageType: 'crack',
    severity: 'moderate',
    confidence: 88,
    detectedAt: '2025-12-15T10:15:00Z',
    roadName: 'Ara Sokak 1',
    description: 'Asfalt çatlağı - Onarım gerekiyor',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '3',
    coordinate: { latitude: CENTER_LAT - 0.0006, longitude: CENTER_LNG + 0.0015 },
    damageType: 'surface_wear',
    severity: 'none',
    confidence: 78,
    detectedAt: '2025-12-15T08:45:00Z',
    roadName: 'Yan Yol',
    description: 'Hafif aşınma - Rutin kontrol yapıldı',
    processed: true,
    priority: 1,
    weatherCondition: 'clear',
    trafficLevel: 'low'
  },
  {
    id: '4',
    coordinate: { latitude: CENTER_LAT + 0.0012, longitude: CENTER_LNG + 0.0008 },
    damageType: 'edge_damage',
    severity: 'moderate',
    confidence: 82,
    detectedAt: '2025-12-15T11:20:00Z',
    roadName: 'Köşe Durağı',
    description: 'Kenar çöküntüsü - Orta seviye hasar',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '5',
    coordinate: { latitude: CENTER_LAT - 0.0010, longitude: CENTER_LNG - 0.0006 },
    damageType: 'pothole',
    severity: 'severe',
    confidence: 91,
    detectedAt: '2025-12-15T12:45:00Z',
    roadName: 'Kavşak Noktası',
    description: 'Derin çukur - Araç hasarı riski',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '6',
    coordinate: { latitude: CENTER_LAT + 0.0005, longitude: CENTER_LNG + 0.0018 },
    damageType: 'water_damage',
    severity: 'moderate',
    confidence: 75,
    detectedAt: '2025-12-15T07:30:00Z',
    roadName: 'Park Girişi',
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
    center: { latitude: CENTER_LAT, longitude: CENTER_LNG },
    radius: 80,
    damageCount: 3,
    severity: 'severe',
    damages: [mockRoadDamages[0], mockRoadDamages[4]],
    averageConfidence: 93,
    dominantDamageType: 'pothole'
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