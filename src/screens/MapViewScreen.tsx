import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions, StatusBar, Linking, Platform, TouchableOpacity, Modal } from 'react-native';
import { FAB, Title, Paragraph, Portal, Dialog, Button, Text, Surface } from 'react-native-paper';
import MapView, { Marker, Region, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { RoadDamage, DamageHeatZone } from '../types/DamageTypes';
import { mockRoadDamages, severityColors, damageTypeNames, severityNames } from '../data/mockData';
import { fetchDamages } from '../services/aiService';
import { createDynamicHeatZones } from '../services/HeatZoneService';

const { width, height } = Dimensions.get('window');

// Basit Marker Bileşeni - Temiz tasarım
const SimpleMarker = ({ damage, onPress, getMarkerColor }: {
  damage: RoadDamage;
  onPress: () => void;
  getMarkerColor: (severity: string) => string;
}) => {
  const markerColor = getMarkerColor(damage.severity);
  const size = damage.severity === 'severe' ? 24 : damage.severity === 'moderate' ? 20 : 16;

  return (
    <Marker
      coordinate={damage.coordinate}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: markerColor,
          borderWidth: 3,
          borderColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      />
    </Marker>
  );
};

const MapViewScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heatZones, setHeatZones] = useState<DamageHeatZone[]>([]);
  const [damages, setDamages] = useState<RoadDamage[]>([]);
  const [selectedDamage, setSelectedDamage] = useState<RoadDamage | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 39.881697,
    longitude: 33.443401,
    latitudeDelta: 0.018,
    longitudeDelta: 0.018,
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
      const damageData = await fetchDamages(mockRoadDamages);
      setDamages(damageData);

      // Dinamik heat zone hesaplama
      // clusterRadius: 300m içindeki hasarları grupla
      // minDamages: En az 2 hasar varsa zone oluştur
      const dynamicZones = createDynamicHeatZones(damageData, 300, 2);
      setHeatZones(dynamicZones);

      console.log(`${damageData.length} hasar, ${dynamicZones.length} heat zone oluşturuldu`);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      // Hata durumunda mock data kullan
      setDamages(mockRoadDamages);
      setHeatZones(createDynamicHeatZones(mockRoadDamages, 300, 2));
    } finally {
      setLoading(false);
    }
  };

  const getMarkerColor = (severity: string) => {
    return severityColors[severity as keyof typeof severityColors] || '#0E7490';
  };

  const handleMarkerPress = (damage: RoadDamage) => {
    setSelectedDamage(damage);
    setActionSheetVisible(true);
  };

  const showDamageDetails = () => {
    setActionSheetVisible(false);
    setTimeout(() => {
      setDialogVisible(true);
    }, 200);
  };

  const openNavigation = () => {
    if (!selectedDamage) return;

    setActionSheetVisible(false);

    const { latitude, longitude } = selectedDamage.coordinate;
    const label = selectedDamage.roadName || 'Hasar Noktası';

    // Google Maps veya Apple Maps ile yol tarifi
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });

    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });

    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=driving`;

    Linking.canOpenURL(googleMapsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(googleMapsUrl);
        } else if (url) {
          return Linking.openURL(url);
        }
      })
      .catch((err) => {
        Alert.alert('Hata', 'Navigasyon uygulaması açılamadı.');
        console.error('Navigation error:', err);
      });
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
        {/* Hasar Noktaları - Basit ve temiz markerlar */}
        {damages.map((damage) => (
          <SimpleMarker
            key={damage.id}
            damage={damage}
            onPress={() => handleMarkerPress(damage)}
            getMarkerColor={getMarkerColor}
          />
        ))}

        {/* Hasar Yoğunluk Alanları */}
        {heatZones.map((zone) => (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            strokeColor={getMarkerColor(zone.severity)}
            fillColor={getMarkerColor(zone.severity) + '40'}
            strokeWidth={3}
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

      {/* Action Sheet Modal */}
      <Modal
        visible={actionSheetVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActionSheetVisible(false)}
      >
        <TouchableOpacity
          style={styles.actionSheetOverlay}
          activeOpacity={1}
          onPress={() => setActionSheetVisible(false)}
        >
          <View style={styles.actionSheetContainer}>
            {/* Handle Bar */}
            <View style={styles.actionSheetHandle} />

            {/* Header */}
            {selectedDamage && (
              <View style={styles.actionSheetHeader}>
                <View style={[styles.actionSheetSeverityDot, { backgroundColor: getMarkerColor(selectedDamage.severity) }]} />
                <View style={styles.actionSheetHeaderText}>
                  <Text style={styles.actionSheetTitle}>
                    {selectedDamage.roadName || 'Hasar Noktası'}
                  </Text>
                  <Text style={styles.actionSheetSubtitle}>
                    {severityNames[selectedDamage.severity]} • {damageTypeNames[selectedDamage.damageType]}
                  </Text>
                </View>
              </View>
            )}

            {/* Buttons */}
            <View style={styles.actionSheetButtons}>
              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={showDamageDetails}
              >
                <View style={[styles.actionSheetButtonIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Text style={styles.actionButtonEmoji}>📋</Text>
                </View>
                <View style={styles.actionSheetButtonContent}>
                  <Text style={styles.actionSheetButtonText}>Hasar Detayı Göster</Text>
                  <Text style={styles.actionSheetButtonDesc}>Detaylı bilgi ve görüntüler</Text>
                </View>
                <Text style={styles.actionSheetArrow}>›</Text>
              </TouchableOpacity>

              <View style={styles.actionSheetDivider} />

              <TouchableOpacity
                style={styles.actionSheetButton}
                onPress={openNavigation}
              >
                <View style={[styles.actionSheetButtonIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Text style={styles.actionButtonEmoji}>🗺️</Text>
                </View>
                <View style={styles.actionSheetButtonContent}>
                  <Text style={styles.actionSheetButtonText}>Yol Tarifi Al</Text>
                  <Text style={styles.actionSheetButtonDesc}>Google Maps ile navigasyon</Text>
                </View>
                <Text style={styles.actionSheetArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* İptal Button */}
            <TouchableOpacity
              style={styles.actionSheetCancelButton}
              onPress={() => setActionSheetVisible(false)}
            >
              <Text style={styles.actionSheetCancelText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
              openNavigation();
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
  // Action Sheet Stilleri
  actionSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  actionSheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
  },
  actionSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  actionSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  actionSheetSeverityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  actionSheetHeaderText: {
    flex: 1,
  },
  actionSheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionSheetSubtitle: {
    fontSize: 13,
    color: '#64748B',
  },
  actionSheetButtons: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionSheetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  actionSheetButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  actionButtonEmoji: {
    fontSize: 22,
  },
  actionSheetButtonContent: {
    flex: 1,
  },
  actionSheetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionSheetButtonDesc: {
    fontSize: 13,
    color: '#64748B',
  },
  actionSheetArrow: {
    fontSize: 24,
    color: '#94A3B8',
    fontWeight: '300',
  },
  actionSheetDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  actionSheetCancelButton: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  actionSheetCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  // Yeni animasyonlu marker stilleri
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
  },
  markerOuterRing: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  markerMain: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  markerIcon: {
    textAlign: 'center',
  },
  markerShadowNew: {
    height: 6,
    borderRadius: 10,
    marginTop: 3,
    opacity: 0.25,
  },
});

export default MapViewScreen;