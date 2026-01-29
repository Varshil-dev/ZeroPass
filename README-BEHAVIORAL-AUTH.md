# Behavioral Authentication App

A React Native app built with Expo that implements continuous behavioral authentication by collecting typing patterns, swipe gestures, tap reactions, motion data, and location context.

## Features

### Enrollment Phase
1. **Typing Test** - Captures keystroke dynamics including:
   - Key press/release timestamps
   - Inter-key delay
   - Hold time
   - Touch coordinates
   - Accelerometer & gyroscope data during typing

2. **Swipe Test** - Records swipe patterns:
   - Direction-based swipes (→ ↓ ← ↑)
   - Start/end coordinates
   - Swipe speed and distance
   - Motion sensor data

3. **Tap Reaction Test** - Measures tap behavior:
   - Reaction time to random targets
   - Tap precision (distance from center)
   - Touch pressure (if available)

4. **Motion Test** - Analyzes device hold patterns:
   - 10-second motion capture
   - Accelerometer & gyroscope variance
   - Natural holding behavior

5. **Context Capture**:
   - GPS location
   - Timestamp metadata

### Continuous Authentication Phase
- Real-time monitoring of user behavior in the background
- Collects touch events, motion data, and context
- Sends data batches every 10 seconds to `/api/auth` endpoint
- Automatic lockout on anomaly detection

## API Integration

### Enrollment Endpoint: `/api/train`

**Payload Structure:**
```json
{
  "userId": "user_1234567890",
  "typingData": {
    "attempts": [
      [
        {
          "key": "T",
          "pressTime": 1234567890,
          "releaseTime": 1234567920,
          "holdTime": 30,
          "interKeyDelay": 0
        }
      ]
    ],
    "sensorData": {
      "accelerometer": [...],
      "gyroscope": [...],
      "timestamp": 1234567890
    }
  },
  "swipeData": {
    "swipes": [
      {
        "direction": "right",
        "startX": 100,
        "startY": 200,
        "endX": 300,
        "endY": 200,
        "duration": 250,
        "speed": 0.8,
        "distance": 200,
        "timestamp": 1234567890
      }
    ],
    "sensorData": {...}
  },
  "tapData": {
    "taps": [
      {
        "targetX": 150,
        "targetY": 250,
        "tapX": 148,
        "tapY": 252,
        "reactionTime": 320,
        "distance": 2.8,
        "timestamp": 1234567890
      }
    ],
    "sensorData": {...}
  },
  "motionData": {
    "sensorData": {...},
    "duration": 10
  },
  "context": {
    "location": {
      "coords": {
        "latitude": 37.7749,
        "longitude": -122.4194
      }
    },
    "timestamp": 1234567890
  }
}
```

### Authentication Endpoint: `/api/auth`

**Payload Structure:**
```json
{
  "userId": "user_1234567890",
  "touchEvents": [
    {
      "type": "press",
      "x": 100,
      "y": 200,
      "timestamp": 1234567890,
      "pressure": 0.5
    }
  ],
  "motionData": {
    "accelerometer": [...],
    "gyroscope": [...],
    "timestamp": 1234567890
  },
  "context": {
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "timestamp": 1234567890,
    "timeOfDay": "14:30"
  }
}
```

**Response Structure:**
```json
{
  "anomaly": false,
  "confidence": 0.95,
  "message": "Authentication successful"
}
```

## Configuration

Update the API base URL in `.env`:
```
EXPO_PUBLIC_API_BASE_URL=https://your-api-endpoint.com
```

## Project Structure

```
/app
  ├── index.tsx                    # Home screen
  ├── _layout.tsx                  # Root navigation
  ├── authenticated.tsx            # Authenticated mode with monitoring
  ├── lock.tsx                     # Lock screen on anomaly
  └── /enrollment
      ├── typing.tsx              # Typing test
      ├── swipe.tsx               # Swipe test
      ├── tap.tsx                 # Tap reaction test
      ├── motion.tsx              # Motion test
      └── complete.tsx            # Enrollment submission

/services
  ├── sensorService.ts            # Accelerometer, gyroscope, location
  ├── apiService.ts               # API communication
  └── continuousAuthService.ts    # Background monitoring

/types
  └── env.d.ts                    # Environment variable types
```

## Running the App

```bash
npm install
npm run dev
```

## Technical Notes

- Uses `expo-sensors` for accelerometer and gyroscope
- Uses `expo-location` for GPS data
- Uses `PanResponder` for gesture capture
- Background monitoring runs every 10 seconds
- All sensor data is timestamped for temporal analysis
- Platform: Web (primary), iOS, Android compatible

## Security Considerations

- No sensitive data stored locally
- All biometric data sent to secure backend
- Automatic session termination on anomaly
- Real-time continuous monitoring
