import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CircleCheck as CheckCircle } from "lucide-react-native";
import apiService, { EnrollmentPayload } from "@/services/apiService";

export default function EnrollmentCompleteScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedPayload, setSubmittedPayload] = useState<EnrollmentPayload | null>(null);

  useEffect(() => {
    submitEnrollmentData();
  }, []);

  const submitEnrollmentData = async () => {
    try {
      const userId = `user_${Date.now()}`;

      const payload: EnrollmentPayload = {
        userId,
        typingData: params.typingData ? JSON.parse(params.typingData as string) : null,
        swipeData: params.swipeData ? JSON.parse(params.swipeData as string) : null,
        tapData: params.tapData ? JSON.parse(params.tapData as string) : null,
        motionData: params.motionData ? JSON.parse(params.motionData as string) : null,
        context: {
          location: params.location ? JSON.parse(params.location as string) : null,
          timestamp: Date.now(),
        },
      };

      setSubmittedPayload(payload);
      console.log("📦 Enrollment Payload:", JSON.stringify(payload, null, 2));

      const result = await apiService.sendTrainingData(payload);

      if (result) {
        setSuccess(true);
        setTimeout(() => {
          router.replace("/authenticated");
        }, 3000);
      } else {
        setError("Failed to submit enrollment data");
      }
    } catch (err) {
      console.error("❌ Enrollment Error:", err);
      setError("An error occurred during enrollment submission");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {isSubmitting ? (
        <>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Submitting enrollment data...</Text>
        </>
      ) : success ? (
        <>
          <CheckCircle size={80} color="#34C759" />
          <Text style={styles.successTitle}>Enrollment Complete!</Text>
          <Text style={styles.successSubtitle}>
            Your behavioral profile has been created
          </Text>
          <Text style={styles.redirectText}>Redirecting to authenticated mode...</Text>

          {submittedPayload && (
            <ScrollView style={styles.payloadBox}>
              <Text style={styles.payloadTitle}>Submitted Payload:</Text>
              <Text style={styles.payloadText}>
                {JSON.stringify(submittedPayload, null, 2)}
              </Text>
            </ScrollView>
          )}
        </>
      ) : (
        <>
          <Text style={styles.errorTitle}>Enrollment Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          {submittedPayload && (
            <ScrollView style={styles.payloadBox}>
              <Text style={styles.payloadTitle}>Payload (Not Sent):</Text>
              <Text style={styles.payloadText}>
                {JSON.stringify(submittedPayload, null, 2)}
              </Text>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    marginTop: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 24,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  redirectText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  errorTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FF3B30",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  payloadBox: {
    marginTop: 20,
    maxHeight: 250,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    width: "100%",
  },
  payloadTitle: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  payloadText: {
    fontFamily: "monospace",
    fontSize: 12,
    color: "#333",
  },
});
