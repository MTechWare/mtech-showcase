/**
 * MTech Components Library - Optimized Version
 * @version 2.0.0
 * @author MTech IT Solutions
 * 
 * Performance Optimizations:
 * - Event delegation and memory management
 * - DOM manipulation optimization with element pooling
 * - Performance monitoring and optimized animations
 * - Component lazy loading and lifecycle management
 * - Memory leak prevention and cleanup
 */

class MTechComponentsOptimized {
    constructor(options = {}) {
        this.options = {
            theme: 'dark',
            primaryColor: '#ff9800',
            autoInit: true,
            enableVirtualScrolling: true,
            enableComponentPooling: true,
            enablePerformanceMonitoring: true,
            debounceDelay: 300,
            maxPoolSize: 20,
            lazyLoadThreshold: 100,
            ...options
        };

        // Core managers
        this.eventManager = null;
        this.domManager = null;
        this.performanceManager = null;
        this.componentManager = null;

        // State
        this.initialized = false;
        this.destroyed = false;

        if (this.options.autoInit) {
            this.init();
        }
    }

    /**
     * Initialize the optimized library
     */
    async init() {
        if (this.initialized || this.destroyed) return;

        try {
            performance.mark('mtech-init-start');

            // Initialize core managers
            await this.initializeManagers();
            
            // Setup theme and styles
            await this.setupThemeAndStyles();
            
            // Setup common functionality
            this.setupCommonFeatures();

            this.initialized = true;
            
            performance.mark('mtech-init-end');
            performance.measure('mtech-init', 'mtech-init-start', 'mtech-init-end');

            console.log('MTech Components Optimized Library initialized successfully');
            
            // Emit initialization event
            document.dispatchEvent(new CustomEvent('mtech:initialized', {
                detail: { instance: this, metrics: this.getPerformanceMetrics() }
            }));

        } catch (error) {
            console.error('Failed to initialize MTech Components:', error);
            throw error;
        }
    }

    /**
     * Initialize core managers
     */
    async initializeManagers() {
        // Load core managers (these would be imported in a real module system)
        if (typeof EventManager !== 'undefined') {
            this.eventManager = new EventManager();
        }

        if (typeof DOMManager !== 'undefined') {
            this.domManager = new DOMManager();
        }

        if (typeof PerformanceManager !== 'undefined' && this.options.enablePerformanceMonitoring) {
            this.performanceManager = new PerformanceManager();
        }

        if (typeof ComponentManager !== 'undefined') {
            this.componentManager = new ComponentManager(this.domManager, this.performanceManager);
        }

        // Setup common event handlers
        if (this.eventManager) {
            this.eventManager.setupCommonHandlers();
        }
    }

    /**
     * Setup theme and styles
     */
    async setupThemeAndStyles() {
        // Load critical styles
        await this.loadStyles();
        
        // Setup theme
        this.setupTheme();
    }

    /**
     * Load required CSS styles asynchronously
     */
    async loadStyles() {
        return new Promise((resolve) => {
            if (!document.querySelector('#mtech-styles')) {
                const link = document.createElement('link');
                link.id = 'mtech-styles';
                link.rel = 'stylesheet';
                link.href = './electron-showcase-styles.css';
                link.onload = resolve;
                link.onerror = resolve;
                document.head.appendChild(link);
            } else {
                resolve();
            }
        });
    }

    /**
     * Setup theme with optimized CSS custom properties
     */
    setupTheme() {
        const root = document.documentElement;
        
        // Batch CSS updates
        if (this.domManager) {
            this.domManager.scheduleUpdate(() => {
                root.style.setProperty('--primary-color', this.options.primaryColor);
                
                // Calculate derived colors
                const rgb = this.hexToRgb(this.options.primaryColor);
                if (rgb) {
                    root.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                    root.style.setProperty('--primary-dark', this.darkenColor(this.options.primaryColor, 20));
                    root.style.setProperty('--primary-light', this.lightenColor(this.options.primaryColor, 20));
                }
            });
        } else {
            // Fallback if DOM manager not available
            root.style.setProperty('--primary-color', this.options.primaryColor);
        }
    }

