import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Chip, 
  List, 
  Searchbar, 
  SegmentedButtons,
  Surface,
  Badge,
  Button
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RoadDamage } from '../types/DamageTypes';
import { mockRoadDamages, damageTypeNames, severityColors, severityNames } from '../data/mockData';

const DamageListScreen = () => {
  const navigation = useNavigation();
  const [damages, setDamages] = useState<RoadDamage[]>(mockRoadDamages);
  const [filteredDamages, setFilteredDamages] = useState<RoadDamage[]>(mockRoadDamages);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    filterDamages();
  }, [searchQuery, severityFilter, damages]);

  const filterDamages = () => {
    let filtered = damages;

    // Arama filtresi
    if (searchQuery) {
      filtered = filtered.filter(damage => 
        damage.roadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        damage.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        damageTypeNames[damage.damageType].toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Seviye filtresi
    if (severityFilter !== 'all') {
      filtered = filtered.filter(damage => damage.severity === severityFilter);
    }

    setFilteredDamages(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setDamages([...mockRoadDamages]);
      setRefreshing(false);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert-circle';
      case 'high': return 'alert';
      case 'medium': return 'minus-circle';
      case 'low': return 'check-circle';
      default: return 'help-circle';
    }
  };

  const handleDamagePress = (damage: RoadDamage) => {
    // TODO: Detay sayfasına git
    console.log('Hasar detayı:', damage.id);
  };

  return (
    <View style={styles.container}>
      {/* Arama çubuğu */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Yol adı, hasar tipi veya açıklama ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </Surface>

      {/* Filtre butonları */}
      <Surface style={styles.filterContainer}>
        <SegmentedButtons
          value={severityFilter}
          onValueChange={setSeverityFilter}
          buttons={[
            { value: 'all', label: 'Tümü' },
            { value: 'critical', label: 'Kritik' },
            { value: 'high', label: 'Yüksek' },
            { value: 'medium', label: 'Orta' },
            { value: 'low', label: 'Düşük' }
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

      {/* Hasar listesi */}
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredDamages.map((damage) => (
          <Card 
            key={damage.id} 
            style={styles.damageCard}
            onPress={() => handleDamagePress(damage)}
          >
            <Card.Content>
              {/* Başlık ve badges */}
              <View style={styles.cardHeader}>
                <View style={styles.titleContainer}>
                  <Title style={styles.roadName}>
                    {damage.roadName || 'Bilinmeyen Yol'}
                  </Title>
                  <View style={styles.badgeContainer}>
                    <Chip 
                      icon={getSeverityIcon(damage.severity)}
                      style={[styles.severityChip, { backgroundColor: severityColors[damage.severity] }]}
                      textStyle={styles.chipText}
                    >
                      {severityNames[damage.severity]}
                    </Chip>
                    <Chip 
                      icon="wrench"
                      style={styles.typeChip}
                      textStyle={styles.typeChipText}
                    >
                      {damageTypeNames[damage.damageType]}
                    </Chip>
                  </View>
                </View>
              </View>

              {/* Açıklama */}
              <Paragraph style={styles.description}>
                {damage.description}
              </Paragraph>

              {/* Detay bilgileri */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <List.Icon icon="target" color="#666" />
                  <Paragraph style={styles.detailText}>
                    Güven: %{damage.confidence}
                  </Paragraph>
                </View>
                
                <View style={styles.detailRow}>
                  <List.Icon icon="priority-high" color="#666" />
                  <Paragraph style={styles.detailText}>
                    Öncelik: {damage.priority}/5
                  </Paragraph>
                </View>

                {damage.estimatedRepairCost && (
                  <View style={styles.detailRow}>
                    <List.Icon icon="currency-try" color="#666" />
                    <Paragraph style={styles.detailText}>
                      Tahmini Maliyet: {formatCurrency(damage.estimatedRepairCost)}
                    </Paragraph>
                  </View>
                )}
              </View>

              {/* Alt bilgiler */}
              <View style={styles.footerContainer}>
                <Paragraph style={styles.dateText}>
                  {formatDate(damage.detectedAt)}
                </Paragraph>
                <View style={styles.statusContainer}>
                  {damage.processed ? (
                    <Badge style={styles.processedBadge}>İşlendi</Badge>
                  ) : (
                    <Badge style={styles.pendingBadge}>Bekliyor</Badge>
                  )}
                </View>
              </View>
            </Card.Content>
          </Card>
        ))}

        {filteredDamages.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <List.Icon icon="database-search" color="#ccc" />
              <Title style={styles.emptyTitle}>Hasar bulunamadı</Title>
              <Paragraph style={styles.emptyText}>
                Arama kriterlerinize uygun hasar kaydı bulunmuyor.
              </Paragraph>
              <Button 
                mode="outlined" 
                onPress={() => {
                  setSearchQuery('');
                  setSeverityFilter('all');
                }}
                style={styles.clearButton}
              >
                Filtreleri Temizle
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
  },
  searchbar: {
    backgroundColor: 'white',
  },
  filterContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 1,
  },
  segmentedButtons: {
    backgroundColor: 'white',
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  damageCard: {
    marginBottom: 12,
    elevation: 3,
    borderRadius: 12,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  roadName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  processedBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  pendingBadge: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  emptyCard: {
    marginTop: 40,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 8,
  },
  clearButton: {
    marginTop: 16,
  },
});

export default DamageListScreen;