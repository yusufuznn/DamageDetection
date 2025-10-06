import { RoadDamage, DamageReport, DamageStatistics, RoadSegment } from '../types/DamageTypes';

// Mock yol hasarları verisi - Gerçek yol koordinatlarına uygun
export const mockRoadDamages: RoadDamage[] = [
  {
    id: '1',
    coordinate: { latitude: 41.0095, longitude: 28.9740 }, // Atatürk Caddesi üzerinde
    damageType: 'pothole',
    severity: 'critical',
    confidence: 95,
    detectedAt: '2025-10-06T09:30:00Z',
    roadName: 'Atatürk Caddesi',
    description: 'Büyük çukur - Acil müdahale gerekli',
    processed: true,
    priority: 5,
    estimatedRepairCost: 2500,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  },
  {
    id: '2',
    coordinate: { latitude: 41.0070, longitude: 28.9690 }, // İnönü Bulvarı üzerinde
    damageType: 'crack',
    severity: 'high',
    confidence: 88,
    detectedAt: '2025-10-06T10:15:00Z',
    roadName: 'İnönü Bulvarı',
    description: 'Uzun çatlak - Genişleme riski var',
    processed: true,
    priority: 4,
    estimatedRepairCost: 1800,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '3',
    coordinate: { latitude: 41.0185, longitude: 28.9760 }, // Galata Köprüsü bağlantısında
    damageType: 'surface_wear',
    severity: 'medium',
    confidence: 78,
    detectedAt: '2025-10-06T08:45:00Z',
    roadName: 'Galata Köprüsü - Eminönü Bağlantısı',
    description: 'Asfalt aşınması - Rutin bakım gerekli',
    processed: true,
    priority: 3,
    estimatedRepairCost: 1200,
    weatherCondition: 'clear',
    trafficLevel: 'low'
  },
  {
    id: '4',
    coordinate: { latitude: 41.0080, longitude: 28.9710 }, // İnönü Bulvarı üzerinde
    damageType: 'edge_damage',
    severity: 'medium',
    confidence: 82,
    detectedAt: '2025-10-06T11:20:00Z',
    roadName: 'İnönü Bulvarı',
    description: 'Kenar çöküntüsü - Orta seviye hasar',
    processed: true,
    priority: 3,
    estimatedRepairCost: 900,
    weatherCondition: 'clear',
    trafficLevel: 'medium'
  },
  {
    id: '5',
    coordinate: { latitude: 41.0460, longitude: 29.0160 }, // Barbaros Bulvarı üzerinde
    damageType: 'water_damage',
    severity: 'low',
    confidence: 71,
    detectedAt: '2025-10-06T07:30:00Z',
    roadName: 'Barbaros Bulvarı',
    description: 'Su birikintisi hasarı - Düşük seviye',
    processed: false,
    priority: 2,
    estimatedRepairCost: 600,
    weatherCondition: 'rainy',
    trafficLevel: 'low'
  },
  {
    id: '6',
    coordinate: { latitude: 41.0105, longitude: 28.9780 }, // Atatürk Caddesi üzerinde
    damageType: 'pothole',
    severity: 'high',
    confidence: 91,
    detectedAt: '2025-10-06T12:45:00Z',
    roadName: 'Atatürk Caddesi',
    description: 'Orta boy çukur - Yüksek öncelik',
    processed: true,
    priority: 4,
    estimatedRepairCost: 1500,
    weatherCondition: 'clear',
    trafficLevel: 'high'
  }
];

// Mock raporlar
export const mockDamageReports: DamageReport[] = [
  {
    id: 'report-1',
    title: 'Merkez İlçe Hasar Raporu',
    area: 'Merkez',
    totalDamages: 4,
    criticalDamages: 1,
    averageConfidence: 86,
    reportDate: '2025-10-06',
    damages: mockRoadDamages.slice(0, 4),
    roadSegments: [], // Boş array, gerekirse doldurulabilir
    status: 'in_progress',
    assignedTeam: 'Ekip A'
  },
  {
    id: 'report-2',
    title: 'Güney Bölge Hasar Raporu',
    area: 'Güney Bölge',
    totalDamages: 2,
    criticalDamages: 0,
    averageConfidence: 77,
    reportDate: '2025-10-06',
    damages: mockRoadDamages.slice(4, 6),
    roadSegments: [], // Boş array, gerekirse doldurulabilir
    status: 'pending',
    assignedTeam: undefined
  }
];

