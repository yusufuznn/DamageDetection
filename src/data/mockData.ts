import { RoadDamage, DamageReport, DamageStatistics, RoadSegment, DamageHeatZone } from '../types/DamageTypes';

// Merkez konum: 39.881697, 33.443401
const CENTER_LAT = 39.881697;
const CENTER_LNG = 33.443401;

// Mock hasarlar - Geniş alana yayılmış gerçekçi konumlar
export const mockRoadDamages: RoadDamage[] = [
  // Merkez bölge hasarları
  {
    id: '1',
    coordinate: { latitude: CENTER_LAT, longitude: CENTER_LNG },
    damageType: 'pothole',
    severity: 'severe',
    confidence: 95,
    detectedAt: '2025-12-25T09:30:00Z',
    roadName: 'Atatürk Bulvarı',
    description: 'Büyük çukur - Acil müdahale gerekli. Araç geçişi tehlikeli.',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '2',
    coordinate: { latitude: CENTER_LAT + 0.002, longitude: CENTER_LNG - 0.003 },
    damageType: 'crack',
    severity: 'moderate',
    confidence: 88,
    detectedAt: '2025-12-25T10:15:00Z',
    roadName: 'Cumhuriyet Caddesi',
    description: 'Uzun asfalt çatlağı - 15 metre boyunca devam ediyor',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '3',
    coordinate: { latitude: CENTER_LAT - 0.0025, longitude: CENTER_LNG + 0.004 },
    damageType: 'surface_wear',
    severity: 'none',
    confidence: 78,
    detectedAt: '2025-12-24T08:45:00Z',
    roadName: 'İstasyon Yolu',
    description: 'Hafif aşınma - Rutin kontrol yapıldı, iyi durumda',
    processed: true,
    priority: 1,
    weatherCondition: 'clear',
    trafficLevel: 'low'
  },
  {
    id: '4',
    coordinate: { latitude: CENTER_LAT + 0.004, longitude: CENTER_LNG + 0.002 },
    damageType: 'edge_damage',
    severity: 'moderate',
    confidence: 82,
    detectedAt: '2025-12-25T11:20:00Z',
    roadName: 'Sanayi Kavşağı',
    description: 'Kenar çöküntüsü - Yol kenarı erozyona uğramış',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '5',
    coordinate: { latitude: CENTER_LAT - 0.003, longitude: CENTER_LNG - 0.002 },
    damageType: 'pothole',
    severity: 'severe',
    confidence: 91,
    detectedAt: '2025-12-25T12:45:00Z',
    roadName: 'Belediye Önü',
    description: 'Derin çukur - Araç lastiği patlama riski yüksek',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '6',
    coordinate: { latitude: CENTER_LAT + 0.001, longitude: CENTER_LNG + 0.005 },
    damageType: 'water_damage',
    severity: 'moderate',
    confidence: 75,
    detectedAt: '2025-12-24T07:30:00Z',
    roadName: 'Park Caddesi',
    description: 'Su birikintisi hasarı - Drenaj sistemi tıkalı',
    processed: false,
    priority: 3,
    weatherCondition: 'rainy',
    trafficLevel: 'low'
  },
  // Kuzey bölgesi hasarları
  {
    id: '7',
    coordinate: { latitude: CENTER_LAT + 0.006, longitude: CENTER_LNG - 0.001 },
    damageType: 'crack',
    severity: 'severe',
    confidence: 89,
    detectedAt: '2025-12-25T14:00:00Z',
    roadName: 'Organize Sanayi Yolu',
    description: 'Geniş çatlak ağı - Yol yüzeyi parçalanmış',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '8',
    coordinate: { latitude: CENTER_LAT + 0.005, longitude: CENTER_LNG + 0.004 },
    damageType: 'pothole',
    severity: 'moderate',
    confidence: 85,
    detectedAt: '2025-12-25T13:20:00Z',
    roadName: 'Hastane Caddesi',
    description: 'Orta boyutlu çukur - Dikkatli sürüş gerekli',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  // Güney bölgesi hasarları
  {
    id: '9',
    coordinate: { latitude: CENTER_LAT - 0.005, longitude: CENTER_LNG + 0.001 },
    damageType: 'surface_wear',
    severity: 'none',
    confidence: 92,
    detectedAt: '2025-12-23T16:00:00Z',
    roadName: 'Okul Sokağı',
    description: 'Yeni asfalt - Mükemmel durumda',
    processed: true,
    priority: 1,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '10',
    coordinate: { latitude: CENTER_LAT - 0.004, longitude: CENTER_LNG - 0.004 },
    damageType: 'edge_damage',
    severity: 'severe',
    confidence: 94,
    detectedAt: '2025-12-25T15:30:00Z',
    roadName: 'Köprü Altı Yolu',
    description: 'Yol kenarı çökmüş - Acil bariyier gerekli',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  // Doğu bölgesi hasarları
  {
    id: '11',
    coordinate: { latitude: CENTER_LAT + 0.002, longitude: CENTER_LNG + 0.006 },
    damageType: 'water_damage',
    severity: 'moderate',
    confidence: 77,
    detectedAt: '2025-12-24T09:00:00Z',
    roadName: 'Dere Kenarı Yolu',
    description: 'Yağmur sonrası hasar - Asfalt kabarmış',
    processed: false,
    priority: 3,
    weatherCondition: 'rainy',
    trafficLevel: 'low'
  },
  {
    id: '12',
    coordinate: { latitude: CENTER_LAT - 0.001, longitude: CENTER_LNG + 0.007 },
    damageType: 'crack',
    severity: 'none',
    confidence: 81,
    detectedAt: '2025-12-22T11:00:00Z',
    roadName: 'Bahçe Sokak',
    description: 'Küçük çatlak - Onarıldı, takip altında',
    processed: true,
    priority: 1,
    weatherCondition: 'clear',
    trafficLevel: 'low'
  },
  // Batı bölgesi hasarları
  {
    id: '13',
    coordinate: { latitude: CENTER_LAT + 0.003, longitude: CENTER_LNG - 0.005 },
    damageType: 'pothole',
    severity: 'moderate',
    confidence: 86,
    detectedAt: '2025-12-25T08:00:00Z',
    roadName: 'Terminal Caddesi',
    description: 'Çukur - Otobüs güzergahında, öncelikli onarım',
    processed: false,
    priority: 4,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '14',
    coordinate: { latitude: CENTER_LAT - 0.002, longitude: CENTER_LNG - 0.006 },
    damageType: 'surface_wear',
    severity: 'moderate',
    confidence: 73,
    detectedAt: '2025-12-24T14:30:00Z',
    roadName: 'Fabrika Yolu',
    description: 'Ağır araç trafiğinden aşınma - Yüzey yenilenmeli',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '15',
    coordinate: { latitude: CENTER_LAT + 0.0015, longitude: CENTER_LNG - 0.0035 },
    damageType: 'pothole',
    severity: 'severe',
    confidence: 97,
    detectedAt: '2025-12-25T16:00:00Z',
    roadName: 'Ana Arter Yolu',
    description: 'Kritik çukur - Kaza raporu mevcut, acil müdahale',
    processed: false,
    priority: 5,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  // Ekstra noktalar
  {
    id: '16',
    coordinate: { latitude: CENTER_LAT + 0.0045, longitude: CENTER_LNG - 0.003 },
    damageType: 'edge_damage',
    severity: 'none',
    confidence: 88,
    detectedAt: '2025-12-21T10:00:00Z',
    roadName: 'Yeni Mahalle Cad.',
    description: 'Kenar onarımı tamamlandı - İyi durumda',
    processed: true,
    priority: 1,
    weatherCondition: 'clear',
    trafficLevel: 'low'
  },
  {
    id: '17',
    coordinate: { latitude: CENTER_LAT - 0.0055, longitude: CENTER_LNG + 0.003 },
    damageType: 'water_damage',
    severity: 'severe',
    confidence: 90,
    detectedAt: '2025-12-25T06:30:00Z',
    roadName: 'Sel Bölgesi Yolu',
    description: 'Sel hasarı - Yol tamamen tahrip olmuş',
    processed: false,
    priority: 5,
    weatherCondition: 'rainy',
    trafficLevel: 'low'
  },
  {
    id: '18',
    coordinate: { latitude: CENTER_LAT - 0.0035, longitude: CENTER_LNG + 0.0055 },
    damageType: 'crack',
    severity: 'moderate',
    confidence: 84,
    detectedAt: '2025-12-24T17:00:00Z',
    roadName: 'Mezarlık Yolu',
    description: 'Çoklu çatlaklar - Bakım planlandı',
    processed: false,
    priority: 3,
    weatherCondition: 'clear',
    trafficLevel: 'low'
  }
];

// Mock raporlar
export const mockDamageReports: DamageReport[] = [];

// Mock yol segmentleri
export const mockRoadSegments: RoadSegment[] = [];

// Mock hasar yoğunluk alanları - Güncellenmiş
export const mockDamageHeatZones: DamageHeatZone[] = [
  {
    id: 'zone-1',
    center: { latitude: CENTER_LAT, longitude: CENTER_LNG },
    radius: 250,
    damageCount: 4,
    severity: 'severe',
    damages: [mockRoadDamages[0], mockRoadDamages[4], mockRoadDamages[14]],
    averageConfidence: 94,
    dominantDamageType: 'pothole'
  },
  {
    id: 'zone-2',
    center: { latitude: CENTER_LAT + 0.005, longitude: CENTER_LNG + 0.002 },
    radius: 300,
    damageCount: 3,
    severity: 'moderate',
    damages: [mockRoadDamages[3], mockRoadDamages[6], mockRoadDamages[7]],
    averageConfidence: 85,
    dominantDamageType: 'crack'
  },
  {
    id: 'zone-3',
    center: { latitude: CENTER_LAT - 0.004, longitude: CENTER_LNG - 0.003 },
    radius: 200,
    damageCount: 2,
    severity: 'severe',
    damages: [mockRoadDamages[9]],
    averageConfidence: 94,
    dominantDamageType: 'edge_damage'
  }
];

// Mock istatistikler - Güncellenmiş
export const mockStatistics: DamageStatistics = {
  totalDamages: 18,
  todayDamages: 10,
  weeklyDamages: 18,
  monthlyDamages: 56,
  averageConfidence: 85,
  noneCount: 4,
  moderateCount: 7,
  severeCount: 7,
  mostCommonType: 'pothole',
  totalRoadLength: 8.5,
  damagedRoadLength: 5.2
};

// Hasar tipi için Türkçe isimler
export const damageTypeNames: Record<string, string> = {
  pothole: 'Çukur',
  crack: 'Çatlak',
  surface_wear: 'Aşınma',
  edge_damage: 'Kenar Hasarı',
  water_damage: 'Su Hasarı'
};

// Hasar tipi için ikonlar (emoji)
export const damageTypeIcons: Record<string, string> = {
  pothole: '🕳️',
  crack: '⚡',
  surface_wear: '🔧',
  edge_damage: '🚧',
  water_damage: '💧'
};

// Hasar seviyesi için renkler
export const severityColors: Record<string, string> = {
  none: '#22C55E', // Yeşil - Hasarsız
  moderate: '#F97316', // Turuncu - Orta Hasarlı
  severe: '#EF4444' // Kırmızı - Ağır Hasarlı
};

// Hasar seviyesi için Türkçe isimler
export const severityNames: Record<string, string> = {
  none: 'Hasarsız',
  moderate: 'Orta Hasarlı',
  severe: 'Ağır Hasarlı'
};