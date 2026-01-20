/**
 * Professional Monitoring Dashboard for Exam Proctor Extension
 * IEEE Standard Compliant Implementation
 * 
 * This module provides a comprehensive monitoring interface
 * for exam proctoring with real-time analytics and AI integration.
 * 
 * @author Exam Proctor Team
 * @version 2.0.0
 * @license MIT
 */

class ProfessionalMonitoringDashboard {
    constructor() {
        this.currentExam = null;
        this.examinees = new Map();
        this.violations = [];
        this.isMonitoring = false;
        this.yoloWorker = null;
        this.securityManager = null;
        this.analytics = new Map();
        this.settings = {
            yoloConfidence: 0.5,
            yoloNMS: 0.4,
            frameRate: 5,
            autoFlag: true,
            enableAudioMonitoring: false,
            enableScreenRecording: true,
            violationThreshold: 3
        };
        this.init();
    }

    /**
     * Initialize the monitoring dashboard
     */
    async init() {
        try {
            await this.initializeServices();
            this.setupEventListeners();
            this.loadExamData();
            this.startPeriodicUpdates();
            this.loadSettings();
            this.initializeAnalytics();
            console.log('Professional Monitoring Dashboard initialized');
        } catch (error) {
            console.error('Failed to initialize monitoring dashboard:', error);
            this.showError('Failed to initialize monitoring system');
        }
    }

