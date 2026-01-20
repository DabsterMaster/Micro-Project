// Content script for Exam Proctor Extension
class ExamProctorContent {
    constructor() {
        this.isMonitoring = false;
        this.userId = null;
        this.examId = null;
        this.lastUrl = window.location.href;
        this.suspiciousKeywords = [
            'calculator', 'google', 'stackoverflow', 'cheat', 'answer', 'solution',
            'help', 'tutorial', 'guide', 'reference', 'formula', 'equation'
        ];
        this.init();
    }

    init() {
        this.checkMonitoringStatus();
        this.setupPageMonitoring();
        this.setupMutationObserver();
        this.setupKeyboardMonitoring();
        this.setupMouseMonitoring();
    }

    async checkMonitoringStatus() {
        try {
            // Check if user is being monitored
            const response = await chrome.runtime.sendMessage({
                action: 'checkMonitoringStatus'
            });

            if (response && response.isMonitoring) {
                this.isMonitoring = true;
                this.userId = response.userId;
                this.examId = response.examId;
                this.startMonitoring();
            }
        } catch (error) {
            console.log('Not in monitoring mode or error checking status:', error);
        }
    }

    setupPageMonitoring() {
        // Monitor URL changes
        let currentUrl = window.location.href;
        
        // Check for URL changes every second
        setInterval(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                this.handleUrlChange(currentUrl);
            }
        }, 1000);

        // Monitor page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (this.isMonitoring) {
                this.handleVisibilityChange();
            }
        });

        // Monitor focus changes
        window.addEventListener('focus', () => {
            if (this.isMonitoring) {
                this.handleFocusChange(true);
            }
        });

        window.addEventListener('blur', () => {
            if (this.isMonitoring) {
                this.handleFocusChange(false);
            }
        });
    }

    setupMutationObserver() {
        // Monitor DOM changes for suspicious content
        const observer = new MutationObserver((mutations) => {
            if (!this.isMonitoring) return;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.checkForSuspiciousContent(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    setupKeyboardMonitoring() {
        // Monitor keyboard shortcuts that might indicate cheating
        document.addEventListener('keydown', (event) => {
            if (!this.isMonitoring) return;

            // Check for common shortcuts
            const shortcuts = [
                { key: 'F1', description: 'Help key pressed' },
                { key: 'F12', description: 'Developer tools key pressed' },
                { key: 'Ctrl+Shift+I', description: 'Developer tools shortcut' },
                { key: 'Ctrl+Shift+C', description: 'Element inspector shortcut' },
                { key: 'Ctrl+Shift+J', description: 'Console shortcut' }
            ];

            shortcuts.forEach(shortcut => {
                if (this.checkShortcut(event, shortcut.key)) {
                    this.reportViolation('keyboard_shortcut', {
                        shortcut: shortcut.key,
                        description: shortcut.description,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });
    }

    setupMouseMonitoring() {
        // Monitor mouse movements for suspicious patterns
        let mouseMovements = [];
        let lastMouseTime = Date.now();

        document.addEventListener('mousemove', (event) => {
            if (!this.isMonitoring) return;

            const now = Date.now();
            mouseMovements.push({
                x: event.clientX,
                y: event.clientY,
                timestamp: now
            });

            // Keep only recent movements (last 5 seconds)
            mouseMovements = mouseMovements.filter(move => now - move.timestamp < 5000);

            // Check for suspicious patterns
            if (mouseMovements.length > 100) {
                this.analyzeMousePatterns(mouseMovements);
            }

            lastMouseTime = now;
        });
    }

    checkShortcut(event, shortcut) {
        const key = event.key;
        const ctrl = event.ctrlKey;
        const shift = event.shiftKey;

        switch (shortcut) {
            case 'F1':
                return key === 'F1';
            case 'F12':
                return key === 'F12';
            case 'Ctrl+Shift+I':
                return ctrl && shift && key === 'I';
            case 'Ctrl+Shift+C':
                return ctrl && shift && key === 'C';
            case 'Ctrl+Shift+J':
                return ctrl && shift && key === 'J';
            default:
                return false;
        }
    }

    analyzeMousePatterns(movements) {
        // Check for rapid, repetitive movements (potential automated behavior)
        let rapidMovements = 0;
        let totalDistance = 0;

        for (let i = 1; i < movements.length; i++) {
            const prev = movements[i - 1];
            const curr = movements[i];
            const distance = Math.sqrt(
                Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2)
            );
            const timeDiff = curr.timestamp - prev.timestamp;

            if (timeDiff < 50 && distance > 10) {
                rapidMovements++;
            }

            totalDistance += distance;
        }

        // Report if suspicious patterns detected
        if (rapidMovements > 20 || totalDistance > 1000) {
            this.reportViolation('suspicious_mouse_pattern', {
                rapidMovements,
                totalDistance,
                timestamp: new Date().toISOString()
            });
        }
    }

    handleUrlChange(newUrl) {
        if (!this.isMonitoring) return;

        // Check if new URL is suspicious
        const isSuspicious = this.suspiciousKeywords.some(keyword => 
            newUrl.toLowerCase().includes(keyword.toLowerCase())
        );

        if (isSuspicious) {
            this.reportViolation('suspicious_url_change', {
                oldUrl: this.lastUrl,
                newUrl: newUrl,
                timestamp: new Date().toISOString()
            });
        }

        this.lastUrl = newUrl;
    }

    handleVisibilityChange() {
        if (!this.isMonitoring) return;

        const isHidden = document.hidden;
        
        if (isHidden) {
            this.reportViolation('page_hidden', {
                timestamp: new Date().toISOString(),
                description: 'User switched away from exam page'
            });
        }
    }

    handleFocusChange(hasFocus) {
        if (!this.isMonitoring) return;

        if (!hasFocus) {
            this.reportViolation('page_lost_focus', {
                timestamp: new Date().toISOString(),
                description: 'User switched to different application'
            });
        }
    }

    checkForSuspiciousContent(node) {
        if (!this.isMonitoring) return;

        // Check text content for suspicious keywords
        if (node.textContent) {
            const text = node.textContent.toLowerCase();
            const suspiciousContent = this.suspiciousKeywords.filter(keyword => 
                text.includes(keyword.toLowerCase())
            );

            if (suspiciousContent.length > 0) {
                this.reportViolation('suspicious_content_detected', {
                    keywords: suspiciousContent,
                    content: node.textContent.substring(0, 100),
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Check for suspicious iframes or external content
        if (node.tagName === 'IFRAME') {
            const src = node.src;
            if (src && !src.startsWith(window.location.origin)) {
                this.reportViolation('external_iframe_detected', {
                    src: src,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // Check for suspicious scripts
        if (node.tagName === 'SCRIPT') {
            const src = node.src;
            if (src && !src.startsWith(window.location.origin)) {
                this.reportViolation('external_script_detected', {
                    src: src,
                    timestamp: new Date().toISOString()
                });
            }
        }
    }

    async reportViolation(type, data) {
        if (!this.isMonitoring || !this.userId) return;

        try {
            const violation = {
                type,
                data,
                userId: this.userId,
                examId: this.examId,
                pageUrl: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            };

            // Send violation to background script
            await chrome.runtime.sendMessage({
                action: 'reportViolation',
                violation
            });

            console.log('Violation reported:', violation);
        } catch (error) {
            console.error('Error reporting violation:', error);
        }
    }

    startMonitoring() {
        this.isMonitoring = true;
        console.log('Content script monitoring started for user:', this.userId);
        
        // Add monitoring indicator to page
        this.addMonitoringIndicator();
        
        // Start periodic checks
        this.startPeriodicChecks();
    }

    addMonitoringIndicator() {
        // Create a subtle monitoring indicator
        const indicator = document.createElement('div');
        indicator.id = 'exam-proctor-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 20px;
            height: 20px;
            background: #ff4757;
            border-radius: 50%;
            z-index: 999999;
            opacity: 0.7;
            pointer-events: none;
            animation: pulse 2s infinite;
        `;

        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 0.7; }
                50% { opacity: 1; }
                100% { opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(indicator);
    }

    startPeriodicChecks() {
        // Check for suspicious activities every 30 seconds
        setInterval(() => {
            if (!this.isMonitoring) return;

            this.performPeriodicChecks();
        }, 30000);
    }

    performPeriodicChecks() {
        // Check for multiple tabs
        this.checkMultipleTabs();
        
        // Check for developer tools
        this.checkDeveloperTools();
        
        // Check for suspicious browser extensions
        this.checkBrowserExtensions();
    }

    async checkMultipleTabs() {
        try {
            const tabs = await chrome.tabs.query({});
            const examTabs = tabs.filter(tab => 
                tab.url && tab.url.includes(window.location.hostname)
            );

            if (examTabs.length > 1) {
                this.reportViolation('multiple_exam_tabs', {
                    tabCount: examTabs.length,
                    tabs: examTabs.map(tab => ({
                        id: tab.id,
                        url: tab.url,
                        title: tab.title
                    })),
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error checking multiple tabs:', error);
        }
    }

    checkDeveloperTools() {
        // Check if developer tools are open
        const devtools = {
            open: false,
            orientation: null
        };

        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if (widthThreshold || heightThreshold) {
            devtools.open = true;
            devtools.orientation = widthThreshold ? 'vertical' : 'horizontal';

            this.reportViolation('developer_tools_detected', {
                orientation: devtools.orientation,
                timestamp: new Date().toISOString()
            });
        }
    }

    checkBrowserExtensions() {
        // Check for suspicious browser extensions
        // This is a limited check due to browser security restrictions
        try {
            // Check if certain global objects exist (indicating extensions)
            const suspiciousExtensions = [
                'adblock',
                'ublock',
                'ghostery',
                'noscript',
                'tampermonkey',
                'greasemonkey'
            ];

            const detectedExtensions = suspiciousExtensions.filter(ext => {
                try {
                    return window[ext] !== undefined;
                } catch {
                    return false;
                }
            });

            if (detectedExtensions.length > 0) {
                this.reportViolation('suspicious_extensions_detected', {
                    extensions: detectedExtensions,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            // Extension detection is limited by browser security
            console.log('Extension detection limited by browser security');
        }
    }

    stopMonitoring() {
        this.isMonitoring = false;
        
        // Remove monitoring indicator
        const indicator = document.getElementById('exam-proctor-indicator');
        if (indicator) {
            indicator.remove();
        }

        console.log('Content script monitoring stopped');
    }
}

// Initialize content script
const examProctorContent = new ExamProctorContent();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startContentMonitoring') {
        examProctorContent.startMonitoring();
        sendResponse({ success: true });
    } else if (request.action === 'stopContentMonitoring') {
        examProctorContent.stopMonitoring();
        sendResponse({ success: true });
    }
});

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
    if (examProctorContent.isMonitoring) {
        examProctorContent.stopMonitoring();
    }
});
