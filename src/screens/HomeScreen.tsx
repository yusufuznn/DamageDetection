import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, FAB, Button, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { mockStatistics } from '../data/mockData';

const HomeScreen = () => {
  const navigation = useNavigation();

  const handleNewDamageReport = () => {
    // TODO: Yeni hasar raporu oluşturma ekranı
    Alert.alert('Bilgi', 'Yeni hasar raporu özelliği yakında eklenecek!');
  };

  const handleViewMap = () => {
    navigation.navigate('MapView' as never);
  };

  const handleViewReports = () => {
    navigation.navigate('DamageList' as never);
  };

  const handleViewStatistics = () => {
    navigation.navigate('Statistics' as never);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Ana Başlık */}
        <Surface style={styles.headerSurface}>
          <Title style={styles.headerTitle}>Hasar Tespit Sistemi</Title>
          <Paragraph style={styles.headerSubtitle}>
            Hasar raporlarınızı kolayca oluşturun ve yönetin
          </Paragraph>
        </Surface>

        {/* Hızlı Eylemler */}
        <View style={styles.quickActions}>
          <Card style={styles.actionCard} onPress={handleNewDamageReport}>
            <Card.Content style={styles.actionCardContent}>
              <Title style={styles.actionTitle}>Yeni Hasar Raporu</Title>
              <Paragraph style={styles.actionDescription}>
                Yeni bir hasar kaydı oluşturun
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={handleViewMap}>
            <Card.Content style={styles.actionCardContent}>
              <Title style={styles.actionTitle}>Harita Görünümü</Title>
              <Paragraph style={styles.actionDescription}>
                Hasar konumlarını haritada görün
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={handleViewReports}>
            <Card.Content style={styles.actionCardContent}>
              <Title style={styles.actionTitle}>Hasar Listesi</Title>
              <Paragraph style={styles.actionDescription}>
                Tüm hasar kayıtlarını görüntüleyin
              </Paragraph>
            </Card.Content>
          </Card>

          <Card style={styles.actionCard} onPress={handleViewStatistics}>
            <Card.Content style={styles.actionCardContent}>
              <Title style={styles.actionTitle}>İstatistikler</Title>
              <Paragraph style={styles.actionDescription}>
                Detaylı analiz ve raporlar
              </Paragraph>
            </Card.Content>
          </Card>
        </View>

        {/* İstatistikler */}
        <Surface style={styles.statsContainer}>
          <Title style={styles.statsTitle}>Özet</Title>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{mockStatistics.totalDamages}</Title>
              <Paragraph style={styles.statLabel}>Toplam Hasar</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{mockStatistics.todayDamages}</Title>
              <Paragraph style={styles.statLabel}>Bugün</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>{mockStatistics.severeCount}</Title>
              <Paragraph style={styles.statLabel}>Ağır Hasarlı</Paragraph>
            </View>
          </View>
        </Surface>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleNewDamageReport}
        label="Yeni Rapor"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  headerSurface: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#6200ea',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 8,
  },
  quickActions: {
    marginBottom: 20,
  },
  actionCard: {
    marginBottom: 12,
    elevation: 3,
  },
  actionCardContent: {
    padding: 20,
  },
  actionTitle: {
    fontSize: 18,
    color: '#6200ea',
    marginBottom: 8,
  },
  actionDescription: {
    color: '#666',
  },
  statsContainer: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 80, // FAB için boşluk
  },
  statsTitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  statLabel: {
    color: '#666',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ea',
  },
});

export default HomeScreen;