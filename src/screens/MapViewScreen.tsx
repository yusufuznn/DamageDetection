import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { Appbar, FAB, Card, Title, Paragraph, Portal, Dialog, Button, Chip } from 'react-native-paper';
import MapView, { Marker, Region, Polyline, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { RoadDamage, RoadSegment, DamageHeatZone } from '../types/DamageTypes';
import { mockRoadDamages, mockRoadSegments, mockDamageHeatZones, severityColors, damageTypeNames, severityNames } from '../data/mockData';

const MapViewScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heatZones, setHeatZones] = useState<DamageHeatZone[]>([]);
  const [selectedZone, setSelectedZone] = useState<DamageHeatZone | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [showDamagePoints, setShowDamagePoints] = useState(false);
  const [viewMode, setViewMode] = useState<'zones' | 'lines'>('zones'); // Yeni: görünüm modu
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 41.0150,
    longitude: 28.9800,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  useEffect(() => {
    getCurrentLocation();
    loadHeatZones();
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
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    } catch (error) {
      console.error('Konum alınamadı:', error);
      Alert.alert('Hata', 'Konum bilgisi alınamadı. Varsayılan konum kullanılacak.');
    }
  };

  const loadHeatZones = () => {
    setHeatZones(mockDamageHeatZones);
  };

  const getZoneColor = (severity: string) => {
    return severityColors[severity as keyof typeof severityColors] || '#2196f3';
  };

  const getZoneOpacity = (severity: string) => {
    switch (severity) {
      case 'critical': return 0.6;
      case 'high': return 0.5;
      case 'medium': return 0.4;
      case 'low': return 0.3;
      default: return 0.25;
    }
  };

  const handleZonePress = (zone: DamageHeatZone) => {
    setSelectedZone(zone);
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

  const addNewDamageReport = () => {
    Alert.alert(
      'Yeni Hasar Tespiti', 
      'İHA görüntü analizi ile otomatik hasar tespiti yakında aktif olacak!',
      [
        { text: 'Tamam', style: 'default' }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onRegionChangeComplete={setMapRegion}
      >
        {/* Hasar Yoğunluk Alanları - Circle olarak */}
        {heatZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            strokeColor={getZoneColor(zone.severity)}
            fillColor={getZoneColor(zone.severity) + Math.round(getZoneOpacity(zone.severity) * 255).toString(16).padStart(2, '0')}
            strokeWidth={2}
          />
        ))}

        {/* Merkez Noktası Marker'ları */}
        {heatZones.map((zone) => (
          <Marker
            key={`marker-${zone.id}`}
            coordinate={zone.center}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => handleZonePress(zone)}
          >
            <View style={[
              styles.zoneMarker,
              { backgroundColor: getZoneColor(zone.severity) }
            ]}>
              <Paragraph style={styles.zoneMarkerText}>{zone.damageCount}</Paragraph>
            </View>
          </Marker>
        ))}

        {/* Opsiyonel: Hasar noktaları küçük marker'lar olarak */}
        {showDamagePoints && mockRoadDamages.map((damage) => (
          <Marker
            key={damage.id}
            coordinate={damage.coordinate}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.damagePoint, 
              { backgroundColor: getZoneColor(damage.severity) }
            ]}>
              <View style={styles.damagePointInner} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Konum Butonu */}
      <FAB
        style={styles.locationFab}
        icon="crosshairs-gps"
        size="small"
        onPress={centerOnUserLocation}
      />

      {/* Yeni Rapor Butonu */}
      <FAB
        style={styles.addFab}
        icon="plus"
        onPress={addNewDamageReport}
        label="Yeni Rapor"
      />

      {/* Hasar Noktaları Toggle Butonu */}
      <FAB
        style={styles.toggleFab}
        icon={showDamagePoints ? "map-marker-off" : "map-marker"}
        size="small"
        onPress={() => setShowDamagePoints(!showDamagePoints)}
        label={showDamagePoints ? "Noktaları Gizle" : "Noktaları Göster"}
      />

      {/* Hasar Yoğunluk Alanı Detay Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>Hasar Yoğunluk Alanı</Dialog.Title>
          <Dialog.Content>
            <View style={styles.segmentInfo}>
              <View style={styles.segmentHeader}>
                <Chip 
                  icon="alert-circle"
                  style={[styles.severityChip, { backgroundColor: getZoneColor(selectedZone?.severity || 'low') }]}
                  textStyle={styles.chipText}
                >
                  {severityNames[selectedZone?.severity || 'low']}
                </Chip>
                <Chip 
                  icon="wrench"
                  style={styles.typeChip}
                  textStyle={styles.typeChipText}
                >
                  {damageTypeNames[selectedZone?.dominantDamageType || 'pothole']}
                </Chip>
              </View>
              
              <View style={styles.segmentStats}>
                <View style={styles.statRow}>
                  <Paragraph style={styles.statLabel}>Hasar Sayısı:</Paragraph>
                  <Paragraph style={styles.statValue}>{selectedZone?.damageCount || 0}</Paragraph>
                </View>
                
                <View style={styles.statRow}>
                  <Paragraph style={styles.statLabel}>Ortalama Güven:</Paragraph>
                  <Paragraph style={styles.statValue}>%{selectedZone?.averageConfidence || 0}</Paragraph>
                </View>
                
                <View style={styles.statRow}>
                  <Paragraph style={styles.statLabel}>Alan Yarıçapı:</Paragraph>
                  <Paragraph style={styles.statValue}>{selectedZone?.radius || 0} m</Paragraph>
                </View>
                
                <View style={styles.infoBox}>
                  <Paragraph style={styles.infoText}>
                    💡 Alan büyüklüğü, bölgedeki hasar sayısı ve önem seviyesine göre belirlenir.
                    {selectedZone?.damageCount && selectedZone.damageCount > 1 && 
                      ` Bu alanda ${selectedZone.damageCount} adet hasar tespit edildi.`
                    }
                  </Paragraph>
                </View>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Kapat</Button>
            <Button onPress={() => {
              setDialogVisible(false);
              Alert.alert('Detaylar', 'Alan hasarlarının detaylı listesi yakında eklenecek!');
            }}>
              Hasarları Görüntüle
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  customMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  locationFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 100,
    backgroundColor: 'white',
  },
  addFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
  dialogDescription: {
    marginBottom: 8,
    fontSize: 16,
  },
  dialogDate: {
    marginBottom: 12,
    color: '#666',
    fontSize: 14,
  },
  severityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  severityLabel: {
    fontSize: 14,
    color: '#666',
  },
  severityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  severityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  damagePoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  damagePointInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 2,
  },
  toggleFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 160,
    backgroundColor: 'white',
  },
  segmentInfo: {
    paddingVertical: 8,
  },
  segmentHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  segmentStats: {
    gap: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  severityChip: {
    elevation: 1,
  },
  chipText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  typeChip: {
    backgroundColor: '#e3f2fd',
  },
  typeChipText: {
    color: '#1976d2',
    fontSize: 12,
  },
  zoneMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    elevation: 4,
  },
  zoneMarkerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
});

export default MapViewScreen;