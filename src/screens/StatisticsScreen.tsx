import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Surface, 
  ProgressBar,
  Divider,
  List,
  Button
} from 'react-native-paper';
import { mockStatistics, mockRoadDamages, severityColors, damageTypeNames, severityNames } from '../data/mockData';
import { DamageStatistics } from '../types/DamageTypes';

const { width } = Dimensions.get('window');

const StatisticsScreen = () => {
  const [stats, setStats] = useState<DamageStatistics>(mockStatistics);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const calculateDamageTypeStats = () => {
    const typeStats: { [key: string]: number } = {};
    mockRoadDamages.forEach(damage => {
      typeStats[damage.damageType] = (typeStats[damage.damageType] || 0) + 1;
    });
    return Object.entries(typeStats).map(([type, count]) => ({
      type,
      name: damageTypeNames[type as keyof typeof damageTypeNames],
      count,
      percentage: (count / mockRoadDamages.length) * 100
    }));
  };

  const damageTypeStats = calculateDamageTypeStats();

  const getSeverityPercentage = (count: number) => {
    return stats.totalDamages > 0 ? (count / stats.totalDamages) * 100 : 0;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Genel Özet */}
      <Surface style={styles.summaryCard}>
        <Title style={styles.sectionTitle}>Genel Durum</Title>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Title style={[styles.summaryNumber, { color: '#6200ea' }]}>
              {stats.totalDamages}
            </Title>
            <Paragraph style={styles.summaryLabel}>Toplam Hasar</Paragraph>
          </View>
          <View style={styles.summaryItem}>
            <Title style={[styles.summaryNumber, { color: '#d32f2f' }]}>
              {stats.criticalCount}
            </Title>
            <Paragraph style={styles.summaryLabel}>Kritik Hasar</Paragraph>
          </View>
          <View style={styles.summaryItem}>
            <Title style={[styles.summaryNumber, { color: '#4caf50' }]}>
              %{stats.averageConfidence}
            </Title>
            <Paragraph style={styles.summaryLabel}>Ort. Güven</Paragraph>
          </View>
          <View style={styles.summaryItem}>
            <Title style={[styles.summaryNumber, { color: '#ff9800' }]}>
              {formatCurrency(stats.estimatedTotalCost)}
            </Title>
            <Paragraph style={styles.summaryLabel}>Tahmini Maliyet</Paragraph>
          </View>
        </View>
      </Surface>

      {/* Önem Seviyesi Dağılımı */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Önem Seviyesi Dağılımı</Title>
          
          <View style={styles.severityItem}>
            <View style={styles.severityHeader}>
              <Paragraph style={styles.severityLabel}>Kritik</Paragraph>
              <Paragraph style={styles.severityCount}>
                {stats.criticalCount} (%{getSeverityPercentage(stats.criticalCount).toFixed(1)})
              </Paragraph>
            </View>
            <ProgressBar 
              progress={getSeverityPercentage(stats.criticalCount) / 100} 
              color={severityColors.critical}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.severityItem}>
            <View style={styles.severityHeader}>
              <Paragraph style={styles.severityLabel}>Yüksek</Paragraph>
              <Paragraph style={styles.severityCount}>
                {stats.highCount} (%{getSeverityPercentage(stats.highCount).toFixed(1)})
              </Paragraph>
            </View>
            <ProgressBar 
              progress={getSeverityPercentage(stats.highCount) / 100} 
              color={severityColors.high}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.severityItem}>
            <View style={styles.severityHeader}>
              <Paragraph style={styles.severityLabel}>Orta</Paragraph>
              <Paragraph style={styles.severityCount}>
                {stats.mediumCount} (%{getSeverityPercentage(stats.mediumCount).toFixed(1)})
              </Paragraph>
            </View>
            <ProgressBar 
              progress={getSeverityPercentage(stats.mediumCount) / 100} 
              color={severityColors.medium}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.severityItem}>
            <View style={styles.severityHeader}>
              <Paragraph style={styles.severityLabel}>Düşük</Paragraph>
              <Paragraph style={styles.severityCount}>
                {stats.lowCount} (%{getSeverityPercentage(stats.lowCount).toFixed(1)})
              </Paragraph>
            </View>
            <ProgressBar 
              progress={getSeverityPercentage(stats.lowCount) / 100} 
              color={severityColors.low}
              style={styles.progressBar}
            />
          </View>
        </Card.Content>
      </Card>

      {/* Hasar Tipi Dağılımı */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Hasar Tipi Dağılımı</Title>
          {damageTypeStats.map((item, index) => (
            <View key={item.type} style={styles.typeItem}>
              <View style={styles.typeHeader}>
                <Paragraph style={styles.typeLabel}>{item.name}</Paragraph>
                <Paragraph style={styles.typeCount}>
                  {item.count} (%{item.percentage.toFixed(1)})
                </Paragraph>
              </View>
              <ProgressBar 
                progress={item.percentage / 100} 
                color="#6200ea"
                style={styles.progressBar}
              />
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Zaman Bazlı İstatistikler */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Zaman Bazlı Analiz</Title>
          
          <List.Item
            title="Bugün"
            description={`${stats.todayDamages} yeni hasar tespit edildi`}
            left={props => <List.Icon {...props} icon="calendar-today" />}
            right={() => (
              <View style={styles.timeStatValue}>
                <Title style={styles.timeStatNumber}>{stats.todayDamages}</Title>
              </View>
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Bu Hafta"
            description={`${stats.weeklyDamages} toplam hasar kaydı`}
            left={props => <List.Icon {...props} icon="calendar-week" />}
            right={() => (
              <View style={styles.timeStatValue}>
                <Title style={styles.timeStatNumber}>{stats.weeklyDamages}</Title>
              </View>
            )}
          />
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Bu Ay"
            description={`${stats.monthlyDamages} toplam hasar kaydı`}
            left={props => <List.Icon {...props} icon="calendar-month" />}
            right={() => (
              <View style={styles.timeStatValue}>
                <Title style={styles.timeStatNumber}>{stats.monthlyDamages}</Title>
              </View>
            )}
          />
        </Card.Content>
      </Card>

      {/* En Yaygın Hasar Tipi */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Öne Çıkan Bilgiler</Title>
          
          <Surface style={styles.highlightCard}>
            <View style={styles.highlightContent}>
              <List.Icon icon="chart-pie" color="#6200ea" />
              <View style={styles.highlightText}>
                <Title style={styles.highlightTitle}>En Yaygın Hasar</Title>
                <Paragraph style={styles.highlightDescription}>
                  {damageTypeNames[stats.mostCommonType as keyof typeof damageTypeNames]}
                </Paragraph>
              </View>
            </View>
          </Surface>

          <Surface style={styles.highlightCard}>
            <View style={styles.highlightContent}>
              <List.Icon icon="target" color="#4caf50" />
              <View style={styles.highlightText}>
                <Title style={styles.highlightTitle}>Ortalama Güven Skoru</Title>
                <Paragraph style={styles.highlightDescription}>
                  %{stats.averageConfidence} (Yüksek güvenilirlik)
                </Paragraph>
              </View>
            </View>
          </Surface>

          <Surface style={styles.highlightCard}>
            <View style={styles.highlightContent}>
              <List.Icon icon="currency-try" color="#ff9800" />
              <View style={styles.highlightText}>
                <Title style={styles.highlightTitle}>Toplam Tahmini Maliyet</Title>
                <Paragraph style={styles.highlightDescription}>
                  {formatCurrency(stats.estimatedTotalCost)}
                </Paragraph>
              </View>
            </View>
          </Surface>
        </Card.Content>
      </Card>

      {/* Alt boşluk */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 3,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  severityItem: {
    marginBottom: 16,
  },
  severityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  severityLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  severityCount: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  typeItem: {
    marginBottom: 16,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  typeCount: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
  timeStatValue: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  timeStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200ea',
  },
  highlightCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
  },
  highlightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    marginLeft: 16,
    flex: 1,
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  highlightDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default StatisticsScreen;