// Mock yol segmentleri - İstanbul gerçek yol koordinatları
export const mockRoadSegments: RoadSegment[] = [
  {
    id: 'seg-1',
    roadName: 'Atatürk Caddesi',
    coordinates: [
      { latitude: 41.0085, longitude: 28.9700 },
      { latitude: 41.0090, longitude: 28.9720 },
      { latitude: 41.0095, longitude: 28.9740 },
      { latitude: 41.0100, longitude: 28.9760 },
      { latitude: 41.0105, longitude: 28.9780 },
      { latitude: 41.0110, longitude: 28.9800 }
    ],
    severity: 'critical',
    damageCount: 3,
    averageConfidence: 92,
    mainDamageType: 'pothole',
    totalLength: 1.2,
    lastUpdated: '2025-10-06T09:30:00Z',
    damages: [mockRoadDamages[0], mockRoadDamages[5]]
  },
  {
    id: 'seg-2',
    roadName: 'İnönü Bulvarı',
    coordinates: [
      { latitude: 41.0050, longitude: 28.9650 },
      { latitude: 41.0060, longitude: 28.9670 },
      { latitude: 41.0070, longitude: 28.9690 },
      { latitude: 41.0080, longitude: 28.9710 },
      { latitude: 41.0090, longitude: 28.9730 }
    ],
    severity: 'high',
    damageCount: 2,
    averageConfidence: 85,
    mainDamageType: 'crack',
    totalLength: 1.8,
    lastUpdated: '2025-10-06T10:15:00Z',
    damages: [mockRoadDamages[1], mockRoadDamages[3]]
  },
  {
    id: 'seg-3',
    roadName: 'Kennedy Caddesi (Sahil Yolu)',
    coordinates: [
      { latitude: 40.9950, longitude: 28.9500 },
      { latitude: 40.9960, longitude: 28.9520 },
      { latitude: 40.9970, longitude: 28.9540 },
      { latitude: 40.9980, longitude: 28.9560 },
      { latitude: 40.9990, longitude: 28.9580 },
      { latitude: 41.0000, longitude: 28.9600 },
      { latitude: 41.0010, longitude: 28.9620 }
    ],
    severity: 'medium',
    damageCount: 2,
    averageConfidence: 80,
    mainDamageType: 'edge_damage',
    totalLength: 2.5,
    lastUpdated: '2025-10-06T11:20:00Z',
    damages: []
  },
  {
    id: 'seg-4',
    roadName: 'Galata Köprüsü - Eminönü Bağlantısı',
    coordinates: [
      { latitude: 41.0175, longitude: 28.9740 },
      { latitude: 41.0180, longitude: 28.9750 },
      { latitude: 41.0185, longitude: 28.9760 },
      { latitude: 41.0190, longitude: 28.9770 }
    ],
    severity: 'high',
    damageCount: 1,
    averageConfidence: 88,
    mainDamageType: 'surface_wear',
    totalLength: 0.7,
    lastUpdated: '2025-10-06T08:45:00Z',
    damages: [mockRoadDamages[2]]
  },
  {
    id: 'seg-5',
    roadName: 'Barbaros Bulvarı',
    coordinates: [
      { latitude: 41.0400, longitude: 29.0100 },
      { latitude: 41.0420, longitude: 29.0120 },
      { latitude: 41.0440, longitude: 29.0140 },
      { latitude: 41.0460, longitude: 29.0160 },
      { latitude: 41.0480, longitude: 29.0180 }
    ],
    severity: 'low',
    damageCount: 1,
    averageConfidence: 71,
    mainDamageType: 'water_damage',
    totalLength: 1.4,
    lastUpdated: '2025-10-06T07:30:00Z',
    damages: [mockRoadDamages[4]]
  }
];

// Mock istatistikler
export const mockStatistics: DamageStatistics = {
  totalDamages: 6,
  todayDamages: 6,
  weeklyDamages: 23,
  monthlyDamages: 89,
  averageConfidence: 84,
  criticalCount: 1,
  highCount: 2,
  mediumCount: 2,
  lowCount: 1,
  mostCommonType: 'pothole',
  estimatedTotalCost: 8500,
  totalRoadLength: 5.2,
  damagedRoadLength: 4.7
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
  critical: '#d32f2f',
  high: '#f57c00',
  medium: '#fbc02d',
  low: '#388e3c'
};

// Hasar seviyesi için Türkçe isimler
export const severityNames = {
  critical: 'Kritik',
  high: 'Yüksek',
  medium: 'Orta',
  low: 'Düşük'
};