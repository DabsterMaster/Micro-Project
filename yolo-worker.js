/**
 * YOLO Worker for Exam Proctor Extension
 * IEEE Standard Compliant Implementation
 * 
 * This worker runs YOLO model inference in a separate thread
 * for real-time object detection in exam proctoring scenarios.
 * 
 * @author Exam Proctor Team
 * @version 2.0.0
 * @license MIT
 */

class YOLOWorker {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.modelLoader = null;
        this.processingQueue = [];
        this.isProcessing = false;
        this.init();
    }

    async init() {
        try {
            // Import ONNX.js runtime for model inference
            await this.importONNXRuntime();
            await this.loadYOLOModel();
            this.setupMessageHandler();
            this.startProcessingLoop();
        } catch (error) {
            console.error('Error initializing YOLO worker:', error);
            self.postMessage({
                type: 'modelError',
                error: error.message
            });
        }
    }

    /**
     * Import ONNX.js runtime for model inference
     */
    async importONNXRuntime() {
        try {
            // Import ONNX.js runtime
            importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort.min.js');
            console.log('ONNX.js runtime loaded successfully');
        } catch (error) {
            console.error('Failed to load ONNX.js runtime:', error);
            throw error;
        }
    }

    async loadYOLOModel() {
        try {
            console.log('Loading YOLO model in worker...');
            
            // MOCK MODE - For testing without real model
            // This simulates a real YOLO model for development and testing
            this.model = {
                name: 'YOLO-v8n-Mock',
                version: '2.0.0',
                inputShape: [1, 3, 640, 640],
                outputShape: [1, 84, 8400],
                confidenceThreshold: 0.5,
                nmsThreshold: 0.4,
                isMock: true
            };

            this.isModelLoaded = true;
            console.log('YOLO model loaded successfully in worker (MOCK MODE)');
            console.log('Note: Using mock model for testing. Replace with real model for production.');
            
            // Notify main thread that model is ready
            self.postMessage({
                type: 'modelLoaded',
                model: this.model
            });

        } catch (error) {
            console.error('Error loading YOLO model:', error);
            self.postMessage({
                type: 'modelError',
                error: error.message
            });
        }
    }

    setupMessageHandler() {
        self.onmessage = async (event) => {
            const { type, data } = event.data;

            try {
                switch (type) {
                    case 'processFrame':
                        await this.processFrame(data);
                        break;
                    case 'updateThresholds':
                        this.updateThresholds(data);
                        break;
                    case 'getModelInfo':
                        this.sendModelInfo();
                        break;
                    default:
                        console.warn('Unknown message type:', type);
                }
            } catch (error) {
                console.error('Error handling message:', error);
                self.postMessage({
                    type: 'error',
                    error: error.message
                });
            }
        };
    }

    /**
     * Process frame data for object detection
     * @param {Object} frameData - Frame data from camera
     */
    async processFrame(frameData) {
        if (!this.isModelLoaded) {
            self.postMessage({
                type: 'error',
                error: 'Model not loaded'
            });
            return;
        }

        try {
            // Add frame to processing queue
            this.processingQueue.push({
                frameData,
                timestamp: Date.now(),
                id: Math.random().toString(36).substr(2, 9)
            });

            // Process queue if not already processing
            if (!this.isProcessing) {
                this.processQueue();
            }

        } catch (error) {
            console.error('Error queuing frame:', error);
            self.postMessage({
                type: 'error',
                error: error.message
            });
        }
    }

    /**
     * Process the frame queue
     */
    async processQueue() {
        if (this.processingQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const frame = this.processingQueue.shift();

        try {
            // Preprocess the frame data
            const preprocessedData = await this.preprocessFrame(frame.frameData);
            
            // Run YOLO inference
            const detections = await this.runInference(preprocessedData);
            
            // Post-process detections
            const processedDetections = this.postprocessDetections(detections);
            
            // Filter detections based on exam proctoring needs
            const relevantDetections = this.filterRelevantDetections(processedDetections);
            
            // Send results back to main thread
            self.postMessage({
                type: 'detectionResults',
                detections: relevantDetections,
                timestamp: frame.timestamp,
                frameId: frame.id
            });

        } catch (error) {
            console.error('Error processing frame:', error);
            self.postMessage({
                type: 'error',
                error: error.message,
                frameId: frame.id
            });
        }

        // Continue processing queue
        setTimeout(() => this.processQueue(), 0);
    }

    /**
     * Preprocess frame data for YOLO inference
     * @param {Object} frameData - Input frame data
     * @returns {Float32Array} Preprocessed tensor data
     */
    async preprocessFrame(frameData) {
        try {
            const { width, height, data } = frameData;
            
            // Create canvas for resizing
            const canvas = new OffscreenCanvas(640, 640);
            const ctx = canvas.getContext('2d');
            
            // Create temporary canvas with original image
            const tempCanvas = new OffscreenCanvas(width, height);
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.putImageData(new ImageData(data, width, height), 0, 0);
            
            // Resize and draw to target canvas
            ctx.drawImage(tempCanvas, 0, 0, 640, 640);
            
            // Get resized image data
            const resizedData = ctx.getImageData(0, 0, 640, 640);
            
            // Convert to tensor format (normalize to 0-1)
            const tensorData = new Float32Array(640 * 640 * 3);
            let index = 0;
            
            for (let i = 0; i < resizedData.data.length; i += 4) {
                tensorData[index] = resizedData.data[i] / 255.0;     // R
                tensorData[index + 1] = resizedData.data[i + 1] / 255.0; // G
                tensorData[index + 2] = resizedData.data[i + 2] / 255.0; // B
                index += 3;
            }
            
            return tensorData;

        } catch (error) {
            throw new Error(`Preprocessing failed: ${error.message}`);
        }
    }

    /**
     * Run YOLO inference on preprocessed data
     * @param {Float32Array} preprocessedData - Preprocessed image data
     * @returns {Promise<Array>} Detection results
     */
    async runInference(preprocessedData) {
        try {
            if (!this.model) {
                throw new Error('Model not loaded');
            }

            // MOCK MODE - Generate simulated detections for testing
            if (this.model.isMock) {
                // Simulate processing time
                await new Promise(resolve => setTimeout(resolve, 50));
                
                // Generate mock detections (randomly, for testing)
                const mockDetections = [];
                const shouldDetect = Math.random() > 0.7; // 30% chance of detection
                
                if (shouldDetect) {
                    const mockClasses = ['person', 'cell phone', 'laptop', 'book', 'remote', 'tv'];
                    const randomClass = mockClasses[Math.floor(Math.random() * mockClasses.length)];
                    
                    mockDetections.push({
                        classId: mockClasses.indexOf(randomClass),
                        className: randomClass,
                        confidence: 0.5 + Math.random() * 0.4, // 0.5-0.9 confidence
                        bbox: [
                            100 + Math.random() * 200, // x
                            100 + Math.random() * 200, // y
                            50 + Math.random() * 100,  // width
                            50 + Math.random() * 100   // height
                        ],
                        centerX: 200 + Math.random() * 200,
                        centerY: 200 + Math.random() * 200,
                        width: 50 + Math.random() * 100,
                        height: 50 + Math.random() * 100
                    });
                }
                
                return mockDetections;
            }

            // REAL MODE - Use actual ONNX model (when you add the real model later)
            // Create input tensor
            const inputTensor = new ort.Tensor('float32', preprocessedData, [1, 3, 640, 640]);
            
            // Run inference
            const results = await this.model.run({ images: inputTensor });
            
            // Extract output tensor
            const output = results.output0;
            
            // Process detections
            const detections = this.postprocessDetections(output);
            
            return detections;

        } catch (error) {
            throw new Error(`Inference failed: ${error.message}`);
        }
    }

    /**
     * Post-process YOLO output to extract bounding boxes and classes
     * @param {ort.Tensor} output - Model output tensor
     * @returns {Array} Processed detections
     */
    postprocessDetections(output) {
        try {
            const detections = [];
            const outputData = output.data;
            const outputShape = output.dims;
            
            // YOLOv8 output format: [1, 84, 8400]
            // 84 = 4 (bbox) + 80 (classes)
            const numDetections = outputShape[2];
            const numClasses = outputShape[1] - 4;
            
            for (let i = 0; i < numDetections; i++) {
                // Extract bounding box coordinates
                const x = outputData[i * outputShape[1] + 0];
                const y = outputData[i * outputShape[1] + 1];
                const w = outputData[i * outputShape[1] + 2];
                const h = outputData[i * outputShape[1] + 3];
                
                // Find class with highest confidence
                let maxConfidence = 0;
                let maxClassIndex = 0;
                
                for (let j = 0; j < numClasses; j++) {
                    const confidence = outputData[i * outputShape[1] + 4 + j];
                    if (confidence > maxConfidence) {
                        maxConfidence = confidence;
                        maxClassIndex = j;
                    }
                }
                
                // Filter by confidence threshold
                if (maxConfidence > 0.5) {
                    detections.push({
                        classId: maxClassIndex,
                        className: this.getClassNames()[maxClassIndex],
                        confidence: maxConfidence,
                        bbox: [x, y, w, h],
                        centerX: x,
                        centerY: y,
                        width: w,
                        height: h
                    });
                }
            }
            
            // Apply Non-Maximum Suppression
            return this.applyNMS(detections);

        } catch (error) {
            throw new Error(`Post-processing failed: ${error.message}`);
        }
    }

    applyNMS(detections) {
        // Simple NMS implementation
        // In a real implementation, you would use a more sophisticated algorithm
        
        const sortedDetections = detections.sort((a, b) => b.confidence - a.confidence);
        const keptDetections = [];
        
        for (const detection of sortedDetections) {
            let shouldKeep = true;
            
            for (const kept of keptDetections) {
                const iou = this.calculateIOU(detection.bbox, kept.bbox);
                if (iou > this.model.nmsThreshold) {
                    shouldKeep = false;
                    break;
                }
            }
            
            if (shouldKeep) {
                keptDetections.push(detection);
            }
        }
        
        return keptDetections;
    }

    calculateIOU(bbox1, bbox2) {
        // Calculate Intersection over Union between two bounding boxes
        const [x1, y1, w1, h1] = bbox1;
        const [x2, y2, w2, h2] = bbox2;
        
        const intersectionX = Math.max(x1, x2);
        const intersectionY = Math.max(y1, y2);
        const intersectionW = Math.min(x1 + w1, x2 + w2) - intersectionX;
        const intersectionH = Math.min(y1 + h1, y2 + h2) - intersectionY;
        
        if (intersectionW <= 0 || intersectionH <= 0) {
            return 0;
        }
        
        const intersectionArea = intersectionW * intersectionH;
        const unionArea = (w1 * h1) + (w2 * h2) - intersectionArea;
        
        return intersectionArea / unionArea;
    }

    /**
     * Get COCO class names
     * @returns {Array} Array of class names
     */
    getClassNames() {
        return [
            'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
            'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
            'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
            'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
            'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
            'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
            'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
            'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
            'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
            'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
        ];
    }

    /**
     * Filter detections relevant to exam proctoring
     * @param {Array} detections - All detections
     * @returns {Array} Relevant detections
     */
    filterRelevantDetections(detections) {
        const relevantClasses = [
            'person',           // Student presence
            'cell phone',       // Phone usage
            'laptop',           // Multiple devices
            'book',             // Physical materials
            'remote',           // Remote control
            'tv',               // TV/monitor
            'keyboard',         // Multiple keyboards
            'mouse',            // Multiple mice
            'bottle',           // Food/drink
            'cup',              // Food/drink
            'chair',            // Multiple seating
            'backpack',         // Suspicious items
            'handbag'           // Suspicious items
        ];

        return detections.filter(detection => 
            relevantClasses.includes(detection.className)
        );
    }

    /**
     * Start processing loop for continuous frame processing
     */
    startProcessingLoop() {
        // Process queue every 100ms to maintain smooth performance
        setInterval(() => {
            if (this.processingQueue.length > 0 && !this.isProcessing) {
                this.processQueue();
            }
        }, 100);
    }

    updateThresholds(thresholds) {
        if (thresholds.confidence !== undefined) {
            this.model.confidenceThreshold = thresholds.confidence;
        }
        if (thresholds.nms !== undefined) {
            this.model.nmsThreshold = thresholds.nms;
        }

        self.postMessage({
            type: 'thresholdsUpdated',
            thresholds: {
                confidence: this.model.confidenceThreshold,
                nms: this.model.nmsThreshold
            }
        });
    }

    sendModelInfo() {
        self.postMessage({
            type: 'modelInfo',
            model: this.model
        });
    }

    // Utility method to convert image data to canvas
    imageDataToCanvas(imageData) {
        const canvas = new OffscreenCanvas(imageData.width, imageData.height);
        const ctx = canvas.getContext('2d');
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    // Utility method to resize canvas
    resizeCanvas(canvas, targetWidth, targetHeight) {
        const resizedCanvas = new OffscreenCanvas(targetWidth, targetHeight);
        const ctx = resizedCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);
        return resizedCanvas;
    }
}

// Initialize the YOLO worker
const yoloWorker = new YOLOWorker();

// Handle worker errors
self.onerror = (error) => {
    console.error('YOLO Worker error:', error);
    self.postMessage({
        type: 'error',
        error: 'Worker error occurred'
    });
};

// Handle unhandled promise rejections
self.onunhandledrejection = (event) => {
    console.error('YOLO Worker unhandled rejection:', event.reason);
    self.postMessage({
        type: 'error',
        error: 'Unhandled promise rejection'
    });
};
