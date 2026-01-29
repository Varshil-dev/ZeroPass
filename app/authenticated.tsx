import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Lock } from 'lucide-react-native';
import continuousAuthService from '@/services/continuousAuthService';

export default function AuthenticatedScreen() {
  const router = useRouter();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [text, setText] = useState('');

  useEffect(() => {
    startMonitoring();

    return () => {
      continuousAuthService.stopMonitoring();
    };
  }, []);

  const startMonitoring = () => {
    const userId = `user_${Date.now()}`;

    continuousAuthService.startMonitoring(userId, () => {
      router.replace('/lock');
    });

    setIsMonitoring(true);
  };

  const handleTextChange = (newText: string) => {
    setText(newText);

    continuousAuthService.recordTouchEvent({
      type: 'press',
      x: 0,
      y: 0,
      timestamp: Date.now(),
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Shield size={48} color="#34C759" />
        <Text style={styles.title}>Authenticated Mode</Text>
        <View style={styles.statusBadge}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Monitoring Active</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Continuous Authentication</Text>
        <Text style={styles.cardText}>
          Your behavior is being continuously monitored in the background. The
          system analyzes your typing patterns, touch gestures, and device motion
          to ensure it's really you.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Try typing something:</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTextChange}
          placeholder="Type here to test authentication..."
          multiline
        />
      </View>

      <View style={styles.infoCard}>
        <Lock size={24} color="#007AFF" />
        <Text style={styles.infoText}>
          If anomalous behavior is detected, you'll be locked out automatically
        </Text>
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
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#34C759',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  cardText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 21,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 12,
    lineHeight: 21,
  },
});
