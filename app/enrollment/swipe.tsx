import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronRight, ChevronDown, ChevronLeft, ChevronUp } from 'lucide-react-native';
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

  const [currentDirection, setCurrentDirection] = useState(0);
  const [swipeCount, setSwipeCount] = useState(0);
  const [swipeData, setSwipeData] = useState<SwipeData[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  // Refs that keep latest values for handlers (avoid stale closure)
  const isRecordingRef = useRef(isRecording);
  const currentDirectionRef = useRef(currentDirection);
  const swipeCountRef = useRef(swipeCount);
  const swipeDataRef = useRef<SwipeData[]>(swipeData);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { currentDirectionRef.current = currentDirection; }, [currentDirection]);
  useEffect(() => { swipeCountRef.current = swipeCount; }, [swipeCount]);
  useEffect(() => { swipeDataRef.current = swipeData; }, [swipeData]);

  const startPos = useRef({ x: 0, y: 0, time: 0 });

  const panResponder = useRef(
    PanResponder.create({
      // only start responder when recording
      onStartShouldSetPanResponder: () => isRecordingRef.current,
      onMoveShouldSetPanResponder: () => isRecordingRef.current,

      onPanResponderGrant: (evt, gestureState) => {
        if (!isRecordingRef.current) return;
        // use gestureState.x0/y0 for initial touch (more reliable)
        startPos.current = {
          x: (gestureState.x0 ?? evt.nativeEvent.pageX) as number,
          y: (gestureState.y0 ?? evt.nativeEvent.pageY) as number,
          time: Date.now(),
        };
      },

      onPanResponderRelease: (evt, gestureState) => {
        if (!isRecordingRef.current) return;

        // Prefer gestureState.moveX/moveY for end location
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

        // only accept sufficiently large swipe and correct direction
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

          // update swipeData (use functional update + ref sync)
          setSwipeData(prev => {
            const next = [...prev, swipe];
            swipeDataRef.current = next;
            return next;
          });

          // update counts using refs (avoid stale closure)
          const newCount = (swipeCountRef.current ?? 0) + 1;
          setSwipeCount(newCount);
          swipeCountRef.current = newCount;

          // if required swipes for this direction completed
          if (newCount >= REQUIRED_SWIPES) {
            if (currentDirectionRef.current < DIRECTIONS.length - 1) {
              const nextDir = currentDirectionRef.current + 1;
              setCurrentDirection(nextDir);
              currentDirectionRef.current = nextDir;

              // reset count for next direction
              setSwipeCount(0);
              swipeCountRef.current = 0;
            } else {
              // final direction completed — finalize
              // ensure the last swipe is included (we already added it)
              const finalSwipeData = swipeDataRef.current;
              // small timeout to let UI update before navigation if desired
              handleComplete(finalSwipeData);
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
    // stop sensors
    const sensorData = sensorService.stopRecording();
    setIsRecording(false);

    const swipeTestData = {
      swipes: finalSwipeData,
      sensorData,
    };

    // navigate to next enrollment step (passing data)
    router.push({
      pathname: '/enrollment/tap',
      params: {
        typingData: params.typingData,
        swipeData: JSON.stringify(swipeTestData),
      },
    });
  };

  const getDirectionIcon = () => {
    const direction = DIRECTIONS[currentDirection];
    const iconProps = { size: 64, color: '#007AFF' };

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

  const progress = ((currentDirection * REQUIRED_SWIPES + swipeCount) / (DIRECTIONS.length * REQUIRED_SWIPES)) * 100;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Swipe Test</Text>
        <Text style={styles.subtitle}>
          Direction: {DIRECTIONS[currentDirection].toUpperCase()}
        </Text>
        <Text style={styles.subtitle}>
          Swipes: {swipeCount} / {REQUIRED_SWIPES}
        </Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      {!isRecording ? (
        <View style={styles.instructions}>
          <Text style={styles.instructionText}>
            Swipe in each direction (→ ↓ ← ↑) three times each
          </Text>
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Swipe Test</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.swipeArea} {...panResponder.panHandlers}>
          <View style={styles.iconContainer}>{getDirectionIcon()}</View>
          <Text style={styles.swipePrompt}>
            Swipe {DIRECTIONS[currentDirection]}
          </Text>
          <Text style={styles.swipeCount}>
            {swipeCount} / {REQUIRED_SWIPES}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 32,
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
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
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
  swipeArea: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  iconContainer: {
    marginBottom: 24,
  },
  swipePrompt: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  swipeCount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
  },
});
