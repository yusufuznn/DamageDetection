import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import { Appbar, FAB, Card, Title, Paragraph, Portal, Dialog, Button, Chip } from 'react-native-paper';
import MapView, { Marker, Region, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { RoadDamage, RoadSegment } from '../types/DamageTypes';
import { mockRoadDamages, mockRoadSegments, severityColors, damageTypeNames, severityNames } from '../data/mockData';

const MapViewScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<RoadSegment | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [showDamagePoints, setShowDamagePoints] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 41.0150,
    longitude: 28.9800,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  });

  useEffect(() => {
    getCurrentLocation();
    loadRoadSegments();
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

  const loadRoadSegments = () => {
    setRoadSegments(mockRoadSegments);
  };

  const getSegmentColor = (severity: string) => {
    return severityColors[severity as keyof typeof severityColors] || '#2196f3';
  };

  const getSegmentWidth = (severity: string) => {
    switch (severity) {
      case 'critical': return 8;
      case 'high': return 6;
      case 'medium': return 4;
      case 'low': return 3;
      default: return 2;
    }
  };

  const handleSegmentPress = (segment: RoadSegment) => {
    setSelectedSegment(segment);
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
        {/* Yol Segmentleri - Polyline olarak */}
        {roadSegments.map((segment) => (
          <Polyline
            key={segment.id}
            coordinates={segment.coordinates}
            strokeColor={getSegmentColor(segment.severity)}
            strokeWidth={getSegmentWidth(segment.severity)}
            onPress={() => handleSegmentPress(segment)}
            tappable={true}
          />
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
              { backgroundColor: getSegmentColor(damage.severity) }
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

      {/* Yol/Hasar Noktası Toggle Butonu */}
      <FAB
        style={styles.toggleFab}
        icon={showDamagePoints ? "map-marker-off" : "map-marker"}
        size="small"
        onPress={() => setShowDamagePoints(!showDamagePoints)}
        label={showDamagePoints ? "Noktaları Gizle" : "Noktaları Göster"}
      />

      {/* Yol Segmenti Detay Dialog */}
      <Portal>
        <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
          <Dialog.Title>{selectedSegment?.roadName || 'Yol Bilgisi'}</Dialog.Title>
          <Dialog.Content>
            <View style={styles.segmentInfo}>
              <View style={styles.segmentHeader}>
                <Chip 
                  icon="road"
                  style={[styles.severityChip, { backgroundColor: getSegmentColor(selectedSegment?.severity || 'low') }]}
                  textStyle={styles.chipText}
                >
                  {severityNames[selectedSegment?.severity || 'low']}
                </Chip>
                <Chip 
                  icon="wrench"
                  style={styles.typeChip}
                  textStyle={styles.typeChipText}
                >
                  {damageTypeNames[selectedSegment?.mainDamageType || 'pothole']}
                </Chip>
              </View>
              
              <View style={styles.segmentStats}>
                <View style={styles.statRow}>
                  <Paragraph style={styles.statLabel}>Hasar Sayısı:</Paragraph>
                  <Paragraph style={styles.statValue}>{selectedSegment?.damageCount || 0}</Paragraph>
                </View>
                
                <View style={styles.statRow}>
                  <Paragraph style={styles.statLabel}>Ortalama Güven:</Paragraph>
                  <Paragraph style={styles.statValue}>%{selectedSegment?.averageConfidence || 0}</Paragraph>
                </View>
                
                <View style={styles.statRow}>
                  <Paragraph style={styles.statLabel}>Yol Uzunluğu:</Paragraph>
                  <Paragraph style={styles.statValue}>{selectedSegment?.totalLength || 0} km</Paragraph>
                </View>
                
                <View style={styles.statRow}>
                  <Paragraph style={styles.statLabel}>Son Güncelleme:</Paragraph>
                  <Paragraph style={styles.statValue}>
                    {selectedSegment?.lastUpdated ? new Date(selectedSegment.lastUpdated).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
                  </Paragraph>
                </View>
              </View>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogVisible(false)}>Kapat</Button>
            <Button onPress={() => {
              setDialogVisible(false);
              // TODO: Yol detay sayfasına git
              Alert.alert('Detay', 'Yol detay sayfası yakında eklenecek!');
            }}>
              Detayları Görüntüle
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
});

export default MapViewScreen;