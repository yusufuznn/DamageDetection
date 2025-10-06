export interface RoadDamage {
  id: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  damageType: 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // AI güven skoru (0-100)
  detectedAt: string; // ISO tarih
  roadName?: string;
  description: string;
  imageUrl?: string; // İHA'dan gelen görüntü URL'i
  processed: boolean;
  priority: number; // 1-5 arası öncelik
  estimatedRepairCost?: number;
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
  severity: 'low' | 'medium' | 'high' | 'critical';
  damageCount: number;
  averageConfidence: number;
  mainDamageType: 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage';
  totalLength: number; // km cinsinden
  lastUpdated: string;
  damages: RoadDamage[]; // Bu yol segmentindeki hasarlar
}

export interface DamageReport {
  id: string;
  title: string;
  area: string;
  totalDamages: number;
  criticalDamages: number;
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
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  mostCommonType: string;
  estimatedTotalCost: number;
  totalRoadLength: number; // km
  damagedRoadLength: number; // km
}