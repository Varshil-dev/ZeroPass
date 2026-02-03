import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Smartphone, Activity } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card, ProgressBar, Badge } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';
import sensorService from '@/services/sensorService';

const HOLD_DURATION = 10;

export default function MotionTestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(HOLD_DURATION);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [isRecording]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRecording && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      handleComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording, countdown]);

  const handleStart = () => {
    setIsRecording(true);
    setCountdown(HOLD_DURATION);
    sensorService.startRecording();
  };

  const handleComplete = async () => {
    const sensorData = sensorService.stopRecording();
    const location = await sensorService.getLocation();
    setIsRecording(false);

    const motionTestData = {
      sensorData,
      duration: HOLD_DURATION,
    };

    router.push({
      pathname: '/enrollment/complete',
      params: {
        typingData: params.typingData,
        swipeData: params.swipeData,
        tapData: params.tapData,
        motionData: JSON.stringify(motionTestData),
        location: JSON.stringify(location),
      },
    });
  };

  const progress = ((HOLD_DURATION - countdown) / HOLD_DURATION) * 100;
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: theme.accent.success + '20' },
            ]}
          >
            <Activity size={24} color={theme.accent.success} />
          </View>
          <Badge text="Step 4 of 4" variant="success" size="medium" />
        </View>

        <Text style={[styles.title, { color: theme.text.primary }]}>
          Motion Signature
        </Text>

        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Micro-movements reveal unique hand tremor patterns
        </Text>

        <ProgressBar
          progress={progress}
          style={styles.progressBar}
          color={theme.accent.success}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!isRecording ? (
          <View style={styles.instructionsContainer}>
            <Card variant="elevated" style={styles.instructionCard}>
              <Animated.View
                style={[
                  styles.phoneIcon,
                  {
                    backgroundColor: theme.accent.success + '15',
                    transform: [{ rotate: rotation }],
                  },
                ]}
              >
                <Smartphone size={64} color={theme.accent.success} />
              </Animated.View>

              <Text style={[styles.instructionTitle, { color: theme.text.primary }]}>
                Hold Still for 10 Seconds
              </Text>

              <Text style={[styles.instructionText, { color: theme.text.secondary }]}>
                Hold your device naturally in one hand while remaining as still as
                possible. We'll capture your unique micro-movement patterns.
              </Text>

              <View style={styles.tips}>
                <View style={styles.tipRow}>
                  <View
                    style={[
                      styles.tipDot,
                      { backgroundColor: theme.accent.success },
                    ]}
                  />
                  <Text style={[styles.tipText, { color: theme.text.secondary }]}>
                    Hold phone comfortably
                  </Text>
                </View>
                <View style={styles.tipRow}>
                  <View
                    style={[
                      styles.tipDot,
                      { backgroundColor: theme.accent.success },
                    ]}
                  />
                  <Text style={[styles.tipText, { color: theme.text.secondary }]}>
                    Keep arm relaxed
                  </Text>
                </View>
                <View style={styles.tipRow}>
                  <View
                    style={[
                      styles.tipDot,
                      { backgroundColor: theme.accent.success },
                    ]}
                  />
                  <Text style={[styles.tipText, { color: theme.text.secondary }]}>
                    Minimize movement
                  </Text>
                </View>
              </View>
            </Card>

            <Button
              title="Begin Motion Test"
              onPress={handleStart}
              variant="primary"
              size="large"
              icon={<Activity size={20} color={theme.text.inverse} />}
              style={styles.startButton}
            />
          </View>
        ) : (
          <View style={styles.recordingContainer}>
            <Animated.View
              style={[
                styles.countdownCircle,
                {
                  backgroundColor: theme.accent.success,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={[styles.countdownText, { color: theme.text.inverse }]}>
                {countdown}
              </Text>
              <Text
                style={[
                  styles.countdownLabel,
                  { color: theme.text.inverse + 'CC' },
                ]}
              >
                seconds
              </Text>
            </Animated.View>

            <Text style={[styles.recordingTitle, { color: theme.text.primary }]}>
              Hold Still
            </Text>

            <View style={styles.recordingInfo}>
              <Animated.View
                style={[
                  styles.recordingDot,
                  { backgroundColor: theme.accent.danger },
                ]}
              />
              <Text style={[styles.recordingText, { color: theme.text.secondary }]}>
                Recording motion data...
              </Text>
            </View>

            {/* Visual stabilization indicator */}
            <Card
              variant="glass"
              style={[
                styles.stabilityCard,
                { backgroundColor: theme.accent.success + '10' },
              ]}
            >
              <View style={styles.stabilityRow}>
                <View style={styles.stabilityBar}>
                  <View
                    style={[
                      styles.stabilityIndicator,
                      {
                        backgroundColor: theme.accent.success,
                        width: `${Math.min((HOLD_DURATION - countdown) * 10, 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.stabilityText, { color: theme.text.tertiary }]}>
                  Stability
                </Text>
              </View>
            </Card>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
    lineHeight: 24,
  },
  progressBar: {
    marginBottom: spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  instructionsContainer: {
    gap: spacing.lg,
  },
  instructionCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  phoneIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  instructionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  instructionText: {
    ...typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  tips: {
    gap: spacing.md,
    width: '100%',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tipText: {
    ...typography.body,
  },
  startButton: {
    width: '100%',
  },
  recordingContainer: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  countdownCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  countdownText: {
    fontSize: 96,
    fontWeight: '800',
    letterSpacing: -4,
  },
  countdownLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  recordingTitle: {
    ...typography.h1,
    textAlign: 'center',
  },
  recordingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  recordingText: {
    ...typography.body,
    fontWeight: '500',
  },
  stabilityCard: {
    width: '100%',
    padding: spacing.lg,
  },
  stabilityRow: {
    gap: spacing.md,
  },
  stabilityBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  stabilityIndicator: {
    height: '100%',
    borderRadius: 4,
  },
  stabilityText: {
    ...typography.caption,
    textAlign: 'center',
  },
});