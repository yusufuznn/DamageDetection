// Heat Zone Hesaplama Servisi
// Hasar noktalarından otomatik yoğunluk alanları oluşturur

import { RoadDamage, DamageHeatZone } from '../types/DamageTypes';

/**
 * İki koordinat arası mesafeyi hesaplar (metre cinsinden)
 * Haversine formülü kullanır
 */
function getDistanceInMeters(
    coord1: { latitude: number; longitude: number },
    coord2: { latitude: number; longitude: number }
): number {
    const R = 6371000; // Dünya yarıçapı (metre)
    const dLat = toRad(coord2.latitude - coord1.latitude);
    const dLon = toRad(coord2.longitude - coord1.longitude);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coord1.latitude)) *
        Math.cos(toRad(coord2.latitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Kümenin merkez noktasını hesaplar
 */
function calculateCentroid(damages: RoadDamage[]): { latitude: number; longitude: number } {
    const sum = damages.reduce(
        (acc, d) => ({
            latitude: acc.latitude + d.coordinate.latitude,
            longitude: acc.longitude + d.coordinate.longitude,
        }),
        { latitude: 0, longitude: 0 }
    );

    return {
        latitude: sum.latitude / damages.length,
        longitude: sum.longitude / damages.length,
    };
}

/**
 * Kümenin yarıçapını hesaplar (merkeze en uzak nokta + padding)
 */
function calculateRadius(damages: RoadDamage[], center: { latitude: number; longitude: number }): number {
    let maxDistance = 0;

    for (const damage of damages) {
        const distance = getDistanceInMeters(center, damage.coordinate);
        if (distance > maxDistance) {
            maxDistance = distance;
        }
    }

    // Minimum 100m, maksimum 500m, + %20 padding
    return Math.min(500, Math.max(100, maxDistance * 1.2));
}

/**
 * Kümedeki en yüksek hasar seviyesini döndürür
 */
function getMaxSeverity(damages: RoadDamage[]): 'none' | 'moderate' | 'severe' {
    const severityOrder = { none: 0, moderate: 1, severe: 2 };

    let maxSeverity: 'none' | 'moderate' | 'severe' = 'none';

    for (const damage of damages) {
        if (severityOrder[damage.severity] > severityOrder[maxSeverity]) {
            maxSeverity = damage.severity;
        }
    }

    return maxSeverity;
}

/**
 * En yaygın hasar tipini bulur
 */
function getDominantDamageType(damages: RoadDamage[]): string {
    const counts: Record<string, number> = {};

    for (const damage of damages) {
        counts[damage.damageType] = (counts[damage.damageType] || 0) + 1;
    }

    let maxType = 'pothole';
    let maxCount = 0;

    for (const [type, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            maxType = type;
        }
    }

    return maxType;
}

/**
 * Ortalama güven skorunu hesaplar
 */
function calculateAverageConfidence(damages: RoadDamage[]): number {
    const sum = damages.reduce((acc, d) => acc + d.confidence, 0);
    return Math.round(sum / damages.length);
}

/**
 * Hasar noktalarından dinamik heat zone'lar oluşturur
 * DBSCAN benzeri kümeleme algoritması kullanır
 * 
 * @param damages - Hasar noktaları listesi
 * @param clusterRadius - Kümeleme yarıçapı (metre), default 300m
 * @param minDamages - Minimum hasar sayısı (zone oluşturmak için), default 3
 */
export function createDynamicHeatZones(
    damages: RoadDamage[],
    clusterRadius: number = 300,
    minDamages: number = 3
): DamageHeatZone[] {
    const zones: DamageHeatZone[] = [];
    const used = new Set<string>();

    // Önce ağır hasarlı noktaları işle (öncelik)
    const sortedDamages = [...damages].sort((a, b) => {
        const severityOrder = { severe: 2, moderate: 1, none: 0 };
        return severityOrder[b.severity] - severityOrder[a.severity];
    });

    for (const damage of sortedDamages) {
        // Bu hasar zaten bir kümeye dahil edilmişse atla
        if (used.has(damage.id)) continue;

        // Bu hasara yakın olan tüm hasarları bul
        const cluster = damages.filter(
            (d) => !used.has(d.id) && getDistanceInMeters(damage.coordinate, d.coordinate) <= clusterRadius
        );

        // Minimum hasar sayısına ulaşıldıysa zone oluştur
        if (cluster.length >= minDamages) {
            // Kümedeki tüm hasarları işaretli olarak işaretle
            cluster.forEach((d) => used.add(d.id));

            // Merkez noktayı hesapla
            const center = calculateCentroid(cluster);

            // Zone oluştur
            const zone: DamageHeatZone = {
                id: `zone-${zones.length + 1}`,
                center,
                radius: calculateRadius(cluster, center),
                damageCount: cluster.length,
                severity: getMaxSeverity(cluster),
                damages: cluster,
                averageConfidence: calculateAverageConfidence(cluster),
                dominantDamageType: getDominantDamageType(cluster) as any,
            };

            zones.push(zone);
        }
    }

    return zones;
}

/**
 * Mevcut zone'ları hasar listesiyle günceller
 * Yeni hasarlar eklendiğinde veya kaldırıldığında çağrılır
 */
export function updateHeatZones(
    currentZones: DamageHeatZone[],
    damages: RoadDamage[],
    clusterRadius: number = 300,
    minDamages: number = 3
): DamageHeatZone[] {
    // Her seferinde sıfırdan hesapla (basit yaklaşım)
    // Performans gerekirse incremental güncelleme yapılabilir
    return createDynamicHeatZones(damages, clusterRadius, minDamages);
}
