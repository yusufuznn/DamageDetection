import React from 'react';
import { View, ActivityIndicator, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import MapViewScreen from './src/screens/MapViewScreen';
import DamageListScreen from './src/screens/DamageListScreen';
import StatisticsScreen from './src/screens/StatisticsScreen';

const Tab = createBottomTabNavigator();

// Afet Görevlileri için Açık Tema
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0E7490', // Petrol Mavisi
    accent: '#0E7490',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1E293B',
    placeholder: '#64748B',
  },
};

// Loading Screen
function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0E7490" />
    </View>
  );
}

// Ana Uygulama (Tab Navigator)
function MainApp() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Oturumunuzu kapatmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <Tab.Navigator
      initialRouteName="MapView"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'MapView') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'DamageList') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Statistics') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0E7490',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          paddingBottom: 5,
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#E2E8F0',
        },
        headerTintColor: '#1E293B',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        // Header'da kullanıcı bilgisi ve çıkış butonu
        headerRight: () => (
          <TouchableOpacity style={styles.headerRight} onPress={handleLogout}>
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{user?.memberName || 'Kullanıcı'}</Text>
              <Text style={styles.userRole}>{user?.role || ''}</Text>
            </View>
            <View style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={20} color="#DC2626" />
            </View>
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen
        name="MapView"
        component={MapViewScreen}
        options={{
          title: 'Harita',
          tabBarLabel: 'Harita',
          headerShown: false, // Harita tam ekran
        }}
      />
      <Tab.Screen
        name="DamageList"
        component={DamageListScreen}
        options={{
          title: 'Hasarlar',
          tabBarLabel: 'Hasarlar',
          headerTitle: user ? `${user.teamName} - Hasarlar` : 'Hasarlar',
        }}
      />
      <Tab.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{
          title: 'Raporlar',
          tabBarLabel: 'Raporlar',
          headerTitle: user ? `${user.teamName} - Raporlar` : 'Raporlar',
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation Container (Auth durumuna göre)
function AppNavigator() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer>
      <MainApp />
    </NavigationContainer>
  );
}

// Root Component
export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  userInfoContainer: {
    marginRight: 8,
  },
  userName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  userRole: {
    fontSize: 10,
    color: '#64748B',
  },
  logoutButton: {
    padding: 4,
  },
});
