import {
  Accelerometer,
  Gyroscope,
  AccelerometerMeasurement,
  GyroscopeMeasurement,
} from 'expo-sensors';
import * as Location from 'expo-location';

export interface SensorData {
  accelerometer: AccelerometerMeasurement[];
  gyroscope: GyroscopeMeasurement[];
  timestamp: number;
}

class SensorService {
  private accelerometerData: AccelerometerMeasurement[] = [];
  private gyroscopeData: GyroscopeMeasurement[] = [];
  private accelerometerSubscription: any = null;
  private gyroscopeSubscription: any = null;

  startRecording() {
    this.accelerometerData = [];
    this.gyroscopeData = [];

    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);

    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.accelerometerData.push({
        ...data,
        timestamp: Date.now(),
      });
    });

    this.gyroscopeSubscription = Gyroscope.addListener((data) => {
      this.gyroscopeData.push({
        ...data,
        timestamp: Date.now(),
      });
    });
  }

  stopRecording(): SensorData {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }

    if (this.gyroscopeSubscription) {
      this.gyroscopeSubscription.remove();
      this.gyroscopeSubscription = null;
    }

    return {
      accelerometer: [...this.accelerometerData],
      gyroscope: [...this.gyroscopeData],
      timestamp: Date.now(),
    };
  }

  getData(): SensorData {
    return {
      accelerometer: [...this.accelerometerData],
      gyroscope: [...this.gyroscopeData],
      timestamp: Date.now(),
    };
  }

  clearData() {
    this.accelerometerData = [];
    this.gyroscopeData = [];
  }

  async getLocation(): Promise<Location.LocationObject | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return null;
      }

      return await Location.getCurrentPositionAsync({});
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  }
}

export default new SensorService();
