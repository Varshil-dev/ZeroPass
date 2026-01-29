import sensorService from './sensorService';
import apiService, { AuthPayload } from './apiService';

export interface TouchEvent {
  type: 'press' | 'release' | 'swipe' | 'tap';
  x: number;
  y: number;
  timestamp: number;
  pressure?: number;
}

class ContinuousAuthService {
  private touchEvents: TouchEvent[] = [];
  private authInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private userId: string = '';
  private onAnomalyDetected: (() => void) | null = null;

  startMonitoring(userId: string, onAnomalyCallback: () => void) {
    if (this.isMonitoring) return;

    this.userId = userId;
    this.onAnomalyDetected = onAnomalyCallback;
    this.isMonitoring = true;
    this.touchEvents = [];

    sensorService.startRecording();

    this.authInterval = setInterval(() => {
      this.performAuthCheck();
    }, 10000);
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;

    if (this.authInterval) {
      clearInterval(this.authInterval);
      this.authInterval = null;
    }

    sensorService.stopRecording();
    this.touchEvents = [];
  }

  recordTouchEvent(event: TouchEvent) {
    if (!this.isMonitoring) return;

    this.touchEvents.push(event);

    if (this.touchEvents.length > 100) {
      this.touchEvents = this.touchEvents.slice(-100);
    }
  }

  private async performAuthCheck() {
    if (this.touchEvents.length === 0) return;

    const location = await sensorService.getLocation();
    const motionData = sensorService.getData();
    const now = new Date();

    const payload: AuthPayload = {
      userId: this.userId,
      touchEvents: [...this.touchEvents],
      motionData,
      context: {
        location: location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }
          : null,
        timestamp: Date.now(),
        timeOfDay: `${now.getHours()}:${now.getMinutes()}`,
      },
    };

    const response = await apiService.sendAuthData(payload);

    if (response.anomaly && this.onAnomalyDetected) {
      this.stopMonitoring();
      this.onAnomalyDetected();
    }

    this.touchEvents = [];
    sensorService.clearData();
  }

  isActive(): boolean {
    return this.isMonitoring;
  }
}

export default new ContinuousAuthService();
