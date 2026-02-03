import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Keyboard, CheckCircle2, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card, ProgressBar } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';
import sensorService from '@/services/sensorService';

interface KeystrokeData {
  key: string;
  pressTime: number;
  releaseTime: number;
  holdTime: number;
  interKeyDelay: number;
}

const TARGET_SENTENCE = 'The quick brown fox jumps over the lazy dog';

export default function TypingTestScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [attempt, setAttempt] = useState(1);
  const [text, setText] = useState('');
  const [keystrokeData, setKeystrokeData] = useState<KeystrokeData[][]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const lastKeyTime = useRef<number>(0);
  const keyPressTime = useRef<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleStart = () => {
    setText('');
    setIsRecording(true);
    lastKeyTime.current = 0;
    sensorService.startRecording();
  };

  const handleKeyPress = () => {
    keyPressTime.current = Date.now();
  };

  const handleChangeText = (newText: string) => {
    if (!isRecording) return;

    setText(newText);

    if (newText.length > text.length) {
      const releaseTime = Date.now();
      const key = newText[newText.length - 1];
      const holdTime = releaseTime - keyPressTime.current;
      const interKeyDelay =
        lastKeyTime.current === 0 ? 0 : keyPressTime.current - lastKeyTime.current;

      const currentAttemptData = keystrokeData[attempt - 1] || [];
      currentAttemptData.push({
        key,
        pressTime: keyPressTime.current,
        releaseTime,
        holdTime,
        interKeyDelay,
      });

      const updatedData = [...keystrokeData];
      updatedData[attempt - 1] = currentAttemptData;
      setKeystrokeData(updatedData);

      lastKeyTime.current = releaseTime;
    }
  };

  const handleComplete = () => {
    if (text.toLowerCase() !== TARGET_SENTENCE.toLowerCase()) {
      // Could add a toast/alert here
      return;
    }

    const sensorData = sensorService.stopRecording();
    setIsRecording(false);

    if (attempt < 2) {
      setAttempt(2);
      setText('');
      setIsRecording(true);
      lastKeyTime.current = 0;
      sensorService.startRecording();
    } else {
      const typingData = {
        attempts: keystrokeData,
        sensorData,
      };
      router.push({
        pathname: '/enrollment/swipe',
        params: { typingData: JSON.stringify(typingData) },
      });
    }
  };

  const progress = ((attempt - 1) * 50 + (text.length / TARGET_SENTENCE.length) * 50);
  const isComplete = text.toLowerCase() === TARGET_SENTENCE.toLowerCase();
  const accuracy = text.length > 0
    ? (text.split('').filter((char, i) => char === TARGET_SENTENCE[i]).length / text.length) * 100
    : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: theme.accent.primary + '20' },
            ]}
          >
            <Keyboard size={24} color={theme.accent.primary} />
          </View>
          <View style={styles.attemptBadge}>
            <Text style={[styles.attemptText, { color: theme.text.primary }]}>
              Attempt {attempt} / 2
            </Text>
          </View>
        </View>

        <Text style={[styles.title, { color: theme.text.primary }]}>
          Typing Analysis
        </Text>

        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Your unique typing rhythm creates an unbreakable signature
        </Text>

        <ProgressBar progress={progress} style={styles.progressBar} />

        {isRecording && (
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.primary }]}>
                {text.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Characters
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.success }]}>
                {accuracy.toFixed(0)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Accuracy
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.secondary }]}>
                {keystrokeData[attempt - 1]?.length || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Keystrokes
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Target Text */}
        <Card variant="elevated" style={styles.targetCard}>
          <Text style={[styles.targetLabel, { color: theme.text.tertiary }]}>
            Type this sentence exactly:
          </Text>
          <Text style={[styles.targetText, { color: theme.accent.primary }]}>
            {TARGET_SENTENCE}
          </Text>
        </Card>

        {/* Input Area or Start Button */}
        {!isRecording ? (
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Button
              title="Start Typing"
              onPress={handleStart}
              variant="primary"
              size="large"
              icon={<Keyboard size={20} color={theme.text.inverse} />}
              style={styles.startButton}
            />
          </Animated.View>
        ) : (
          <>
            <Card variant="outlined" style={styles.inputCard}>
              <TextInput
                style={[styles.input, { color: theme.text.primary }]}
                value={text}
                onChangeText={handleChangeText}
                onKeyPress={handleKeyPress}
                placeholder="Start typing here..."
                placeholderTextColor={theme.text.tertiary}
                multiline
                autoFocus
                autoCorrect={false}
                autoCapitalize="none"
              />

              {/* Character by character feedback */}
              <View style={styles.feedback}>
                {text.split('').map((char, index) => {
                  const isCorrect = char === TARGET_SENTENCE[index];
                  return (
                    <View
                      key={index}
                      style={[
                        styles.charIndicator,
                        {
                          backgroundColor: isCorrect
                            ? theme.accent.success + '30'
                            : theme.accent.danger + '30',
                        },
                      ]}
                    />
                  );
                })}
              </View>
            </Card>

            <Button
              title={attempt === 1 ? 'Next Attempt' : 'Complete Test'}
              onPress={handleComplete}
              variant="primary"
              size="large"
              disabled={!isComplete}
              icon={
                isComplete ? (
                  <CheckCircle2 size={20} color={theme.text.inverse} />
                ) : (
                  <ArrowRight size={20} color={theme.text.inverse} />
                )
              }
              style={styles.completeButton}
            />
          </>
        )}

        {/* Instructions */}
        <Card
          variant="glass"
          style={[
            styles.infoCard,
            { backgroundColor: theme.accent.primary + '10' },
          ]}
        >
          <Text style={[styles.infoTitle, { color: theme.accent.primary }]}>
            💡 Pro Tip
          </Text>
          <Text style={[styles.infoText, { color: theme.text.secondary }]}>
            Type naturally at your normal speed. We're measuring timing patterns, not speed.
          </Text>
        </Card>
      </View>
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
  attemptBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  attemptText: {
    ...typography.bodySmall,
    fontWeight: '600',
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    gap: spacing.lg,
  },
  targetCard: {
    padding: spacing.lg,
  },
  targetLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  targetText: {
    ...typography.bodyLarge,
    fontWeight: '600',
    lineHeight: 28,
  },
  startButton: {
    width: '100%',
  },
  inputCard: {
    padding: spacing.lg,
  },
  input: {
    ...typography.body,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  feedback: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: spacing.md,
  },
  charIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  completeButton: {
    width: '100%',
  },
  infoCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
  },
  infoTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    lineHeight: 20,
  },
});