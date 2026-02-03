import React from 'react';
import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';

export default function NotFoundScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.accent.warning + '20' },
          ]}
        >
          <AlertCircle size={64} color={theme.accent.warning} />
        </View>

        <Text style={[styles.title, { color: theme.text.primary }]}>
          Page Not Found
        </Text>

        <Text style={[styles.text, { color: theme.text.secondary }]}>
          This screen doesn't exist.
        </Text>

        <Link href="/" asChild>
          <Button
            title="Go to Home Screen"
            onPress={() => {}}
            variant="primary"
            size="large"
            style={styles.button}
          />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    textAlign: 'center',
  },
  text: {
    ...typography.body,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.lg,
    minWidth: 200,
  },
});