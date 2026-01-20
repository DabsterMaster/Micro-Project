/**
 * Security Manager for Exam Proctor Extension
 * IEEE Standard Compliant Implementation
 * 
 * This module handles security, encryption, and data protection
 * for the exam proctoring system.
 * 
 * @author Exam Proctor Team
 * @version 2.0.0
 * @license MIT
 */

class SecurityManager {
    constructor() {
        this.encryptionKey = null;
        this.sessionToken = null;
        this.userPermissions = new Map();
        this.auditLog = [];
        this.init();
    }

    /**
     * Initialize security manager
     */
    async init() {
        try {
            await this.generateEncryptionKey();
            this.setupSecurityPolicies();
            this.startAuditLogging();
            console.log('Security Manager initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Security Manager:', error);
            throw error;
        }
    }

    /**
     * Generate encryption key for data protection
     */
    async generateEncryptionKey() {
        try {
            // Generate a secure random key for encryption
            const key = await crypto.subtle.generateKey(
                {
                    name: 'AES-GCM',
                    length: 256
                },
                true,
                ['encrypt', 'decrypt']
            );
            
            this.encryptionKey = key;
            console.log('Encryption key generated successfully');
        } catch (error) {
            console.error('Failed to generate encryption key:', error);
            throw error;
        }
    }

    /**
     * Setup security policies and rules
     */
    setupSecurityPolicies() {
        this.securityPolicies = {
            // Data retention policies
            dataRetention: {
                examData: 365, // days
                violationLogs: 90, // days
                userSessions: 30, // days
                auditLogs: 2555 // days (7 years for compliance)
            },
            
            // Access control policies
            accessControl: {
                maxConcurrentSessions: 3,
                sessionTimeout: 3600000, // 1 hour in milliseconds
                passwordMinLength: 8,
                requireStrongPassword: true,
                enableTwoFactor: false // Can be enabled for enhanced security
            },
            
            // Privacy policies
            privacy: {
                anonymizeData: true,
                encryptPersonalData: true,
                allowDataExport: true,
                gdprCompliant: true
            }
        };
    }

