/**
 * Optimized Event Management System
 * Part 1: Event Delegation and Memory Management
 */

class EventManager {
    constructor() {
        this.eventHandlers = new Map();
        this.delegatedEvents = new Set(['click', 'input', 'change', 'keydown', 'focus', 'blur']);
        this.activeListeners = new WeakMap();
        this.debounceCache = new Map();
        
        this.init();
    }

    /**
     * Initialize event delegation system
     */
    init() {
        this.delegatedEvents.forEach(eventType => {
            document.addEventListener(eventType, this.handleDelegatedEvent.bind(this), {
                passive: this.isPassiveEvent(eventType),
                capture: false
            });
        });
    }

    /**
     * Check if event should be passive
     */
    isPassiveEvent(eventType) {
        const passiveEvents = ['scroll', 'wheel', 'touchstart', 'touchmove'];
        return passiveEvents.includes(eventType);
    }

    /**
     * Handle delegated events efficiently
     */
    handleDelegatedEvent(event) {
        const target = event.target;
        const eventType = event.type;
        
        // Get all registered handlers for this event type
        const handlers = this.eventHandlers.get(eventType) || [];
        
        // Find matching handlers by traversing up the DOM tree
        let currentElement = target;
        while (currentElement && currentElement !== document) {
            for (const handler of handlers) {
                if (this.matchesSelector(currentElement, handler.selector)) {
                    // Prevent duplicate calls
                    if (!handler.processed) {
                        handler.processed = true;
                        handler.callback.call(currentElement, event);
                        
                        // Reset processed flag after event loop
                        setTimeout(() => {
                            handler.processed = false;
                        }, 0);
                        
                        if (handler.once) {
                            this.removeHandler(eventType, handler);
                        }
                        
                        if (event.defaultPrevented) {
                            return;
                        }
                    }
                }
            }
            currentElement = currentElement.parentElement;
        }
    }

    /**
     * Check if element matches selector
     */
    matchesSelector(element, selector) {
        if (typeof selector === 'string') {
            return element.matches && element.matches(selector);
        } else if (typeof selector === 'function') {
            return selector(element);
        } else if (selector instanceof Element) {
            return element === selector;
        }
        return false;
    }

