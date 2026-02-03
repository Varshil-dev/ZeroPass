import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Move,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card, ProgressBar, Badge } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';
import sensorService from '@/services/sensorService';

interface SwipeData {
  direction: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  speed: number;
  distance: number;
  timestamp: number;
}

const DIRECTIONS = ['right', 'down', 'left', 'up'];
const REQUIRED_SWIPES = 3;

export default function SwipeTestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [currentDirection, setCurrentDirection] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [swipeData, setSwipeData] = useState<SwipeData[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [lastSwipeSpeed, setLastSwipeSpeed] = useState<number | null>(null);

  const isRecordingRef = useRef(isRecording);
  const currentDirectionRef = useRef(currentDirection);
  const swipeCountRef = useRef(swipeCount);
  const swipeDataRef = useRef<SwipeData[]>(swipeData);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const swipeIndicatorAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  useEffect(() => {
    currentDirectionRef.current = currentDirection;
  }, [currentDirection]);
  useEffect(() => {
    swipeCountRef.current = swipeCount;
  }, [swipeCount]);
  useEffect(() => {
    swipeDataRef.current = swipeData;
  }, [swipeData]);

  useEffect(() => {
    if (isRecording) {
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
    }
  }, [isRecording]);

  const startPos = useRef({ x: 0, y: 0, time: 0 });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isRecordingRef.current,
      onMoveShouldSetPanResponder: () => isRecordingRef.current,

      onPanResponderGrant: (evt, gestureState) => {
        if (!isRecordingRef.current) return;
        startPos.current = {
          x: (gestureState.x0 ?? evt.nativeEvent.pageX) as number,
          y: (gestureState.y0 ?? evt.nativeEvent.pageY) as number,
          time: Date.now(),
        };
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (!isRecordingRef.current) return;

        const endX = (gestureState.moveX ?? evt.nativeEvent.pageX) as number;
        const endY = (gestureState.moveY ?? evt.nativeEvent.pageY) as number;
        const duration = Date.now() - startPos.current.time;

        const dx = endX - startPos.current.x;
        const dy = endY - startPos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const speed = distance / Math.max(duration, 1);

        let detectedDirection = '';
        if (Math.abs(dx) > Math.abs(dy)) {
          detectedDirection = dx > 0 ? 'right' : 'left';
        } else {
          detectedDirection = dy > 0 ? 'down' : 'up';
        }

        const expectedDirection = DIRECTIONS[currentDirectionRef.current];

        if (detectedDirection === expectedDirection && distance > 50) {
          const swipe: SwipeData = {
            direction: detectedDirection,
            startX: startPos.current.x,
            startY: startPos.current.y,
            endX,
            endY,
            duration,
            speed,
            distance,
            timestamp: Date.now(),
          };

          setLastSwipeSpeed(speed);

          // Animate success feedback
          Animated.sequence([
            Animated.timing(swipeIndicatorAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(swipeIndicatorAnim, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();

          setSwipeData((prev) => {
            const next = [...prev, swipe];
            swipeDataRef.current = next;
            return next;
          });

          const newCount = (swipeCountRef.current ?? 0) + 1;
          setSwipeCount(newCount);
          swipeCountRef.current = newCount;

          if (newCount >= REQUIRED_SWIPES) {
            if (currentDirectionRef.current < DIRECTIONS.length - 1) {
              const nextDir = currentDirectionRef.current + 1;
              setCurrentDirection(nextDir);
              currentDirectionRef.current = nextDir;
              setSwipeCount(0);
              swipeCountRef.current = 0;
            } else {
              handleComplete(swipeDataRef.current);
            }
          }
        }
      },
    })
  ).current;

  const handleStart = () => {
    setIsRecording(true);
    sensorService.startRecording();
  };

  const handleComplete = (finalSwipeData: SwipeData[]) => {
    const sensorData = sensorService.stopRecording();
    setIsRecording(false);

    const swipeTestData = {
      swipes: finalSwipeData,
      sensorData,
    };

    router.push({
      pathname: '/enrollment/tap',
      params: {
        typingData: params.typingData,
        swipeData: JSON.stringify(swipeTestData),
      },
    });
  };

  const getDirectionIcon = (size: number = 64) => {
    const direction = DIRECTIONS[currentDirection];
    const iconProps = { size, color: theme.accent.primary, strokeWidth: 2.5 };

    switch (direction) {
      case 'right':
        return <ChevronRight {...iconProps} />;
      case 'down':
        return <ChevronDown {...iconProps} />;
      case 'left':
        return <ChevronLeft {...iconProps} />;
      case 'up':
        return <ChevronUp {...iconProps} />;
      default:
        return null;
    }
  };

  const progress =
    ((currentDirection * REQUIRED_SWIPES + swipeCount) /
      (DIRECTIONS.length * REQUIRED_SWIPES)) *
    100;

  const averageSpeed = swipeData.length > 0
    ? swipeData.reduce((sum, s) => sum + s.speed, 0) / swipeData.length
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: theme.accent.secondary + '20' },
            ]}
          >
            <Move size={24} color={theme.accent.secondary} />
          </View>
          <Badge
            text={`Step 2 of 4`}
            variant="info"
            size="medium"
          />
        </View>

        <Text style={[styles.title, { color: theme.text.primary }]}>
          Swipe Dynamics
        </Text>

        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Your swipe patterns reveal unique motor control signatures
        </Text>

        <ProgressBar progress={progress} style={styles.progressBar} />

        {isRecording && (
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.primary }]}>
                {DIRECTIONS[currentDirection].toUpperCase()}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Direction
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.success }]}>
                {swipeCount} / {REQUIRED_SWIPES}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Progress
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.warning }]}>
                {averageSpeed.toFixed(1)}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Avg Speed
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      {!isRecording ? (
        <View style={styles.instructionsContainer}>
          <Card variant="elevated" style={styles.instructionCard}>
            <Text style={[styles.instructionTitle, { color: theme.text.primary }]}>
              Swipe in 4 directions
            </Text>
            <View style={styles.directionGrid}>
              {DIRECTIONS.map((dir, index) => (
                <View
                  key={dir}
                  style={[
                    styles.directionPreview,
                    { backgroundColor: theme.background.tertiary },
                  ]}
                >
                  {getDirectionIcon(32)}
                  <Text
                    style={[styles.directionLabel, { color: theme.text.secondary }]}
                  >
                    {dir.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={[styles.instructionText, { color: theme.text.secondary }]}>
              Complete 3 swipes in each direction
            </Text>
          </Card>

          <Button
            title="Start Swipe Test"
            onPress={handleStart}
            variant="primary"
            size="large"
            icon={<Move size={20} color={theme.text.inverse} />}
            style={styles.startButton}
          />

          <Card
            variant="glass"
            style={[
              styles.tipCard,
              { backgroundColor: theme.accent.secondary + '10' },
            ]}
          >
            <Text style={[styles.tipText, { color: theme.text.secondary }]}>
              💡 Swipe naturally and consistently for best results
            </Text>
          </Card>
        </View>
      ) : (
        <View style={styles.swipeArea} {...panResponder.panHandlers}>
          <Animated.View
            style={[
              styles.swipeZone,
              {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.primary,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <View style={styles.iconContainer}>{getDirectionIcon()}</View>

            <Text style={[styles.swipePrompt, { color: theme.text.primary }]}>
              Swipe {DIRECTIONS[currentDirection]}
            </Text>

            <Text style={[styles.swipeCounter, { color: theme.accent.primary }]}>
              {swipeCount} / {REQUIRED_SWIPES}
            </Text>

            {lastSwipeSpeed !== null && (
              <Animated.View
                style={[
                  styles.feedbackBadge,
                  {
                    backgroundColor: theme.accent.success + '20',
                    opacity: swipeIndicatorAnim,
                  },
                ]}
              >
                <Text style={[styles.feedbackText, { color: theme.accent.success }]}>
                  ✓ {lastSwipeSpeed.toFixed(1)} px/ms
                </Text>
              </Animated.View>
            )}
          </Animated.View>

          {/* Visual guide lines */}
          <View style={styles.guideLines}>
            <View
              style={[
                styles.guideLine,
                styles.guideLineHorizontal,
                { backgroundColor: theme.border.primary },
              ]}
            />
            <View
              style={[
                styles.guideLine,
                styles.guideLineVertical,
                { backgroundColor: theme.border.primary },
              ]}
            />
          </View>
        </View>
      )}
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
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  instructionCard: {
    padding: spacing.xl,
  },
  instructionTitle: {
    ...typography.h2,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  directionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  directionPreview: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  directionLabel: {
    ...typography.caption,
    fontWeight: '700',
  },
  instructionText: {
    ...typography.body,
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
  },
  tipCard: {
    padding: spacing.lg,
  },
  tipText: {
    ...typography.bodySmall,
    textAlign: 'center',
  },
  swipeArea: {
    flex: 1,
    position: 'relative',
  },
  swipeZone: {
    flex: 1,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderStyle: 'dashed',
    gap: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
  },
  swipePrompt: {
    ...typography.h2,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  swipeCounter: {
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
  },
  feedbackBadge: {
    position: 'absolute',
    top: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  feedbackText: {
    ...typography.h3,
    fontWeight: '700',
  },
  guideLines: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  guideLine: {
    position: 'absolute',
  },
  guideLineHorizontal: {
    width: '100%',
    height: 1,
    opacity: 0.3,
  },
  guideLineVertical: {
    height: '100%',
    width: 1,
    opacity: 0.3,
  },
});