    /**
     * Initialize required services
     */
    async initializeServices() {
        try {
            // Initialize YOLO worker
            this.yoloWorker = new Worker('yolo-worker.js');
            this.setupYOLOWorkerListeners();

            // Initialize security manager
            this.securityManager = new SecurityManager();
            await this.securityManager.init();

            // Initialize analytics
            this.analytics = new Map();
        } catch (error) {
            console.error('Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Setup YOLO worker event listeners
     */
    setupYOLOWorkerListeners() {
        this.yoloWorker.onmessage = (event) => {
            const { type, data } = event.data;

            switch (type) {
                case 'modelLoaded':
                    this.handleModelLoaded(data);
                    break;
                case 'detectionResults':
                    this.handleDetectionResults(data);
                    break;
                case 'modelError':
                    this.handleModelError(data);
                    break;
                case 'error':
                    this.handleWorkerError(data);
                    break;
            }
        };

        this.yoloWorker.onerror = (error) => {
            console.error('YOLO Worker error:', error);
            this.showError('YOLO processing error occurred');
        };
    }

    /**
     * Setup event listeners for UI interactions
     */
    setupEventListeners() {
        // Header controls
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.toggleMonitoring());
        document.getElementById('settingsBtn')?.addEventListener('click', () => this.showSettings());
        document.getElementById('closeBtn')?.addEventListener('click', () => this.closeMonitoring());
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());

        // Settings modal
        document.getElementById('closeSettings')?.addEventListener('click', () => this.hideSettings());
        document.getElementById('saveSettings')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('cancelSettings')?.addEventListener('click', () => this.hideSettings());

        // Settings controls
        document.getElementById('yoloConfidence')?.addEventListener('input', (e) => {
            document.getElementById('confidenceValue').textContent = e.target.value;
        });

        document.getElementById('yoloNMS')?.addEventListener('input', (e) => {
            document.getElementById('nmsValue').textContent = e.target.value;
        });

        // Violation modal
        document.getElementById('closeViolation')?.addEventListener('click', () => this.hideViolationModal());
        document.getElementById('acknowledgeViolation')?.addEventListener('click', () => this.acknowledgeViolation());
        document.getElementById('dismissViolation')?.addEventListener('click', () => this.dismissViolation());

        // Analytics controls
        document.getElementById('refreshAnalytics')?.addEventListener('click', () => this.refreshAnalytics());
        document.getElementById('exportAnalytics')?.addEventListener('click', () => this.exportAnalytics());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Window events
        window.addEventListener('beforeunload', () => this.cleanup());
    }

    /**
     * Load exam data from Firebase
     */
    async loadExamData() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const examId = urlParams.get('examId');
            
            if (examId && window.firebaseApp) {
                const examDoc = await window.firebaseApp.db.collection('exams').doc(examId).get();
                
                if (examDoc.exists) {
                    this.currentExam = { id: examId, ...examDoc.data() };
                    this.updateExamInfo();
                    await this.loadExaminees();
                    await this.loadViolations();
                } else {
                    this.showError('Exam not found');
                }
            } else {
                this.showError('No exam ID provided or Firebase not available');
            }
        } catch (error) {
            console.error('Error loading exam data:', error);
            this.showError('Failed to load exam data');
        }
    }

    /**
     * Update exam information display
     */
    updateExamInfo() {
        if (this.currentExam) {
            document.getElementById('examTitle').textContent = this.currentExam.title;
            document.getElementById('examCode').textContent = `Code: ${this.currentExam.code}`;
            document.getElementById('examDuration').textContent = `Duration: ${this.currentExam.duration} minutes`;
            document.getElementById('examStatus').textContent = `Status: ${this.currentExam.status}`;
        }
    }

    /**
     * Load examinees from Firebase
     */
    async loadExaminees() {
        try {
            if (!this.currentExam) return;

            const examineesSnapshot = await window.firebaseApp.db
                .collection('exams')
                .doc(this.currentExam.id)
                .collection('examinees')
                .get();

            this.examinees.clear();
            examineesSnapshot.forEach(doc => {
                const examinee = { id: doc.id, ...doc.data() };
                this.examinees.set(doc.id, examinee);
            });

            this.updateExamineeList();
            this.updateMonitoringGrid();
            this.updateSystemStatus();
        } catch (error) {
            console.error('Error loading examinees:', error);
        }
    }

    /**
     * Update examinee list in sidebar
     */
    updateExamineeList() {
        const examineeList = document.getElementById('examineeList');
        if (!examineeList) return;

        examineeList.innerHTML = '';

        this.examinees.forEach((examinee, userId) => {
            const examineeItem = document.createElement('div');
            examineeItem.className = 'examinee-item';
            examineeItem.dataset.userId = userId;

            const status = this.getExamineeStatus(examinee);
            const statusClass = this.getStatusClass(status);
            const violationCount = this.getViolationCount(userId);

            examineeItem.innerHTML = `
                <div class="examinee-info">
                    <div class="examinee-header">
                        <span class="examinee-name">${examinee.name || 'Unknown'}</span>
                        <span class="violation-count ${violationCount > 0 ? 'has-violations' : ''}">${violationCount}</span>
                    </div>
                    <span class="examinee-status ${statusClass}">${status}</span>
                    <div class="examinee-meta">
                        <span class="join-time">Joined: ${new Date(examinee.joinedAt?.toDate()).toLocaleTimeString()}</span>
                    </div>
                </div>
            `;

            examineeItem.addEventListener('click', () => this.focusExaminee(userId));
            examineeList.appendChild(examineeItem);
        });
    }

    /**
     * Update monitoring grid with video feeds
     */
    updateMonitoringGrid() {
        const monitoringGrid = document.getElementById('monitoringGrid');
        if (!monitoringGrid) return;

        monitoringGrid.innerHTML = '';

        if (this.examinees.size === 0) {
            monitoringGrid.innerHTML = `
                <div class="loading-placeholder">
                    <div class="placeholder-icon">👥</div>
                    <p>No examinees currently in exam</p>
                    <p class="placeholder-subtitle">Students will appear here when they join</p>
                </div>
            `;
            return;
        }

        this.examinees.forEach((examinee, userId) => {
            const tile = this.createMonitoringTile(examinee, userId);
            monitoringGrid.appendChild(tile);
        });
    }

    /**
     * Create monitoring tile for examinee
     */
    createMonitoringTile(examinee, userId) {
        const tile = document.createElement('div');
        tile.className = 'monitoring-tile';
        tile.dataset.userId = userId;

        const status = this.getExamineeStatus(examinee);
        const statusClass = this.getStatusClass(status);
        const violationCount = this.getViolationCount(userId);

        tile.innerHTML = `
            <div class="tile-header">
                <div class="tile-title-section">
                    <span class="tile-title">${examinee.name || 'Unknown'}</span>
                    <span class="tile-id">ID: ${userId.substring(0, 8)}</span>
                </div>
                <div class="tile-status-section">
                    <span class="tile-status ${statusClass}">${status}</span>
                    <span class="violation-indicator ${violationCount > 0 ? 'active' : ''}">${violationCount}</span>
                </div>
            </div>
            <div class="video-container">
                <video id="video-${userId}" autoplay muted playsinline></video>
                <div class="video-overlay">
                    <div class="overlay-status">Live</div>
                    <div class="overlay-controls">
                        <button class="overlay-btn" onclick="monitoringDashboard.focusExaminee('${userId}')" title="Focus">
                            <span>🔍</span>
                        </button>
                        <button class="overlay-btn" onclick="monitoringDashboard.pauseExaminee('${userId}')" title="Pause">
                            <span>⏸️</span>
                        </button>
                    </div>
                </div>
                <div class="ai-detection-overlay" id="ai-overlay-${userId}">
                    <!-- AI detection results will be displayed here -->
                </div>
            </div>
            <div class="tile-analytics">
                <div class="analytics-item">
                    <span class="analytics-label">Violations:</span>
                    <span class="analytics-value">${violationCount}</span>
                </div>
                <div class="analytics-item">
                    <span class="analytics-label">Uptime:</span>
                    <span class="analytics-value" id="uptime-${userId}">0m</span>
                </div>
            </div>
        `;

        // Start video stream for this examinee
        this.startVideoStream(userId);
        this.startAnalyticsTracking(userId);

        return tile;
    }

    /**
     * Start video stream for examinee
     */
    async startVideoStream(userId) {
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 },
                audio: false
            });

            const video = document.getElementById(`video-${userId}`);
            if (video) {
                video.srcObject = stream;
                
                // Start YOLO processing
                this.startYOLOProcessing(userId, video);
            }
        } catch (error) {
            console.error('Error starting video stream:', error);
            this.showError(`Failed to start video for ${userId}`);
        }
    }

    /**
     * Start YOLO processing for video stream
     */
    startYOLOProcessing(userId, video) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 640;
        canvas.height = 480;

        const processFrame = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Send frame to YOLO worker
                this.yoloWorker.postMessage({
                    type: 'processFrame',
                    data: {
                        width: canvas.width,
                        height: canvas.height,
                        data: imageData.data
                    }
                });
            }
            
            if (this.isMonitoring) {
                requestAnimationFrame(processFrame);
            }
        };

        video.addEventListener('loadeddata', () => {
            if (this.isMonitoring) {
                processFrame();
            }
        });
    }

    /**
     * Handle YOLO detection results
     */
    handleDetectionResults(data) {
        const { detections, timestamp } = data;
        
        if (detections && detections.length > 0) {
            // Process detections for each examinee
            this.examinees.forEach((examinee, userId) => {
                const relevantDetections = detections.filter(detection => 
                    this.isRelevantForExamProctoring(detection)
                );
                
                if (relevantDetections.length > 0) {
                    this.handleViolation(userId, 'yolo_detection', {
                        detections: relevantDetections,
                        timestamp
                    });
                    
                    this.updateAIDetectionOverlay(userId, relevantDetections);
                }
            });
        }
    }

    /**
     * Check if detection is relevant for exam proctoring
     */
    isRelevantForExamProctoring(detection) {
        const relevantClasses = [
            'cell phone', 'laptop', 'book', 'remote', 'tv',
            'keyboard', 'mouse', 'bottle', 'cup', 'backpack', 'handbag'
        ];
        
        return relevantClasses.includes(detection.className) && 
               detection.confidence > this.settings.yoloConfidence;
    }

    /**
     * Update AI detection overlay
     */
    updateAIDetectionOverlay(userId, detections) {
        const overlay = document.getElementById(`ai-overlay-${userId}`);
        if (!overlay) return;

        overlay.innerHTML = '';
        
        detections.forEach(detection => {
            const detectionBox = document.createElement('div');
            detectionBox.className = 'detection-box';
            detectionBox.style.cssText = `
                position: absolute;
                left: ${detection.bbox[0]}px;
                top: ${detection.bbox[1]}px;
                width: ${detection.bbox[2]}px;
                height: ${detection.bbox[3]}px;
                border: 2px solid #ff4757;
                background: rgba(255, 71, 87, 0.1);
                pointer-events: none;
            `;
            
            const label = document.createElement('div');
            label.className = 'detection-label';
            label.textContent = `${detection.className} (${(detection.confidence * 100).toFixed(1)}%)`;
            label.style.cssText = `
                position: absolute;
                top: -20px;
                left: 0;
                background: #ff4757;
                color: white;
                padding: 2px 6px;
                font-size: 12px;
                border-radius: 3px;
            `;
            
            detectionBox.appendChild(label);
            overlay.appendChild(detectionBox);
        });
    }

    /**
     * Handle violation detection
     */
    async handleViolation(userId, type, data) {
        try {
            const violation = {
                id: this.generateViolationId(),
                userId,
                type,
                data,
                timestamp: new Date().toISOString(),
                severity: this.calculateSeverity(type, data),
                acknowledged: false,
                examId: this.currentExam.id
            };

            this.violations.push(violation);
            
            // Update examinee violation count
            const examinee = this.examinees.get(userId);
            if (examinee) {
                if (!examinee.violations) examinee.violations = [];
                examinee.violations.push(violation);
            }

            // Save to Firebase
            await this.saveViolationToFirebase(violation);
            
            // Update UI
            this.updateViolationsList();
            this.updateExamineeList();
            
            // Show notification
            this.showViolationNotification(violation);
            
            // Log security event
            this.securityManager?.logSecurityEvent('violation_detected', {
                userId,
                type,
                severity: violation.severity
            });

        } catch (error) {
            console.error('Error handling violation:', error);
        }
    }

    /**
     * Calculate violation severity
     */
    calculateSeverity(type, data) {
        const severityMap = {
            'yolo_detection': 'medium',
            'suspicious_tab': 'high',
            'page_hidden': 'low',
            'developer_tools': 'high',
            'multiple_tabs': 'medium'
        };
        
        return severityMap[type] || 'low';
    }

    /**
     * Save violation to Firebase
     */
    async saveViolationToFirebase(violation) {
        try {
            if (window.firebaseApp) {
                await window.firebaseApp.db
                    .collection('exams')
                    .doc(this.currentExam.id)
                    .collection('violations')
                    .doc(violation.id)
                    .set(violation);
            }
        } catch (error) {
            console.error('Failed to save violation to Firebase:', error);
        }
    }

    /**
     * Show violation notification
     */
    showViolationNotification(violation) {
        const examinee = this.examinees.get(violation.userId);
        const examineeName = examinee?.name || 'Unknown';
        
        this.showNotification(
            `Violation detected: ${this.formatViolationType(violation.type)}`,
            `Examinee: ${examineeName}`,
            violation.severity
        );
    }

    /**
     * Format violation type for display
     */
    formatViolationType(type) {
        const typeMap = {
            'yolo_detection': 'AI Detection',
            'suspicious_tab': 'Suspicious Tab',
            'page_hidden': 'Page Hidden',
            'developer_tools': 'Developer Tools',
            'multiple_tabs': 'Multiple Tabs'
        };
        
        return typeMap[type] || type;
    }

    /**
     * Get examinee status
     */
    getExamineeStatus(examinee) {
        if (!examinee.violations || examinee.violations.length === 0) {
            return 'Active';
        }
        
        const highViolations = examinee.violations.filter(v => v.severity === 'high');
        const mediumViolations = examinee.violations.filter(v => v.severity === 'medium');
        
        if (highViolations.length > 0) return 'Warning';
        if (mediumViolations.length > 2) return 'Caution';
        return 'Active';
    }

    /**
     * Get status class for styling
     */
    getStatusClass(status) {
        const classMap = {
            'Active': 'active',
            'Caution': 'warning',
            'Warning': 'danger',
            'Inactive': 'inactive'
        };
        
        return classMap[status] || 'active';
    }

    /**
     * Get violation count for examinee
     */
    getViolationCount(userId) {
        const examinee = this.examinees.get(userId);
        return examinee?.violations?.length || 0;
    }

    /**
     * Generate unique violation ID
     */
    generateViolationId() {
        return 'violation_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Show notification
     */
    showNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        notification.innerHTML = `
            <div class="notification-header">
                <span class="notification-title">${title}</span>
                <button class="notification-close">&times;</button>
            </div>
            <div class="notification-body">${message}</div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            min-width: 300px;
            max-width: 400px;
            padding: 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        // Set background color based on type
        const colors = {
            'success': '#27ae60',
            'error': '#e74c3c',
            'warning': '#f39c12',
            'info': '#3498db',
            'high': '#e74c3c',
            'medium': '#f39c12',
            'low': '#3498db'
        };
        
        notification.style.background = colors[type] || colors.info;

        // Add to DOM
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    /**
     * Show error message
     */
    showError(message) {
        this.showNotification('Error', message, 'error');
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.yoloWorker) {
            this.yoloWorker.terminate();
        }
        
        if (this.securityManager) {
            this.securityManager.dispose();
        }
        
        this.isMonitoring = false;
    }
}

// Initialize the monitoring dashboard
let monitoringDashboard;

document.addEventListener('DOMContentLoaded', () => {
    monitoringDashboard = new ProfessionalMonitoringDashboard();
});

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);
