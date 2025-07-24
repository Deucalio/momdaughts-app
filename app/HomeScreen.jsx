import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = ({ navigation }) => {
  const [cycleData, setCycleData] = useState(null);
  const [nextPeriod, setNextPeriod] = useState(null);

//   useEffect(() => {
//     loadCycleData();
//   }, []);

//   const loadCycleData = async () => {
//     try {
//       const data = await AsyncStorage.getItem('cycleData');
//       if (data) {
//         const parsedData = JSON.parse(data);
//         setCycleData(parsedData);
//         calculateNextPeriod(parsedData);
//       }
//     } catch (error) {
//       console.error('Error loading cycle data:', error);
//     }
//   };

//   const calculateNextPeriod = (data) => {
//     if (data.lastPeriod) {
//       const lastPeriodDate = new Date(data.lastPeriod);
//       const cycleLength = data.cycleLength || 28;
//       const nextPeriodDate = new Date(lastPeriodDate);
//       nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);
//       setNextPeriod(nextPeriodDate);
//     }
//   };

//   const getDaysUntilNextPeriod = () => {
//     if (!nextPeriod) return null;
//     const today = new Date();
//     const diffTime = nextPeriod - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

  const startPeriod = async () => {
    const today = new Date().toISOString().split('T')[0];
    const newCycleData = {
      ...cycleData,
      lastPeriod: today,
      periods: [...(cycleData?.periods || []), today],
    };
    
    try {
      await AsyncStorage.setItem('cycleData', JSON.stringify(newCycleData));
      setCycleData(newCycleData);
      calculateNextPeriod(newCycleData);
      Alert.alert('Period Started', 'Your period has been logged for today.');
    } catch (error) {
      console.error('Error saving period data:', error);
    }
  };

  // const daysUntilNext = getDaysUntilNextPeriod();
  const daysUntilNext = null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MomDaughts</Text>
        <Text style={styles.subtitle}>Her Peace, Our Purpose</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="calendar" size={24} color="#6B46C1" />
          <Text style={styles.cardTitle}>Cycle Overview</Text>
        </View>
        
        {daysUntilNext !== null ? (
          <View style={styles.cycleInfo}>
            <Text style={styles.daysCount}>{daysUntilNext}</Text>
            <Text style={styles.daysLabel}>
              {daysUntilNext === 0 ? 'Period due today' : 
               daysUntilNext === 1 ? 'day until next period' : 
               'days until next period'}
            </Text>
          </View>
        ) : (
          <Text style={styles.noDataText}>
            Start tracking your cycle to see predictions
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.periodButton} onPress={startPeriod}>
        <Ionicons name="water" size={24} color="#fff" />
        <Text style={styles.periodButtonText}>Start Period</Text>
      </TouchableOpacity>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Log')}
        >
          <Ionicons name="add-circle-outline" size={20} color="#6B46C1" />
          <Text style={styles.actionText}>Log Symptoms</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Calendar')}
        >
          <Ionicons name="calendar-outline" size={20} color="#6B46C1" />
          <Text style={styles.actionText}>View Calendar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Insights')}
        >
          <Ionicons name="analytics-outline" size={20} color="#6B46C1" />
          <Text style={styles.actionText}>View Insights</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6B46C1',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  cycleInfo: {
    alignItems: 'center',
  },
  daysCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6B46C1',
  },
  daysLabel: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  periodButton: {
    backgroundColor: '#EC4899',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  periodButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
});

export default HomeScreen;