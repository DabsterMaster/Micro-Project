# Exam Proctor Extension - Professional Setup Guide

## IEEE Standard Compliant Installation

This guide will walk you through setting up the Exam Proctor Extension for professional use in educational institutions.

---

## 📋 Prerequisites

### System Requirements
- **Chrome Browser**: Version 88 or higher
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Internet Connection**: Stable broadband connection
- **Camera**: Webcam for student monitoring
- **Microphone**: Optional, for audio monitoring

### Accounts Required
- **Firebase Account**: [console.firebase.google.com](https://console.firebase.google.com)
- **Cloudinary Account**: [cloudinary.com](https://cloudinary.com) (optional)
- **GitHub Account**: For source code access

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Download Extension
```bash
# Clone the repository
git clone https://github.com/yourusername/exam-proctor-extension.git
cd exam-proctor-extension
```

### Step 2: Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enable Authentication, Firestore, and Functions
4. Copy your configuration

### Step 3: Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select extension folder
4. Pin extension to toolbar

### Step 4: Configure
1. Click extension icon
2. Update Firebase config in settings
3. Test with a sample exam

---

## 🔧 Detailed Setup

### Firebase Configuration

#### 1. Create Firebase Project
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project
firebase init
```

#### 2. Enable Services
- **Authentication**: Email/Password, Google
- **Firestore**: Real-time database
- **Functions**: Serverless backend
- **Storage**: File storage (optional)

#### 3. Security Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Exams: examiners can manage their exams
    match /exams/{examId} {
      allow read: if request.auth != null && 
        (resource.data.status == 'active' || 
         resource.data.examinerId == request.auth.uid);
      allow write: if request.auth != null && 
        resource.data.examinerId == request.auth.uid;
    }
    
    // Violations: only examiners can access
    match /exams/{examId}/violations/{violationId} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/exams/$(examId)).data.examinerId == request.auth.uid;
    }
  }
}
```

#### 4. Update Configuration
```javascript
// firebase-config.js
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};
```

### YOLO Model Setup

#### 1. Download Model
```bash
# Create models directory
mkdir models

# Download YOLO v8n model
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx -O models/yolov8n.onnx
```

#### 2. Verify Model
```javascript
// Test model loading
const testModel = async () => {
    try {
        const model = await ort.InferenceSession.create('models/yolov8n.onnx');
        console.log('YOLO model loaded successfully');
        return true;
    } catch (error) {
        console.error('Model loading failed:', error);
        return false;
    }
};
```

### Security Configuration

#### 1. Encryption Setup
```javascript
// security-manager.js
const securityConfig = {
    encryption: {
        algorithm: 'AES-GCM',
        keyLength: 256
    },
    password: {
        minLength: 8,
        requireSpecialChars: true,
        requireNumbers: true
    },
    session: {
        timeout: 3600000, // 1 hour
        maxConcurrent: 3
    }
};
```

#### 2. Audit Logging
```javascript
// Enable comprehensive logging
const auditConfig = {
    enabled: true,
    retention: 2555, // 7 years
    events: [
        'user_login',
        'exam_created',
        'violation_detected',
        'data_export'
    ]
};
```

---

## 🎯 Usage Guide

### For Examiners

#### Creating an Exam
1. **Login**: Use your institutional email
2. **Create Exam**: Click "Create Exam" tab
3. **Configure Settings**:
   - Exam title and description
   - Duration (15-480 minutes)
   - Organization restrictions (optional)
4. **Generate Codes**: System creates unique examinee/proctor codes
5. **Share Codes**: Distribute codes to students and proctors
6. **Start Monitoring**: Begin real-time proctoring

#### Monitoring Dashboard
- **Live Feeds**: Real-time video streams from all examinees
- **Violation Alerts**: Instant notifications for suspicious activities
- **Analytics**: Comprehensive reporting and statistics
- **Controls**: Pause, focus, or remove examinees as needed

### For Students

#### Joining an Exam
1. **Install Extension**: Follow setup guide
2. **Login**: Use your student credentials
3. **Enter Code**: Use examinee code provided by instructor
4. **Enable Camera**: Grant camera permissions
5. **Start Exam**: Begin taking the exam under monitoring

#### During Exam
- **Stay Visible**: Keep your face in camera view
- **No Additional Devices**: Avoid using phones, tablets, or other computers
- **Stay Focused**: Avoid looking away from screen frequently
- **Follow Instructions**: Comply with all exam guidelines

### For Administrators

#### System Management
- **User Management**: Create and manage user accounts
- **Exam Oversight**: Monitor all active exams
- **Security Monitoring**: Review audit logs and security events
- **System Configuration**: Adjust global settings and policies

---

## 🔍 Testing & Validation

### Unit Testing
```bash
# Install testing dependencies
npm install --save-dev jest @testing-library/jest-dom

# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### Integration Testing
```bash
# Test Firebase connectivity
npm run test:firebase

# Test YOLO model
npm run test:yolo

# Test security features
npm run test:security
```

### Performance Testing
```bash
# Load testing
npm run test:load

# Memory profiling
npm run test:memory

# Network testing
npm run test:network
```

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Edge 88+
- ⚠️ Firefox (limited support)
- ❌ Safari (not supported)

---

## 🛠️ Troubleshooting

### Common Issues

#### Extension Not Loading
```bash
# Check manifest.json syntax
npm run validate:manifest

# Verify permissions
chrome://extensions/ → Developer mode → Errors
```

#### Firebase Connection Failed
```javascript
// Test connection
firebaseApp.db.collection('test').doc('test').get()
    .then(() => console.log('✅ Connected'))
    .catch(err => console.error('❌ Failed:', err));
```

#### YOLO Model Not Working
```javascript
// Check model path
console.log('Model path:', chrome.runtime.getURL('models/yolov8n.onnx'));

// Verify ONNX.js
console.log('ONNX available:', typeof ort !== 'undefined');
```

#### Camera Access Denied
```javascript
// Check permissions
navigator.permissions.query({name: 'camera'})
    .then(result => console.log('Camera permission:', result.state));
```

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('debug', 'true');

// View debug information
console.log('Debug mode enabled');
```

### Performance Issues
1. **Reduce Frame Rate**: Lower YOLO processing frequency
2. **Close Tabs**: Free up browser resources
3. **Check Network**: Ensure stable internet connection
4. **Update Browser**: Use latest Chrome version

---

## 📊 Monitoring & Analytics

### Real-Time Metrics
- **Active Exams**: Number of ongoing examinations
- **Total Examinees**: Students currently being monitored
- **Violation Rate**: Percentage of students with violations
- **System Performance**: Response times and error rates

### Reports & Exports
- **Exam Reports**: Detailed violation summaries
- **User Analytics**: Student behavior patterns
- **System Health**: Performance and reliability metrics
- **Security Logs**: Audit trail and security events

### Dashboard Features
- **Live Monitoring**: Real-time video feeds
- **Violation Alerts**: Instant notifications
- **Analytics Charts**: Visual data representation
- **Export Options**: PDF, CSV, JSON formats

---

## 🔒 Security Best Practices

### Data Protection
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Access Control**: Role-based permissions
- **Audit Logging**: Comprehensive activity tracking
- **Data Retention**: Configurable retention policies

### Privacy Compliance
- **GDPR**: European data protection compliance
- **FERPA**: Educational privacy compliance
- **COPPA**: Children's privacy protection
- **Data Minimization**: Collect only necessary data

### Security Monitoring
- **Real-Time Alerts**: Immediate violation notifications
- **Threat Detection**: AI-powered anomaly detection
- **Incident Response**: Automated security protocols
- **Regular Audits**: Periodic security assessments

---

## 📞 Support & Maintenance

### Getting Help
- **Documentation**: [Technical Documentation](TECHNICAL_DOCUMENTATION.md)
- **GitHub Issues**: [Report bugs and request features](https://github.com/yourusername/exam-proctor-extension/issues)
- **Email Support**: support@examproctor.com
- **Community Forum**: [GitHub Discussions](https://github.com/yourusername/exam-proctor-extension/discussions)

### Regular Maintenance
- **Updates**: Check for extension updates monthly
- **Security Patches**: Apply security updates immediately
- **Performance Monitoring**: Monitor system performance weekly
- **Backup**: Regular data backup and recovery testing

### Professional Services
- **Custom Development**: Tailored solutions for institutions
- **Training**: Staff training and certification
- **Support**: 24/7 technical support
- **Consulting**: Security and compliance consulting

---

## 📄 License & Compliance

### Open Source License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### IEEE Standards
- **IEEE 12207**: Software lifecycle processes
- **IEEE 29119**: Software testing standards
- **IEEE 829**: Software test documentation
- **IEEE 1012**: Software verification and validation

### Educational Compliance
- **FERPA**: Family Educational Rights and Privacy Act
- **COPPA**: Children's Online Privacy Protection Act
- **GDPR**: General Data Protection Regulation
- **SOC 2**: Security and availability standards

---

**Ready to get started?** Follow the Quick Start guide above, or dive into the detailed setup for a production-ready installation.

For additional support, please refer to our [Technical Documentation](TECHNICAL_DOCUMENTATION.md) or contact our support team.
