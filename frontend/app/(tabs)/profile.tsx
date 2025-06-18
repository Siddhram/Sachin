import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import Colors from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userStats, setUserStats] = useState({
    totalSpots: 0,
    totalComments: 0,
    totalVisits: 0,
  });
  const [mySpots, setMySpots] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [profile, spots, favs] = await Promise.all([
        apiService.getProfile(),
        apiService.getMySpots(),
        apiService.getFavorites(),
      ]);
      
      setUserStats(profile.stats || { totalSpots: 0, totalComments: 0, totalVisits: 0 });
      setMySpots(spots);
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  const StatCard = ({ title, value, icon }: { title: string; value: number; icon: string }) => (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon as any} size={24} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
    </View>
  );

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.message, { color: colors.text }]}>Please login to view your profile</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.profileImageContainer}>
          {user.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
              <Ionicons name="person" size={40} color="white" />
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[styles.username, { color: colors.text }]}>{user.username}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
          {user.bio && (
            <Text style={[styles.bio, { color: colors.textSecondary }]}>{user.bio}</Text>
          )}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Activity</Text>
        <View style={styles.statsGrid}>
          <StatCard title="Spots Created" value={userStats.totalSpots} icon="location" />
          <StatCard title="Comments" value={userStats.totalComments} icon="chatbubble" />
          <StatCard title="Visits" value={userStats.totalVisits} icon="footsteps" />
        </View>
      </View>

      {/* My Spots Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Hidden Spots</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {mySpots.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {mySpots.slice(0, 3).map((spot) => (
              <View key={spot._id} style={[styles.spotCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.spotName, { color: colors.text }]} numberOfLines={1}>
                  {spot.name}
                </Text>
                <Text style={[styles.spotCategory, { color: colors.primary }]}>
                  {spot.category}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You haven't created any spots yet
          </Text>
        )}
      </View>

      {/* Favorites Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Favorites</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        
        {favorites.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {favorites.slice(0, 3).map((spot) => (
              <View key={spot._id} style={[styles.spotCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.spotName, { color: colors.text }]} numberOfLines={1}>
                  {spot.name}
                </Text>
                <Text style={[styles.spotCategory, { color: colors.primary }]}>
                  {spot.category}
                </Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            You haven't favorited any spots yet
          </Text>
        )}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        
        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <Ionicons name="person-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <Ionicons name="notifications-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.surface }]}>
          <Ionicons name="shield-outline" size={24} color={colors.text} />
          <Text style={[styles.settingText, { color: colors.text }]}>Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={colors.error} />
          <Text style={[styles.settingText, { color: colors.error }]}>Logout</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 50,
  },
  header: {
    padding: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statTitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  spotCard: {
    width: 150,
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
  },
  spotName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  spotCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
}); 