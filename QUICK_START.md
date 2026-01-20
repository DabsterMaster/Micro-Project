# Deployment Verification Guide

## System Initialization

### Step 1: Extension Installation
1. Navigate to `chrome://extensions/` in Chrome.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the project root directory.
4. Verify the extension is active in the toolbar.

### Step 2: Configuration Validation
1. Ensure `firebase-config.js` is populated with valid credentials.
2. Launch the extension popup.
3. Confirm connection status is "Connected" in the interface footer.

### Step 3: Account Provisioning
To verify role-based access control, create distinct test accounts:

**Examiner Profile**
- Register a new user with the "Examiner" role.
- Verify access to the "Create Exam" interface.

**Examinee Profile**
- Register a separate user with the "Examinee" role.
- Verify access to the "Attend Exam" interface.

### Step 4: End-to-End Workflow Test

**1. Exam Creation (Examiner)**
- Login as Examiner.
- Generate a new exam (e.g., "System Test 01").
- Note the generated **Client Code**.
- Start the exam.
- Launch the **Monitoring Dashboard**.

**2. Exam Participation (Examinee)**
- Open a new browser instance (or Incognito window).
- Login as Examinee.
- Join the exam using the Client Code.
- Grant permissions for Camera and Screen Sharing.

**3. Monitoring Verification**
- Return to the Examiner's Monitoring Dashboard.
- Verify the Examinee's video and screen feeds are active.
- Confirm that system metrics are updating in real-time.

## Verification Checklist

- [ ] Chrome Extension loaded successfully.
- [ ] Firebase connectivity established.
- [ ] User registration and authentication subsystems functional.
- [ ] Exam creation and state management functional.
- [ ] Real-time WebRTC media streams (Camera/Screen) active.
- [ ] Dashboard receiving live telemetry.

## Troubleshooting

**Extension Load Failure**
- Validate `manifest.json` syntax.

**Connectivity Issues**
- Inspect network traffic in DevTools for blocked requests.
- Verify Firestore security rules allow current access patterns.

**Media Stream Failures**
- Ensure browser permissions are granted for Camera/Microphone.
- Verify `yolo-worker.js` is loading correctly for AI features.
