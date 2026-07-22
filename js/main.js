// ===== MAIN SCRIPT =====

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('ANGELKACS SETUP - Initializing...');
    
    // Set current year
    const yearElements = document.querySelectorAll('#currentYear');
    yearElements.forEach(el => {
        el.textContent = new Date().getFullYear();
    });
    
    // Initialize copy buttons
    initCopyButtons();
    
    console.log('ANGELKACS SETUP - Initialization complete');
});

// ===== COPY BUTTONS =====
function initCopyButtons() {
    // Generic copy function
    function copyToClipboard(text) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(() => {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    return true;
                } catch (err) {
                    console.warn('Copy failed:', err);
                    return false;
                } finally {
                    document.body.removeChild(textArea);
                }
            });
    }
    
    // Handle copy buttons
    document.addEventListener('click', function(e) {
        const copyBtn = e.target.closest('.copy-btn');
        
        if (copyBtn) {
            let textToCopy = '';
            
            // Get text from data-text attribute or from code block
            if (copyBtn.hasAttribute('data-text')) {
                textToCopy = copyBtn.getAttribute('data-text');
            } else {
                const codeBlock = copyBtn.closest('.code-block');
                if (codeBlock) {
                    const codeElement = codeBlock.querySelector('code');
                    if (codeElement) {
                        textToCopy = codeElement.textContent;
                    }
                }
            }
            
            if (textToCopy) {
                copyToClipboard(textToCopy.trim()).then(success => {
                    if (success) {
                        // Visual feedback
                        const originalHTML = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> <span>Copied!</span>';
                        copyBtn.classList.add('copied');
                        
                        setTimeout(() => {
                            copyBtn.innerHTML = originalHTML;
                            copyBtn.classList.remove('copied');
                        }, 1500);
                    }
                });
            }
        }
    });
}

// Make initCopyButtons globally available
window.initCopyButtons = initCopyButtons;

// ===== SIMPLE PERFORMANCE OPTIMIZATION =====
// Disable heavy animations on low-end devices
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--transition', 'none');
}