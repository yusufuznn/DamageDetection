import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions, StatusBar, ActivityIndicator } from 'react-native';
import { FAB, Title, Paragraph, Portal, Dialog, Button, Text, Surface } from 'react-native-paper';
import MapView, { Marker, Region, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { RoadDamage, DamageHeatZone } from '../types/DamageTypes';
import { mockRoadDamages, mockDamageHeatZones, severityColors, damageTypeNames, severityNames } from '../data/mockData';
import { fetchDamages, fetchHeatZones } from '../services/aiService';

const { width, height } = Dimensions.get('window');

const MapViewScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heatZones, setHeatZones] = useState<DamageHeatZone[]>([]);
  const [damages, setDamages] = useState<RoadDamage[]>([]);
  const [selectedDamage, setSelectedDamage] = useState<RoadDamage | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 39.881697,
    longitude: 33.443401,
    latitudeDelta: 0.008,
    longitudeDelta: 0.008,
  });

  useEffect(() => {
    getCurrentLocation();
    loadDamages();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Konum İzni', 'Harita özelliklerini kullanmak için konum iznine ihtiyacımız var.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setMapRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      console.error('Konum alınamadı:', error);
    }
  };

  const loadDamages = async () => {
    setLoading(true);
    try {
      const [damageData, zoneData] = await Promise.all([
        fetchDamages(mockRoadDamages),
        fetchHeatZones(mockDamageHeatZones)
      ]);
      setDamages(damageData);
      setHeatZones(zoneData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      // Hata durumunda mock data kullan
      setDamages(mockRoadDamages);
      setHeatZones(mockDamageHeatZones);
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (severity: string) => {
    return severityColors[severity as keyof typeof severityColors] || '#0E7490';
  };

  const handleMarkerPress = (damage: RoadDamage) => {
    setSelectedDamage(damage);
    setDialogVisible(true);
  };

  const centerOnUserLocation = () => {
    if (location) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);

    if (diff < 60) return `${diff} dk önce`;
    if (diff < 1440) return `${Math.floor(diff / 60)} saat önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Harita */}
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={setMapRegion}
      >
        {/* Hasar Noktaları */}
        {damages.map((damage) => (
          <Marker
            key={damage.id}
            coordinate={damage.coordinate}
            onPress={() => handleMarkerPress(damage)}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.markerWrapper}>
              <View style={[styles.markerOuter, { backgroundColor: getMarkerColor(damage.severity) + '30' }]}>
                <View style={[styles.markerInner, { backgroundColor: getMarkerColor(damage.severity) }]}>
                  <View style={styles.markerCore} />
                </View>
              </View>
              <View style={[styles.markerShadow, { backgroundColor: getMarkerColor(damage.severity) }]} />
            </View>
          </Marker>
        ))}

        {/* Hasar Yoğunluk Alanları */}
        {heatZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            strokeColor={getMarkerColor(zone.severity)}
            fillColor={getMarkerColor(zone.severity) + '30'}
            strokeWidth={2}
          />
        ))}
      </MapView>

      {/* Üst Bilgi Barı */}
      <Surface style={styles.topBar}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#DC2626' }]}>{damages.filter(d => d.severity === 'severe').length}</Text>
            <Text style={styles.statLabel}>Ağır</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#EA580C' }]}>{damages.filter(d => d.severity === 'moderate').length}</Text>
            <Text style={styles.statLabel}>Orta</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#16A34A' }]}>{damages.filter(d => d.severity === 'none').length}</Text>
            <Text style={styles.statLabel}>Hasarsız</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#0E7490' }]}>{damages.length}</Text>
            <Text style={styles.statLabel}>Toplam</Text>
          </View>
        </View>
      </Surface>

      {/* Konum Butonu */}
      <FAB
        style={styles.locationFab}
        icon="crosshairs-gps"
        size="small"
        color="#0E7490"
        onPress={centerOnUserLocation}
      />

      {/* Hasar Detay Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)} style={styles.dialog}>
          <Dialog.Content>
            {selectedDamage && (
              <View>
                <View style={[styles.severityBadge, { backgroundColor: getMarkerColor(selectedDamage.severity) }]}>
                  <Text style={styles.severityBadgeText}>
                    {severityNames[selectedDamage.severity] || 'Bilinmiyor'}
                  </Text>
                </View>

                <Title style={styles.dialogTitle}>
                  {selectedDamage.roadName || 'Bilinmeyen Konum'}
                </Title>

                <Paragraph style={styles.dialogDescription}>
                  {selectedDamage.description || 'Açıklama yok'}
                </Paragraph>

                <View style={styles.dialogInfo}>
                  <Text style={styles.dialogInfoText}>
                    📍 {selectedDamage.coordinate?.latitude?.toFixed(5) || '0'}, {selectedDamage.coordinate?.longitude?.toFixed(5) || '0'}
                  </Text>
                  <Text style={styles.dialogInfoText}>
                    🕐 {formatDate(selectedDamage.detectedAt)}
                  </Text>
                  <Text style={styles.dialogInfoText}>
                    🔧 {damageTypeNames[selectedDamage.damageType] || 'Bilinmiyor'}
                  </Text>
                </View>
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)} textColor="#64748B">Kapat</Button>
            <Button onPress={() => {
              setDialogVisible(false);
              Alert.alert('Navigasyon', 'Yol tarifi başlatılacak');
            }} textColor="#0E7490">Yol Tarifi</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  map: {
    width: width,
    height: height,
  },
  topBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerOuter: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerCore: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  markerShadow: {
    width: 12,
    height: 4,
    borderRadius: 6,
    marginTop: 2,
    opacity: 0.3,
  },
  locationFab: {
    position: 'absolute',
    right: 16,
    top: 130,
    backgroundColor: '#FFFFFF',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  severityBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  dialogDescription: {
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 22,
  },
  dialogInfo: {
    gap: 8,
  },
  dialogInfoText: {
    color: '#64748B',
    fontSize: 13,
  },
});

export default MapViewScreen;