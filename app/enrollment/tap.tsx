import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const [isActive, setIsActive] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [tapData, setTapData] = useState<TapData[]>([]);
  const [targetPosition, setTargetPosition] = useState({ x: 0, y: 0 });
  const [showTarget, setShowTarget] = useState(false);

  const targetAppearTime = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scaleAnim = useRef(new Animated.Value(0)).current;

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
    const margin = TARGET_SIZE;
    const x = Math.random() * (width - 2 * margin - TARGET_SIZE) + margin;
    const y = Math.random() * (height - 300 - TARGET_SIZE) + 150;

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

    setTapData([...tapData, tap]);
    setTapCount(tapCount + 1);
    setShowTarget(false);
  };

  const handleStart = () => {
    setIsActive(true);
    setTapCount(0);
    setTapData([]);
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tap Reaction Test</Text>
        <Text style={styles.subtitle}>Taps: {tapCount} / {TOTAL_TAPS}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      {!isActive ? (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Tap the circles as quickly as possible when they appear
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Tap Test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.testArea}>
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
                <View style={styles.targetInner} />
              </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  instructions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 27,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testArea: {
    flex: 1,
    position: 'relative',
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
  },
  targetTouchable: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  targetInner: {
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: '#007AFF',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});
