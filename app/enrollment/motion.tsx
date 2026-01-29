import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import sensorService from '@/services/sensorService';

const HOLD_DURATION = 10;

export default function MotionTestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(HOLD_DURATION);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Motion Test</Text>
        <Text style={styles.subtitle}>Hold your device still</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        {!isRecording ? (
          <>
            <Text style={styles.instructionText}>
              Hold your phone in one hand naturally for 10 seconds while we
              capture motion patterns
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Start Motion Test</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.recordingContainer}>
            <View style={styles.countdownCircle}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
            <Text style={styles.recordingText}>Hold Still</Text>
            <Text style={styles.recordingSubtext}>
              Recording motion data...
            </Text>
          </View>
        )}
      </View>
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
    marginBottom: 16,
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
  content: {
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
    paddingHorizontal: 20,
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
  recordingContainer: {
    alignItems: 'center',
  },
  countdownCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  countdownText: {
    fontSize: 80,
    fontWeight: '700',
    color: '#fff',
  },
  recordingText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  recordingSubtext: {
    fontSize: 16,
    color: '#666',
  },
});
