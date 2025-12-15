export interface RoadDamage {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  damageType: 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage';
  severity: 'none' | 'moderate' | 'severe'; // hasarsız, orta hasarlı, ağır hasarlı
  confidence: number; // AI güven skoru (0-100)
  detectedAt: string; // ISO tarih
  roadName?: string;
  description: string;
  imageUrl?: string; // İHA'dan gelen görüntü URL'i
  processed: boolean;
  priority: number; // 1-5 arası öncelik
  weatherCondition?: string;
  trafficLevel?: 'low' | 'medium' | 'high';
}

export interface RoadSegment {
  id: string;
  roadName: string;
  coordinates: Array<{
    latitude: number;
    longitude: number;
  }>;
  severity: 'none' | 'moderate' | 'severe'; // hasarsız, orta hasarlı, ağır hasarlı
  damageCount: number;
  averageConfidence: number;
  mainDamageType: 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage';
  totalLength: number; // km cinsinden
  lastUpdated: string;
  damages: RoadDamage[]; // Bu yol segmentindeki hasarlar
}

export interface DamageHeatZone {
  id: string;
  center: {
    latitude: number;
    longitude: number;
  };
  radius: number; // metre cinsinden
  damageCount: number;
  severity: 'none' | 'moderate' | 'severe'; // hasarsız, orta hasarlı, ağır hasarlı
  damages: RoadDamage[]; // Bu alandaki hasarlar
  averageConfidence: number;
  dominantDamageType: 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage';
}

export interface DamageReport {
  id: string;
  title: string;
  area: string;
  totalDamages: number;
  severeDamages: number; // ağır hasarlı sayısı
  averageConfidence: number;
  reportDate: string;
  damages: RoadDamage[];
  roadSegments: RoadSegment[];
  status: 'pending' | 'in_progress' | 'completed';
  assignedTeam?: string;
}

export interface DamageStatistics {
  totalDamages: number;
  todayDamages: number;
  weeklyDamages: number;
  monthlyDamages: number;
  averageConfidence: number;
  noneCount: number; // hasarsız
  moderateCount: number; // orta hasarlı
  severeCount: number; // ağır hasarlı
  mostCommonType: string;
  totalRoadLength: number; // km
  damagedRoadLength: number; // km
}