/**
 * Component Management System
 * Part 4: Lazy Loading and Component Lifecycle
 */

class ComponentManager {
    constructor(domManager, performanceManager) {
        this.domManager = domManager;
        this.performanceManager = performanceManager;
        
        this.components = new Map();
        this.componentInstances = new WeakMap();
        this.componentRegistry = new Map();
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        
        this.setupComponentSystem();
    }

    /**
     * Setup component system
     */
    setupComponentSystem() {
        this.registerCoreComponents();
        this.setupLazyLoading();
    }

    /**
     * Register core components
     */
    registerCoreComponents() {
        // Register built-in components
        this.registerComponent('modal', {
            template: this.getModalTemplate(),
            lazy: false,
            dependencies: []
        });

        this.registerComponent('notification', {
            template: this.getNotificationTemplate(),
            lazy: false,
            dependencies: []
        });

        this.registerComponent('button', {
            template: this.getButtonTemplate(),
            lazy: false,
            dependencies: []
        });

        this.registerComponent('card', {
            template: this.getCardTemplate(),
            lazy: false,
            dependencies: []
        });
    }

    /**
     * Register a component
     */
    registerComponent(name, config) {
        this.componentRegistry.set(name, {
            name,
            template: config.template,
            lazy: config.lazy || false,
            dependencies: config.dependencies || [],
            module: config.module || null,
            loaded: !config.lazy,
            instances: new Set()
        });
    }

    /**
     * Create component instance
     */
    async createComponent(name, config = {}) {
        const componentDef = this.componentRegistry.get(name);
        if (!componentDef) {
            throw new Error(`Component '${name}' not found`);
        }

        // Load component if lazy
        if (componentDef.lazy && !componentDef.loaded) {
            await this.loadComponent(name);
        }

        // Load dependencies
        await this.loadDependencies(componentDef.dependencies);

        // Create component instance
        const instance = new ComponentInstance(name, config, componentDef, this);
        
        // Track instance
        componentDef.instances.add(instance);
        this.componentInstances.set(instance.element, instance);

        return instance;
    }

    /**
     * Load component lazily
     */
    async loadComponent(name) {
        const componentDef = this.componentRegistry.get(name);
        if (!componentDef || componentDef.loaded) {
            return;
        }

        // Check if already loading
        if (this.loadingPromises.has(name)) {
            return this.loadingPromises.get(name);
        }

        const loadPromise = this.performLoadComponent(componentDef);
        this.loadingPromises.set(name, loadPromise);

        try {
            await loadPromise;
            componentDef.loaded = true;
        } finally {
            this.loadingPromises.delete(name);
        }
    }

    /**
     * Perform component loading
     */
    async performLoadComponent(componentDef) {
        if (componentDef.module) {
            try {
                const module = await import(componentDef.module);
                
                // Update component definition with loaded module
                if (module.template) {
                    componentDef.template = module.template;
                }
                if (module.dependencies) {
                    componentDef.dependencies = module.dependencies;
                }
                
                this.loadedModules.set(componentDef.name, module);
            } catch (error) {
                console.error(`Failed to load component '${componentDef.name}':`, error);
                throw error;
            }
        }
    }

    /**
     * Load component dependencies
     */
    async loadDependencies(dependencies) {
        const loadPromises = dependencies.map(dep => this.loadComponent(dep));
        await Promise.all(loadPromises);
    }

