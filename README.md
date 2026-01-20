# Exam Proctor Extension

A Chrome extension for monitoring exams using the YOLO object detection model. It helps proctors keep an eye on examinees by detecting objects like phones, books, or multiple people in the frame.

## Features

*   **Real-time Object Detection**: Uses YOLO v8 to spot things like cell phones, books, etc.
*   **Role-Based Access**: Separate views for Examiners (create exams) and Examinees (join exams).
*   **Live Monitoring**: Examiners can see live feeds and get alerts for violations.
*   **Secure**: Built on Firebase for auth and realtime database interactions.

## Setup

### Prerequisites
*   Node.js & npm
*   A Firebase project
*   Chrome browser

### Installation

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/DabsterMaster/Micro-Project.git
    cd Micro-Project
    ```

2.  **Configure Firebase**:
    *   Create a project in the [Firebase Console](https://console.firebase.google.com/).
    *   Enable **Authentication** (Email/Password).
    *   Create a **Firestore Database** (start in Test mode).
    *   Copy your web app config and paste it into `firebase-config.js`:
    ```javascript
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      // ... other config values
    };
    ```

3.  **Load into Chrome**:
    *   Go to `chrome://extensions/`.
    *   Turn on **Developer mode** (top right).
    *   Click **Load unpacked** and select this directory.

## Usage

*   **Admin/Examiner**: Sign up, create an exam, and share the code with students.
*   **Student**: Enter the exam code to join. You'll need to allow camera and screen sharing permissions.

## Tech Stack
*   **Frontend**: HTML, CSS, JavaScript
*   **AI/ML**: YOLO v8 (ONNX runtime)
*   **Backend**: Firebase (Auth, Firestore, Functions)

## License
MIT
