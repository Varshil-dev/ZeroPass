import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ShieldAlert,
  AlertTriangle,
  Home,
  RotateCcw,
  Keyboard,
  Move,
  Target,
  Activity,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';

export default function LockScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const shakeAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Shake animation
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Fade in and scale
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
  }, []);

  const anomalies = [
    {
      icon: <Keyboard size={20} color={theme.accent.danger} />,
      title: 'Typing Patterns',
      description: 'Keystroke dynamics mismatch detected',
    },
    {
      icon: <Move size={20} color={theme.accent.danger} />,
      title: 'Swipe Gestures',
      description: 'Unusual swipe velocity and trajectory',
    },
    {
      icon: <Target size={20} color={theme.accent.danger} />,
      title: 'Tap Precision',
      description: 'Reaction time deviation from baseline',
    },
    {
      icon: <Activity size={20} color={theme.accent.danger} />,
      title: 'Device Motion',
      description: 'Abnormal micro-movement patterns',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
          },
        ]}
      >
        {/* Alert Icon */}
        <View
          style={[
            styles.alertIcon,
            {
              backgroundColor: theme.accent.danger + '20',
              borderColor: theme.accent.danger + '40',
            },
          ]}
        >
          <ShieldAlert
            size={80}
            color={theme.accent.danger}
            strokeWidth={2}
            fill={theme.accent.danger + '30'}
          />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.accent.danger }]}>
          Authentication Failed
        </Text>

        <View
          style={[
            styles.subtitle,
            {
              backgroundColor: theme.accent.danger + '15',
              borderColor: theme.accent.danger + '30',
            },
          ]}
        >
          <AlertTriangle size={16} color={theme.accent.danger} />
          <Text style={[styles.subtitleText, { color: theme.accent.danger }]}>
            Behavioral Anomaly Detected
          </Text>
        </View>

        {/* Explanation Card */}
        <Card variant="elevated" style={styles.explanationCard}>
          <Text style={[styles.explanationTitle, { color: theme.text.primary }]}>
            What happened?
          </Text>
          <Text style={[styles.explanationText, { color: theme.text.secondary }]}>
            Your recent behavioral patterns don't match your enrolled profile. This
            could indicate unauthorized access or unusual circumstances.
          </Text>
        </Card>

        {/* Anomalies List */}
        <Card variant="outlined" style={styles.anomaliesCard}>
          <Text style={[styles.anomaliesTitle, { color: theme.text.primary }]}>
            Detected Anomalies
          </Text>

          <View style={styles.anomaliesList}>
            {anomalies.map((anomaly, index) => (
              <View
                key={index}
                style={[
                  styles.anomalyItem,
                  { borderBottomColor: theme.border.primary },
                  index === anomalies.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View
                  style={[
                    styles.anomalyIcon,
                    { backgroundColor: theme.accent.danger + '15' },
                  ]}
                >
                  {anomaly.icon}
                </View>
                <View style={styles.anomalyContent}>
                  <Text style={[styles.anomalyTitle, { color: theme.text.primary }]}>
                    {anomaly.title}
                  </Text>
                  <Text
                    style={[styles.anomalyDescription, { color: theme.text.tertiary }]}
                  >
                    {anomaly.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button
            title="Return to Home"
            onPress={() => router.replace('/')}
            variant="danger"
            size="large"
            icon={<Home size={20} color={theme.text.inverse} />}
            style={styles.primaryButton}
          />

          <Button
            title="Re-enroll Profile"
            onPress={() => router.replace('/enrollment/typing')}
            variant="secondary"
            size="large"
            icon={<RotateCcw size={20} color={theme.accent.danger} />}
          />
        </View>

        {/* Security Note */}
        <Card
          variant="glass"
          style={[
            styles.securityNote,
            {
              backgroundColor: theme.accent.primary + '10',
              borderColor: theme.accent.primary + '20',
            },
          ]}
        >
          <Text style={[styles.securityNoteText, { color: theme.text.secondary }]}>
            💡 This security measure protects your account from unauthorized access.
            If this was you, try re-enrolling in a comfortable environment.
          </Text>
        </Card>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  content: {
    gap: spacing.lg,
  },
  alertIcon: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
    borderWidth: 3,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  subtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignSelf: 'center',
  },
  subtitleText: {
    ...typography.body,
    fontWeight: '600',
  },
  explanationCard: {
    padding: spacing.xl,
  },
  explanationTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  explanationText: {
    ...typography.body,
    lineHeight: 24,
  },
  anomaliesCard: {
    padding: spacing.xl,
  },
  anomaliesTitle: {
    ...typography.h3,
    marginBottom: spacing.lg,
  },
  anomaliesList: {
    gap: 0,
  },
  anomalyItem: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  anomalyIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  anomalyContent: {
    flex: 1,
  },
  anomalyTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  anomalyDescription: {
    ...typography.bodySmall,
    lineHeight: 18,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  securityNote: {
    padding: spacing.lg,
    borderWidth: 1,
  },
  securityNoteText: {
    ...typography.bodySmall,
    lineHeight: 20,
    textAlign: 'center',
  },
});