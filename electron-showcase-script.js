// MTech Electron Component Showcase JavaScript

// Initialize the showcase when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeShowcase();
    initializeSearch();
    initializeSyntaxHighlighting();
    initializeFormControls();
    initializeColorCustomization();
    initializeDocumentationTabs();
    initializeNotificationCenter();
});

// Initialize the main showcase functionality
function initializeShowcase() {
    // Add click handlers to tab items
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.addEventListener('click', function() {
            const componentName = this.getAttribute('data-component');
            switchComponent(componentName);
        });
    });

    // Add click handlers to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            // Get the onclick attribute value and extract component name
            const onclickAttr = this.getAttribute('onclick');
            if (onclickAttr) {
                const match = onclickAttr.match(/switchComponent\('([^']+)'\)/);
                if (match) {
                    switchComponent(match[1]);
                }
            }
        });
    });

    // Initialize title bar controls
    initializeTitleBarControls();
}

// Initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('component-search');
    const tabItems = document.querySelectorAll('.tab-item');

    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        tabItems.forEach(item => {
            const componentName = item.querySelector('span').textContent.toLowerCase();
            const shouldShow = componentName.includes(searchTerm);
            
            if (shouldShow) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });

    // Clear search on escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            this.value = '';
            this.dispatchEvent(new Event('input'));
            this.blur();
        }
    });
}

// Initialize syntax highlighting
function initializeSyntaxHighlighting() {
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
}

// Initialize title bar controls
function initializeTitleBarControls() {
    const titleBarBtns = document.querySelectorAll('.title-bar-btn');
    
    titleBarBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const title = this.getAttribute('title');
            
            // Add visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
            
            // Show notification for demo purposes
            showNotification(`${title} button clicked (demo only)`, 'info');
        });
    });
}

// Switch between components
function switchComponent(componentName) {
    // Update active tab
    const tabItems = document.querySelectorAll('.tab-item');
    tabItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-component') === componentName) {
            item.classList.add('active');
        }
    });

    // Update active content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
    });

    const targetContent = document.getElementById(`component-${componentName}`);
    if (targetContent) {
        targetContent.classList.add('active');
        
        // Re-highlight syntax if switching to a component with code
        setTimeout(() => {
            if (typeof Prism !== 'undefined') {
                Prism.highlightAllUnder(targetContent);
            }
        }, 100);
    }

    // Scroll to top of content
    const contentArea = document.querySelector('.content-area');
    if (contentArea) {
        contentArea.scrollTop = 0;
    }
}

