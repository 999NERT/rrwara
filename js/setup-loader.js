// ===== SETUP DATA LOADER =====

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('SETUP PAGE - Initializing...');
    
    // Set current year
    const yearElements = document.querySelectorAll('#currentYear');
    yearElements.forEach(el => {
        el.textContent = new Date().getFullYear();
    });
    
    // Get current page type from URL
    const path = window.location.pathname;
    const pageType = getPageTypeFromPath(path);
    
    if (pageType) {
        console.log('Loading data for:', pageType);
        
        // Load data for this page
        loadPageData(pageType);
        
        // Initialize navigation
        initPageNavigation(pageType);
        
        // Update page title
        updatePageTitle(pageType);
    }
    
    console.log('SETUP PAGE - Initialization complete');
});

// ===== HELPER FUNCTIONS =====
function getPageTypeFromPath(path) {
    const pathParts = path.split('/').filter(part => part);
    const pageTypes = ['games', 'video', 'eq', 'binds', 'config'];
    
    for (const type of pageTypes) {
        if (pathParts.includes(type)) {
            return type;
        }
    }
    
    return null;
}

// Map page types to JSON filenames
function getJsonFilename(pageType) {
    const jsonMap = {
        'games': 'games.json',
        'video': 'video.json',
        'eq': 'gear.json',
        'binds': 'binds.json',
        'config': 'config.json'
    };
    return jsonMap[pageType] || `${pageType}.json`;
}

// ===== LOAD PAGE DATA =====
async function loadPageData(pageType) {
    const contentElement = document.getElementById('pageContent');
    
    if (!contentElement) {
        console.error('Page content element not found');
        return;
    }
    
    // Show loading state
    contentElement.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading ${pageType} settings...</p>
        </div>
    `;
    
    try {
        // Load JSON data
        const jsonFilename = getJsonFilename(pageType);
        const jsonUrl = `../data/${jsonFilename}`;
        
        const response = await fetch(jsonUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Render content based on page type
        let html = '';
        
        switch(pageType) {
            case 'games':
                html = renderGamesPage(data);
                break;
            case 'video':
                html = renderVideoPage(data);
                break;
            case 'eq':
                html = renderGearPage(data);
                break;
            case 'binds':
                html = renderBindsPage(data);
                break;
            case 'config':
                html = renderConfigPage(data);
                break;
            default:
                html = '<div class="error-state"><p>Invalid page type</p></div>';
        }
        
        // Update content
        contentElement.innerHTML = html;
        
        // Initialize copy buttons
        if (typeof initCopyButtons === 'function') {
            initCopyButtons();
        }
        
    } catch (error) {
        console.error('Error loading page data:', error);
        contentElement.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load settings</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()" class="copy-btn" style="margin: 1rem auto; display: block;">
                    <i class="fas fa-redo"></i> Refresh Page
                </button>
            </div>
        `;
    }
}

// ===== RENDER FUNCTIONS =====
function renderGamesPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';
    
    return `
        <div class="settings-container">
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-mouse"></i>
                    Mouse Settings
                </h3>
                <div class="settings-grid">
                    ${data.mouseSettings?.map(setting => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${setting.name}</span>
                                <span class="setting-value">${setting.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${data.commands?.mouse ? `
                <div class="code-block">
                    <pre><code>${data.commands.mouse}</code></pre>
                    <button class="copy-btn" data-text="${data.commands.mouse}">
                        <i class="far fa-copy"></i>
                        <span>Copy</span>
                    </button>
                </div>
                ` : ''}
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-eye"></i>
                    Viewmodel Settings
                </h3>
                <div class="settings-grid">
                    ${data.viewmodelSettings?.map(setting => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${setting.name}</span>
                                <span class="setting-value">${setting.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${data.commands?.viewmodel ? `
                <div class="code-block">
                    <pre><code>${data.commands.viewmodel}</code></pre>
                    <button class="copy-btn" data-text="${data.commands.viewmodel}">
                        <i class="far fa-copy"></i>
                        <span>Copy</span>
                    </button>
                </div>
                ` : ''}
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-crosshairs"></i>
                    Crosshair Settings
                </h3>
                <div class="settings-grid">
                    ${data.crosshairSettings?.map(setting => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${setting.name}</span>
                                <span class="setting-value">${setting.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${data.commands?.shareCode ? `
                <div class="code-block">
                    <pre><code>// Crosshair Share Code