    /**
     * Register event handler with delegation
     */
    on(eventType, selector, callback, options = {}) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }

        const handler = {
            selector,
            callback,
            once: options.once || false,
            processed: false,
            id: this.generateHandlerId()
        };

        this.eventHandlers.get(eventType).push(handler);
        return handler.id;
    }

    /**
     * Remove specific event handler
     */
    off(eventType, handlerId) {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            const index = handlers.findIndex(h => h.id === handlerId);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Remove handler from array
     */
    removeHandler(eventType, handler) {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        }
    }

    /**
     * Generate unique handler ID
     */
    generateHandlerId() {
        return `handler_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Optimized debounce with caching
     */
    debounce(func, delay = 300, key = null) {
        const cacheKey = key || func.toString();
        
        if (this.debounceCache.has(cacheKey)) {
            const cached = this.debounceCache.get(cacheKey);
            clearTimeout(cached.timeoutId);
            
            cached.timeoutId = setTimeout(() => {
                func.apply(this, cached.args);
                this.debounceCache.delete(cacheKey);
            }, delay);
            
            return cached.debouncedFunc;
        }

        let timeoutId;
        let args;
        
        const debouncedFunc = (...newArgs) => {
            args = newArgs;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
                this.debounceCache.delete(cacheKey);
            }, delay);
        };

        this.debounceCache.set(cacheKey, { debouncedFunc, timeoutId, args });
        return debouncedFunc;
    }

    /**
     * Throttle function execution
     */
    throttle(func, limit = 100) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Add common event handlers for MTech components
     */
    setupCommonHandlers() {
        // Copy code functionality
        this.on('click', '.copy-code-btn', (event) => {
            this.handleCopyCode(event.target);
        });

        // Modal close on backdrop click
        this.on('click', '.modal', (event) => {
            if (event.target.classList.contains('modal')) {
                this.handleModalClose(event.target);
            }
        });

        // Modal close on close button
        this.on('click', '.modal-close', (event) => {
            const modal = event.target.closest('.modal');
            if (modal) {
                this.handleModalClose(modal);
            }
        });

        // Escape key handling
        this.on('keydown', document, (event) => {
            if (event.key === 'Escape') {
                this.handleEscapeKey(event);
            }
        });

        // Form validation on input
        this.on('input', '.demo-form-input', this.debounce((event) => {
            this.handleFormValidation(event.target);
        }, 300));

        // Search functionality
        this.on('input', '[data-search]', this.debounce((event) => {
            this.handleSearch(event.target);
        }, 300));
    }

    /**
     * Handle copy code functionality
     */
    async handleCopyCode(button) {
        const codeContainer = button.nextElementSibling;
        const code = codeContainer?.querySelector('code');
        
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code.textContent);
            
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);

            // Trigger custom event
            button.dispatchEvent(new CustomEvent('mtech:code-copied', {
                detail: { code: code.textContent }
            }));
            
        } catch (err) {
            console.error('Failed to copy code:', err);
            button.dispatchEvent(new CustomEvent('mtech:code-copy-failed', {
                detail: { error: err }
            }));
        }
    }

    /**
     * Handle modal close
     */
    handleModalClose(modal) {
        modal.classList.remove('modal-show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);

        modal.dispatchEvent(new CustomEvent('mtech:modal-closed', {
            detail: { modalId: modal.id }
        }));
    }

    /**
     * Handle escape key
     */
    handleEscapeKey(event) {
        const openModals = document.querySelectorAll('.modal[style*="flex"]');
        openModals.forEach(modal => this.handleModalClose(modal));
    }

    /**
     * Handle form validation
     */
    handleFormValidation(input) {
        input.classList.remove('valid', 'invalid');

        if (input.value.length > 0) {
            if (input.validity.valid) {
                input.classList.add('valid');
            } else {
                input.classList.add('invalid');
            }
        }
    }

    /**
     * Handle search functionality
     */
    handleSearch(searchInput) {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const targetSelector = searchInput.dataset.search;
        const targets = document.querySelectorAll(targetSelector);

        targets.forEach(target => {
            const text = target.textContent.toLowerCase();
            const shouldShow = text.includes(searchTerm);
            
            target.style.display = shouldShow ? '' : 'none';
        });

        searchInput.dispatchEvent(new CustomEvent('mtech:search-performed', {
            detail: { searchTerm, resultCount: Array.from(targets).filter(t => t.style.display !== 'none').length }
        }));
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        return {
            totalHandlers: Array.from(this.eventHandlers.values()).reduce((sum, handlers) => sum + handlers.length, 0),
            eventTypes: this.eventHandlers.size,
            debounceCache: this.debounceCache.size,
            memoryUsage: this.estimateMemoryUsage()
        };
    }

    /**
     * Estimate memory usage
     */
    estimateMemoryUsage() {
        let size = 0;
        this.eventHandlers.forEach(handlers => {
            size += handlers.length * 100; // Rough estimate per handler
        });
        return size;
    }

    /**
     * Clean up all event handlers and caches
     */
    destroy() {
        // Clear all handlers
        this.eventHandlers.clear();
        
        // Clear debounce cache
        this.debounceCache.forEach(cached => {
            clearTimeout(cached.timeoutId);
        });
        this.debounceCache.clear();

        // Remove delegated event listeners
        this.delegatedEvents.forEach(eventType => {
            document.removeEventListener(eventType, this.handleDelegatedEvent);
        });

        console.log('EventManager destroyed and cleaned up');
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventManager;
} else if (typeof window !== 'undefined') {
    window.EventManager = EventManager;
}