// Copy code functionality
function copyCode(button) {
    const codeContainer = button.nextElementSibling;
    const code = codeContainer.querySelector('code');
    
    if (code) {
        // Create a temporary textarea to copy the text
        const textarea = document.createElement('textarea');
        textarea.value = code.textContent;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            
            // Update button state
            const originalContent = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            button.classList.add('copied');
            
            // Show notification
            showNotification('Code copied to clipboard!', 'success');
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalContent;
                button.classList.remove('copied');
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy code:', err);
            showNotification('Failed to copy code', 'error');
        }
        
        document.body.removeChild(textarea);
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Set icon based on type
    let icon = 'fas fa-info-circle';
    let bgColor = 'var(--primary-color)';
    
    if (type === 'success') {
        icon = 'fas fa-check-circle';
        bgColor = 'var(--success-color)';
    } else if (type === 'error') {
        icon = 'fas fa-exclamation-circle';
        bgColor = 'var(--error-color)';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 60px;
        right: 20px;
        background: ${bgColor};
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
    `;
    
    // Style the notification content
    const notificationContent = notification.querySelector('.notification-content');
    notificationContent.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide and remove notification after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Modal functionality
function showDemoModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Add click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeDemoModal();
            }
        });
    }
}

function closeDemoModal() {
    const modal = document.getElementById('demo-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape') {
        closeDemoModal();
    }
    
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('component-search');
        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        }
    }
});

// Smooth scrolling for better UX
function smoothScrollTo(element) {
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Toggle collapsible sidebar
function toggleSidebar(sidebarId) {
    const sidebar = document.getElementById(sidebarId);
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

// Toggle submenu in multi-level navigation
function toggleSubmenu(element) {
    const tabGroup = element.closest('.demo-tab-group');
    if (tabGroup) {
        tabGroup.classList.toggle('expanded');
    }
}

// Add loading animation for better perceived performance
function showLoadingState() {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.opacity = '0.7';
        appContainer.style.pointerEvents = 'none';
    }
}

function hideLoadingState() {
    const appContainer = document.querySelector('.app-container');
    if (appContainer) {
        appContainer.style.opacity = '1';
        appContainer.style.pointerEvents = '';
    }
}

// Utility function to debounce search input
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize form controls
function initializeFormControls() {
    // Initialize range sliders with value display
    initializeRangeSliders();

    // Initialize file inputs
    initializeFileInputs();

    // Initialize color pickers
    initializeColorPickers();

    // Initialize toggle switches
    initializeToggleSwitches();
}

// Initialize range sliders
function initializeRangeSliders() {
    const rangeSliders = document.querySelectorAll('.demo-range-slider');

    rangeSliders.forEach(slider => {
        const valueDisplay = slider.parentNode.querySelector('.demo-range-value');

        // Update value display
        function updateValue() {
            const value = slider.value;
            const max = slider.max;
            const min = slider.min;

            // Determine the unit based on the label
            const label = slider.parentNode.parentNode.querySelector('.demo-form-label').textContent;
            let unit = '';

            if (label.includes('Volume')) {
                unit = '%';
            } else if (label.includes('seconds')) {
                unit = 's';
            } else if (label.includes('minutes')) {
                unit = 'm';
            }

            if (valueDisplay) {
                valueDisplay.textContent = value + unit;
            }

            // Update slider background to show progress
            const percentage = ((value - min) / (max - min)) * 100;
            slider.style.background = `linear-gradient(to right, var(--primary-color) 0%, var(--primary-color) ${percentage}%, var(--background-card) ${percentage}%, var(--background-card) 100%)`;
        }

        // Initialize
        updateValue();

        // Update on input
        slider.addEventListener('input', updateValue);
        slider.addEventListener('change', updateValue);
    });
}

// Initialize file inputs
function initializeFileInputs() {
    const fileInputs = document.querySelectorAll('.demo-file-input');

    fileInputs.forEach(input => {
        const fileNameDisplay = input.parentNode.querySelector('.demo-file-name');

        input.addEventListener('change', function() {
            if (this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                const fileSize = (this.files[0].size / 1024).toFixed(1) + ' KB';

                if (fileNameDisplay) {
                    fileNameDisplay.textContent = `${fileName} (${fileSize})`;
                    fileNameDisplay.style.color = 'var(--primary-color)';
                    fileNameDisplay.style.fontStyle = 'normal';
                }

                // Show notification
                showNotification(`File selected: ${fileName}`, 'success');
            } else {
                if (fileNameDisplay) {
                    fileNameDisplay.textContent = 'No file selected';
                    fileNameDisplay.style.color = 'var(--text-secondary)';
                    fileNameDisplay.style.fontStyle = 'italic';
                }
            }
        });
    });
}

// Initialize color pickers
function initializeColorPickers() {
    const colorInputs = document.querySelectorAll('.demo-color-input');

    colorInputs.forEach(input => {
        const valueDisplay = input.parentNode.querySelector('.demo-color-value');

        function updateColorValue() {
            const color = input.value;
            if (valueDisplay) {
                valueDisplay.textContent = color.toUpperCase();
                valueDisplay.style.borderColor = color;
                valueDisplay.style.color = color;
            }
        }

        // Initialize
        updateColorValue();

        // Update on change
        input.addEventListener('input', updateColorValue);
        input.addEventListener('change', function() {
            updateColorValue();
            showNotification(`Color changed to ${input.value.toUpperCase()}`, 'info');
        });
    });
}

// Initialize toggle switches
function initializeToggleSwitches() {
    const toggleInputs = document.querySelectorAll('.demo-toggle-input');

    toggleInputs.forEach(input => {
        input.addEventListener('change', function() {
            const toggleText = this.parentNode.parentNode.querySelector('.demo-toggle-text').textContent;
            const state = this.checked ? 'enabled' : 'disabled';

            showNotification(`${toggleText} ${state}`, this.checked ? 'success' : 'info');
        });
    });
}

// Add interactive behavior to checkboxes and radio buttons
document.addEventListener('change', function(e) {
    // Handle checkbox changes
    if (e.target.classList.contains('demo-checkbox')) {
        const label = e.target.parentNode.textContent.trim();
        const state = e.target.checked ? 'enabled' : 'disabled';
        showNotification(`${label} ${state}`, e.target.checked ? 'success' : 'info');
    }

    // Handle radio button changes
    if (e.target.classList.contains('demo-radio')) {
        const label = e.target.parentNode.textContent.trim();
        showNotification(`Selected: ${label}`, 'info');
    }

    // Handle select changes
    if (e.target.classList.contains('demo-form-select')) {
        if (e.target.multiple) {
            const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.text);
            if (selectedOptions.length > 0) {
                showNotification(`Selected: ${selectedOptions.join(', ')}`, 'info');
            }
        } else {
            showNotification(`Selected: ${e.target.value}`, 'info');
        }
    }
});

// Add form validation feedback
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('demo-form-input')) {
        // Remove any existing validation classes
        e.target.classList.remove('valid', 'invalid');

        // Add validation class based on validity
        if (e.target.value.length > 0) {
            if (e.target.validity.valid) {
                e.target.classList.add('valid');
            } else {
                e.target.classList.add('invalid');
            }
        }
    }
});

// Modal Functions for Demo
function showInfoModal() {
    showModal('info-modal');
}

function closeInfoModal() {
    closeModal('info-modal');
}

function showConfirmModal() {
    showModal('confirm-modal');
}

function closeConfirmModal() {
    closeModal('confirm-modal');
}

function confirmAction() {
    showNotification('Item deleted successfully!', 'success');
    closeConfirmModal();
}

function showSettingsModal() {
    showModal('settings-modal');
}

function closeSettingsModal() {
    closeModal('settings-modal');
}

function showFormModal() {
    showModal('form-modal');
}

function closeFormModal() {
    closeModal('form-modal');
}

function submitForm() {
    const form = document.querySelector('.modal-form');
    const formData = new FormData(form);

    // Simple validation
    const nameInput = form.querySelector('input[type="text"]');
    const categorySelect = form.querySelector('select');

    if (!nameInput.value.trim()) {
        showNotification('Please enter an item name', 'error');
        nameInput.focus();
        return;
    }

    if (!categorySelect.value) {
        showNotification('Please select a category', 'error');
        categorySelect.focus();
        return;
    }

    showNotification('Item added successfully!', 'success');
    closeFormModal();

    // Reset form
    form.reset();
}

function saveSettings() {
    showNotification('Settings saved successfully!', 'success');
    closeSettingsModal();
}

// Settings tab switching
function showSettingsTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.settings-tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.settings-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    const targetTab = document.getElementById(`settings-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }

    // Add active class to clicked button
    const targetButton = event.target;
    if (targetButton) {
        targetButton.classList.add('active');
    }
}

