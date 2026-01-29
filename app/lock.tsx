import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldAlert } from 'lucide-react-native';

export default function LockScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ShieldAlert size={80} color="#FF3B30" />
      <Text style={styles.title}>Authentication Failed</Text>
      <Text style={styles.subtitle}>Behavior Mismatch Detected</Text>

      <View style={styles.messageCard}>
        <Text style={styles.messageText}>
          Your behavioral patterns don't match your enrolled profile. This could
          be due to:
        </Text>
        <Text style={styles.bulletPoint}>• Different typing patterns</Text>
        <Text style={styles.bulletPoint}>• Unusual touch gestures</Text>
        <Text style={styles.bulletPoint}>• Unexpected device motion</Text>
        <Text style={styles.bulletPoint}>• Location anomalies</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>Return to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.replace('/enrollment/typing')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          Re-enroll Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FF3B30',
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 32,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 21,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 21,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    width: '100%',
    maxWidth: 300,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  secondaryButtonText: {
    color: '#FF3B30',
  },
});
