/**
 * Performance Monitoring and Animation System
 * Part 3: Performance Tracking and Optimized Animations
 */

class PerformanceManager {
    constructor() {
        this.metrics = {
            renderTime: 0,
            componentCount: 0,
            memoryUsage: 0,
            fps: 0,
            animationFrames: 0
        };
        
        this.animationQueue = new Map();
        this.runningAnimations = new Set();
        this.performanceObserver = null;
        this.fpsCounter = null;
        this.memoryMonitor = null;
        
        this.init();
    }

    /**
     * Initialize performance monitoring
     */
    init() {
        this.setupPerformanceObserver();
        this.setupFPSMonitoring();
        this.setupMemoryMonitoring();
        this.setupAnimationSystem();
    }

    /**
     * Setup Performance Observer
     */
    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            this.performanceObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    this.handlePerformanceEntry(entry);
                }
            });

            // Observe different types of performance entries
            try {
                this.performanceObserver.observe({ 
                    entryTypes: ['measure', 'navigation', 'resource', 'paint'] 
                });
            } catch (e) {
                console.warn('Some performance entry types not supported:', e);
            }
        }
    }

    /**
     * Handle performance entries
     */
    handlePerformanceEntry(entry) {
        switch (entry.entryType) {
            case 'measure':
                if (entry.name.includes('mtech')) {
                    this.metrics.renderTime = entry.duration;
                }
                break;
                
            case 'paint':
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.firstContentfulPaint = entry.startTime;
                }
                break;
                
            case 'navigation':
                this.metrics.navigationTiming = {
                    domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                    loadComplete: entry.loadEventEnd - entry.loadEventStart
                };
                break;
        }
    }

    /**
     * Setup FPS monitoring
     */
    setupFPSMonitoring() {
        let frames = 0;
        let lastTime = performance.now();
        
        const countFrame = (currentTime) => {
            frames++;
            
            if (currentTime >= lastTime + 1000) {
                this.metrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
            }
            
            this.fpsCounter = requestAnimationFrame(countFrame);
        };
        
        this.fpsCounter = requestAnimationFrame(countFrame);
    }

    /**
     * Setup memory monitoring
     */
    setupMemoryMonitoring() {
        if ('memory' in performance) {
            this.memoryMonitor = setInterval(() => {
                this.metrics.memoryUsage = {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit,
                    percentage: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100
                };
            }, 5000);
        }
    }

    /**
     * Setup optimized animation system
     */
    setupAnimationSystem() {
        this.animationLoop = this.animationLoop.bind(this);
        this.startAnimationLoop();
    }

    /**
     * Animation loop using RAF
     */
    animationLoop(timestamp) {
        this.metrics.animationFrames++;
        
        // Process animation queue
        this.processAnimationQueue(timestamp);
        
        // Continue loop if there are animations
        if (this.runningAnimations.size > 0 || this.animationQueue.size > 0) {
            requestAnimationFrame(this.animationLoop);
        }
    }

    /**
     * Start animation loop
     */
    startAnimationLoop() {
        if (this.runningAnimations.size === 0) {
            requestAnimationFrame(this.animationLoop);
        }
    }

    /**
     * Process animation queue
     */
    processAnimationQueue(timestamp) {
        this.animationQueue.forEach((animation, id) => {
            if (!animation.startTime) {
                animation.startTime = timestamp;
            }
            
            const elapsed = timestamp - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            
            // Apply easing
            const easedProgress = this.applyEasing(progress, animation.easing);
            
            // Update animation
            animation.update(easedProgress);
            
            // Check if animation is complete
            if (progress >= 1) {
                if (animation.onComplete) {
                    animation.onComplete();
                }
                this.animationQueue.delete(id);
                this.runningAnimations.delete(id);
            }
        });
    }

    /**
     * Add animation to queue
     */
    animate(options) {
        const {
            element,
            properties,
            duration = 300,
            easing = 'easeOutCubic',
            onComplete = null,
            onUpdate = null
        } = options;

        const animationId = this.generateAnimationId();
        
        // Store initial values
        const initialValues = {};
        const targetValues = {};
        
        Object.entries(properties).forEach(([prop, value]) => {
            if (prop === 'transform') {
                initialValues[prop] = this.getTransformValue(element);
                targetValues[prop] = value;
            } else {
                const currentValue = this.getCurrentValue(element, prop);
                initialValues[prop] = currentValue;
                targetValues[prop] = this.parseValue(value);
            }
        });

        const animation = {
            element,
            initialValues,
            targetValues,
            duration,
            easing,
            onComplete,
            onUpdate,
            startTime: null,
            update: (progress) => {
                Object.entries(targetValues).forEach(([prop, target]) => {
                    const initial = initialValues[prop];
                    const current = this.interpolateValue(initial, target, progress);
                    this.applyValue(element, prop, current);
                });
                
                if (onUpdate) {
                    onUpdate(progress);
                }
            }
        };

        this.animationQueue.set(animationId, animation);
        this.runningAnimations.add(animationId);
        this.startAnimationLoop();
        
        return animationId;
    }

    /**
     * Cancel animation
     */
    cancelAnimation(animationId) {
        this.animationQueue.delete(animationId);
        this.runningAnimations.delete(animationId);
    }

    /**
     * Apply easing function
     */
    applyEasing(progress, easing) {
        const easingFunctions = {
            linear: t => t,
            easeInQuad: t => t * t,
            easeOutQuad: t => t * (2 - t),
            easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeInCubic: t => t * t * t,
            easeOutCubic: t => (--t) * t * t + 1,
            easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
            easeInQuart: t => t * t * t * t,
            easeOutQuart: t => 1 - (--t) * t * t * t,
            easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
            easeInBounce: t => 1 - this.applyEasing(1 - t, 'easeOutBounce'),
            easeOutBounce: t => {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            }
        };

        return easingFunctions[easing] ? easingFunctions[easing](progress) : progress;
    }

    /**
     * Get current CSS value
     */
    getCurrentValue(element, property) {
        const computed = getComputedStyle(element);
        const value = computed.getPropertyValue(property);
        return this.parseValue(value);
    }

    /**
     * Get current transform value
     */
    getTransformValue(element) {
        const computed = getComputedStyle(element);
        return computed.transform !== 'none' ? computed.transform : '';
    }

    /**
     * Parse CSS value
     */
    parseValue(value) {
        if (typeof value === 'number') return { value, unit: '' };
        
        const match = String(value).match(/^(-?\d*\.?\d+)(.*)$/);
        if (match) {
            return {
                value: parseFloat(match[1]),
                unit: match[2] || ''
            };
        }
        
        return { value: 0, unit: '' };
    }

    /**
     * Interpolate between values
     */
    interpolateValue(initial, target, progress) {
        if (typeof initial === 'string' || typeof target === 'string') {
            return progress >= 1 ? target : initial;
        }
        
        const diff = target.value - initial.value;
        const currentValue = initial.value + (diff * progress);
        
        return {
            value: currentValue,
            unit: target.unit || initial.unit
        };
    }

    /**
     * Apply value to element
     */
    applyValue(element, property, value) {
        if (property === 'transform') {
            element.style.transform = typeof value === 'string' ? value : `${value.value}${value.unit}`;
        } else {
            const cssValue = typeof value === 'object' ? `${value.value}${value.unit}` : value;
            element.style.setProperty(property, cssValue);
        }
    }

    /**
     * Generate unique animation ID
     */
    generateAnimationId() {
        return `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Fade in animation
     */
    fadeIn(element, duration = 300, onComplete = null) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        return this.animate({
            element,
            properties: { opacity: 1 },
            duration,
            easing: 'easeOutCubic',
            onComplete
        });
    }

    /**
     * Fade out animation
     */
    fadeOut(element, duration = 300, onComplete = null) {
        return this.animate({
            element,
            properties: { opacity: 0 },
            duration,
            easing: 'easeOutCubic',
            onComplete: () => {
                element.style.display = 'none';
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Slide in animation
     */
    slideIn(element, direction = 'down', duration = 300, onComplete = null) {
        const transforms = {
            up: 'translateY(100%)',
            down: 'translateY(-100%)',
            left: 'translateX(100%)',
            right: 'translateX(-100%)'
        };

        element.style.transform = transforms[direction];
        element.style.display = 'block';
        
        return this.animate({
            element,
            properties: { transform: 'translateX(0) translateY(0)' },
            duration,
            easing: 'easeOutCubic',
            onComplete
        });
    }

    /**
     * Scale animation
     */
    scale(element, scale = 1.1, duration = 200, onComplete = null) {
        return this.animate({
            element,
            properties: { transform: `scale(${scale})` },
            duration,
            easing: 'easeOutCubic',
            onComplete
        });
    }

    /**
     * Get current performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            activeAnimations: this.runningAnimations.size,
            queuedAnimations: this.animationQueue.size,
            timestamp: Date.now()
        };
    }

    /**
     * Performance warning system
     */
    checkPerformance() {
        const warnings = [];
        
        if (this.metrics.fps < 30) {
            warnings.push('Low FPS detected');
        }
        
        if (this.metrics.memoryUsage && this.metrics.memoryUsage.percentage > 80) {
            warnings.push('High memory usage detected');
        }
        
        if (this.runningAnimations.size > 10) {
            warnings.push('Too many concurrent animations');
        }
        
        return warnings;
    }

    /**
     * Optimize performance
     */
    optimize() {
        // Cancel non-essential animations if performance is poor
        if (this.metrics.fps < 30 && this.runningAnimations.size > 5) {
            const animationsToCancel = Array.from(this.runningAnimations).slice(5);
            animationsToCancel.forEach(id => this.cancelAnimation(id));
        }
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        // Cancel all animations
        this.animationQueue.clear();
        this.runningAnimations.clear();
        
        // Stop monitoring
        if (this.performanceObserver) {
            this.performanceObserver.disconnect();
        }
        
        if (this.fpsCounter) {
            cancelAnimationFrame(this.fpsCounter);
        }
        
        if (this.memoryMonitor) {
            clearInterval(this.memoryMonitor);
        }
        
        console.log('PerformanceManager destroyed and cleaned up');
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceManager;
} else if (typeof window !== 'undefined') {
    window.PerformanceManager = PerformanceManager;
}