// Generic modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Add animation class
        setTimeout(() => {
            modal.classList.add('modal-show');
        }, 10);

        // Close on backdrop click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('modal-show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }
}

// Enhanced keyboard shortcuts for modals
document.addEventListener('keydown', function(e) {
    // Escape key to close modal
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal[style*="flex"]');
        openModals.forEach(modal => {
            const modalId = modal.id;
            closeModal(modalId);
        });
    }

    // Enter key to submit forms in modals
    if (e.key === 'Enter' && e.target.closest('.modal-form')) {
        e.preventDefault();
        const modal = e.target.closest('.modal');
        if (modal) {
            const submitButton = modal.querySelector('.btn-primary');
            if (submitButton) {
                submitButton.click();
            }
        }
    }
});

// Color Customization System
const defaultColors = {
    'primary-color': '#ff9800',
    'primary-dark': '#f57c00',
    'primary-darker': '#e65100',
    'background-dark': '#0a0a0c',
    'background-light': '#111113',
    'background-card': '#1a1a1c',
    'text-primary': '#ffffff',
    'text-secondary': '#b0b0b0',
    'border-color': '#333333',
    'hover-color': '#23232a',
    'success-color': '#4caf50',
    'error-color': '#f44336'
};

// Initialize color customization
function initializeColorCustomization() {
    loadSavedColors();
    setupColorPickers();
}

// Load saved colors from localStorage
function loadSavedColors() {
    const savedColors = localStorage.getItem('mtech-custom-colors');
    if (savedColors) {
        try {
            const colors = JSON.parse(savedColors);
            applyColors(colors);
        } catch (e) {
            console.warn('Failed to load saved colors:', e);
        }
    }
}

