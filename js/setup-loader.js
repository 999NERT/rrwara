// ===== SETUP DATA LOADER =====

document.addEventListener('DOMContentLoaded', function() {
    const yearElements = document.querySelectorAll('#currentYear');
    yearElements.forEach(el => { el.textContent = new Date().getFullYear(); });

    const path = window.location.pathname;
    const pageType = getPageTypeFromPath(path);

    if (pageType) {
        loadPageData(pageType);
        initPageNavigation(pageType);
        updatePageTitle(pageType);
    }
});

// ===== HELPER FUNCTIONS =====
function getPageTypeFromPath(path) {
    const pathParts = path.split('/').filter(part => part);
    const pageTypes = ['games', 'video', 'eq', 'binds', 'config'];
    for (const type of pageTypes) {
        if (pathParts.includes(type)) return type;
    }
    return null;
}

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

function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// ===== SMALL UI BUILDING BLOCKS =====
function kvRows(items) {
    if (!items || !items.length) return '';
    return `<div class="kv-grid">${items.map(item => `
        <div class="kv-row">
            <span class="kv-label">${escHtml(item.name)}</span>
            <span class="kv-value">${escHtml(item.value)}</span>
        </div>
    `).join('')}</div>`;
}

function panel(icon, title, count, bodyHtml) {
    const iconClass = icon.includes(' ') ? icon : `fas fa-${icon}`;
    return `
        <div class="panel">
            <div class="panel-head">
                <div class="panel-icon"><i class="${iconClass}"></i></div>
                <div class="panel-title">${title}</div>
                ${count ? `<div class="panel-count">${count}</div>` : ''}
            </div>
            <div class="panel-body">${bodyHtml}</div>
        </div>
    `;
}

function codeBlock(label, rawCode, buttonText, extraClass) {
    return `
        <div class="code-block ${extraClass || ''}">
            <div class="code-block-bar">
                <span class="code-block-dot"></span>
                <span class="code-block-dot"></span>
                <span class="code-block-dot"></span>
                <span class="code-block-label">${escHtml(label)}</span>
            </div>
            <pre><code>${escHtml(rawCode)}</code></pre>
            <button class="copy-btn" title="Copy">
                <i class="far fa-copy"></i>
                <span>${buttonText || 'Copy'}</span>
            </button>
        </div>
    `;
}

// ===== LOAD PAGE DATA =====
async function loadPageData(pageType) {
    const contentElement = document.getElementById('pageContent');
    if (!contentElement) return;

    contentElement.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading ${pageType} settings...</p>
        </div>
    `;

    try {
        const jsonFilename = getJsonFilename(pageType);
        const jsonUrl = `../data/${jsonFilename}`;
        const response = await fetch(jsonUrl);

        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

        const data = await response.json();
        let html = '';

        switch (pageType) {
            case 'games':  html = renderGamesPage(data); break;
            case 'video':  html = renderVideoPage(data); break;
            case 'eq':     html = renderGearPage(data); break;
            case 'binds':  html = renderBindsPage(data); break;
            case 'config': html = renderConfigPage(data); break;
            default: html = '<div class="error-state"><p>Invalid page type</p></div>';
        }

        contentElement.innerHTML = html;

        if (typeof initCopyButtons === 'function') initCopyButtons();
        if (pageType === 'config') wireConfigDownload(data);

    } catch (error) {
        contentElement.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Failed to load settings</h3>
                <p>${escHtml(error.message)}</p>
                <button onclick="location.reload()" class="download-btn">
                    <i class="fas fa-redo"></i> Refresh Page
                </button>
            </div>
        `;
    }
}

// ===== RENDER: GAMES =====
function renderGamesPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';

    return `
        <div class="settings-container">
            ${panel('mouse', 'Mouse Settings', data.mouseSettings?.length, `
                ${kvRows(data.mouseSettings)}
                ${data.commands?.mouse ? codeBlock('mouse.cfg', data.commands.mouse, 'Copy') : ''}
            `)}

            ${panel('eye', 'Viewmodel Settings', data.viewmodelSettings?.length, `
                ${kvRows(data.viewmodelSettings)}
                ${data.commands?.viewmodel ? codeBlock('viewmodel.cfg', data.commands.viewmodel, 'Copy') : ''}
            `)}

            ${panel('crosshairs', 'Crosshair Settings', data.crosshairSettings?.length, `
                ${kvRows(data.crosshairSettings)}
                ${data.commands?.shareCode ? codeBlock('share-code', data.commands.shareCode, 'Copy Code') : ''}
                ${data.commands?.crosshair ? codeBlock('crosshair.cfg', data.commands.crosshair, 'Copy') : ''}
            `)}
        </div>
    `;
}

