import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Searchbar,
  Surface,
  Text,
  IconButton
} from 'react-native-paper';
import { RoadDamage } from '../types/DamageTypes';
import { mockRoadDamages, damageTypeNames, severityColors, severityNames } from '../data/mockData';
import { fetchDamages } from '../services/aiService';

const DamageListScreen = () => {
  const [damages, setDamages] = useState<RoadDamage[]>([]);
  const [filteredDamages, setFilteredDamages] = useState<RoadDamage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDamages();
  }, []);

  useEffect(() => {
    filterDamages();
  }, [searchQuery, severityFilter, damages]);

  const loadDamages = async () => {
    setLoading(true);
    try {
      const data = await fetchDamages(mockRoadDamages);
      setDamages(data);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setDamages(mockRoadDamages);
    } finally {
      setLoading(false);
    }
  };

  const filterDamages = () => {
    let filtered = damages;

    if (searchQuery) {
      filtered = filtered.filter(damage =>
        damage.roadName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        damage.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(damage => damage.severity === severityFilter);
    }

    setFilteredDamages(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await fetchDamages(mockRoadDamages);
      setDamages(data);
    } catch (error) {
      console.error('Yenileme hatası:', error);
    } finally {
      setRefreshing(false);
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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'severe': return 'alert-circle';
      case 'moderate': return 'alert';
      case 'none': return 'check-circle';
      default: return 'help-circle';
    }
  };

  return (
    <View style={styles.container}>
      {/* Arama */}
      <Surface style={styles.searchContainer}>
        <Searchbar
          placeholder="Konum veya açıklama ara..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#64748B"
          placeholderTextColor="#94A3B8"
        />
      </Surface>

      {/* Filtreler */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScrollView}
        contentContainerStyle={styles.filterScrollContent}
      >
        <Chip
          selected={severityFilter === 'all'}
          onPress={() => setSeverityFilter('all')}
          style={[styles.filterChip, severityFilter === 'all' && styles.filterChipActive]}
          textStyle={severityFilter === 'all' ? styles.filterChipTextActive : styles.filterChipText}
          mode="flat"
        >
          Tümü ({damages.length})
        </Chip>
        <Chip
          selected={severityFilter === 'severe'}
          onPress={() => setSeverityFilter('severe')}
          style={[styles.filterChip, severityFilter === 'severe' && { backgroundColor: '#FEE2E2' }]}
          textStyle={severityFilter === 'severe' ? { color: '#DC2626' } : styles.filterChipText}
          mode="flat"
        >
          Ağır ({damages.filter(d => d.severity === 'severe').length})
        </Chip>
        <Chip
          selected={severityFilter === 'moderate'}
          onPress={() => setSeverityFilter('moderate')}
          style={[styles.filterChip, severityFilter === 'moderate' && { backgroundColor: '#FFEDD5' }]}
          textStyle={severityFilter === 'moderate' ? { color: '#EA580C' } : styles.filterChipText}
          mode="flat"
        >
          Orta ({damages.filter(d => d.severity === 'moderate').length})
        </Chip>
        <Chip
          selected={severityFilter === 'none'}
          onPress={() => setSeverityFilter('none')}
          style={[styles.filterChip, severityFilter === 'none' && { backgroundColor: '#DCFCE7' }]}
          textStyle={severityFilter === 'none' ? { color: '#16A34A' } : styles.filterChipText}
          mode="flat"
        >
          Hasarsız ({damages.filter(d => d.severity === 'none').length})
        </Chip>
      </ScrollView>

      {/* Hasar Listesi */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0E7490']} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredDamages.map((damage) => (
          <Card key={damage.id} style={styles.damageCard}>
            <View style={styles.cardContent}>
              {/* Sol Renk Göstergesi */}
              <View style={[styles.severityIndicator, { backgroundColor: severityColors[damage.severity] }]} />

              {/* İçerik */}
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.roadName}>{damage.roadName || 'Bilinmeyen Konum'}</Text>
                  <Chip
                    style={[styles.severityChip, { backgroundColor: severityColors[damage.severity] }]}
                    textStyle={styles.severityChipText}
                  >
                    {severityNames[damage.severity]}
                  </Chip>
                </View>

                <Text style={styles.description} numberOfLines={2}>
                  {damage.description}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>🕐 {formatDate(damage.detectedAt)}</Text>
                  <Text style={styles.typeText}>🔧 {damageTypeNames[damage.damageType]}</Text>
                </View>
              </View>
            </View>
          </Card>
        ))}

        {filteredDamages.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>Hasar Kaydı Yok</Text>
            <Text style={styles.emptyText}>
              Henüz kayıtlı hasar bulunmuyor veya arama kriterlerinize uygun sonuç yok.
            </Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  searchbar: {
    backgroundColor: '#FFFFFF',
    elevation: 0,
  },
  filterScrollView: {
    maxHeight: 45,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: '#E0F2FE',
  },
  filterChipText: {
    color: '#64748B',
    fontSize: 13,
  },
  filterChipTextActive: {
    color: '#0E7490',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  damageCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
  },
  severityIndicator: {
    width: 5,
  },
  cardBody: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roadName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  severityChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  severityChipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  typeText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default DamageListScreen;