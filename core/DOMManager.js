/**
 * Optimized DOM Management System
 * Part 2: DOM Manipulation and Element Pooling
 */

class DOMManager {
    constructor() {
        this.elementPool = new Map();
        this.elementCache = new Map();
        this.rafCallbacks = new Set();
        this.batchedUpdates = new Map();
        this.observers = new Map();
        this.maxPoolSize = 20;
        
        this.setupObservers();
    }

    /**
     * Setup performance observers
     */
    setupObservers() {
        // Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleElementVisible(entry.target);
                    }
                });
            }, {
                rootMargin: '50px',
                threshold: 0.1
            });
        }

        // Resize Observer for responsive components
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver((entries) => {
                this.batchUpdate('resize', () => {
                    entries.forEach(entry => {
                        this.handleElementResize(entry.target, entry.contentRect);
                    });
                });
            });
        }

        // Mutation Observer for DOM changes
        if ('MutationObserver' in window) {
            this.mutationObserver = new MutationObserver((mutations) => {
                this.handleDOMMutations(mutations);
            });
        }
    }

    /**
     * Batch DOM updates using RAF
     */
    batchUpdate(key, callback) {
        if (this.batchedUpdates.has(key)) {
            this.batchedUpdates.get(key).push(callback);
        } else {
            this.batchedUpdates.set(key, [callback]);
            
            requestAnimationFrame(() => {
                const callbacks = this.batchedUpdates.get(key) || [];
                this.batchedUpdates.delete(key);
                
                performance.mark(`mtech-${key}-start`);
                callbacks.forEach(cb => cb());
                performance.mark(`mtech-${key}-end`);
                performance.measure(`mtech-${key}`, `mtech-${key}-start`, `mtech-${key}-end`);
            });
        }
    }

    /**
     * Schedule update using RAF
     */
    scheduleUpdate(callback) {
        this.rafCallbacks.add(callback);
        
        if (this.rafCallbacks.size === 1) {
            requestAnimationFrame(() => {
                const callbacks = Array.from(this.rafCallbacks);
                this.rafCallbacks.clear();
                
                performance.mark('mtech-update-start');
                callbacks.forEach(cb => cb());
                performance.mark('mtech-update-end');
                performance.measure('mtech-update', 'mtech-update-start', 'mtech-update-end');
            });
        }
    }

    /**
     * Get element from pool or create new one
     */
    getPooledElement(tagName, className = '', attributes = {}) {
        const poolKey = `${tagName.toLowerCase()}-${className}`;
        
        if (!this.elementPool.has(poolKey)) {
            this.elementPool.set(poolKey, []);
        }

        const pool = this.elementPool.get(poolKey);
        
        let element;
        if (pool.length > 0) {
            element = pool.pop();
            this.resetElement(element);
        } else {
            element = document.createElement(tagName);
            if (className) {
                element.className = className;
            }
        }

        // Apply attributes
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });

        return element;
    }

    /**
     * Return element to pool
     */
    returnToPool(element) {
        if (!element || !element.tagName) return;

        const poolKey = `${element.tagName.toLowerCase()}-${element.className}`;
        
        if (!this.elementPool.has(poolKey)) {
            this.elementPool.set(poolKey, []);
        }

        const pool = this.elementPool.get(poolKey);
        
        // Only pool if under limit
        if (pool.length < this.maxPoolSize) {
            this.resetElement(element);
            
            // Remove from DOM if attached
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
            
            pool.push(element);
        }
    }

    /**
     * Reset element to clean state
     */
    resetElement(element) {
        // Clear content
        element.innerHTML = '';
        
        // Remove inline styles except essential ones
        const preserveStyles = ['display', 'position'];
        const currentStyles = element.style.cssText;
        element.removeAttribute('style');
        
        preserveStyles.forEach(prop => {
            const value = element.style.getPropertyValue(prop);
            if (value) {
                element.style.setProperty(prop, value);
            }
        });

        // Remove data attributes
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-') && attr.name !== 'data-pool') {
                element.removeAttribute(attr.name);
            }
        });

        // Remove event listeners by cloning
        const newElement = element.cloneNode(false);
        if (element.parentNode) {
            element.parentNode.replaceChild(newElement, element);
            return newElement;
        }
        
        return element;
    }

    /**
     * Cached element selector
     */
    querySelector(selector, useCache = true) {
        if (useCache && this.elementCache.has(selector)) {
            const cached = this.elementCache.get(selector);
            // Verify element is still in DOM
            if (document.contains(cached.element)) {
                return cached.element;
            } else {
                this.elementCache.delete(selector);
            }
        }

        const element = document.querySelector(selector);
        
        if (useCache && element) {
            this.elementCache.set(selector, {
                element,
                timestamp: Date.now()
            });
        }

        return element;
    }

    /**
     * Cached element selector for multiple elements
     */
    querySelectorAll(selector, useCache = true) {
        const cacheKey = `all:${selector}`;
        
        if (useCache && this.elementCache.has(cacheKey)) {
            const cached = this.elementCache.get(cacheKey);
            // Check if cache is still valid (5 seconds)
            if (Date.now() - cached.timestamp < 5000) {
                return cached.elements;
            } else {
                this.elementCache.delete(cacheKey);
            }
        }

        const elements = Array.from(document.querySelectorAll(selector));
        
        if (useCache) {
            this.elementCache.set(cacheKey, {
                elements,
                timestamp: Date.now()
            });
        }

        return elements;
    }

    /**
     * Efficient element creation with template
     */
    createElement(template, data = {}) {
        // Simple template engine
        let html = template;
        
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, value);
        });

        const container = this.getPooledElement('div');
        container.innerHTML = html;
        
        const element = container.firstElementChild;
        this.returnToPool(container);
        
        return element;
    }

    /**
     * Batch DOM operations
     */
    batchDOMOperations(operations) {
        this.scheduleUpdate(() => {
            // Create document fragment for efficient DOM manipulation
            const fragment = document.createDocumentFragment();
            const elementsToAppend = [];
            
            operations.forEach(operation => {
                switch (operation.type) {
                    case 'create':
                        const element = this.getPooledElement(
                            operation.tagName, 
                            operation.className, 
                            operation.attributes
                        );
                        if (operation.content) {
                            element.innerHTML = operation.content;
                        }
                        if (operation.parent) {
                            elementsToAppend.push({ element, parent: operation.parent });
                        } else {
                            fragment.appendChild(element);
                        }
                        break;
                        
                    case 'update':
                        if (operation.element) {
                            Object.entries(operation.properties || {}).forEach(([key, value]) => {
                                operation.element[key] = value;
                            });
                            Object.entries(operation.styles || {}).forEach(([key, value]) => {
                                operation.element.style[key] = value;
                            });
                        }
                        break;
                        
                    case 'remove':
                        if (operation.element && operation.element.parentNode) {
                            this.returnToPool(operation.element);
                        }
                        break;
                }
            });

            // Append all elements at once
            elementsToAppend.forEach(({ element, parent }) => {
                parent.appendChild(element);
            });
        });
    }

    /**
     * Handle element becoming visible
     */
    handleElementVisible(element) {
        if (element.dataset.lazyLoad) {
            this.loadLazyContent(element);
        }
        
        element.dispatchEvent(new CustomEvent('mtech:element-visible', {
            detail: { element }
        }));
    }

    /**
     * Handle element resize
     */
    handleElementResize(element, rect) {
        element.dispatchEvent(new CustomEvent('mtech:element-resized', {
            detail: { element, rect }
        }));
    }

    /**
     * Handle DOM mutations
     */
    handleDOMMutations(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                // Handle added nodes
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.handleElementAdded(node);
                    }
                });
                
                // Handle removed nodes
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.handleElementRemoved(node);
                    }
                });
            }
        });
    }

    /**
     * Handle element added to DOM
     */
    handleElementAdded(element) {
        // Setup lazy loading if needed
        if (element.dataset.lazyLoad) {
            this.intersectionObserver?.observe(element);
        }
        
        // Setup resize observation if needed
        if (element.dataset.resizeObserve) {
            this.resizeObserver?.observe(element);
        }
    }

    /**
     * Handle element removed from DOM
     */
    handleElementRemoved(element) {
        // Clean up observers
        this.intersectionObserver?.unobserve(element);
        this.resizeObserver?.unobserve(element);
        
        // Clean up cache entries
        this.cleanupElementCache(element);
    }

    /**
     * Load lazy content
     */
    loadLazyContent(element) {
        const src = element.dataset.src;
        const content = element.dataset.content;
        
        if (src) {
            // Load image or other resource
            if (element.tagName === 'IMG') {
                element.src = src;
                element.removeAttribute('data-src');
            }
        }
        
        if (content) {
            // Load content
            element.innerHTML = content;
            element.removeAttribute('data-content');
        }
        
        element.removeAttribute('data-lazy-load');
        element.classList.add('lazy-loaded');
    }

    /**
     * Clean up element cache
     */
    cleanupElementCache(removedElement) {
        const toDelete = [];
        
        this.elementCache.forEach((cached, key) => {
            if (cached.element === removedElement || 
                (cached.elements && cached.elements.includes(removedElement))) {
                toDelete.push(key);
            }
        });
        
        toDelete.forEach(key => this.elementCache.delete(key));
    }

    /**
     * Clear old cache entries
     */
    clearOldCache(maxAge = 30000) { // 30 seconds
        const now = Date.now();
        const toDelete = [];
        
        this.elementCache.forEach((cached, key) => {
            if (now - cached.timestamp > maxAge) {
                toDelete.push(key);
            }
        });
        
        toDelete.forEach(key => this.elementCache.delete(key));
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        const poolSizes = {};
        this.elementPool.forEach((pool, key) => {
            poolSizes[key] = pool.length;
        });

        return {
            pooledElements: Array.from(this.elementPool.values()).reduce((sum, pool) => sum + pool.length, 0),
            poolSizes,
            cachedSelectors: this.elementCache.size,
            pendingUpdates: this.rafCallbacks.size,
            batchedOperations: this.batchedUpdates.size
        };
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        // Disconnect observers
        this.intersectionObserver?.disconnect();
        this.resizeObserver?.disconnect();
        this.mutationObserver?.disconnect();
        
        // Clear pools
        this.elementPool.clear();
        this.elementCache.clear();
        this.rafCallbacks.clear();
        this.batchedUpdates.clear();
        
        console.log('DOMManager destroyed and cleaned up');
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMManager;
} else if (typeof window !== 'undefined') {
    window.DOMManager = DOMManager;
}