// ===== RENDER: VIDEO =====
function renderVideoPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';

    return `
        <div class="settings-container">
            ${panel('gamepad', 'CS2 Video Settings', data.cs2Settings?.length, kvRows(data.cs2Settings))}
            ${panel('fab fa-nvidia', 'NVIDIA Control Panel', data.nvidiaSettings?.length, kvRows(data.nvidiaSettings))}
            ${panel('tv', 'Monitor Calibration', data.monitorSettings?.length, kvRows(data.monitorSettings))}
        </div>
    `;
}

// ===== RENDER: GEAR =====
function renderGearPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';

    return `
        <div class="settings-container">
            ${panel('keyboard', 'Setup & Peripherals', data.setup?.length, kvRows(data.setup))}
            ${panel('desktop', 'PC Build Specifications', data.pcBuild?.length, kvRows(data.pcBuild))}
        </div>
    `;
}

// ===== RENDER: BINDS =====
function renderBindsPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';

    const rows = (data.binds || []).map(bind => `
        <div class="bind-row">
            <span class="bind-key">${escHtml(bind.key)}</span>
            <span class="bind-action">${escHtml(bind.action)}</span>
            <span class="bind-desc">${escHtml(bind.description)}</span>
        </div>
    `).join('');

    return `
        <div class="settings-container">
            ${panel('key', 'Custom Key Binds', data.binds?.length, `
                <div class="binds-head-row">
                    <span>Key</span><span>Action</span><span>Description</span>
                </div>
                <div class="binds-list">${rows}</div>
                ${data.commands?.all ? codeBlock('all-binds.cfg', data.commands.all, 'Copy All Binds') : ''}
            `)}
        </div>
    `;
}

// ===== RENDER: CONFIG =====
function renderConfigPage(data) {
    if (!data) return '<div class="error-state"><p>No data available</p></div>';

    const raw = data.config || 'No config data available';
    const highlighted = renderCfgSyntax(raw);

    return `
        <div class="settings-container">
            ${panel('terminal', 'Autoexec Configuration', null, `
                <div class="config-info">
                    <div class="config-info-item"><strong>Path</strong> ${escHtml(data.configPath || 'csgo/cfg')}</div>
                    <div class="config-info-item"><strong>Updated</strong> ${escHtml(data.lastUpdated || new Date().toLocaleDateString())}</div>
                </div>

                <div class="code-block full-config">
                    <div class="code-block-bar">
                        <span class="code-block-dot"></span>
                        <span class="code-block-dot"></span>
                        <span class="code-block-dot"></span>
                        <span class="code-block-label">autoexec.cfg</span>
                    </div>
                    <pre><code id="cfgContent">${highlighted}</code></pre>
                    <button class="copy-btn" title="Copy" data-cfg-raw>
                        <i class="far fa-copy"></i>
                        <span>Copy Config</span>
                    </button>
                </div>

                <div class="download-section">
                    <a href="#" class="download-btn" id="btnDownload" download="autoexec.cfg">
                        <i class="fas fa-download"></i>
                        Download autoexec.cfg
                    </a>
                </div>
            `)}
        </div>
    `;
}

// Simple syntax highlighting for the raw config text
function renderCfgSyntax(raw) {
    return raw.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed === '') return '';
        if (trimmed.startsWith('//')) return `<span class="cfg-line-comment">${escHtml(line)}</span>`;
        if (trimmed.startsWith('echo')) return `<span class="cfg-line-echo">${escHtml(line)}</span>`;
        if (trimmed.startsWith('bind')) return `<span class="cfg-line-bind">${escHtml(line)}</span>`;

        const spaceIdx = trimmed.search(/\s/);
        if (spaceIdx > 0) {
            const key = line.slice(0, line.indexOf(trimmed) + spaceIdx);
            const val = line.slice(line.indexOf(trimmed) + spaceIdx);
            return `<span class="cfg-line-key">${escHtml(key)}</span><span class="cfg-line-value">${escHtml(val)}</span>`;
        }
        return escHtml(line);
    }).join('\n');
}

// Wire up the config download link + copy button to the raw (non-highlighted) text
function wireConfigDownload(data) {
    const raw = data.config || '';

    const blob = new Blob([raw], { type: 'text/plain' });
    const blobUrl = URL.createObjectURL(blob);
    const downloadBtn = document.getElementById('btnDownload');
    if (downloadBtn) downloadBtn.href = blobUrl;

    const copyBtn = document.querySelector('[data-cfg-raw]');
    if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(raw.trim());
                const original = copyBtn.innerHTML;
                copyBtn.classList.add('copied');
                copyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.innerHTML = original;
                }, 1500);
            } catch (e) {
                console.warn('Copy failed:', e);
            }
        });
    }
}

// ===== PAGE NAVIGATION (active state safety-net) =====
function initPageNavigation(activePage) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.dataset.page === activePage);
    });
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
}
