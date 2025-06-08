# MTech Electron Component Showcase

A comprehensive showcase of versatile UI components designed for any Electron application. While originally created for system utilities, these components are highly adaptable for media players, code editors, chat applications, business software, and more. This showcase provides templates, code examples, and interactive demonstrations of all the key components used in modern desktop applications.

## 🖥️ Electron-Specific Features

- **Custom Title Bar**: Native-looking title bar with window controls
- **Sidebar Navigation**: Collapsible sidebar with search and tab management
- **Desktop UI Patterns**: Components optimized for desktop interaction
- **Native Feel**: Windows-style components with proper hover states
- **Performance Optimized**: Lightweight components for Electron apps
- **Dark Theme**: Professional dark theme with orange accents

## 📦 Components Included

### Window Management
- **Custom Title Bar**: Frameless window title bar with minimize, maximize, close buttons
- **Window Controls**: Interactive window management buttons with hover effects
- **Application Branding**: Logo and title display in title bar

### Navigation Components
- **Sidebar Navigation**: Multiple patterns including collapsible, badges, multi-level, and user profiles
- **Application-Specific Examples**: Sidebars adapted for media players, code editors, chat apps, and business software
- **Tab Management**: Dynamic tab system with search functionality
- **Search Interface**: Real-time component/tab filtering
- **Settings Panel**: Application settings and preferences interface

### Universal Component Variants
- **Title Bars**: Adaptable for system utilities, media players, code editors, business apps, and chat applications
- **Information Cards**: System info, media statistics, business metrics, and development project data
- **Interactive Buttons**: Media controls, file operations, business actions, and development tools
- **Form Controls**: User profiles, media settings, business data entry, and search filters
- **Modal Dialogs**: Context-aware dialogs for any application type
- **Data Display**: Comprehensive visualization including progress bars, charts, analytics dashboards, project tracking, file management, and network monitoring
- **Splash Screens**: Application loading screens adaptable for system tools, media players, business software, and development environments

### Data Display Components
- **System Information Cards**: Hardware and system data display
- **Overview Cards**: Quick stats and metrics display
- **Detail Cards**: Comprehensive information layouts
- **Progress Indicators**: Memory usage, CPU load, and other metrics
- **Real-time Data**: Live updating system information

### Interactive Components
- **Button Variants**: Primary, secondary, danger, and success buttons
- **Form Controls**: Custom styled inputs, selects, textareas, and checkboxes
- **Modal Dialogs**: Settings panels and information overlays
- **Loading States**: Splash screens and progress indicators

### Specialized Components
- **CPU Information Display**: Detailed processor information layout
- **Memory Usage Visualization**: Progress bars and usage statistics
- **Hardware Detail Views**: Motherboard, BIOS, and system information
- **Splash Screen**: Application loading screen with animations

## 🎯 Application Versatility

These components are designed to be adaptable for various application types:

### System Utilities
- Performance monitoring tools
- System information displays
- Network diagnostics
- Registry editors

### Media Applications
- Music players with playlist management
- Video players with library organization
- Photo organizers with album views
- Streaming applications

### Development Tools
- Code editors with file explorers
- Database management tools
- API testing applications
- Git clients

### Business Applications
- CRM systems with customer management
- Inventory management tools
- Sales dashboards
- Report generators

### Communication Apps
- Chat applications with channels
- Video conferencing tools
- Team collaboration platforms
- Email clients

## 🚀 Getting Started

### Prerequisites
- Electron application setup
- Node.js and npm/yarn
- Modern web browser for development

### Installation
1. Copy the Electron showcase folder to your project
2. Include the CSS and JavaScript files in your Electron app
3. Reference the HTML templates for component structure

### Basic Usage

#### Custom Title Bar
```html
<div class="title-bar">
    <div class="title-bar-text">
        <i class="fas fa-tools"></i>
        Your App Name
    </div>
    <div class="title-bar-controls">
        <button class="title-bar-btn" onclick="minimizeWindow()">
            <i class="fas fa-window-minimize"></i>
        </button>
        <button class="title-bar-btn" onclick="maximizeWindow()">
            <i class="fas fa-window-maximize"></i>
        </button>
        <button class="title-bar-btn close-btn" onclick="closeWindow()">
            <i class="fas fa-times"></i>
        </button>
    </div>
</div>
```

