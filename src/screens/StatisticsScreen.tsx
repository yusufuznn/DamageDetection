import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import {
  Card,
  Title,
  Text,
  Surface,
  ProgressBar,
  Divider,
  List,
} from 'react-native-paper';
import { mockStatistics, mockRoadDamages, severityColors, damageTypeNames } from '../data/mockData';
import { DamageStatistics } from '../types/DamageTypes';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [stats] = useState<DamageStatistics>(mockStatistics);

  const calculateDamageTypeStats = () => {
    const typeStats: { [key: string]: number } = {};
    mockRoadDamages.forEach(damage => {
      typeStats[damage.damageType] = (typeStats[damage.damageType] || 0) + 1;
    });
    return Object.entries(typeStats).map(([type, count]) => ({
      type,
      name: damageTypeNames[type as keyof typeof damageTypeNames],
      count,
      percentage: mockRoadDamages.length > 0 ? (count / mockRoadDamages.length) * 100 : 0
    }));
  };

  const damageTypeStats = calculateDamageTypeStats();

  const getSeverityPercentage = (count: number) => {
    return stats.totalDamages > 0 ? (count / stats.totalDamages) * 100 : 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Özet Kartları */}
      <View style={styles.summaryCards}>
        <Surface style={[styles.summaryCard, { borderLeftColor: '#0E7490' }]}>
          <Text style={[styles.summaryNumber, { color: '#0E7490' }]}>{stats.totalDamages}</Text>
          <Text style={styles.summaryLabel}>Toplam Hasar</Text>
        </Surface>
        <Surface style={[styles.summaryCard, { borderLeftColor: '#DC2626' }]}>
          <Text style={[styles.summaryNumber, { color: '#DC2626' }]}>{stats.severeCount}</Text>
          <Text style={styles.summaryLabel}>Ağır Hasarlı</Text>
        </Surface>
      </View>

      <View style={styles.summaryCards}>
        <Surface style={[styles.summaryCard, { borderLeftColor: '#EA580C' }]}>
          <Text style={[styles.summaryNumber, { color: '#EA580C' }]}>{stats.moderateCount}</Text>
          <Text style={styles.summaryLabel}>Orta Hasarlı</Text>
        </Surface>
        <Surface style={[styles.summaryCard, { borderLeftColor: '#16A34A' }]}>
          <Text style={[styles.summaryNumber, { color: '#16A34A' }]}>{stats.noneCount}</Text>
          <Text style={styles.summaryLabel}>Hasarsız</Text>
        </Surface>
      </View>

      {/* Hasar Seviyesi Dağılımı */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Hasar Seviyesi Dağılımı</Title>

          <View style={styles.barItem}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Ağır Hasarlı</Text>
              <Text style={styles.barValue}>{stats.severeCount}</Text>
            </View>
            <ProgressBar
              progress={getSeverityPercentage(stats.severeCount) / 100}
              color="#DC2626"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.barItem}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Orta Hasarlı</Text>
              <Text style={styles.barValue}>{stats.moderateCount}</Text>
            </View>
            <ProgressBar
              progress={getSeverityPercentage(stats.moderateCount) / 100}
              color="#EA580C"
              style={styles.progressBar}
            />
          </View>

          <View style={styles.barItem}>
            <View style={styles.barHeader}>
              <Text style={styles.barLabel}>Hasarsız</Text>
              <Text style={styles.barValue}>{stats.noneCount}</Text>
            </View>
            <ProgressBar
              progress={getSeverityPercentage(stats.noneCount) / 100}
              color="#16A34A"
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Hasar Tipi Dağılımı */}
      {damageTypeStats.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Hasar Tipi Dağılımı</Title>
            {damageTypeStats.map((item) => (
              <View key={item.type} style={styles.barItem}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>{item.name}</Text>
                  <Text style={styles.barValue}>{item.count}</Text>
                </View>
                <ProgressBar
                  progress={item.percentage / 100}
                  color="#0E7490"
                  style={styles.progressBar}
                />
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Zaman Bazlı */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Zaman Bazlı Analiz</Title>

          <View style={styles.timeItem}>
            <View style={styles.timeIcon}>
              <Text style={styles.timeEmoji}>📅</Text>
            </View>
            <View style={styles.timeContent}>
              <Text style={styles.timeLabel}>Bugün</Text>
              <Text style={styles.timeValue}>{stats.todayDamages} hasar</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.timeItem}>
            <View style={styles.timeIcon}>
              <Text style={styles.timeEmoji}>📆</Text>
            </View>
            <View style={styles.timeContent}>
              <Text style={styles.timeLabel}>Bu Hafta</Text>
              <Text style={styles.timeValue}>{stats.weeklyDamages} hasar</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.timeItem}>
            <View style={styles.timeIcon}>
              <Text style={styles.timeEmoji}>🗓️</Text>
            </View>
            <View style={styles.timeContent}>
              <Text style={styles.timeLabel}>Bu Ay</Text>
              <Text style={styles.timeValue}>{stats.monthlyDamages} hasar</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderLeftWidth: 4,
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  barItem: {
    marginBottom: 16,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 14,
    color: '#1E293B',
  },
  barValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  timeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timeEmoji: {
    fontSize: 18,
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
  },
  timeValue: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
});

export default StatisticsScreen;