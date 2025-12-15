import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

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

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
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
              tabBarLabel: 'Hasarlar'
            }}
          />
          <Tab.Screen
            name="Statistics"
            component={StatisticsScreen}
            options={{
              title: 'Raporlar',
              tabBarLabel: 'Raporlar'
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