// Setup color picker event listeners
function setupColorPickers() {
    Object.keys(defaultColors).forEach(colorKey => {
        const picker = document.getElementById(`${colorKey}-picker`);
        const display = picker?.parentNode.querySelector('.color-value-display');

        if (picker && display) {
            // Initialize display value
            const currentValue = getComputedStyle(document.documentElement)
                .getPropertyValue(`--${colorKey}`).trim();
            if (currentValue) {
                picker.value = currentValue;
                display.textContent = currentValue.toUpperCase();
                display.style.borderColor = currentValue;
            }

            // Handle color changes
            picker.addEventListener('input', function() {
                updateColor(colorKey, this.value);
                display.textContent = this.value.toUpperCase();
                display.style.borderColor = this.value;
            });

            picker.addEventListener('change', function() {
                saveColors();
                showNotification(`${colorKey.replace('-', ' ')} updated to ${this.value.toUpperCase()}`, 'success');
            });
        }
    });
}

// Update a single color variable
function updateColor(colorKey, value) {
    document.documentElement.style.setProperty(`--${colorKey}`, value);

    // Update primary-rgb if primary-color changes
    if (colorKey === 'primary-color') {
        const rgb = hexToRgb(value);
        if (rgb) {
            document.documentElement.style.setProperty('--primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
    }
}

// Apply multiple colors at once
function applyColors(colors) {
    Object.entries(colors).forEach(([key, value]) => {
        updateColor(key, value);

        // Update picker and display if they exist
        const picker = document.getElementById(`${key}-picker`);
        const display = picker?.parentNode.querySelector('.color-value-display');
        if (picker && display) {
            picker.value = value;
            display.textContent = value.toUpperCase();
            display.style.borderColor = value;
        }
    });
}

// Save current colors to localStorage
function saveColors() {
    const currentColors = {};
    Object.keys(defaultColors).forEach(colorKey => {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(`--${colorKey}`).trim();
        if (value) {
            currentColors[colorKey] = value;
        }
    });

    localStorage.setItem('mtech-custom-colors', JSON.stringify(currentColors));
}

// Reset colors to default
function resetColorsToDefault() {
    if (confirm('Are you sure you want to reset all colors to default? This cannot be undone.')) {
        applyColors(defaultColors);
        saveColors();
        showNotification('Colors reset to default theme', 'success');
    }
}

// Export color theme
function exportColorTheme() {
    const currentColors = {};
    Object.keys(defaultColors).forEach(colorKey => {
        const value = getComputedStyle(document.documentElement)
            .getPropertyValue(`--${colorKey}`).trim();
        if (value) {
            currentColors[colorKey] = value;
        }
    });

    const themeData = {
        name: 'Custom Theme',
        version: '1.0',
        created: new Date().toISOString(),
        colors: currentColors
    };

    const dataStr = JSON.stringify(themeData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'mtech-color-theme.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showNotification('Color theme exported successfully', 'success');
}

// Import color theme
function importColorTheme() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const themeData = JSON.parse(e.target.result);

                if (themeData.colors && typeof themeData.colors === 'object') {
                    // Validate colors
                    const validColors = {};
                    Object.keys(defaultColors).forEach(key => {
                        if (themeData.colors[key] && isValidColor(themeData.colors[key])) {
                            validColors[key] = themeData.colors[key];
                        }
                    });

                    if (Object.keys(validColors).length > 0) {
                        applyColors(validColors);
                        saveColors();
                        showNotification(`Color theme "${themeData.name || 'Imported'}" applied successfully`, 'success');
                    } else {
                        showNotification('No valid colors found in theme file', 'error');
                    }
                } else {
                    showNotification('Invalid theme file format', 'error');
                }
            } catch (error) {
                showNotification('Failed to import theme: Invalid JSON file', 'error');
            }
        };
        reader.readAsText(file);
    });

    input.click();
}

// Utility functions
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function isValidColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Documentation Tab System
function initializeDocumentationTabs() {
    const docTabBtns = document.querySelectorAll('.doc-tab-btn');

    docTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            const container = this.closest('.component-documentation');

            if (container && tabName) {
                showDocumentationTab(container, tabName);
            }
        });
    });
}

