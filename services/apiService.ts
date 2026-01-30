export interface EnrollmentPayload {
  userId: string;
  typingData: any;
  swipeData: any;
  tapData: any;
  motionData: any;
  context: {
    location: any;
    timestamp: number;
  };
}

export interface AuthPayload {
  userId: string;
  touchEvents: any[];
  motionData: any;
  context: {
    location: any;
    timestamp: number;
    timeOfDay: string;
  };
}

export interface AuthResponse {
  authenticated: boolean;
  anomaly: boolean;
  confidence?: number;
  message?: string;
}

// ⚠️ Replace with your computer’s LAN IP (not localhost)
// Example: 192.168.1.10 or 10.0.2.2 for emulator
const API_BASE_URL = "http://192.168.1.140:8000"; // <--- CHANGE THIS

class ApiService {
  async sendTrainingData(payload: EnrollmentPayload): Promise<boolean> {
    try {
      // Send to your save-payload API
      const response = await fetch(`${API_BASE_URL}/api/save-payload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Training data submission failed");
      console.log("✅ Payload successfully sent to backend");
      return true;
    } catch (error) {
      console.error("❌ Error sending training data:", error);
      return false;
    }
  }

  async sendAuthData(payload: AuthPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/authenticate`, { //contious auth
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Authentication check failed");

      const data = await response.json();
      console.log('[One-Shot Auth] Result:', data);
      return data;
    } catch (error) {
      console.error("❌ Error sending auth data:", error);
      return { anomaly: false, message: "Network error" };
    }
  }

  async sendContinuousAuthData(payload: AuthPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/continuous-auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Continuous auth check failed");

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("❌ Error sending continuous auth data:", error);
      return { authenticated: true, anomaly: false, message: "Network error (defaulting to authenticated)" };
    }
  }
}

export default new ApiService();
