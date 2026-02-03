import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Target, Zap } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Button, Card, ProgressBar, Badge } from '@/components/UIComponents';
import { spacing, typography, borderRadius } from '@/theme/theme';
import sensorService from '@/services/sensorService';

interface TapData {
  targetX: number;
  targetY: number;
  tapX: number;
  tapY: number;
  reactionTime: number;
  distance: number;
  timestamp: number;
}

const TOTAL_TAPS = 10;
const MIN_DELAY = 1000;
const MAX_DELAY = 3000;
const TARGET_SIZE = 80;

const { width, height } = Dimensions.get('window');

export default function TapTestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();

  const [isActive, setIsActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [tapData, setTapData] = useState<TapData[]>([]);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [showTarget, setShowTarget] = useState(false);
  const [lastReactionTime, setLastReactionTime] = useState<number | null>(null);
  const [headerHeight, setHeaderHeight] = useState(300);
  const [testAreaDimensions, setTestAreaDimensions] = useState({ width: width, height: height - 300 });

  const targetAppearTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive && tapCount < TOTAL_TAPS) {
      scheduleNextTarget();
    } else if (tapCount >= TOTAL_TAPS) {
      handleComplete();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, tapCount]);

  const scheduleNextTarget = () => {
    const delay = Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY;

    timeoutRef.current = setTimeout(() => {
      showNewTarget();
    }, delay);
  };

  const showNewTarget = () => {
    // Use the actual test area dimensions, not screen dimensions
    const { width: areaWidth, height: areaHeight } = testAreaDimensions;
    
    const SAFE_MARGIN = 20;
    
    // Calculate bounds within the test area container
    const minX = SAFE_MARGIN;
    const maxX = areaWidth - TARGET_SIZE - SAFE_MARGIN;
    
    const minY = SAFE_MARGIN;
    const maxY = areaHeight - TARGET_SIZE - SAFE_MARGIN;
    
    // Ensure valid bounds
    const effectiveMaxX = Math.max(minX + 10, maxX);
    const effectiveMaxY = Math.max(minY + 10, maxY);
    
    // Generate position within test area
    const x = minX + Math.random() * (effectiveMaxX - minX);
    const y = minY + Math.random() * (effectiveMaxY - minY);

    setTargetPosition({ x, y });
    setShowTarget(true);
    targetAppearTime.current = Date.now();

    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 5,
    }).start();
  };

  const handleTap = (event: any) => {
    if (!showTarget) return;

    const tapX = event.nativeEvent.pageX;
    const tapY = event.nativeEvent.pageY;
    const reactionTime = Date.now() - targetAppearTime.current;

    const centerX = targetPosition.x + TARGET_SIZE / 2;
    const centerY = targetPosition.y + TARGET_SIZE / 2;
    const distance = Math.sqrt(
      Math.pow(tapX - centerX, 2) + Math.pow(tapY - centerY, 2)
    );

    const tap: TapData = {
      targetX: centerX,
      targetY: centerY,
      tapX,
      tapY,
      reactionTime,
      distance,
      timestamp: Date.now(),
    };

    setLastReactionTime(reactionTime);
    setTapData([...tapData, tap]);
    setTapCount(tapCount + 1);
    setShowTarget(false);

    // Ripple animation
    rippleAnim.setValue(0);
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handleStart = () => {
    setIsActive(true);
    setTapCount(0);
    setTapData([]);
    setLastReactionTime(null);
    sensorService.startRecording();
  };

  const handleComplete = () => {
    const sensorData = sensorService.stopRecording();
    setIsActive(false);

    const tapTestData = {
      taps: tapData,
      sensorData,
    };

    router.push({
      pathname: '/enrollment/motion',
      params: {
        typingData: params.typingData,
        swipeData: params.swipeData,
        tapData: JSON.stringify(tapTestData),
      },
    });
  };

  const progress = (tapCount / TOTAL_TAPS) * 100;
  const averageReactionTime = tapData.length > 0
    ? tapData.reduce((sum, t) => sum + t.reactionTime, 0) / tapData.length
    : 0;
  const averageAccuracy = tapData.length > 0
    ? tapData.reduce((sum, t) => sum + t.distance, 0) / tapData.length
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {/* Header */}
      <View 
        style={[styles.header, { backgroundColor: theme.background.secondary }]}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeaderHeight(height);
        }}
      >
        <View style={styles.headerTop}>
          <View
            style={[
              styles.iconBadge,
              { backgroundColor: theme.accent.warning + '20' },
            ]}
          >
            <Target size={24} color={theme.accent.warning} />
          </View>
          <Badge text="Step 3 of 4" variant="info" size="medium" />
        </View>

        <Text style={[styles.title, { color: theme.text.primary }]}>
          Reaction Time
        </Text>

        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Tap the targets as quickly as possible
        </Text>

        <ProgressBar progress={progress} style={styles.progressBar} />

        {isActive && tapData.length > 0 && (
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.warning }]}>
                {averageReactionTime.toFixed(0)}ms
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Avg Reaction
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.success }]}>
                {averageAccuracy.toFixed(0)}px
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Avg Accuracy
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.accent.primary }]}>
                {tapCount} / {TOTAL_TAPS}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>
                Progress
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      {!isActive ? (
        <View style={styles.instructionsContainer}>
          <Card variant="elevated" style={styles.instructionCard}>
            <View
              style={[
                styles.demoTarget,
                {
                  backgroundColor: theme.accent.warning + '20',
                  borderColor: theme.accent.warning,
                },
              ]}
            >
              <Target size={48} color={theme.accent.warning} />
            </View>
            <Text style={[styles.instructionTitle, { color: theme.text.primary }]}>
              Tap the targets
            </Text>
            <Text style={[styles.instructionText, { color: theme.text.secondary }]}>
              Targets will appear randomly. Tap them as quickly and accurately as
              possible to measure your reaction time and precision.
            </Text>
          </Card>

          <Button
            title="Start Reaction Test"
            onPress={handleStart}
            variant="primary"
            size="large"
            icon={<Zap size={20} color={theme.text.inverse} />}
            style={styles.startButton}
          />

          <Card
            variant="glass"
            style={[
              styles.tipCard,
              { backgroundColor: theme.accent.warning + '10' },
            ]}
          >
            <Text style={[styles.tipText, { color: theme.text.secondary }]}>
              💡 Stay focused and tap accurately for best results
            </Text>
          </Card>
        </View>
      ) : (
        <View 
          style={styles.testArea}
          onLayout={(event) => {
            const { width: areaWidth, height: areaHeight } = event.nativeEvent.layout;
            setTestAreaDimensions({ width: areaWidth, height: areaHeight });
          }}
        >
          {/* Countdown or waiting indicator */}
          {!showTarget && (
            <View style={styles.waitingIndicator}>
              <Animated.View
                style={[
                  styles.waitingDot,
                  { backgroundColor: theme.accent.primary },
                ]}
              />
              <Text style={[styles.waitingText, { color: theme.text.tertiary }]}>
                Get ready...
              </Text>
            </View>
          )}

          {/* Target */}
          {showTarget && (
            <Animated.View
              style={[
                styles.target,
                {
                  left: targetPosition.x,
                  top: targetPosition.y,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={styles.targetTouchable}
                onPress={handleTap}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.targetOuter,
                    { borderColor: theme.accent.warning + '40' },
                  ]}
                >
                  <View
                    style={[
                      styles.targetInner,
                      { backgroundColor: theme.accent.warning },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Last tap feedback */}
          {lastReactionTime !== null && !showTarget && (
            <Animated.View
              style={[
                styles.feedback,
                {
                  backgroundColor: theme.background.elevated,
                  opacity: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                  transform: [
                    {
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={[styles.feedbackText, { color: theme.accent.success }]}>
                {lastReactionTime}ms
              </Text>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xxxl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    padding: spacing.lg,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  instructionCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  demoTarget: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
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
  testArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    alignSelf: 'stretch',
  },
  waitingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    gap: spacing.md,
    zIndex: 5,
  },
  waitingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  waitingText: {
    ...typography.h3,
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    zIndex: 1,
  },
  targetTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetOuter: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInner: {
    width: TARGET_SIZE * 0.6,
    height: TARGET_SIZE * 0.6,
    borderRadius: (TARGET_SIZE * 0.6) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  feedback: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -60 }, { translateY: -30 }],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  feedbackText: {
    ...typography.h2,
    fontWeight: '800',
  },
});