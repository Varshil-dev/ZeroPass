import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Shield,
  Lock,
  Activity,
  Eye,
  Unlock,
  AlertTriangle,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, StatusIndicator } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';
import continuousAuthService from '@/services/continuousAuthService';

export default function AuthenticatedScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [text, setText] = useState('');
  const [trustScore, setTrustScore] = useState(98);

  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    startMonitoring();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for shield
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Simulate trust score fluctuation
    const interval = setInterval(() => {
      setTrustScore((prev) => {
        const change = Math.random() * 4 - 2;
        return Math.max(90, Math.min(100, prev + change));
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      continuousAuthService.stopMonitoring();
    };
  }, []);

  const startMonitoring = () => {
    const userId = `user_${Date.now()}`;

    continuousAuthService.startMonitoring(userId, () => {
      router.replace('/lock');
    });

    setIsMonitoring(true);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);

    continuousAuthService.recordTouchEvent({
      type: 'press',
      x: 0,
      y: 0,
      timestamp: Date.now(),
    });
  };

  const getTrustColor = () => {
    if (trustScore >= 95) return theme.accent.success;
    if (trustScore >= 85) return theme.accent.warning;
    return theme.accent.danger;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Animated.View
            style={[
              styles.shieldContainer,
              {
                backgroundColor: theme.accent.success + '15',
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <Shield
              size={64}
              color={theme.accent.success}
              strokeWidth={2}
              fill={theme.accent.success + '40'}
            />
          </Animated.View>

          <Text style={[styles.title, { color: theme.text.primary }]}>
            Protected Session
          </Text>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: theme.accent.success + '20',
                borderColor: theme.accent.success + '40',
              },
            ]}
          >
            <StatusIndicator status="active" size={10} />
            <Text style={[styles.statusText, { color: theme.accent.success }]}>
              Actively Monitoring
            </Text>
          </View>
        </View>

        {/* Trust Score */}
        <Card variant="elevated" style={styles.trustCard}>
          <View style={styles.trustHeader}>
            <View style={styles.trustTitleRow}>
              <Eye size={24} color={theme.accent.primary} />
              <Text style={[styles.trustTitle, { color: theme.text.primary }]}>
                Trust Score
              </Text>
            </View>
            <Text style={[styles.trustValue, { color: getTrustColor() }]}>
              {trustScore.toFixed(1)}%
            </Text>
          </View>

          <View style={styles.trustBarContainer}>
            <View
              style={[
                styles.trustBarBackground,
                { backgroundColor: theme.border.primary },
              ]}
            >
              <Animated.View
                style={[
                  styles.trustBarFill,
                  {
                    backgroundColor: getTrustColor(),
                    width: `${trustScore}%`,
                  },
                ]}
              />
            </View>
          </View>

          <Text style={[styles.trustDescription, { color: theme.text.tertiary }]}>
            Real-time behavioral confidence level
          </Text>
        </Card>

        {/* Monitoring Features */}
        <View style={styles.featuresGrid}>
          <Card variant="outlined" style={styles.featureCard}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.accent.primary + '20' },
              ]}
            >
              <Activity size={20} color={theme.accent.primary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text.primary }]}>
              Typing Patterns
            </Text>
            <StatusIndicator status="active" text="Tracking" size={6} />
          </Card>

          <Card variant="outlined" style={styles.featureCard}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.accent.secondary + '20' },
              ]}
            >
              <Unlock size={20} color={theme.accent.secondary} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text.primary }]}>
              Touch Gestures
            </Text>
            <StatusIndicator status="active" text="Tracking" size={6} />
          </Card>

          <Card variant="outlined" style={styles.featureCard}>
            <View
              style={[
                styles.featureIcon,
                { backgroundColor: theme.accent.success + '20' },
              ]}
            >
              <Shield size={20} color={theme.accent.success} />
            </View>
            <Text style={[styles.featureTitle, { color: theme.text.primary }]}>
              Device Motion
            </Text>
            <StatusIndicator status="active" text="Tracking" size={6} />
          </Card>
        </View>

        {/* Interactive Test Area */}
        <Card variant="elevated" style={styles.testCard}>
          <Text style={[styles.testTitle, { color: theme.text.primary }]}>
            Test Authentication
          </Text>
          <Text style={[styles.testDescription, { color: theme.text.secondary }]}>
            Type naturally to see continuous authentication in action
          </Text>

          <View
            style={[
              styles.inputContainer,
              { backgroundColor: theme.background.tertiary },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.text.primary }]}
              value={text}
              onChangeText={handleTextChange}
              placeholder="Start typing here..."
              placeholderTextColor={theme.text.tertiary}
              multiline
            />
          </View>

          {text.length > 0 && (
            <View style={styles.inputStats}>
              <View style={styles.inputStat}>
                <Text style={[styles.inputStatValue, { color: theme.accent.primary }]}>
                  {text.length}
                </Text>
                <Text style={[styles.inputStatLabel, { color: theme.text.tertiary }]}>
                  characters
                </Text>
              </View>
              <View style={styles.inputStat}>
                <Text
                  style={[styles.inputStatValue, { color: theme.accent.success }]}
                >
                  ✓
                </Text>
                <Text style={[styles.inputStatLabel, { color: theme.text.tertiary }]}>
                  verified
                </Text>
              </View>
            </View>
          )}
        </Card>

        {/* Security Info */}
        <Card
          variant="glass"
          style={[
            styles.infoCard,
            {
              backgroundColor: theme.accent.warning + '10',
              borderColor: theme.accent.warning + '30',
            },
          ]}
        >
          <View style={styles.infoHeader}>
            <Lock size={20} color={theme.accent.warning} />
            <Text style={[styles.infoTitle, { color: theme.accent.warning }]}>
              Automatic Protection
            </Text>
          </View>
          <Text style={[styles.infoText, { color: theme.text.secondary }]}>
            If anomalous behavior is detected, you'll be automatically logged out for
            your security.
          </Text>
        </Card>

        {/* How it Works */}
        <Card variant="outlined" style={styles.howItWorksCard}>
          <Text style={[styles.howItWorksTitle, { color: theme.text.primary }]}>
            How It Works
          </Text>

          <View style={styles.stepsList}>
            {[
              {
                icon: <Activity size={20} color={theme.accent.primary} />,
                title: 'Continuous Analysis',
                description: 'Every interaction is analyzed in real-time',
              },
              {
                icon: <Shield size={20} color={theme.accent.success} />,
                title: 'Pattern Matching',
                description: 'Compared against your unique behavioral signature',
              },
              {
                icon: <AlertTriangle size={20} color={theme.accent.warning} />,
                title: 'Anomaly Detection',
                description: 'Suspicious behavior triggers automatic lockout',
              },
            ].map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepIcon,
                    { backgroundColor: theme.background.tertiary },
                  ]}
                >
                  {step.icon}
                </View>
                <View style={styles.stepContent}>
                  <Text style={[styles.stepTitle, { color: theme.text.primary }]}>
                    {step.title}
                  </Text>
                  <Text
                    style={[styles.stepDescription, { color: theme.text.secondary }]}
                  >
                    {step.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
  },
  content: {
    gap: spacing.lg,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shieldContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  trustCard: {
    padding: spacing.xl,
  },
  trustHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  trustTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trustTitle: {
    ...typography.h3,
  },
  trustValue: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  trustBarContainer: {
    marginBottom: spacing.md,
  },
  trustBarBackground: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  trustBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  trustDescription: {
    ...typography.caption,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  testCard: {
    padding: spacing.xl,
  },
  testTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  testDescription: {
    ...typography.body,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 120,
  },
  input: {
    ...typography.body,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
  },
  inputStat: {
    alignItems: 'center',
  },
  inputStatValue: {
    ...typography.h2,
    fontWeight: '800',
  },
  inputStatLabel: {
    ...typography.caption,
  },
  infoCard: {
    padding: spacing.lg,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    ...typography.h3,
  },
  infoText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
  howItWorksCard: {
    padding: spacing.xl,
  },
  howItWorksTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
  },
  stepsList: {
    gap: spacing.lg,
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
});