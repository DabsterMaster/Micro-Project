# Presentation Checklist - Exam Proctor Extension

## ✅ Pre-Presentation Setup

### 1. Extension Installation
- [ ] Load extension in Chrome (chrome://extensions/)
- [ ] Enable Developer Mode
- [ ] Click "Load unpacked" and select project folder
- [ ] Verify extension icon appears in toolbar
- [ ] Pin extension to toolbar for easy access

### 2. Firebase Configuration
- [ ] Verify Firebase config in `firebase-config.js` is correct
- [ ] Test Firebase connection (extension should show "Connected" status)
- [ ] Create test admin account
- [ ] Test login/logout functionality

### 3. Test Accounts Setup
**Create at least 2 test accounts:**
- [ ] Examiner account (creates exams)
- [ ] Examinee account (joins exams)

### 4. Demo Flow Preparation
- [ ] Test exam creation flow
- [ ] Test exam joining flow
- [ ] Test monitoring dashboard
- [ ] Test camera access
- [ ] Test screen sharing

## 🎯 Presentation Flow

### Phase 1: Introduction (2 minutes)
- [ ] Show extension icon and title
- [ ] Explain IEEE standards compliance
- [ ] Highlight key features (AI-powered, real-time monitoring, role-based access)

### Phase 2: Authentication (1 minute)
- [ ] Show login interface
- [ ] Demonstrate registration flow
- [ ] Show role-based access

### Phase 3: Examiner Flow (3 minutes)
- [ ] Create a new exam
- [ ] Show generated codes (examinee and proctor)
- [ ] Start the exam
- [ ] Open monitoring dashboard

### Phase 4: Examinee Flow (2 minutes)
- [ ] Join exam with examinee code
- [ ] Enable camera
- [ ] Share screen
- [ ] Show real-time feed

### Phase 5: Monitoring Dashboard (3 minutes)
- [ ] Show live examinee feeds
- [ ] Demonstrate violation detection
- [ ] Show violation logging
- [ ] Explain AI detection features

### Phase 6: Technical Highlights (2 minutes)
- [ ] Explain YOLO v8 integration
- [ ] Show Firebase backend integration
- [ ] Highlight security features
- [ ] Discuss scalability

## 🛠️ Troubleshooting Guide

### Issue: Extension Not Loading
**Solution:**
1. Check manifest.json for syntax errors
2. Reload extension in chrome://extensions/
3. Check browser console for errors

### Issue: Firebase Connection Failed
**Solution:**
1. Verify Firebase config in firebase-config.js
2. Check internet connection
3. Verify Firebase project is active
4. Check browser console for specific errors

### Issue: Camera Not Working
**Solution:**
1. Grant camera permissions in browser settings
2. Test camera with camera-test.html
3. Use Debug Camera button in extension
4. Check browser console for errors

### Issue: Monitoring Dashboard Empty
**Solution:**
1. Ensure examinees have joined the exam
2. Check Firebase for examinee data
3. Verify exam code is correct
4. Reload monitoring dashboard

### Issue: YOLO Model Not Loading
**Solution:**
1. Check models/yolov8m.onnx exists
2. Verify ONNX.js is loaded (check console)
3. Model loading errors won't break demo - system gracefully handles it

## ⚠️ Important Notes

1. **Demo Mode**: The system includes demonstration features that simulate violations for presentation purposes
2. **Offline Capability**: Extension works offline but requires Firebase for full functionality
3. **Camera Privacy**: Always inform viewers about camera access during demos
4. **Error Handling**: System gracefully handles missing dependencies (YOLO model, Firebase connection)

## ✅ Final Checks Before Presentation

- [ ] Extension loads without errors
- [ ] Firebase connection works
- [ ] Test accounts created and working
- [ ] Camera permissions granted
- [ ] Screen sharing works
- [ ] Monitoring dashboard displays correctly
- [ ] All documentation files present
- [ ] Backup plan ready (screenshots/videos)


