# Firebase Setup Guide

## Setup Instructions

### Step 1: Create Firebase Project
1. Navigate to [Firebase Console](https://console.firebase.google.com/).
2. Select **"Create a project"**.
3. Project Name: `proctor-bay`.
4. Disable Google Analytics (optional).
5. Confirm creation.

### Step 2: Enable Services
1. **Authentication**:
   - Select **Authentication** > **Get started**.
   - Enable **Email/Password**.
   - Save changes.
   
2. **Firestore Database**:
   - Select **Firestore Database** > **Create database**.
   - Mode: **Test mode**.
   - Location: Select nearest region.
   - Enable.
   
3. **Storage Strategy**:
   - This project uses **Cloudinary** for scalable storage.
   - Refer to `cloudinary-setup.md` for configuration.

### Step 3: Application Configuration
1. Project Settings > **General** > **Your apps**.
2. Select **Web app (</>)**.
3. App Nickname: `exam-proctor-web`.
4. Register app.
5. **Copy the configuration object**.

### Step 4: Extension Configuration
1. Locate `firebase-config.js` in the project root.
2. Update the `firebaseConfig` object with your project credentials:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "proctor-bay.firebaseapp.com",
    projectId: "proctor-bay",
    storageBucket: "proctor-bay.appspot.com",
    messagingSenderId: "SENDER_ID",
    appId: "APP_ID"
};
```

### Step 5: Cloudinary Configuration
1. Complete Cloudinary setup (see `cloudinary-setup.md`).
2. Update Cloudinary credentials in `firebase-config.js`.

### Step 6: Verification
1. Load the extension in Chrome.
2. Verify "Connected" status in the interface footer.

## Security Rules (Production)

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User Profile Access
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Exam Access
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

## Global Deployment

### Global CDN
1. Select **Hosting** > **Get started**.
2. Complete the setup wizard to enable global distribution.

### Custom Domain
1. Hosting > **Custom domains**.
2. Add domain and configure DNS records.

## Troubleshooting

### Connectivity
- Verify internet connection.
- Check Firebase Console > Project Settings.
- Inspect browser console for `firebase-config` errors.

### Permission Errors
- Review Firestore security rules.
- Confirm user authentication status.

### Storage Issues
- Verify Cloudinary credentials.
- Check file size limits (<100MB).
