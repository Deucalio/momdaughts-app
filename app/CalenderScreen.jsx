import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CalendarScreen = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [periodDates, setPeriodDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    loadPeriodData();
  }, []);

  const loadPeriodData = async () => {
    try {
      const data = await AsyncStorage.getItem('cycleData');
      if (data) {
        const parsedData = JSON.parse(data);
        setPeriodDates(parsedData.periods || []);
      }
    } catch (error) {
      console.error('Error loading period data:', error);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isPeriodDate = (dateString) => {
    return periodDates.includes(dateString);
  };

  const isPredictedPeriodDate = (dateString) => {
    if (periodDates.length === 0) return false;
    
    const lastPeriod = new Date(periodDates[periodDates.length - 1]);
    const checkDate = new Date(dateString);
    const daysDiff = Math.floor((checkDate - lastPeriod) / (1000 * 60 * 60 * 24));
    
    return daysDiff > 0 && (daysDiff % 28 >= 26 && daysDiff % 28 <= 30);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const dayHeaders = dayNames.map((day, index) => (
      <Text key={index} style={styles.dayHeader}>{day}</Text>
    ));
    
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDate(year, month, day);
      const isPeriod = isPeriodDate(dateString);
      const isPredicted = isPredictedPeriodDate(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isPeriod && styles.periodDay,
            isPredicted && styles.predictedDay,
            isToday && styles.today,
            selectedDate === dateString && styles.selectedDay,
          ]}
          onPress={() => setSelectedDate(dateString)}
        >
          <Text style={[
            styles.dayText,
            (isPeriod || isPredicted) && styles.periodDayText,
            isToday && styles.todayText,
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.calendar}>
        <View style={styles.dayHeaderRow}>
          {dayHeaders}
        </View>
        <View style={styles.daysGrid}>
          {days}
        </View>
      </View>
    );
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => changeMonth(-1)}>
          <Text style={styles.navButton}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </Text>
        <TouchableOpacity onPress={() => changeMonth(1)}>
          <Text style={styles.navButton}>›</Text>
        </TouchableOpacity>
      </View>

      {renderCalendar()}

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.periodDay]} />
          <Text style={styles.legendText}>Period Days</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.predictedDay]} />
          <Text style={styles.legendText}>Predicted Period</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.today]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  navButton: {
    fontSize: 24,
    color: '#6B46C1',
    fontWeight: 'bold',
    padding: 10,
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  calendar: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
  },
  dayText: {
    fontSize: 16,
    color: '#1F2937',
  },
  periodDay: {
    backgroundColor: '#EC4899',
  },
  predictedDay: {
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#6B46C1',
  },
  today: {
    backgroundColor: '#6B46C1',
  },
  selectedDay: {
    borderWidth: 2,
    borderColor: '#059669',
  },
  periodDayText: {
    color: '#fff',
    fontWeight: '600',
  },
  todayText: {
    color: '#fff',
    fontWeight: '600',
  },
  legend: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  legendText: {
    fontSize: 16,
    color: '#1F2937',
  },
});

export default CalendarScreen;