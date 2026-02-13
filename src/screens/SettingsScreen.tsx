import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme, themeConfig } = useThemeStore();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.title, { color: themeConfig.colors.text }]}>
        Settings
      </Text>

      <View style={[styles.section, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeConfig.colors.text }]}>
          Appearance
        </Text>
        
        <View style={styles.row}>
          <View style={styles.rowContent}>
            <Text style={[styles.label, { color: themeConfig.colors.text }]}>
              Dark Mode
            </Text>
            <Text style={[styles.description, { color: themeConfig.colors.textSecondary }]}>
              Toggle between light and dark theme
            </Text>
          </View>
          <Switch 
            value={theme === 'dark'} 
            onValueChange={toggleTheme}
            trackColor={{ false: themeConfig.colors.border, true: themeConfig.colors.primary }}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.sectionTitle, { color: themeConfig.colors.text }]}>
          Account
        </Text>
        
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: themeConfig.colors.textSecondary }]}>
            Name
          </Text>
          <Text style={[styles.infoValue, { color: themeConfig.colors.text }]}>
            {user?.fullName || 'N/A'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: themeConfig.colors.textSecondary }]}>
            Email
          </Text>
          <Text style={[styles.infoValue, { color: themeConfig.colors.text }]}>
            {user?.email || 'N/A'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: themeConfig.colors.error }]}
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Text style={[styles.version, { color: themeConfig.colors.textSecondary }]}>
        Version 1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  rowContent: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto',
    minHeight: 56,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
  },
});
