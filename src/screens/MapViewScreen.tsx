import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Dimensions, StatusBar, Modal, Image, ScrollView } from 'react-native';
import { FAB, Card, Title, Paragraph, Portal, Dialog, Button, Chip, Text, Surface, TextInput, SegmentedButtons } from 'react-native-paper';
import MapView, { Marker, Region, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { RoadDamage, DamageHeatZone } from '../types/DamageTypes';
import { mockRoadDamages, mockDamageHeatZones, severityColors, damageTypeNames, severityNames } from '../data/mockData';

const { width, height } = Dimensions.get('window');

const MapViewScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [heatZones, setHeatZones] = useState<DamageHeatZone[]>([]);
  const [damages, setDamages] = useState<RoadDamage[]>(mockRoadDamages);
  const [selectedDamage, setSelectedDamage] = useState<RoadDamage | null>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [newDamage, setNewDamage] = useState({
    description: '',
    severity: 'moderate' as 'none' | 'moderate' | 'severe',
    damageType: 'pothole' as 'pothole' | 'crack' | 'surface_wear' | 'edge_damage' | 'water_damage',
  });
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 39.8350,
    longitude: 33.5190,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
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

  const loadDamages = () => {
    setDamages(mockRoadDamages);
    setHeatZones(mockDamageHeatZones);
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

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Kamera İzni', 'Fotoğraf çekmek için kamera iznine ihtiyacımız var.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
      setAddModalVisible(true);
    }
  };

  const openManualForm = () => {
    setCapturedImage(null);
    setAddModalVisible(true);
  };

  const addNewDamageReport = () => {
    Alert.alert(
      'Yeni Hasar Ekle',
      'Fotoğraf çekerek veya manuel olarak hasar kaydı oluşturabilirsiniz.',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Fotoğraf Çek', onPress: openCamera },
        { text: 'Manuel Ekle', onPress: openManualForm },
      ]
    );
  };

  const saveDamage = async () => {
    if (!location) {
      Alert.alert('Hata', 'Konum bilgisi alınamadı. Lütfen konum izni verin.');
      return;
    }

    if (!newDamage.description.trim()) {
      Alert.alert('Hata', 'Lütfen hasar açıklaması girin.');
      return;
    }

    const damage: RoadDamage = {
      id: Date.now().toString(),
      coordinate: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
      damageType: newDamage.damageType,
      severity: newDamage.severity,
      confidence: 100,
      detectedAt: new Date().toISOString(),
      roadName: 'Mevcut Konum',
      description: newDamage.description,
      imageUrl: capturedImage || undefined,
      processed: false,
      priority: newDamage.severity === 'severe' ? 5 : newDamage.severity === 'moderate' ? 3 : 1,
    };

    setDamages([...damages, damage]);
    setAddModalVisible(false);
    setCapturedImage(null);
    setNewDamage({
      description: '',
      severity: 'moderate',
      damageType: 'pothole',
    });

    Alert.alert('Başarılı', 'Hasar kaydı eklendi!');
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
          >
            <View style={[styles.markerContainer, { borderColor: getMarkerColor(damage.severity) }]}>
              <View style={[styles.markerDot, { backgroundColor: getMarkerColor(damage.severity) }]} />
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

      {/* Yeni Hasar Ekle Butonu */}
      <FAB
        style={styles.addFab}
        icon="plus"
        label="Hasar Ekle"
        onPress={addNewDamageReport}
        color="#FFFFFF"
      />

      {/* Hasar Ekleme Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Title style={styles.modalTitle}>Yeni Hasar Ekle</Title>
            <Button onPress={() => setAddModalVisible(false)} textColor="#64748B">İptal</Button>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Fotoğraf Önizleme */}
            {capturedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: capturedImage }} style={styles.imagePreview} />
                <Button
                  mode="outlined"
                  onPress={openCamera}
                  style={styles.retakeButton}
                  icon="camera"
                >
                  Yeniden Çek
                </Button>
              </View>
            )}

            {!capturedImage && (
              <Surface style={styles.noImageContainer}>
                <Text style={styles.noImageIcon}>📷</Text>
                <Text style={styles.noImageText}>Fotoğraf çekilmedi</Text>
                <Button mode="outlined" onPress={openCamera} icon="camera">
                  Fotoğraf Çek
                </Button>
              </Surface>
            )}

            {/* Konum Bilgisi */}
            <Surface style={styles.locationInfo}>
              <Text style={styles.locationLabel}>📍 Mevcut Konum</Text>
              {location ? (
                <Text style={styles.locationCoords}>
                  {location.coords.latitude.toFixed(5)}, {location.coords.longitude.toFixed(5)}
                </Text>
              ) : (
                <Text style={styles.locationCoords}>Konum alınıyor...</Text>
              )}
            </Surface>

            {/* Hasar Seviyesi */}
            <Text style={styles.fieldLabel}>Hasar Seviyesi</Text>
            <View style={styles.severityButtons}>
              <Chip
                selected={newDamage.severity === 'severe'}
                onPress={() => setNewDamage({ ...newDamage, severity: 'severe' })}
                style={[styles.severityChip, newDamage.severity === 'severe' && { backgroundColor: '#FEE2E2' }]}
                textStyle={newDamage.severity === 'severe' ? { color: '#DC2626', fontWeight: 'bold' } : { color: '#64748B' }}
              >
                🔴 Ağır Hasarlı
              </Chip>
              <Chip
                selected={newDamage.severity === 'moderate'}
                onPress={() => setNewDamage({ ...newDamage, severity: 'moderate' })}
                style={[styles.severityChip, newDamage.severity === 'moderate' && { backgroundColor: '#FFEDD5' }]}
                textStyle={newDamage.severity === 'moderate' ? { color: '#EA580C', fontWeight: 'bold' } : { color: '#64748B' }}
              >
                🟠 Orta Hasarlı
              </Chip>
              <Chip
                selected={newDamage.severity === 'none'}
                onPress={() => setNewDamage({ ...newDamage, severity: 'none' })}
                style={[styles.severityChip, newDamage.severity === 'none' && { backgroundColor: '#DCFCE7' }]}
                textStyle={newDamage.severity === 'none' ? { color: '#16A34A', fontWeight: 'bold' } : { color: '#64748B' }}
              >
                🟢 Hasarsız
              </Chip>
            </View>

            {/* Hasar Tipi */}
            <Text style={styles.fieldLabel}>Hasar Tipi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {Object.entries(damageTypeNames).map(([key, name]) => (
                <Chip
                  key={key}
                  selected={newDamage.damageType === key}
                  onPress={() => setNewDamage({ ...newDamage, damageType: key as any })}
                  style={[styles.typeChip, newDamage.damageType === key && { backgroundColor: '#E0F2FE' }]}
                  textStyle={newDamage.damageType === key ? { color: '#0E7490', fontWeight: 'bold' } : { color: '#64748B' }}
                >
                  {name}
                </Chip>
              ))}
            </ScrollView>

            {/* Açıklama */}
            <Text style={styles.fieldLabel}>Açıklama</Text>
            <TextInput
              mode="outlined"
              placeholder="Hasar hakkında detay yazın..."
              value={newDamage.description}
              onChangeText={(text) => setNewDamage({ ...newDamage, description: text })}
              multiline
              numberOfLines={3}
              style={styles.descriptionInput}
              outlineColor="#E2E8F0"
              activeOutlineColor="#0E7490"
            />

            {/* Kaydet Butonu */}
            <Button
              mode="contained"
              onPress={saveDamage}
              style={styles.saveButton}
              buttonColor="#0E7490"
              icon="check"
            >
              Hasar Kaydını Kaydet
            </Button>
          </ScrollView>
        </View>
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
  markerContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationFab: {
    position: 'absolute',
    right: 16,
    top: 130,
    backgroundColor: '#FFFFFF',
  },
  addFab: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    backgroundColor: '#0E7490',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  retakeButton: {
    borderColor: '#0E7490',
  },
  noImageContainer: {
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  noImageIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  noImageText: {
    color: '#64748B',
    marginBottom: 16,
  },
  locationInfo: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 13,
    color: '#64748B',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 8,
    marginTop: 8,
  },
  severityButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  severityChip: {
    backgroundColor: '#FFFFFF',
  },
  typeScroll: {
    marginBottom: 8,
  },
  typeChip: {
    marginRight: 8,
    backgroundColor: '#FFFFFF',
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 40,
    paddingVertical: 8,
    borderRadius: 12,
  },
});

export default MapViewScreen;