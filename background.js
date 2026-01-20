// Background service worker for Exam Proctor Extension
class ExamProctorBackground {
    constructor() {
        this.exams = new Map();
        this.users = new Map();
        this.monitoringSessions = new Map();
        this.tabChangeListeners = new Map();
        this.examTimers = new Map();
        this.init();
    }

    init() {
        this.loadStoredData();
        this.setupMessageListeners();
        this.setupTabChangeDetection();
        this.setupPeriodicCleanup();
        this.setupExamTimeMonitoring();
    }

    setupMessageListeners() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            this.handleMessage(request, sender, sendResponse);
            return true; // Keep message channel open for async response
        });
    }

    async handleMessage(request, sender, sendResponse) {
        try {
            switch (request.action) {
                case 'createExam':
                    sendResponse(await this.createExam(request.exam));
                    break;
                case 'joinExam':
                    sendResponse(await this.joinExam(request.examCode, request.userId));
                    break;
                case 'startExam':
                    sendResponse(await this.startExam(request.examId));
                    break;
                case 'stopExam':
                    sendResponse(await this.stopExam(request.examId));
                    break;
                case 'startMonitoring':
                    sendResponse(await this.startMonitoring(request.userId, request.examId));
                    break;
                case 'stopMonitoring':
                    sendResponse(await this.stopMonitoring(request.userId));
                    break;
                case 'getAllExams':
                    sendResponse(await this.getAllExams());
                    break;
                case 'getAllUsers':
                    sendResponse(await this.getAllUsers());
                    break;
                case 'getSystemStats':
                    sendResponse(await this.getSystemStats());
                    break;
                case 'tabChanged':
                    this.handleTabChange(request.userId, request.tabInfo);
                    break;
                case 'getExamineeVideo':
                    sendResponse(await this.getExamineeVideo(request.userId));
                    break;
                case 'getExamineeDetails':
                    sendResponse(await this.getExamineeDetails(request.userId));
                    break;
                case 'pauseExamineeMonitoring':
                    sendResponse(await this.pauseExamineeMonitoring(request.userId));
                    break;
                case 'removeExaminee':
                    sendResponse(await this.removeExaminee(request.userId, request.examId));
                    break;
                case 'acknowledgeViolation':
                    sendResponse(await this.acknowledgeViolation(request.violationId));
                    break;
                case 'dismissViolation':
                    sendResponse(await this.dismissViolation(request.violationId));
                    break;
                case 'updateYOLOThresholds':
                    sendResponse(await this.updateYOLOThresholds(request.thresholds));
                    break;
                case 'pauseMonitoring':
                    sendResponse(await this.pauseExam(request.examId));
                    break;
                case 'resumeMonitoring':
                    sendResponse(await this.resumeExam(request.examId));
                    break;
                default:
                    sendResponse({ success: false, error: 'Unknown action' });
            }
        } catch (error) {
            console.error('Error handling message:', error);
            sendResponse({ success: false, error: error.message });
        }
    }

    async createExam(examData) {
        try {
            // Validate exam data
            if (!examData.title || !examData.code) {
                throw new Error('Invalid exam data');
            }

            // Check if exam code already exists
            if (this.exams.has(examData.code)) {
                throw new Error('Exam code already exists');
            }

            // Store exam
            this.exams.set(examData.code, examData);
            await this.saveExams();

            return { success: true, exam: examData };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async joinExam(examCode, userId) {
        try {
            const exam = this.exams.get(examCode);
            if (!exam) {
                throw new Error('Exam not found');
            }

            if (exam.status !== 'active') {
                throw new Error('Exam is not active');
            }

            // Check organization restriction
            if (exam.orgOnly) {
                const user = this.users.get(userId);
                if (user && !user.email.endsWith(exam.orgEmail)) {
                    throw new Error('Access restricted to organization members only');
                }
            }

            // Add user to exam participants
            if (!exam.participants) {
                exam.participants = [];
            }
            
            if (!exam.participants.includes(userId)) {
                exam.participants.push(userId);
                await this.saveExams();
            }

            return { success: true, exam };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async startExam(examId) {
        try {
            const exam = Array.from(this.exams.values()).find(e => e.id === examId);
            if (!exam) {
                throw new Error('Exam not found');
            }

            exam.status = 'active';
            exam.startedAt = new Date().toISOString();
            await this.saveExams();

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async stopExam(examId) {
        try {
            const exam = Array.from(this.exams.values()).find(e => e.id === examId);
            if (!exam) {
                throw new Error('Exam not found');
            }

            exam.status = 'stopped';
            exam.stoppedAt = new Date().toISOString();
            
            // Stop all monitoring sessions for this exam
            for (const [userId, session] of this.monitoringSessions.entries()) {
                if (session.examId === examId) {
                    await this.stopMonitoring(userId);
                }
            }

            await this.saveExams();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async startMonitoring(userId, examId) {
        try {
            // Check if user is already being monitored
            if (this.monitoringSessions.has(userId)) {
                throw new Error('User is already being monitored');
            }

            const session = {
                userId,
                examId,
                startTime: new Date().toISOString(),
                tabChanges: [],
                violations: [],
                screenCapture: null,
                cameraStream: null
            };

            this.monitoringSessions.set(userId, session);

            // Start tab change detection
            await this.startTabChangeDetection(userId);

            // Start screen capture
            await this.startScreenCapture(userId);

            // Start camera monitoring
            await this.startCameraMonitoring(userId);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async stopMonitoring(userId) {
        try {
            const session = this.monitoringSessions.get(userId);
            if (!session) {
                return { success: false, error: 'No monitoring session found' };
            }

            // Stop tab change detection
            await this.stopTabChangeDetection(userId);

            // Stop screen capture
            if (session.screenCapture) {
                session.screenCapture.getTracks().forEach(track => track.stop());
            }

            // Stop camera monitoring
            if (session.cameraStream) {
                session.cameraStream.getTracks().forEach(track => track.stop());
            }

            // Save session data
            session.endTime = new Date().toISOString();
            await this.saveMonitoringSession(session);

            // Remove from active sessions
            this.monitoringSessions.delete(userId);

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async startTabChangeDetection(userId) {
        try {
            // Get user's tabs
            const tabs = await chrome.tabs.query({});
            const userTabs = tabs.filter(tab => tab.url && !tab.url.startsWith('chrome://'));

            // Set up tab change listener
            const listener = (tabId, changeInfo, tab) => {
                if (changeInfo.status === 'complete' && tab.url) {
                    this.handleTabChange(userId, {
                        tabId,
                        url: tab.url,
                        title: tab.title,
                        timestamp: new Date().toISOString()
                    });
                }
            };

            chrome.tabs.onUpdated.addListener(listener);
            this.tabChangeListeners.set(userId, listener);

            return true;
        } catch (error) {
            console.error('Error starting tab change detection:', error);
            return false;
        }
    }

    async stopTabChangeDetection(userId) {
        try {
            const listener = this.tabChangeListeners.get(userId);
            if (listener) {
                chrome.tabs.onUpdated.removeListener(listener);
                this.tabChangeListeners.delete(userId);
            }
            return true;
        } catch (error) {
            console.error('Error stopping tab change detection:', error);
            return false;
        }
    }

    async startScreenCapture(userId) {
        try {
            // Request screen capture permission
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: 'screen' },
                audio: false
            });

            const session = this.monitoringSessions.get(userId);
            if (session) {
                session.screenCapture = stream;
            }

            return true;
        } catch (error) {
            console.error('Error starting screen capture:', error);
            return false;
        }
    }

    async startCameraMonitoring(userId) {
        try {
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            const session = this.monitoringSessions.get(userId);
            if (session) {
                session.cameraStream = stream;
                
                // Start YOLO monitoring
                this.startYOLOMonitoring(userId, stream);
            }

            return true;
        } catch (error) {
            console.error('Error starting camera monitoring:', error);
            return false;
        }
    }

    async startYOLOMonitoring(userId, stream) {
        try {
            // Create canvas for video processing
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas size
            canvas.width = 640;
            canvas.height = 480;

            // YOLO monitoring loop
            const monitorLoop = async () => {
                try {
                    // Draw video frame to canvas
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    // Get image data for YOLO processing
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    
                    // Process with YOLO model
                    const detections = await this.processYOLO(imageData);
                    
                    // Check for violations
                    if (detections.length > 0) {
                        await this.handleYOLOViolations(userId, detections);
                    }

                    // Continue monitoring
                    if (this.monitoringSessions.has(userId)) {
                        requestAnimationFrame(monitorLoop);
                    }
                } catch (error) {
                    console.error('Error in YOLO monitoring loop:', error);
                }
            };

            // Start monitoring loop
            monitorLoop();

        } catch (error) {
            console.error('Error starting YOLO monitoring:', error);
        }
    }

    async processYOLO(imageData) {
        try {
            // This is a placeholder for YOLO model processing
            // In a real implementation, you would:
            // 1. Load the YOLO model (TensorFlow.js, ONNX.js, or WebAssembly)
            // 2. Preprocess the image data
            // 3. Run inference
            // 4. Post-process results

            // For now, return empty detections
            // You would implement this with actual YOLO model
            return [];
        } catch (error) {
            console.error('Error processing YOLO:', error);
            return [];
        }
    }

    async handleYOLOViolations(userId, detections) {
        try {
            const session = this.monitoringSessions.get(userId);
            if (!session) return;

            const violation = {
                type: 'yolo_detection',
                detections,
                timestamp: new Date().toISOString(),
                severity: 'medium'
            };

            session.violations.push(violation);

            // Send notification to examiner
            await this.notifyExaminer(userId, violation);

            // Log violation
            console.log(`YOLO violation detected for user ${userId}:`, violation);

        } catch (error) {
            console.error('Error handling YOLO violations:', error);
        }
    }

    async handleTabChange(userId, tabInfo) {
        try {
            const session = this.monitoringSessions.get(userId);
            if (!session) return;

            // Check if tab change is suspicious
            const suspiciousPatterns = [
                /calculator/i,
                /google\.com/i,
                /stackoverflow\.com/i,
                /cheat/i,
                /answer/i
            ];

            const isSuspicious = suspiciousPatterns.some(pattern => 
                pattern.test(tabInfo.url) || pattern.test(tabInfo.title)
            );

            if (isSuspicious) {
                const violation = {
                    type: 'suspicious_tab',
                    tabInfo,
                    timestamp: new Date().toISOString(),
                    severity: 'high'
                };

                session.violations.push(violation);
                session.tabChanges.push(tabInfo);

                // Send notification to examiner
                await this.notifyExaminer(userId, violation);

                // Log violation
                console.log(`Suspicious tab change detected for user ${userId}:`, violation);
            }

        } catch (error) {
            console.error('Error handling tab change:', error);
        }
    }

    async notifyExaminer(userId, violation) {
        try {
            const session = this.monitoringSessions.get(userId);
            if (!session) return;

            const exam = Array.from(this.exams.values()).find(e => e.id === session.examId);
            if (!exam) return;

            // Send notification to examiner
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Exam Violation Detected',
                message: `Violation detected for user in exam: ${exam.title}`,
                priority: 2
            });

            // You could also implement real-time communication here
            // (WebSocket, Server-Sent Events, etc.)

        } catch (error) {
            console.error('Error notifying examiner:', error);
        }
    }

    async getAllExams() {
        try {
            const examsArray = Array.from(this.exams.values());
            return { success: true, exams: examsArray };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getAllUsers() {
        try {
            const usersArray = Array.from(this.users.values());
            return { success: true, users: usersArray };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getSystemStats() {
        try {
            const stats = {
                totalExams: this.exams.size,
                activeExams: Array.from(this.exams.values()).filter(e => e.status === 'active').length,
                totalUsers: this.users.size,
                activeMonitoringSessions: this.monitoringSessions.size,
                systemUptime: Date.now() - this.startTime
            };

            return { success: true, stats };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    setupTabChangeDetection() {
        // Global tab change detection for all monitored users
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                // Check if this tab belongs to a monitored user
                for (const [userId, session] of this.monitoringSessions.entries()) {
                    // You would need to track which tabs belong to which user
                    // This is a simplified implementation
                    this.handleTabChange(userId, {
                        tabId,
                        url: tab.url,
                        title: tab.title,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        });
    }

    setupPeriodicCleanup() {
        // Clean up expired sessions every 5 minutes
        setInterval(() => {
            this.cleanupExpiredSessions();
        }, 5 * 60 * 1000);
    }

    setupExamTimeMonitoring() {
        // Check exam times every 30 seconds
        setInterval(() => {
            this.checkExamTimes();
        }, 30 * 1000);
    }

    async checkExamTimes() {
        try {
            const now = new Date();
            
            for (const [examCode, exam] of this.exams.entries()) {
                // Only check active exams
                if (exam.status !== 'active') continue;
                
                // Check if exam has an end time
                if (!exam.endTime) continue;
                
                const endTime = new Date(exam.endTime);
                
                // If time is up, auto-end the exam
                if (now >= endTime) {
                    console.log(`Auto-ending exam ${examCode} - time expired`);
                    await this.autoEndExam(examCode);
                }
            }
        } catch (error) {
            console.error('Error checking exam times:', error);
        }
    }

    async autoEndExam(examCode) {
        try {
            const exam = this.exams.get(examCode);
            if (!exam) return;
            
            // Update exam status
            exam.status = 'completed';
            exam.completedAt = new Date().toISOString();
            exam.autoEnded = true;
            
            // Stop all monitoring sessions for this exam
            for (const [userId, session] of this.monitoringSessions.entries()) {
                if (session.examId === exam.id || session.examId === examCode) {
                    await this.stopMonitoring(userId);
                }
            }
            
            // Save exam data
            await this.saveExams();
            
            // Send notification
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Exam Time Ended',
                message: `Exam "${exam.title}" has automatically ended due to time expiration.`,
                priority: 2
            });
            
            console.log(`Exam ${examCode} automatically ended`);
        } catch (error) {
            console.error('Error auto-ending exam:', error);
        }
    }

    async cleanupExpiredSessions() {
        try {
            const now = new Date();
            const expiredUsers = [];

            for (const [userId, session] of this.monitoringSessions.entries()) {
                const sessionStart = new Date(session.startTime);
                const sessionDuration = now - sessionStart;
                
                // Expire sessions older than 4 hours
                if (sessionDuration > 4 * 60 * 60 * 1000) {
                    expiredUsers.push(userId);
                }
            }

            // Stop expired sessions
            for (const userId of expiredUsers) {
                await this.stopMonitoring(userId);
            }

        } catch (error) {
            console.error('Error cleaning up expired sessions:', error);
        }
    }

    async loadStoredData() {
        try {
            const result = await chrome.storage.local.get(['exams', 'users', 'monitoringSessions']);
            
            if (result.exams) {
                this.exams = new Map(result.exams);
            }
            
            if (result.users) {
                this.users = new Map(result.users);
            }
            
            if (result.monitoringSessions) {
                this.monitoringSessions = new Map(result.monitoringSessions);
            }
        } catch (error) {
            console.error('Error loading stored data:', error);
        }
    }

    async saveExams() {
        try {
            const examsArray = Array.from(this.exams.entries());
            await chrome.storage.local.set({ exams: examsArray });
        } catch (error) {
            console.error('Error saving exams:', error);
        }
    }

    async saveMonitoringSession(session) {
        try {
            const sessions = await chrome.storage.local.get(['monitoringSessions']);
            const sessionsArray = sessions.monitoringSessions || [];
            sessionsArray.push(session);
            await chrome.storage.local.set({ monitoringSessions: sessionsArray });
        } catch (error) {
            console.error('Error saving monitoring session:', error);
        }
    }

    async getExamineeVideo(userId) {
        try {
            const session = this.monitoringSessions.get(userId);
            if (!session || !session.cameraStream) {
                return { success: false, error: 'No video stream available' };
            }
            return { success: true, stream: session.cameraStream };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getExamineeDetails(userId) {
        try {
            const session = this.monitoringSessions.get(userId);
            const user = this.users.get(userId);
            
            if (!session) {
                return { success: false, error: 'Examinee not found' };
            }

            const examinee = {
                userId,
                name: user?.name || 'Unknown',
                email: user?.email || 'Unknown',
                status: session.status || 'active',
                violations: session.violations || [],
                tabChanges: session.tabChanges || [],
                startTime: session.startTime
            };

            return { success: true, examinee };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async pauseExamineeMonitoring(userId) {
        try {
            const session = this.monitoringSessions.get(userId);
            if (!session) {
                return { success: false, error: 'Session not found' };
            }

            session.paused = true;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async removeExaminee(userId, examId) {
        try {
            // Stop monitoring for this user
            await this.stopMonitoring(userId);

            // Remove from exam participants
            const exam = Array.from(this.exams.values()).find(e => e.id === examId);
            if (exam && exam.participants) {
                exam.participants = exam.participants.filter(id => id !== userId);
                await this.saveExams();
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async acknowledgeViolation(violationId) {
        try {
            // Mark violation as acknowledged
            for (const [userId, session] of this.monitoringSessions.entries()) {
                const violation = session.violations.find(v => v.id === violationId);
                if (violation) {
                    violation.acknowledged = true;
                    violation.acknowledgedAt = new Date().toISOString();
                    return { success: true };
                }
            }
            return { success: false, error: 'Violation not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async dismissViolation(violationId) {
        try {
            // Remove violation
            for (const [userId, session] of this.monitoringSessions.entries()) {
                const violationIndex = session.violations.findIndex(v => v.id === violationId);
                if (violationIndex !== -1) {
                    session.violations.splice(violationIndex, 1);
                    return { success: true };
                }
            }
            return { success: false, error: 'Violation not found' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async updateYOLOThresholds(thresholds) {
        try {
            // Store YOLO thresholds for future processing
            await chrome.storage.local.set({ yoloThresholds: thresholds });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async pauseExam(examId) {
        try {
            const exam = Array.from(this.exams.values()).find(e => e.id === examId);
            if (!exam) {
                return { success: false, error: 'Exam not found' };
            }

            exam.monitoringPaused = true;
            await this.saveExams();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async resumeExam(examId) {
        try {
            const exam = Array.from(this.exams.values()).find(e => e.id === examId);
            if (!exam) {
                return { success: false, error: 'Exam not found' };
            }

            exam.monitoringPaused = false;
            await this.saveExams();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Initialize the background service worker
const examProctor = new ExamProctorBackground();
examProctor.startTime = Date.now();

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Exam Proctor Extension installed');
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Exam Proctor Extension started');
});