    /**
     * Setup lazy loading for components
     */
    setupLazyLoading() {
        // Observe elements with data-component attribute
        if (this.domManager.intersectionObserver) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.handleLazyComponentLoad(entry.target);
                    }
                });
            }, {
                rootMargin: '100px',
                threshold: 0.1
            });

            // Observe existing lazy components
            document.querySelectorAll('[data-component][data-lazy]').forEach(el => {
                observer.observe(el);
            });

            this.lazyObserver = observer;
        }
    }

    /**
     * Handle lazy component loading
     */
    async handleLazyComponentLoad(element) {
        const componentName = element.dataset.component;
        if (!componentName) return;

        try {
            const config = this.parseComponentConfig(element);
            const instance = await this.createComponent(componentName, config);
            
            // Replace placeholder with actual component
            element.parentNode.replaceChild(instance.element, element);
            
            // Stop observing
            this.lazyObserver?.unobserve(element);
            
        } catch (error) {
            console.error(`Failed to load lazy component '${componentName}':`, error);
        }
    }

    /**
     * Parse component configuration from element
     */
    parseComponentConfig(element) {
        const config = {};
        
        // Parse data attributes
        Array.from(element.attributes).forEach(attr => {
            if (attr.name.startsWith('data-config-')) {
                const key = attr.name.replace('data-config-', '').replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                config[key] = this.parseAttributeValue(attr.value);
            }
        });

        return config;
    }

    /**
     * Parse attribute value
     */
    parseAttributeValue(value) {
        // Try to parse as JSON
        try {
            return JSON.parse(value);
        } catch {
            // Return as string if not valid JSON
            return value;
        }
    }

    /**
     * Destroy component instance
     */
    destroyComponent(instance) {
        const componentDef = this.componentRegistry.get(instance.name);
        if (componentDef) {
            componentDef.instances.delete(instance);
        }

        this.componentInstances.delete(instance.element);
        instance.destroy();
    }

    /**
     * Get component templates
     */
    getModalTemplate() {
        return `
            <div class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>{{title}}</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        {{content}}
                    </div>
                    <div class="modal-footer">
                        {{buttons}}
                    </div>
                </div>
            </div>
        `;
    }

    getNotificationTemplate() {
        return `
            <div class="mtech-notification">
                <div class="notification-content">
                    <i class="{{icon}}"></i>
                    <span>{{message}}</span>
                </div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    getButtonTemplate() {
        return `
            <button class="btn btn-{{type}} {{size}}">
                {{#if icon}}<i class="{{icon}}"></i>{{/if}}
                {{text}}
            </button>
        `;
    }

    getCardTemplate() {
        return `
            <div class="overview-card {{type}}">
                {{#if icon}}<i class="{{icon}}"></i>{{/if}}
                {{#if title}}<h4>{{title}}</h4>{{/if}}
                {{#if value}}<p>{{value}}</p>{{/if}}
                {{#if subtitle}}<span class="card-subtitle">{{subtitle}}</span>{{/if}}
            </div>
        `;
    }

    /**
     * Get performance metrics
     */
    getMetrics() {
        const componentCounts = {};
        this.componentRegistry.forEach((def, name) => {
            componentCounts[name] = def.instances.size;
        });

        return {
            registeredComponents: this.componentRegistry.size,
            loadedModules: this.loadedModules.size,
            activeInstances: Array.from(this.componentRegistry.values())
                .reduce((sum, def) => sum + def.instances.size, 0),
            componentCounts,
            loadingPromises: this.loadingPromises.size
        };
    }

    /**
     * Clean up and destroy
     */
    destroy() {
        // Destroy all component instances
        this.componentRegistry.forEach(def => {
            def.instances.forEach(instance => {
                instance.destroy();
            });
            def.instances.clear();
        });

        // Clear registries
        this.componentRegistry.clear();
        this.loadedModules.clear();
        this.loadingPromises.clear();

        // Disconnect lazy observer
        this.lazyObserver?.disconnect();

        console.log('ComponentManager destroyed and cleaned up');
    }
}

/**
 * Component Instance Class
 */
class ComponentInstance {
    constructor(name, config, definition, manager) {
        this.name = name;
        this.config = config;
        this.definition = definition;
        this.manager = manager;
        this.element = null;
        this.eventHandlers = [];
        this.childComponents = new Set();
        
        this.createElement();
        this.setupEventHandlers();
    }

    /**
     * Create component element
     */
    createElement() {
        const template = this.definition.template;
        const html = this.processTemplate(template, this.config);
        
        this.element = this.manager.domManager.createElement(html);
        this.element.setAttribute('data-component', this.name);
        this.element.setAttribute('data-instance-id', this.generateInstanceId());
    }

    /**
     * Process template with data
     */
    processTemplate(template, data) {
        let html = template;
        
        // Simple template processing
        Object.entries(data).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, value);
        });

        // Handle conditionals
        html = html.replace(/{{#if\s+(\w+)}}(.*?){{\/if}}/gs, (match, condition, content) => {
            return data[condition] ? content : '';
        });

        return html;
    }

    /**
     * Setup event handlers
     */
    setupEventHandlers() {
        // Component-specific event handling
        switch (this.name) {
            case 'modal':
                this.setupModalEvents();
                break;
            case 'notification':
                this.setupNotificationEvents();
                break;
            case 'button':
                this.setupButtonEvents();
                break;
        }
    }

    /**
     * Setup modal events
     */
    setupModalEvents() {
        const closeBtn = this.element.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.close();
            }
        });
    }

    /**
     * Setup notification events
     */
    setupNotificationEvents() {
        const closeBtn = this.element.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.close();
            });
        }

        // Auto-close after duration
        if (this.config.duration && this.config.duration > 0) {
            setTimeout(() => {
                this.close();
            }, this.config.duration);
        }
    }

    /**
     * Setup button events
     */
    setupButtonEvents() {
        if (this.config.onClick) {
            this.element.addEventListener('click', this.config.onClick);
        }
    }

    /**
     * Show component
     */
    show() {
        if (this.name === 'modal') {
            this.element.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            this.manager.performanceManager.fadeIn(this.element, 300);
        } else if (this.name === 'notification') {
            document.body.appendChild(this.element);
            this.manager.performanceManager.slideIn(this.element, 'right', 300);
        }
    }

    /**
     * Close component
     */
    close() {
        if (this.name === 'modal') {
            this.manager.performanceManager.fadeOut(this.element, 300, () => {
                this.element.style.display = 'none';
                document.body.style.overflow = '';
            });
        } else if (this.name === 'notification') {
            this.manager.performanceManager.slideIn(this.element, 'right', 300, () => {
                if (this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
            });
        }

        // Emit close event
        this.element.dispatchEvent(new CustomEvent('mtech:component-closed', {
            detail: { component: this }
        }));
    }

    /**
     * Update component
     */
    update(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Re-render if needed
        const newHtml = this.processTemplate(this.definition.template, this.config);
        this.element.innerHTML = newHtml;
        
        // Re-setup event handlers
        this.setupEventHandlers();
    }

    /**
     * Generate instance ID
     */
    generateInstanceId() {
        return `${this.name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Destroy component instance
     */
    destroy() {
        // Remove event handlers
        this.eventHandlers.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });

        // Destroy child components
        this.childComponents.forEach(child => {
            child.destroy();
        });

        // Remove from DOM
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }

        // Clear references
        this.element = null;
        this.eventHandlers = [];
        this.childComponents.clear();
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ComponentManager, ComponentInstance };
} else if (typeof window !== 'undefined') {
    window.ComponentManager = ComponentManager;
    window.ComponentInstance = ComponentInstance;
}