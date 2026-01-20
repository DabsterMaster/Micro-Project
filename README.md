# Exam Proctor Extension - IEEE Standard Compliant

[![IEEE Standard](https://img.shields.io/badge/IEEE-Standard%20Compliant-blue.svg)](https://standards.ieee.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-2.0.0-green.svg)](https://github.com/yourusername/exam-proctor-extension)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange.svg)](https://chrome.google.com/webstore)

A comprehensive Chrome web extension that implements an **AI-powered examinee monitoring system** using **YOLO v8 ML model** for real-time proctoring. This IEEE standard-compliant system provides role-based access control for examinees, examiners, and administrators with global accessibility through Firebase integration.

## 🏆 IEEE Standards Compliance

This project adheres to the following IEEE standards:
- **IEEE 12207**: Software lifecycle processes
- **IEEE 29119**: Software testing standards  
- **IEEE 829**: Software test documentation
- **IEEE 1012**: Software verification and validation

## 🌟 Features

### **🤖 AI-Powered Core Functionality**
- **YOLO v8 Integration**: Real-time object detection using state-of-the-art ML models
- **Multi-Role System**: Examinee, Examiner, and Admin roles with distinct permissions
- **Real-Time Monitoring**: Live video feeds, screen sharing, and behavioral analysis
- **Intelligent Violation Detection**: AI-powered identification of suspicious activities
- **Global Accessibility**: Firebase backend for worldwide access
- **Organization Restrictions**: Domain-based access control for private exams

### **🔒 Enterprise-Grade Security**
- **AES-GCM Encryption**: Military-grade data protection
- **Secure Authentication**: Firebase-based user management with session tokens
- **Audit Logging**: Comprehensive security event tracking
- **GDPR Compliance**: Privacy-first data handling
- **Role-Based Access Control**: Granular permission system

### **User Experience**
- **Tab-Based Navigation**: Easy switching between different sections
- **Responsive Design**: Optimized for all devices (mobile, tablet, desktop)
- **Real-Time Updates**: Live status indicators and connection monitoring
- **Intuitive Interface**: Clean, modern UI with smooth transitions

### **Security & Monitoring**
- **Tab Change Detection**: Automatic flagging of suspicious browser activity
- **Screen Recording**: Continuous screen capture for examiners
- **Camera Monitoring**: YOLO-based behavioral analysis
- **Violation Tracking**: Comprehensive logging and alerting system

## 🚀 Quick Start

### **1. Firebase Setup**

#### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project
3. Enable Authentication, Firestore, Storage, and Functions

#### Configure Authentication
1. In Firebase Console → Authentication → Sign-in method
2. Enable Email/Password authentication
3. Add your domain to authorized domains

#### Configure Firestore
1. Go to Firestore Database → Create database
2. Start in test mode (for development)
3. Set up security rules (see Security section below)

#### Get Configuration
1. Project Settings → General → Your apps
2. Click the web app icon (</>)
3. Copy the config object

### **2. Extension Setup**

#### Update Firebase Configuration
1. Open `firebase-config.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
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

#### Install Extension
1. Open Chrome → Extensions (chrome://extensions/)
2. Enable "Developer mode"
3. Click "Load unpacked" → Select extension folder
4. Pin the extension to toolbar

### **3. First Use**

#### Create Admin Account
1. Click extension icon → Login tab
2. Click "Register" with admin role
3. Use this account to manage the system

#### Create Exam
1. Switch to Examiner tab
2. Fill exam details and create
3. Share the generated code with examinees

#### Join Exam
1. Examinees use the exam code
2. Enable camera and screen sharing
3. Start monitoring automatically

## 🏗️ Architecture

### **Frontend Components**
- **Popup Interface**: Main extension UI with tab navigation
- **Monitoring Dashboard**: Fullscreen examinee monitoring
- **Content Scripts**: Page-level activity monitoring
- **Background Service**: Extension lifecycle management

### **Backend Services (Firebase)**
- **Authentication**: User management and role-based access
- **Firestore**: Real-time database for exams and users
- **Storage**: Media file storage (recordings, screenshots)
- **Functions**: Serverless backend processing

### **ML Integration**
- **YOLO Worker**: Web Worker for ML processing
- **Real-time Analysis**: Frame-by-frame behavioral detection
- **Violation Detection**: Automatic flagging of suspicious activities

## 📱 User Interface

### **Navigation Tabs**
- **Login**: Authentication and registration
- **Examinee**: Join exams and manage monitoring
- **Examiner**: Create and manage exams
- **Admin**: System-wide administration
- **Monitoring**: Live examinee feeds

### **Responsive Design**
- **Mobile**: Single-column layout with touch optimization
- **Tablet**: Adaptive grid with sidebar
- **Desktop**: Full-featured multi-panel interface
- **Cross-Platform**: Consistent experience across devices

## 🔐 Security Features

### **Access Control**
- **Role-Based Permissions**: Different access levels for each role
- **Domain Restrictions**: Organization-only exam mode
- **Session Management**: Secure authentication and authorization

### **Data Protection**
- **Encrypted Storage**: Secure handling of sensitive data
- **Privacy Compliance**: GDPR and privacy regulation adherence
- **Audit Logging**: Comprehensive activity tracking

### **Firestore Security Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Exams: examiners can manage their exams, examinees can view active ones
    match /exams/{examId} {
      allow read: if request.auth != null && 
        (resource.data.status == 'active' || 
         resource.data.examinerId == request.auth.uid);
      allow write: if request.auth != null && 
        resource.data.examinerId == request.auth.uid;
    }
  }
}
```

## 🌍 Global Deployment

### **Firebase Global CDN**
- **Multi-Region**: Automatic global distribution
- **Low Latency**: Optimized routing for worldwide access
- **Scalability**: Handles concurrent users globally

### **Performance Optimization**
- **Offline Support**: Local caching and offline persistence
- **Real-time Sync**: Live updates across all connected clients
- **Efficient Queries**: Optimized database queries and indexing

## 🛠️ Development

### **Prerequisites**
- Node.js 16+ and npm
- Chrome browser with developer mode
- Firebase project with enabled services

### **Local Development**
```bash
# Clone repository
git clone <repository-url>
cd exam-proctor-extension

# Install dependencies (if any)
npm install

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable Developer mode
# 3. Load unpacked → Select project folder
```

### **Testing**
1. **Unit Tests**: Run with testing framework
2. **Integration Tests**: Test Firebase connectivity
3. **Browser Tests**: Test extension functionality
4. **Cross-Platform**: Test on different devices

### **Building for Production**
1. Update Firebase configuration
2. Set production security rules
3. Test thoroughly across platforms
4. Package and distribute

## 📊 Monitoring & Analytics

### **Real-Time Metrics**
- **Active Users**: Current online examinees and examiners
- **System Performance**: Response times and error rates
- **Violation Tracking**: Suspicious activity patterns
- **Usage Statistics**: Feature adoption and user engagement

### **Alerting System**
- **Real-time Notifications**: Immediate violation alerts
- **Escalation Procedures**: Automatic admin notifications
- **Performance Monitoring**: System health tracking

## 🔧 Configuration

### **Environment Variables**
```bash
# Firebase Configuration
FIREBASE_API_KEY=your-api-key
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_AUTH_DOMAIN=your-domain.firebaseapp.com

# Extension Settings
EXTENSION_VERSION=1.0.0
DEBUG_MODE=false
```

### **Customization Options**
- **UI Themes**: Light/dark mode support
- **Language Support**: Multi-language interface
- **Notification Settings**: Customizable alert preferences
- **Performance Tuning**: Adjustable monitoring parameters

## 🚨 Troubleshooting

### **Common Issues**

#### Firebase Connection Failed
- Check internet connectivity
- Verify Firebase configuration
- Ensure project services are enabled
- Check browser console for errors

#### Extension Not Loading
- Verify manifest.json syntax
- Check Chrome extension permissions
- Clear browser cache and reload
- Ensure all files are present

#### Monitoring Issues
- Check camera/microphone permissions
- Verify screen sharing permissions
- Ensure YOLO model files are loaded
- Check browser console for errors

### **Debug Mode**
Enable debug logging in the extension:
1. Open extension popup
2. Right-click → Inspect
3. Check console for detailed logs
4. Monitor network requests

## 📈 Future Enhancements

### **Planned Features**
- **Advanced AI**: Enhanced behavioral analysis
- **Multi-Language**: Internationalization support
- **Mobile App**: Native mobile applications
- **Analytics Dashboard**: Advanced reporting tools
- **Integration APIs**: Third-party system integration

### **Performance Improvements**
- **ML Optimization**: Faster inference processing
- **Caching Strategy**: Improved offline support
- **Compression**: Reduced bandwidth usage
- **Load Balancing**: Better global distribution

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **Documentation**: [Project Wiki](wiki-url)
- **Issues**: [GitHub Issues](issues-url)
- **Discussions**: [GitHub Discussions](discussions-url)
- **Email**: support@examproctor.com

## 🙏 Acknowledgments

- **Firebase Team**: For the excellent backend platform
- **YOLO Community**: For the ML model and research
- **Chrome Extensions Team**: For the extension platform
- **Open Source Contributors**: For various libraries and tools

---

**Note**: This extension requires proper Firebase setup and configuration to function. Ensure all security rules and permissions are properly configured before production use.
