import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Fingerprint, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Theme Toggle */}
      <TouchableOpacity
        style={[styles.themeToggle, { backgroundColor: theme.background.secondary }]}
        onPress={toggleTheme}
        activeOpacity={0.8}
      >
        {isDark ? (
          <Sun size={20} color={theme.accent.warning} />
        ) : (
          <Moon size={20} color={theme.accent.primary} />
        )}
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: theme.accent.primary + '15',
                borderColor: theme.accent.primary + '30',
              },
            ]}
          >
            <Shield size={64} color={theme.accent.primary} strokeWidth={1.5} />
          </View>

          <Text style={[styles.title, { color: theme.text.primary }]}>
            Behavioral{'\n'}Authentication
          </Text>

          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Advanced biometric security through{'\n'}behavioral pattern recognition
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <Card variant="elevated" style={styles.featureCard}>
            <View style={styles.featureContent}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: theme.accent.primary + '20' },
                ]}
              >
                <Fingerprint size={24} color={theme.accent.primary} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text.primary }]}>
                  Unique Patterns
                </Text>
                <Text style={[styles.featureDescription, { color: theme.text.secondary }]}>
                  Your typing, touch, and motion patterns are as unique as your fingerprint
                </Text>
              </View>
            </View>
          </Card>

          <Card variant="elevated" style={styles.featureCard}>
            <View style={styles.featureContent}>
              <View
                style={[
                  styles.featureIcon,
                  { backgroundColor: theme.accent.success + '20' },
                ]}
              >
                <Shield size={24} color={theme.accent.success} />
              </View>
              <View style={styles.featureText}>
                <Text style={[styles.featureTitle, { color: theme.text.primary }]}>
                  Continuous Protection
                </Text>
                <Text style={[styles.featureDescription, { color: theme.text.secondary }]}>
                  Real-time monitoring ensures your account stays secure
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* CTA Buttons */}
        <View style={styles.ctaContainer}>
          <Button
            title="Begin Enrollment"
            onPress={() => router.push('/enrollment/typing')}
            variant="primary"
            size="large"
            style={styles.primaryButton}
          />

          <Button
            title="Skip to Demo"
            onPress={() => router.push('/authenticated')}
            variant="secondary"
            size="large"
          />
        </View>

        {/* Info */}
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: theme.accent.primary + '10',
              borderColor: theme.accent.primary + '20',
            },
          ]}
        >
          <Text style={[styles.infoText, { color: theme.accent.primary }]}>
            ⚡ 5-minute enrollment • 🔒 Zero passwords • 🎯 99.7% accuracy
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxxl * 1.5,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  title: {
    ...typography.display,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.bodyLarge,
    textAlign: 'center',
    lineHeight: 28,
  },
  features: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  featureCard: {
    padding: spacing.lg,
  },
  featureContent: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    gap: spacing.xs,
  },
  featureTitle: {
    ...typography.h3,
  },
  featureDescription: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
  ctaContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    width: '100%',
  },
  infoBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  infoText: {
    ...typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
});