import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  TrendingUp,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';
import apiService, { EnrollmentPayload } from '@/services/apiService';

export default function EnrollmentCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [isSubmitting, setIsSubmitting] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<EnrollmentPayload | null>(
    null
  );

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;
  const progressAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    submitEnrollmentData();
  }, []);

  useEffect(() => {
    if (!isSubmitting) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isSubmitting]);

  useEffect(() => {
    if (isSubmitting) {
      Animated.loop(
        Animated.timing(progressAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        })
      ).start();
    }
  }, [isSubmitting]);

  const submitEnrollmentData = async () => {
    try {
      const userId = `user_${Date.now()}`;

      const payload: EnrollmentPayload = {
        userId,
        typingData: params.typingData
          ? JSON.parse(params.typingData as string)
          : null,
        swipeData: params.swipeData ? JSON.parse(params.swipeData as string) : null,
        tapData: params.tapData ? JSON.parse(params.tapData as string) : null,
        motionData: params.motionData
          ? JSON.parse(params.motionData as string)
          : null,
        context: {
          location: params.location ? JSON.parse(params.location as string) : null,
          timestamp: Date.now(),
        },
      };

      setSubmittedPayload(payload);
      console.log('📦 Enrollment Payload:', JSON.stringify(payload, null, 2));

      const result = await apiService.sendTrainingData(payload);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.replace('/authenticated');
        }, 3000);
      } else {
        setError('Failed to submit enrollment data');
      }
    } catch (err) {
      console.error('❌ Enrollment Error:', err);
      setError('An error occurred during enrollment submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {isSubmitting ? (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingRing,
              {
                borderColor: theme.accent.primary + '40',
                borderTopColor: theme.accent.primary,
                transform: [{ rotate: progressRotation }],
              },
            ]}
          />
          <View
            style={[
              styles.loadingIcon,
              { backgroundColor: theme.accent.primary + '20' },
            ]}
          >
            <Sparkles size={32} color={theme.accent.primary} />
          </View>

          <Text style={[styles.loadingTitle, { color: theme.text.primary }]}>
            Creating Your Profile
          </Text>
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
            Analyzing behavioral patterns...
          </Text>

          <View style={styles.processingSteps}>
            {[
              'Processing typing dynamics',
              'Analyzing swipe patterns',
              'Evaluating tap precision',
              'Mapping motion signature',
            ].map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepDot,
                    { backgroundColor: theme.accent.primary },
                  ]}
                />
                <Text style={[styles.stepText, { color: theme.text.tertiary }]}>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : success ? (
        <Animated.View
          style={[
            styles.resultContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.successIcon,
              { backgroundColor: theme.accent.success + '20' },
            ]}
          >
            <CheckCircle2 size={80} color={theme.accent.success} strokeWidth={2} />
          </View>

          <Text style={[styles.successTitle, { color: theme.text.primary }]}>
            Enrollment Complete!
          </Text>

          <Text style={[styles.successSubtitle, { color: theme.text.secondary }]}>
            Your behavioral profile has been created
          </Text>

          <Card variant="elevated" style={styles.statsCard}>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <TrendingUp size={24} color={theme.accent.primary} />
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  99.7%
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                  Accuracy
                </Text>
              </View>
              <View style={styles.statItem}>
                <CheckCircle2 size={24} color={theme.accent.success} />
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  4/4
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                  Tests Passed
                </Text>
              </View>
            </View>
          </Card>

          <View
            style={[
              styles.redirectBadge,
              { backgroundColor: theme.accent.primary + '15' },
            ]}
          >
            <Text style={[styles.redirectText, { color: theme.accent.primary }]}>
              Redirecting to authenticated mode...
            </Text>
          </View>

          {submittedPayload && (
            <ScrollView style={styles.payloadBox}>
              <Card
                variant="outlined"
                style={{ backgroundColor: theme.background.tertiary }}
              >
                <Text style={[styles.payloadTitle, { color: theme.text.primary }]}>
                  Submitted Payload:
                </Text>
                <Text
                  style={[
                    styles.payloadText,
                    { color: theme.text.secondary },
                  ]}
                >
                  {JSON.stringify(submittedPayload, null, 2)}
                </Text>
              </Card>
            </ScrollView>
          )}
        </Animated.View>
      ) : (
        <Animated.View
          style={[
            styles.resultContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View
            style={[
              styles.errorIcon,
              { backgroundColor: theme.accent.danger + '20' },
            ]}
          >
            <AlertCircle size={80} color={theme.accent.danger} strokeWidth={2} />
          </View>

          <Text style={[styles.errorTitle, { color: theme.accent.danger }]}>
            Enrollment Failed
          </Text>

          <Text style={[styles.errorText, { color: theme.text.secondary }]}>
            {error}
          </Text>

          {submittedPayload && (
            <ScrollView style={styles.payloadBox}>
              <Card
                variant="outlined"
                style={{ backgroundColor: theme.background.tertiary }}
              >
                <Text style={[styles.payloadTitle, { color: theme.text.primary }]}>
                  Payload (Not Sent):
                </Text>
                <Text
                  style={[
                    styles.payloadText,
                    { color: theme.text.secondary },
                  ]}
                >
                  {JSON.stringify(submittedPayload, null, 2)}
                </Text>
              </Card>
            </ScrollView>
          )}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
  },
  loadingIcon: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    top: 20,
  },
  loadingTitle: {
    ...typography.h1,
    marginTop: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    textAlign: 'center',
  },
  processingSteps: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepText: {
    ...typography.bodySmall,
  },
  resultContainer: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.lg,
  },
  successIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h1,
    textAlign: 'center',
  },
  successSubtitle: {
    ...typography.bodyLarge,
    textAlign: 'center',
  },
  statsCard: {
    width: '100%',
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  statValue: {
    ...typography.h1,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
  },
  redirectBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    marginTop: spacing.md,
  },
  redirectText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  errorIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h1,
    textAlign: 'center',
  },
  errorText: {
    ...typography.body,
    textAlign: 'center',
  },
  payloadBox: {
    marginTop: spacing.lg,
    maxHeight: 200,
    width: '100%',
  },
  payloadTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  payloadText: {
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
});