    /**
     * Setup common features
     */
    setupCommonFeatures() {
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup performance monitoring
        if (this.performanceManager) {
            this.startPerformanceMonitoring();
        }
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        if (this.eventManager) {
            // Ctrl/Cmd + K for search focus
            this.eventManager.on('keydown', document, (event) => {
                if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
                    event.preventDefault();
                    const searchInput = document.querySelector('[data-search], #component-search');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                    }
                }
            });
        }
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        if (!this.performanceManager) return;

        // Monitor performance every 5 seconds
        setInterval(() => {
            const warnings = this.performanceManager.checkPerformance();
            if (warnings.length > 0) {
                console.warn('Performance warnings:', warnings);
                this.performanceManager.optimize();
            }
        }, 5000);
    }

    /**
     * Create optimized title bar
     */
    async createTitleBar(config = {}) {
        if (!this.componentManager) {
            return this.createTitleBarFallback(config);
        }

        const titleBarConfig = {
            title: config.title || 'MTech App',
            icon: config.icon || 'fas fa-cube',
            theme: config.theme || 'default',
            showSettings: config.showSettings || false,
            ...config
        };

        try {
            const titleBar = await this.componentManager.createComponent('titlebar', titleBarConfig);
            return titleBar.element;
        } catch (error) {
            console.warn('Failed to create optimized title bar, falling back:', error);
            return this.createTitleBarFallback(config);
        }
    }

    /**
     * Fallback title bar creation
     */
    createTitleBarFallback(config) {
        const {
            title = 'MTech App',
            icon = 'fas fa-cube',
            theme = 'default',
            showSettings = false,
            onMinimize = null,
            onMaximize = null,
            onClose = null,
            onSettings = null
        } = config;

        const titleBar = this.domManager ? 
            this.domManager.getPooledElement('div', `title-bar ${theme ? `demo-titlebar-${theme}` : ''}`) :
            document.createElement('div');

        if (!this.domManager) {
            titleBar.className = `title-bar ${theme ? `demo-titlebar-${theme}` : ''}`;
        }

        titleBar.innerHTML = `
            <div class="title-bar-text">
                <i class="${icon}"></i>
                ${title}
            </div>
            <div class="title-bar-controls">
                ${showSettings ? `
                    <button class="title-bar-btn settings" title="Settings">
                        <i class="fas fa-cog"></i>
                    </button>
                ` : ''}
                <button class="title-bar-btn minimize-btn" title="Minimize">
                    <i class="fas fa-window-minimize"></i>
                </button>
                <button class="title-bar-btn maximize-btn" title="Maximize">
                    <i class="fas fa-window-maximize"></i>
                </button>
                <button class="title-bar-btn close-btn" title="Close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add optimized event listeners
        if (this.eventManager) {
            if (onMinimize) {
                this.eventManager.on('click', '.minimize-btn', onMinimize);
            }
            if (onMaximize) {
                this.eventManager.on('click', '.maximize-btn', onMaximize);
            }
            if (onClose) {
                this.eventManager.on('click', '.close-btn', onClose);
            }
            if (onSettings && showSettings) {
                this.eventManager.on('click', '.settings', onSettings);
            }
        } else {
            // Fallback event listeners
            if (onMinimize) {
                titleBar.querySelector('.minimize-btn')?.addEventListener('click', onMinimize);
            }
            if (onMaximize) {
                titleBar.querySelector('.maximize-btn')?.addEventListener('click', onMaximize);
            }
            if (onClose) {
                titleBar.querySelector('.close-btn')?.addEventListener('click', onClose);
            }
            if (onSettings && showSettings) {
                titleBar.querySelector('.settings')?.addEventListener('click', onSettings);
            }
        }

        return titleBar;
    }

    /**
     * Create optimized modal
     */
    async createModal(config = {}) {
        if (!this.componentManager) {
            return this.createModalFallback(config);
        }

        try {
            const modal = await this.componentManager.createComponent('modal', config);
            return modal;
        } catch (error) {
            console.warn('Failed to create optimized modal, falling back:', error);
            return this.createModalFallback(config);
        }
    }

    /**
     * Fallback modal creation
     */
    createModalFallback(config) {
        const {
            id,
            title,
            content,
            size = 'normal',
            buttons = [],
            closable = true,
            onClose = null
        } = config;

        const modal = this.domManager ? 
            this.domManager.getPooledElement('div', `modal ${size !== 'normal' ? `modal-${size}` : ''}`) :
            document.createElement('div');

        if (!this.domManager) {
            modal.className = `modal ${size !== 'normal' ? `modal-${size}` : ''}`;
        }

        modal.id = id;
        modal.style.display = 'none';

        const buttonsHtml = buttons.map(btn => `
            <button class="btn btn-${btn.type || 'secondary'}" data-action="${btn.action || 'close'}">
                ${btn.icon ? `<i class="${btn.icon}"></i>` : ''}
                ${btn.text}
            </button>
        `).join('');

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    ${closable ? `
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${buttons.length > 0 ? `
                    <div class="modal-footer">
                        ${buttonsHtml}
                    </div>
                ` : ''}
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Show modal with animation
     */
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (this.performanceManager) {
            this.performanceManager.fadeIn(modal, 300);
        } else {
            setTimeout(() => modal.classList.add('modal-show'), 10);
        }
    }

    /**
     * Close modal with animation
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        if (this.performanceManager) {
            this.performanceManager.fadeOut(modal, 300, () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            });
        } else {
            modal.classList.remove('modal-show');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            }, 300);
        }
    }

    /**
     * Show optimized notification
     */
    async showNotification(config = {}) {
        if (!this.componentManager) {
            return this.showNotificationFallback(config);
        }

        try {
            const notification = await this.componentManager.createComponent('notification', config);
            notification.show();
            return notification;
        } catch (error) {
            console.warn('Failed to create optimized notification, falling back:', error);
            return this.showNotificationFallback(config);
        }
    }

    /**
     * Fallback notification
     */
    showNotificationFallback(config) {
        const {
            message,
            type = 'info',
            duration = 3000
        } = config;

        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.mtech-notification');
        existingNotifications.forEach(notification => {
            if (this.domManager) {
                this.domManager.returnToPool(notification);
            } else {
                notification.remove();
            }
        });

        const notification = this.domManager ? 
            this.domManager.getPooledElement('div', 'mtech-notification') :
            document.createElement('div');

        if (!this.domManager) {
            notification.className = 'mtech-notification';
        }

        const iconMap = {
            info: 'fas fa-info-circle',
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };

        const colorMap = {
            info: 'var(--primary-color)',
            success: 'var(--success-color)',
            error: 'var(--error-color)',
            warning: '#ff9800'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="${iconMap[type]}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: ${colorMap[type]};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            font-size: 14px;
            font-weight: 500;
            max-width: 300px;
            display: flex;
            align-items: center;
            gap: 12px;
            will-change: transform;
        `;

        document.body.appendChild(notification);

        // Show notification
        if (this.domManager) {
            this.domManager.scheduleUpdate(() => {
                notification.style.transform = 'translateX(0)';
            });
        } else {
            setTimeout(() => {
                notification.style.transform = 'translateX(0)';
            }, 100);
        }

        // Setup close handler
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Auto-hide
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        return notification;
    }

    /**
     * Hide notification
     */
    hideNotification(notification) {
        notification.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (this.domManager) {
                this.domManager.returnToPool(notification);
            } else if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    /**
     * Get comprehensive performance metrics
     */
    getPerformanceMetrics() {
        const metrics = {
            timestamp: Date.now(),
            initialized: this.initialized,
            destroyed: this.destroyed
        };

        if (this.eventManager) {
            metrics.events = this.eventManager.getMetrics();
        }

        if (this.domManager) {
            metrics.dom = this.domManager.getMetrics();
        }

        if (this.performanceManager) {
            metrics.performance = this.performanceManager.getMetrics();
        }

        if (this.componentManager) {
            metrics.components = this.componentManager.getMetrics();
        }

        return metrics;
    }

    /**
     * Color utility functions
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    darkenColor(hex, percent) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = (100 - percent) / 100;
        return `#${Math.round(rgb.r * factor).toString(16).padStart(2, '0')}${Math.round(rgb.g * factor).toString(16).padStart(2, '0')}${Math.round(rgb.b * factor).toString(16).padStart(2, '0')}`;
    }

    lightenColor(hex, percent) {
        const rgb = this.hexToRgb(hex);
        if (!rgb) return hex;
        
        const factor = percent / 100;
        return `#${Math.round(rgb.r + (255 - rgb.r) * factor).toString(16).padStart(2, '0')}${Math.round(rgb.g + (255 - rgb.g) * factor).toString(16).padStart(2, '0')}${Math.round(rgb.b + (255 - rgb.b) * factor).toString(16).padStart(2, '0')}`;
    }

    /**
     * Destroy and clean up everything
     */
    destroy() {
        if (this.destroyed) return;

        // Destroy managers in reverse order
        if (this.componentManager) {
            this.componentManager.destroy();
        }

        if (this.performanceManager) {
            this.performanceManager.destroy();
        }

        if (this.domManager) {
            this.domManager.destroy();
        }

        if (this.eventManager) {
            this.eventManager.destroy();
        }

        // Clear references
        this.eventManager = null;
        this.domManager = null;
        this.performanceManager = null;
        this.componentManager = null;

        this.destroyed = true;
        this.initialized = false;

        console.log('MTech Components Optimized Library destroyed and cleaned up');
        
        // Emit destruction event
        document.dispatchEvent(new CustomEvent('mtech:destroyed', {
            detail: { instance: this }
        }));
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MTechComponentsOptimized;
} else if (typeof window !== 'undefined') {
    window.MTechComponentsOptimized = MTechComponentsOptimized;
}