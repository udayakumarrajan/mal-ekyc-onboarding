import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { useVerificationStore } from '../stores/verificationStore';
import { useThemeStore } from '../stores/themeStore';

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const { status, loading, fetchStatus } = useVerificationStore();
  const { themeConfig } = useThemeStore();
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollAttemptsRef = useRef(0);

  // Polling with exponential backoff
  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Setup polling for IN_PROGRESS status
    const startPolling = () => {
      // Clear any existing timeout
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }

      // Calculate delay with exponential backoff
      // Start at 2s, double each time, max 30s
      const baseDelay = 2000;
      const maxDelay = 30000;
      const delay = Math.min(baseDelay * Math.pow(2, pollAttemptsRef.current), maxDelay);

      pollingTimeoutRef.current = setTimeout(async () => {
        await fetchStatus();
        pollAttemptsRef.current += 1;

        // Continue polling if still IN_PROGRESS
        if (status?.status === 'IN_PROGRESS') {
          startPolling();
        } else {
          // Reset counter when status changes
          pollAttemptsRef.current = 0;
        }
      }, delay);
    };

    // Start polling if status is IN_PROGRESS
    if (status?.status === 'IN_PROGRESS') {
      startPolling();
    }

    // Cleanup on unmount
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, [status?.status]);

  const getStatusColor = () => {
    switch (status?.status) {
      case 'APPROVED':
        return themeConfig.colors.success;
      case 'REJECTED':
        return themeConfig.colors.error;
      case 'IN_PROGRESS':
        return themeConfig.colors.info;
      case 'MANUAL_REVIEW':
        return themeConfig.colors.warning;
      default:
        return themeConfig.colors.textSecondary;
    }
  };

  const getStatusMessage = () => {
    switch (status?.status) {
      case 'APPROVED':
        return '✅ Your verification has been approved!';
      case 'REJECTED':
        return '❌ Verification rejected. Please contact support.';
      case 'IN_PROGRESS':
        return '⏳ Verification in progress...';
      case 'MANUAL_REVIEW':
        return '👁️ Under manual review';
      default:
        return 'Not started';
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themeConfig.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.greeting, { color: themeConfig.colors.text }]}>
        Welcome back,
      </Text>
      <Text style={[styles.userName, { color: themeConfig.colors.primary }]}>
        {user?.fullName || 'User'}!
      </Text>

      <View style={[styles.card, { backgroundColor: themeConfig.colors.card }]}>
        <Text style={[styles.cardLabel, { color: themeConfig.colors.textSecondary }]}>
          Verification Status
        </Text>
        {loading ? (
          <ActivityIndicator size="large" color={themeConfig.colors.primary} style={styles.loader} />
        ) : (
          <>
            <Text style={[styles.statusBadge, { color: getStatusColor() }]}>
              {status?.status || 'NOT_STARTED'}
            </Text>
            <Text style={[styles.statusMessage, { color: themeConfig.colors.text }]}>
              {getStatusMessage()}
            </Text>
            {status?.updatedAt && (
              <Text style={[styles.timestamp, { color: themeConfig.colors.textSecondary }]}>
                Updated: {new Date(status.updatedAt).toLocaleString()}
              </Text>
            )}
          </>
        )}
      </View>

      {status?.status !== 'APPROVED' && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: themeConfig.colors.primary }]}
          onPress={() => navigation.navigate('Onboarding' as never)}
        >
          <Text style={styles.buttonText}>
            {status?.status === 'NOT_STARTED' ? '🚀 Start Onboarding' : '📝 Resume Onboarding'}
          </Text>
        </TouchableOpacity>
      )}

      {status?.status === 'APPROVED' && (
        <View style={[styles.approvedBanner, { backgroundColor: themeConfig.colors.success + '20' }]}>
          <Text style={[styles.approvedText, { color: themeConfig.colors.success }]}>
            🎉 Verification Complete!
          </Text>
          <Text style={[styles.approvedSubtext, { color: themeConfig.colors.text }]}>
            Your account is fully verified and ready to use.
          </Text>
        </View>
      )}
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
  greeting: {
    fontSize: 20,
    marginTop: 16,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 12,
    fontWeight: '600',
  },
  statusBadge: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 16,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 8,
  },
  loader: {
    marginVertical: 20,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  approvedBanner: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  approvedText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  approvedSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