    /**
     * Encrypt sensitive data
     * @param {string} data - Data to encrypt
     * @returns {Promise<string>} Encrypted data
     */
    async encryptData(data) {
        try {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }

            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            // Generate random IV
            const iv = crypto.getRandomValues(new Uint8Array(12));
            
            // Encrypt data
            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                dataBuffer
            );
            
            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encryptedData.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encryptedData), iv.length);
            
            // Convert to base64 for storage
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw error;
        }
    }

    /**
     * Decrypt sensitive data
     * @param {string} encryptedData - Encrypted data
     * @returns {Promise<Object>} Decrypted data
     */
    async decryptData(encryptedData) {
        try {
            if (!this.encryptionKey) {
                throw new Error('Encryption key not available');
            }

            // Convert from base64
            const combined = new Uint8Array(
                atob(encryptedData).split('').map(char => char.charCodeAt(0))
            );
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);
            
            // Decrypt data
            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                this.encryptionKey,
                encrypted
            );
            
            // Convert back to string and parse JSON
            const decoder = new TextDecoder();
            const decryptedString = decoder.decode(decryptedData);
            
            return JSON.parse(decryptedString);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw error;
        }
    }

    /**
     * Hash password securely
     * @param {string} password - Password to hash
     * @param {string} salt - Salt for hashing
     * @returns {Promise<string>} Hashed password
     */
    async hashPassword(password, salt) {
        try {
            const encoder = new TextEncoder();
            const passwordBuffer = encoder.encode(password + salt);
            
            const hashBuffer = await crypto.subtle.digest('SHA-256', passwordBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (error) {
            console.error('Password hashing failed:', error);
            throw error;
        }
    }

    /**
     * Generate secure random salt
     * @returns {string} Random salt
     */
    generateSalt() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Validate password strength
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    validatePasswordStrength(password) {
        const result = {
            isValid: true,
            score: 0,
            issues: []
        };

        // Length check
        if (password.length < 8) {
            result.isValid = false;
            result.issues.push('Password must be at least 8 characters long');
        } else {
            result.score += 1;
        }

        // Uppercase check
        if (!/[A-Z]/.test(password)) {
            result.issues.push('Password must contain at least one uppercase letter');
        } else {
            result.score += 1;
        }

        // Lowercase check
        if (!/[a-z]/.test(password)) {
            result.issues.push('Password must contain at least one lowercase letter');
        } else {
            result.score += 1;
        }

        // Number check
        if (!/\d/.test(password)) {
            result.issues.push('Password must contain at least one number');
        } else {
            result.score += 1;
        }

        // Special character check
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            result.issues.push('Password must contain at least one special character');
        } else {
            result.score += 1;
        }

        // Common password check
        const commonPasswords = [
            'password', '123456', '123456789', 'qwerty', 'abc123',
            'password123', 'admin', 'letmein', 'welcome', 'monkey'
        ];
        
        if (commonPasswords.includes(password.toLowerCase())) {
            result.isValid = false;
            result.issues.push('Password is too common');
        }

        return result;
    }

    /**
     * Generate secure session token
     * @param {string} userId - User ID
     * @returns {Promise<string>} Session token
     */
    async generateSessionToken(userId) {
        try {
            const timestamp = Date.now();
            const randomData = crypto.getRandomValues(new Uint8Array(32));
            const tokenData = `${userId}:${timestamp}:${Array.from(randomData, byte => byte.toString(16).padStart(2, '0')).join('')}`;
            
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(tokenData);
            
            const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            
            this.sessionToken = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            
            // Log session creation
            this.logSecurityEvent('session_created', {
                userId,
                timestamp,
                tokenHash: this.sessionToken.substring(0, 8) + '...'
            });
            
            return this.sessionToken;
        } catch (error) {
            console.error('Session token generation failed:', error);
            throw error;
        }
    }

    /**
     * Validate session token
     * @param {string} token - Token to validate
     * @returns {boolean} Validation result
     */
    validateSessionToken(token) {
        try {
            if (!this.sessionToken) {
                return false;
            }
            
            const isValid = token === this.sessionToken;
            
            if (isValid) {
                this.logSecurityEvent('session_validated', {
                    tokenHash: token.substring(0, 8) + '...'
                });
            } else {
                this.logSecurityEvent('session_validation_failed', {
                    tokenHash: token.substring(0, 8) + '...'
                });
            }
            
            return isValid;
        } catch (error) {
            console.error('Session token validation failed:', error);
            return false;
        }
    }

    /**
     * Check user permissions
     * @param {string} userId - User ID
     * @param {string} action - Action to check
     * @returns {boolean} Permission result
     */
    checkPermission(userId, action) {
        try {
            const userPermissions = this.userPermissions.get(userId);
            if (!userPermissions) {
                this.logSecurityEvent('permission_denied', {
                    userId,
                    action,
                    reason: 'User permissions not found'
                });
                return false;
            }

            const hasPermission = userPermissions.includes(action) || userPermissions.includes('admin');
            
            this.logSecurityEvent('permission_checked', {
                userId,
                action,
                granted: hasPermission
            });
            
            return hasPermission;
        } catch (error) {
            console.error('Permission check failed:', error);
            return false;
        }
    }

    /**
     * Set user permissions
     * @param {string} userId - User ID
     * @param {Array} permissions - Array of permissions
     */
    setUserPermissions(userId, permissions) {
        try {
            this.userPermissions.set(userId, permissions);
            
            this.logSecurityEvent('permissions_updated', {
                userId,
                permissions: permissions.length
            });
        } catch (error) {
            console.error('Failed to set user permissions:', error);
        }
    }

    /**
     * Log security events for audit trail
     * @param {string} event - Event type
     * @param {Object} data - Event data
     */
    logSecurityEvent(event, data) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                event,
                data,
                userAgent: navigator.userAgent,
                ipAddress: 'unknown', // Would be populated by server
                sessionId: this.sessionToken ? this.sessionToken.substring(0, 8) : 'none'
            };
            
            this.auditLog.push(logEntry);
            
            // Keep only recent logs (last 1000 entries)
            if (this.auditLog.length > 1000) {
                this.auditLog = this.auditLog.slice(-1000);
            }
            
            // Store in local storage for persistence
            this.saveAuditLog();
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }

    /**
     * Save audit log to storage
     */
    async saveAuditLog() {
        try {
            const encryptedLog = await this.encryptData(this.auditLog);
            await chrome.storage.local.set({
                auditLog: encryptedLog,
                auditLogTimestamp: Date.now()
            });
        } catch (error) {
            console.error('Failed to save audit log:', error);
        }
    }

    /**
     * Load audit log from storage
     */
    async loadAuditLog() {
        try {
            const result = await chrome.storage.local.get(['auditLog', 'auditLogTimestamp']);
            
            if (result.auditLog && result.auditLogTimestamp) {
                // Check if log is not too old (7 days)
                const logAge = Date.now() - result.auditLogTimestamp;
                if (logAge < 7 * 24 * 60 * 60 * 1000) {
                    this.auditLog = await this.decryptData(result.auditLog);
                }
            }
        } catch (error) {
            console.error('Failed to load audit log:', error);
        }
    }

    /**
     * Start audit logging system
     */
    startAuditLogging() {
        // Load existing audit log
        this.loadAuditLog();
        
        // Log system startup
        this.logSecurityEvent('system_startup', {
            version: '2.0.0',
            timestamp: Date.now()
        });
        
        // Periodic audit log save
        setInterval(() => {
            this.saveAuditLog();
        }, 60000); // Save every minute
    }

    /**
     * Sanitize user input to prevent XSS
     * @param {string} input - User input
     * @returns {string} Sanitized input
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Validation result
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Get security statistics
     * @returns {Object} Security statistics
     */
    getSecurityStats() {
        const now = Date.now();
        const last24Hours = this.auditLog.filter(log => 
            now - new Date(log.timestamp).getTime() < 24 * 60 * 60 * 1000
        );
        
        return {
            totalEvents: this.auditLog.length,
            eventsLast24Hours: last24Hours.length,
            activeSessions: this.userPermissions.size,
            systemUptime: now - (this.auditLog[0] ? new Date(this.auditLog[0].timestamp).getTime() : now),
            lastEvent: this.auditLog[this.auditLog.length - 1]?.timestamp || 'none'
        };
    }

    /**
     * Clean up resources
     */
    dispose() {
        this.encryptionKey = null;
        this.sessionToken = null;
        this.userPermissions.clear();
        this.auditLog = [];
        console.log('Security Manager disposed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
} else {
    window.SecurityManager = SecurityManager;
}