${data.commands.shareCode}</code></pre>
                    <button class="copy-btn" data-text="${data.commands.shareCode}">
                        <i class="far fa-copy"></i>
                        <span>Copy Code</span>
                    </button>
                </div>
                ` : ''}
                
                ${data.commands?.crosshair ? `
                <div class="code-block">
                    <pre><code>${data.commands.crosshair}</code></pre>
                    <button class="copy-btn" data-text="${data.commands.crosshair}">
                        <i class="far fa-copy"></i>
                        <span>Copy Commands</span>
                    </button>
                </div>
                ` : ''}
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-desktop"></i>
                    HUD Settings
                </h3>
                <div class="settings-grid">
                    ${data.hudSettings?.map(setting => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${setting.name}</span>
                                <span class="setting-value">${setting.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                ${data.commands?.hud ? `
                <div class="code-block">
                    <pre><code>${data.commands.hud}</code></pre>
                    <button class="copy-btn" data-text="${data.commands.hud}">
                        <i class="far fa-copy"></i>
                        <span>Copy</span>
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderVideoPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';
    
    return `
        <div class="settings-container">
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-gamepad"></i>
                    CS2 Video Settings
                </h3>
                <div class="settings-grid">
                    ${data.cs2Settings?.map(setting => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${setting.name}</span>
                                <span class="setting-value">${setting.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fab fa-nvidia"></i>
                    NVIDIA Control Panel
                </h3>
                <div class="settings-grid">
                    ${data.nvidiaSettings?.map(setting => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${setting.name}</span>
                                <span class="setting-value">${setting.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-tv"></i>
                    Monitor Calibration
                </h3>
                <div class="settings-grid">
                    ${data.monitorSettings?.map(setting => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${setting.name}</span>
                                <span class="setting-value">${setting.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderGearPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';
    
    return `
        <div class="settings-container">
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-keyboard"></i>
                    Setup & Peripherals
                </h3>
                <div class="settings-grid">
                    ${data.setup?.map(item => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${item.name}</span>
                                <span class="setting-value">${item.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-desktop"></i>
                    PC Build Specifications
                </h3>
                <div class="settings-grid">
                    ${data.pcBuild?.map(item => `
                        <div class="setting-card">
                            <div class="setting-item">
                                <span class="setting-name">${item.name}</span>
                                <span class="setting-value">${item.value}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderBindsPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';
    
    return `
        <div class="settings-container">
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-key"></i>
                    Custom Key Binds
                </h3>
                
                <table class="binds-table">
                    <thead>
                        <tr>
                            <th>KEY</th>
                            <th>ACTION</th>
                            <th>DESCRIPTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.binds?.map(bind => `
                            <tr>
                                <td>${bind.key}</td>
                                <td><code>${bind.action}</code></td>
                                <td>${bind.description}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                ${data.commands?.all ? `
                <div class="code-block">
                    <pre><code>${data.commands.all}</code></pre>
                    <button class="copy-btn" data-text="${data.commands.all}">
                        <i class="far fa-copy"></i>
                        <span>Copy All Binds</span>
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderConfigPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';
    
    return `
        <div class="settings-container">
            <div class="settings-section">
                <h3 class="section-title">
                    <i class="fas fa-code"></i>
                    Autoexec Configuration
                </h3>
                
                <div class="config-info">
                    <p><strong>Config Path:</strong> ${data.configPath || 'Steam\\steamapps\\common\\Counter-Strike Global Offensive\\game\\csgo\\cfg'}</p>
                    <p><strong>Last Updated:</strong> ${data.lastUpdated || new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="code-block full-config">
                    <pre><code>${data.config || 'No config data available'}</code></pre>
                    <button class="copy-btn" data-text="${data.config || ''}">
                        <i class="far fa-copy"></i>
                        <span>Copy Config</span>
                    </button>
                </div>
                
                <div class="download-section">
                    <a href="${data.downloadLink || '#'}" class="download-btn" download>
                        <i class="fas fa-download"></i>
                        Download autoexec.cfg
                    </a>
                </div>
            </div>
        </div>
    `;
}

// ===== PAGE NAVIGATION =====
function initPageNavigation(activePage) {
    const navElement = document.querySelector('.setup-nav');
    if (!navElement) return;
    
    const pages = [
        { id: 'games', name: 'Game', icon: 'gamepad' },
        { id: 'video', name: 'Video', icon: 'video' },
        { id: 'eq', name: 'Gear', icon: 'keyboard' },
        { id: 'binds', name: 'Binds', icon: 'key' },
        { id: 'config', name: 'Config', icon: 'code' }
    ];
    
    const navHTML = pages.map(page => {
        const href = `../${page.id}/`;
        const isActive = activePage === page.id;
        return `
            <a href="${href}" class="nav-tab ${isActive ? 'active' : ''}">
                <i class="fas fa-${page.icon}"></i>
                ${page.name}
            </a>
        `;
    }).join('');
    
    navElement.querySelector('.container').innerHTML = navHTML;
}

// ===== UPDATE PAGE TITLE =====
function updatePageTitle(pageType) {
    const titles = {
        'games': 'Game Settings',
        'video': 'Video Settings',
        'eq': 'Gear & Equipment',
        'binds': 'Key Binds',
        'config': 'Full Config'
    };
    
    const title = titles[pageType] || 'Setup';
    document.title = `ANGELKACS | ${title}`;
    
    // Update page header if it exists
    const pageTitle = document.querySelector('.setup-title');
    if (pageTitle) {
        pageTitle.textContent = title;
    }
}