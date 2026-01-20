# Admin User Setup Guide

## Manual Admin Setup

Admin access controls are managed directly via the Firebase Console to ensure security.

## Step 1: Create Admin User
1. Navigate to [Firebase Console](https://console.firebase.google.com/).
2. Select Project > **Authentication** > **Users**.
3. Select **"Add User"**.
4. create credentials for the administrator account.

## Step 2: Configure Role Permissions
1. Navigate to **Firestore Database**.
2. Open the **users** collection.
3. Locate the administrator document (identified by UID).
4. Add the following role configuration:

```json
{
  "role": "admin",
  "adminLevel": "super",
  "permissions": ["manage_users", "manage_exams", "view_stats", "system_control"]
}
```

## Admin Capabilities
Users with `role: "admin"` possess the following system-wide permissions:
- Global exam visibility.
- User management (suspend/delete/promote).
- System analytics access.
- Global monitoring access.

## Security Overview
- Admin credentials should be strictly controlled.
- Admin status cannot be granted via the public interface.
- Role changes are persistent until manually revoked.

## Verification
1. Log in with admin credentials.
2. Verify access to the **Admin** tab in the navigation.
3. Confirm expanded permission set in the interface.

## Interface Features
The Admin Dashboard provides:
- System Overview
- User Management Panel
- Global Exam Controls
- Violation Reports