function showDocumentationTab(container, tabName) {
    // Hide all doc sections in this container
    const docSections = container.querySelectorAll('.doc-section');
    docSections.forEach(section => section.classList.remove('active'));

    // Remove active class from all buttons in this container
    const docBtns = container.querySelectorAll('.doc-tab-btn');
    docBtns.forEach(btn => btn.classList.remove('active'));

    // Show selected section
    const targetSection = container.querySelector(`#${tabName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Add active class to clicked button
    const targetBtn = container.querySelector(`[data-tab="${tabName}"]`);
    if (targetBtn) {
        targetBtn.classList.add('active');
    }
}

// Export functions for global use
window.switchComponent = switchComponent;
window.copyCode = copyCode;
window.showDemoModal = showDemoModal;
window.closeDemoModal = closeDemoModal;
window.showNotification = showNotification;
window.showInfoModal = showInfoModal;
window.closeInfoModal = closeInfoModal;
window.showConfirmModal = showConfirmModal;
window.closeConfirmModal = closeConfirmModal;
window.confirmAction = confirmAction;
window.showSettingsModal = showSettingsModal;
window.closeSettingsModal = closeSettingsModal;
window.showFormModal = showFormModal;
window.closeFormModal = closeFormModal;
window.submitForm = submitForm;
window.saveSettings = saveSettings;
window.showSettingsTab = showSettingsTab;
window.resetColorsToDefault = resetColorsToDefault;
window.exportColorTheme = exportColorTheme;
window.importColorTheme = importColorTheme;
window.showDocumentationTab = showDocumentationTab;

// ===== NOTIFICATION SYSTEM FUNCTIONS =====

// Show demo toast notification
function showDemoToast(type, message) {
    // Remove existing demo toasts
    const existingToasts = document.querySelectorAll('.demo-toast');
    existingToasts.forEach(toast => {
        toast.remove();
    });

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `demo-toast toast-${type}`;

    // Set icon based on type
    let icon = 'fas fa-info-circle';
    if (type === 'success') {
        icon = 'fas fa-check-circle';
    } else if (type === 'error') {
        icon = 'fas fa-times-circle';
    } else if (type === 'warning') {
        icon = 'fas fa-exclamation-triangle';
    }

    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${icon}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Style the toast for demo
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 350px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    `;

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Auto-hide after 4 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }, 4000);
}

// Mark all notifications as read
function markAllAsRead() {
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    unreadItems.forEach(item => {
        item.classList.remove('unread');
    });

    // Update filter counts
    updateNotificationFilters();

    showNotification('All notifications marked as read', 'success');
}

// Clear all notifications
function clearAllNotifications() {
    const notificationList = document.querySelector('.notification-center-list');
    if (notificationList) {
        notificationList.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-secondary);">No notifications</div>';
    }

    // Update filter counts
    updateNotificationFilters();

    showNotification('All notifications cleared', 'info');
}

// Update notification filter counts
function updateNotificationFilters() {
    const allItems = document.querySelectorAll('.notification-item');
    const unreadItems = document.querySelectorAll('.notification-item.unread');
    const importantItems = document.querySelectorAll('.notification-item.important');

    const allFilter = document.querySelector('[data-filter="all"]');
    const unreadFilter = document.querySelector('[data-filter="unread"]');
    const importantFilter = document.querySelector('[data-filter="important"]');

    if (allFilter) allFilter.textContent = `All (${allItems.length})`;
    if (unreadFilter) unreadFilter.textContent = `Unread (${unreadItems.length})`;
    if (importantFilter) importantFilter.textContent = `Important (${importantItems.length})`;
}

// Initialize notification center functionality
function initializeNotificationCenter() {
    // Add click handlers for filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Filter notifications
            const filter = this.getAttribute('data-filter');
            filterNotifications(filter);
        });
    });

    // Add click handlers for notification actions
    const actionButtons = document.querySelectorAll('.notification-action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();

            const notificationItem = this.closest('.notification-item');
            const icon = this.querySelector('i');

            if (icon.classList.contains('fa-check')) {
                // Mark as read
                notificationItem.classList.remove('unread');
                updateNotificationFilters();
                showNotification('Notification marked as read', 'success');
            } else if (icon.classList.contains('fa-trash')) {
                // Delete notification
                notificationItem.style.transform = 'translateX(100%)';
                notificationItem.style.opacity = '0';
                setTimeout(() => {
                    notificationItem.remove();
                    updateNotificationFilters();
                }, 300);
                showNotification('Notification deleted', 'info');
            }
        });
    });
}

// Filter notifications based on type
function filterNotifications(filter) {
    const notificationItems = document.querySelectorAll('.notification-item');

    notificationItems.forEach(item => {
        let show = false;

        switch (filter) {
            case 'all':
                show = true;
                break;
            case 'unread':
                show = item.classList.contains('unread');
                break;
            case 'important':
                show = item.classList.contains('important');
                break;
        }

        item.style.display = show ? 'flex' : 'none';
    });
}

// Make notification functions globally available
window.showDemoToast = showDemoToast;
window.markAllAsRead = markAllAsRead;
window.clearAllNotifications = clearAllNotifications;
window.updateNotificationFilters = updateNotificationFilters;
window.initializeNotificationCenter = initializeNotificationCenter;
window.filterNotifications = filterNotifications;
