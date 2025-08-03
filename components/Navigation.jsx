import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const Navigation = ({ currentRoute = 'shop', cartCount = 0 }) => {
  const router = useRouter();

  const navItems = [
    { id: 'shop', icon: 'storefront-outline', label: 'Shop', route: '/shop' },
    { id: 'tracker', icon: 'calendar-outline', label: 'Tracker', route: '/tracker' },
    { id: 'cart', icon: 'bag-outline', label: 'Cart', route: '/cart', badge: cartCount },
    { id: 'profile', icon: 'person-outline', label: 'Profile', route: '/profile' },
  ];

  return (
    <View style={styles.container}>
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.navItem}
          onPress={() => router.push(item.route)}
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={currentRoute === item.id ? item.icon.replace('-outline', '') : item.icon}
              size={24}
              color={currentRoute === item.id ? '#2b2b6b' : '#040707'}
            />
            {item.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.navLabel,
            { color: currentRoute === item.id ? '#2b2b6b' : '#040707' }
          ]}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2c6df',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#eb9fc1',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Navigation;