#### Sidebar Navigation
```html
<div class="sidebar">
    <div class="sidebar-header">
        <h2 class="app-title">
            <i class="fas fa-cube"></i>
            App Name
        </h2>
        <div class="tab-search-container">
            <input type="text" placeholder="Search..." class="tab-search-input">
            <i class="fas fa-search tab-search-icon"></i>
        </div>
    </div>
    <ul class="tab-list">
        <li class="tab-item active">
            <i class="fas fa-home"></i>
            <span>Dashboard</span>
        </li>
    </ul>
</div>
```

#### System Information Card
```html
<div class="overview-card">
    <i class="fas fa-laptop"></i>
    <h4>Platform</h4>
    <p id="platform-info">Windows 11</p>
</div>
```

## 🎨 Design System

### Color Scheme
- **Primary Orange**: `#ff9800` (var(--primary-color))
- **Primary Dark**: `#f57c00` (var(--primary-dark))
- **Background Dark**: `#0a0a0c` (var(--background-dark))
- **Background Light**: `#111113` (var(--background-light))
- **Background Card**: `#1a1a1c` (var(--background-card))
- **Text Primary**: `#ffffff` (var(--text-primary))
- **Text Secondary**: `#b0b0b0` (var(--text-secondary))

### Typography
- **Primary Font**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Monospace Font**: 'Consolas', 'Monaco', 'Courier New', monospace

### Spacing and Layout
- **Border Radius**: 8px for cards, 4px for inputs
- **Padding**: 12px-24px for components
- **Gaps**: 8px-20px between elements
- **Transitions**: 0.2s-0.3s ease for interactions

## ⚡ Electron Integration

### Main Process Integration
```javascript
// main.js
const { app, BrowserWindow, ipcMain } = require('electron');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false, // For custom title bar
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    mainWindow.loadFile('index.html');
}

// Window control handlers
ipcMain.on('minimize-window', () => {
    BrowserWindow.getFocusedWindow().minimize();
});

ipcMain.on('maximize-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    window.isMaximized() ? window.unmaximize() : window.maximize();
});

ipcMain.on('close-window', () => {
    BrowserWindow.getFocusedWindow().close();
});
```

### Renderer Process Integration
```javascript
// renderer.js
const { ipcRenderer } = require('electron');

function minimizeWindow() {
    ipcRenderer.send('minimize-window');
}

function maximizeWindow() {
    ipcRenderer.send('maximize-window');
}

function closeWindow() {
    ipcRenderer.send('close-window');
}
```

## 📱 Responsive Design

The components are designed to work across different window sizes:

- **Large Windows**: 1200px+ (full sidebar, all features visible)
- **Medium Windows**: 800px-1199px (condensed sidebar)
- **Small Windows**: 600px-799px (collapsible sidebar)
- **Minimum Size**: 480px (mobile-like layout for testing)

## 🔧 Customization

### CSS Variables
All colors and spacing can be customized by modifying CSS variables:

```css
:root {
    --primary-color: #your-color;
    --background-dark: #your-background;
    /* ... other variables */
}
```

### Component Variants
Each component supports multiple variants and states:

- **Buttons**: Primary, secondary, danger, success
- **Cards**: Overview, detail, hardware, system
- **Inputs**: Text, select, textarea, checkbox
- **Progress**: Memory bars, loading indicators

## 📄 File Structure

```
electron/
├── index.html                    # Main showcase page
├── electron-showcase-styles.css  # Complete CSS styles
├── electron-showcase-script.js   # JavaScript functionality
└── README.md                     # This documentation
```

## 🎯 Best Practices

### Performance
- Use CSS transforms for animations
- Minimize DOM manipulation
- Implement virtual scrolling for large lists
- Cache frequently accessed elements

### Accessibility
- Include ARIA labels for screen readers
- Support keyboard navigation
- Provide focus indicators
- Use semantic HTML elements

### Electron-Specific
- Handle window state changes
- Implement proper IPC communication
- Manage memory usage efficiently
- Support multiple windows

## 🤝 Contributing

To add new components or improve existing ones:

1. Add the component demo to the appropriate section in `index.html`
2. Include the CSS styles in `electron-showcase-styles.css`
3. Add any JavaScript functionality to `electron-showcase-script.js`
4. Update this README with documentation

## 📝 License

This Electron component showcase is part of the MTech IT Solutions project and follows the same licensing terms as the main project.

## 🔗 Related Projects

- **WinTool Electron App**: Main system management application
- **MTech Web Components**: Web-based component showcase
- **MTech Design System**: Core design system documentation

---

Built with ❤️ for Electron applications using the MTech Design System
