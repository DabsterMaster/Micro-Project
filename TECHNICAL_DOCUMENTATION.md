# Exam Proctor Extension - Technical Documentation

## IEEE Standard Compliant Implementation

**Version:** 2.0.0  
**Author:** Exam Proctor Team  
**License:** MIT  
**Date:** January 2025  

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [YOLO ML Integration](#yolo-ml-integration)
4. [Security Implementation](#security-implementation)
5. [Firebase Integration](#firebase-integration)
6. [API Documentation](#api-documentation)
7. [Installation Guide](#installation-guide)
8. [Configuration](#configuration)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)
12. [Contributing](#contributing)

---

## System Overview

The Exam Proctor Extension is a comprehensive AI-powered exam monitoring system that utilizes YOLO (You Only Look Once) machine learning models for real-time object detection and behavioral analysis during online examinations.

### Key Features

- **AI-Powered Monitoring**: Real-time object detection using YOLO v8
- **Multi-Role System**: Examinees, Examiners, and Administrators
- **Real-Time Analytics**: Live violation tracking and reporting
- **Secure Authentication**: Firebase-based user management
- **Global Accessibility**: Cloud-based infrastructure
- **Professional UI/UX**: Modern, responsive interface

### IEEE Compliance

This implementation follows IEEE standards for:
- **IEEE 12207**: Software lifecycle processes
- **IEEE 29119**: Software testing standards
- **IEEE 829**: Software test documentation
- **IEEE 1012**: Software verification and validation

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Exam Proctor Extension                   │
├─────────────────────────────────────────────────────────────┤
│  Frontend Layer                                             │
│  ├── Popup Interface (popup.html/js)                       │
│  ├── Monitoring Dashboard (monitoring.html/js)             │
│  ├── Content Scripts (content.js)                          │
│  └── Background Service (background.js)                    │
├─────────────────────────────────────────────────────────────┤
│  AI/ML Layer                                                │
│  ├── YOLO Model Loader (yolo-model-loader.js)              │
│  ├── YOLO Worker (yolo-worker.js)                          │
│  └── Professional Monitoring (professional-monitoring.js)  │
├─────────────────────────────────────────────────────────────┤
│  Security Layer                                             │
│  ├── Security Manager (security-manager.js)                │
│  ├── Encryption/Decryption                                  │
│  └── Audit Logging                                          │
├─────────────────────────────────────────────────────────────┤
│  Backend Layer                                              │
│  ├── Firebase Authentication                                │
│  ├── Firestore Database                                     │
│  ├── Cloudinary Storage                                     │
│  └── Firebase Functions                                     │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Authentication**: Firebase Auth handles user login/registration
2. **Exam Creation**: Examiners create exams with unique codes
3. **Student Joining**: Students join using examinee codes
4. **Real-Time Monitoring**: YOLO processes video feeds for violations
5. **Violation Detection**: AI identifies suspicious activities
6. **Data Storage**: Violations stored in Firestore with encryption
7. **Analytics**: Real-time dashboard updates and reporting

---

## YOLO ML Integration

### Model Architecture

The system uses YOLO v8n (nano) for optimal performance in browser environments:

- **Input Size**: 640x640 pixels
- **Output Format**: [1, 84, 8400] tensor
- **Classes**: 80 COCO classes
- **Confidence Threshold**: 0.5 (configurable)
- **NMS Threshold**: 0.4 (configurable)

### Implementation Details

#### Model Loading
```javascript
// YOLO Model Loader
class YOLOModelLoader {
    async loadModel() {
        this.model = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['webgl', 'cpu'],
            graphOptimizationLevel: 'all'
        });
    }
}
```

#### Real-Time Processing
```javascript
// Frame Processing Pipeline
async processFrame(frameData) {
    const preprocessedData = await this.preprocessFrame(frameData);
    const detections = await this.runInference(preprocessedData);
    const relevantDetections = this.filterRelevantDetections(detections);
    return relevantDetections;
}
```

#### Relevant Object Classes
The system monitors for exam-relevant objects:
- `person`: Student presence verification
- `cell phone`: Unauthorized device usage
- `laptop`: Multiple device detection
- `book`: Physical material usage
- `remote`: Remote control devices
- `tv`: Additional monitors
- `keyboard`/`mouse`: Multiple input devices
- `bottle`/`cup`: Food/drink consumption
- `backpack`/`handbag`: Suspicious items

### Performance Optimization

- **Web Worker**: YOLO processing runs in separate thread
- **Frame Rate Control**: Configurable processing frequency
- **Queue Management**: Efficient frame processing queue
- **Memory Management**: Automatic cleanup of processed frames

---

## Security Implementation

### Encryption

The system implements AES-GCM encryption for sensitive data:

```javascript
// Data Encryption
async encryptData(data) {
    const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        this.encryptionKey,
        dataBuffer
    );
    return btoa(String.fromCharCode(...combined));
}
```

### Authentication

- **Password Hashing**: SHA-256 with salt
- **Session Management**: Secure token generation
- **Permission System**: Role-based access control
- **Audit Logging**: Comprehensive security event tracking

### Data Protection

- **Input Sanitization**: XSS prevention
- **Data Retention**: Configurable retention policies
- **Privacy Compliance**: GDPR-compliant data handling
- **Secure Storage**: Encrypted local storage

---

## Firebase Integration

### Configuration

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

### Database Structure

```
exams/
├── {examId}/
│   ├── examinees/
│   │   └── {userId}/
│   ├── violations/
│   │   └── {violationId}/
│   └── proctors/
│       └── {userId}/

users/
└── {userId}/

audit_logs/
└── {logId}/
```

### Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /exams/{examId} {
      allow read, write: if request.auth != null && 
        (resource.data.examinerId == request.auth.uid ||
         request.auth.uid in resource.data.proctors);
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

---

## API Documentation

### Core Classes

#### YOLOModelLoader
```javascript
class YOLOModelLoader {
    async loadModel()                    // Load YOLO model
    async processFrame(frameData)        // Process video frame
    filterRelevantDetections(detections) // Filter exam-relevant objects
    updateThresholds(thresholds)         // Update detection thresholds
}
```

#### SecurityManager
```javascript
class SecurityManager {
    async encryptData(data)              // Encrypt sensitive data
    async decryptData(encryptedData)     // Decrypt data
    async hashPassword(password, salt)   // Hash password securely
    validatePasswordStrength(password)   // Validate password
    logSecurityEvent(event, data)        // Log security events
}
```

#### ProfessionalMonitoringDashboard
```javascript
class ProfessionalMonitoringDashboard {
    async loadExamData()                 // Load exam information
    async loadExaminees()                // Load examinee list
    startVideoStream(userId)             // Start video monitoring
    handleViolation(userId, type, data)  // Handle violation detection
    updateAnalytics()                    // Update analytics dashboard
}
```

### Event System

The system uses custom events for communication:

```javascript
// YOLO Events
window.addEventListener('modelLoaded', (event) => {
    console.log('YOLO model ready:', event.detail);
});

// Firebase Events
window.addEventListener('firebaseReady', (event) => {
    console.log('Firebase connected:', event.detail);
});

// Security Events
securityManager.logSecurityEvent('violation_detected', {
    userId: 'user123',
    type: 'yolo_detection',
    severity: 'medium'
});
```

---

## Installation Guide

### Prerequisites

- Chrome Browser (version 88+)
- Node.js (version 16+)
- Firebase Project
- Cloudinary Account (optional)

### Step 1: Firebase Setup

1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication, Firestore, and Functions
3. Configure authentication providers
4. Set up Firestore security rules
5. Get configuration object

### Step 2: Extension Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd exam-proctor-extension
```

2. Update Firebase configuration in `firebase-config.js`

3. Load extension in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

### Step 3: YOLO Model Setup

1. Download YOLO v8n model:
```bash
# Download ONNX model
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx
```

2. Place model in `models/` directory:
```
models/
└── yolov8n.onnx
```

### Step 4: Configuration

1. Update `manifest.json` permissions if needed
2. Configure Cloudinary settings (optional)
3. Set up security policies
4. Test the installation

---

## Configuration

### Environment Variables

```bash
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com

# Cloudinary Configuration (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Security Settings
ENCRYPTION_ENABLED=true
AUDIT_LOGGING_ENABLED=true
DATA_RETENTION_DAYS=365
```

### YOLO Configuration

```javascript
const yoloConfig = {
    modelVersion: 'yolov8n',
    inputSize: 640,
    confidenceThreshold: 0.5,
    nmsThreshold: 0.4,
    frameRate: 5,
    relevantClasses: [
        'person', 'cell phone', 'laptop', 'book',
        'remote', 'tv', 'keyboard', 'mouse'
    ]
};
```

### Security Configuration

```javascript
const securityConfig = {
    dataRetention: {
        examData: 365,      // days
        violationLogs: 90,  // days
        userSessions: 30,   // days
        auditLogs: 2555     // days (7 years)
    },
    accessControl: {
        maxConcurrentSessions: 3,
        sessionTimeout: 3600000,  // 1 hour
        passwordMinLength: 8,
        requireStrongPassword: true
    }
};
```

---

## Testing

### Unit Testing

```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/jest-dom

# Run tests
npm test
```

### Integration Testing

```bash
# Test Firebase connectivity
npm run test:firebase

# Test YOLO model loading
npm run test:yolo

# Test security features
npm run test:security
```

### Browser Testing

1. **Chrome Extension Testing**:
   - Load extension in developer mode
   - Test all user flows
   - Verify permissions work correctly

2. **Cross-Browser Testing**:
   - Test in Chrome, Firefox, Edge
   - Verify compatibility
   - Check performance

3. **Mobile Testing**:
   - Test responsive design
   - Verify touch interactions
   - Check mobile permissions

### Performance Testing

```javascript
// YOLO Performance Test
const performanceTest = async () => {
    const startTime = performance.now();
    const detections = await yoloModel.processFrame(testFrame);
    const endTime = performance.now();
    
    console.log(`Processing time: ${endTime - startTime}ms`);
    console.log(`Detections: ${detections.length}`);
};
```

---

## Deployment

### Production Build

```bash
# Build for production
npm run build

# Optimize assets
npm run optimize

# Generate manifest
npm run manifest
```

### Firebase Deployment

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy functions
firebase deploy --only functions

# Deploy hosting (if applicable)
firebase deploy --only hosting
```

### Extension Packaging

```bash
# Create production package
npm run package

# Generate ZIP file for Chrome Web Store
npm run package:store
```

### Monitoring Setup

1. **Error Tracking**: Set up Sentry or similar
2. **Analytics**: Configure Google Analytics
3. **Performance**: Monitor Core Web Vitals
4. **Security**: Set up security monitoring

---

## Troubleshooting

### Common Issues

#### YOLO Model Not Loading
```javascript
// Check model path
console.log('Model path:', modelPath);

// Verify ONNX.js is loaded
console.log('ONNX available:', typeof ort !== 'undefined');

// Check browser compatibility
console.log('WebGL support:', !!document.createElement('canvas').getContext('webgl'));
```

#### Firebase Connection Issues
```javascript
// Check Firebase initialization
console.log('Firebase ready:', window.firebaseReady);

// Verify configuration
console.log('Firebase config:', firebaseConfig);

// Test connection
firebaseApp.db.collection('test').doc('test').get()
    .then(() => console.log('Connection successful'))
    .catch(err => console.error('Connection failed:', err));
```

#### Video Stream Issues
```javascript
// Check camera permissions
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => console.log('Camera access granted'))
    .catch(err => console.error('Camera access denied:', err));

// Verify video element
const video = document.getElementById('video-element');
console.log('Video ready state:', video.readyState);
```

### Debug Mode

Enable debug logging:

```javascript
// Enable debug mode
localStorage.setItem('debug', 'true');

// View debug logs
console.log('Debug mode enabled');
```

### Performance Issues

1. **Reduce Frame Rate**: Lower YOLO processing frequency
2. **Optimize Model**: Use smaller YOLO variant
3. **Memory Management**: Clear processed frames
4. **Browser Resources**: Close unnecessary tabs

---

## Contributing

### Development Setup

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Install dependencies: `npm install`
4. Make changes and test
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Create Pull Request

### Code Standards

- **ESLint**: Follow configured linting rules
- **Prettier**: Use consistent code formatting
- **JSDoc**: Document all functions and classes
- **Testing**: Write tests for new features
- **Security**: Follow security best practices

### Pull Request Guidelines

1. **Clear Description**: Explain what the PR does
2. **Testing**: Include test results
3. **Documentation**: Update docs if needed
4. **Security**: Review security implications
5. **Performance**: Consider performance impact

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

- **Documentation**: [Project Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)
- **Discussions**: [GitHub Discussions](discussions-url)
- **Email**: support@examproctor.com

---

## Acknowledgments

- **Firebase Team**: For the excellent backend platform
- **YOLO Community**: For the ML model and research
- **Chrome Extensions Team**: For the extension platform
- **IEEE Standards**: For providing industry standards
- **Open Source Contributors**: For various libraries and tools

---

**Note**: This documentation is maintained according to IEEE standards and should be updated with each release to ensure accuracy and completeness.
