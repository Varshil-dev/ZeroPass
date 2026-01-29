import { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
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
  const [attempt, setAttempt] = useState(1);
  const [text, setText] = useState('');
  const [keystrokeData, setKeystrokeData] = useState<KeystrokeData[][]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const lastKeyTime = useRef<number>(0);
  const keyPressTime = useRef<number>(0);

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
      const interKeyDelay = lastKeyTime.current === 0 ? 0 : keyPressTime.current - lastKeyTime.current;

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
      alert('Please type the sentence exactly as shown');
      return;
    }

    const sensorData = sensorService.stopRecording();
    setIsRecording(false);

    if (attempt < 2) {
      setAttempt(2);
      alert('Great! Now type it one more time.');
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

  const progress = (attempt - 1) * 50 + (text.length / TARGET_SENTENCE.length) * 50;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Typing Test</Text>
        <Text style={styles.subtitle}>Attempt {attempt} of 2</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.prompt}>Type this sentence:</Text>
        <Text style={styles.targetText}>{TARGET_SENTENCE}</Text>

        {!isRecording ? (
          <TouchableOpacity style={styles.button} onPress={handleStart}>
            <Text style={styles.buttonText}>Start Typing</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={handleChangeText}
              onKeyPress={handleKeyPress}
              placeholder="Start typing here..."
              multiline
              autoFocus
            />

            <TouchableOpacity
              style={[
                styles.button,
                text.toLowerCase() !== TARGET_SENTENCE.toLowerCase() && styles.buttonDisabled,
              ]}
              onPress={handleComplete}
              disabled={text.toLowerCase() !== TARGET_SENTENCE.toLowerCase()}
            >
              <Text style={styles.buttonText}>
                {attempt === 1 ? 'Next Attempt' : 'Complete'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  },
  prompt: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  targetText: {
    fontSize: 16,
    color: '#007AFF',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    lineHeight: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 24,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
