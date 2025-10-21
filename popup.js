// Default settings
const DEFAULT_SETTINGS = {
    extensionEnabled: true,
    apiUrl: 'http://localhost:11434/api/chat',
    apiModel: 'hf.co/LiquidAI/LFM2-8B-A1B-GGUF:LFM2-8B-A1B-Q4_0.gguf'
};

// DOM elements
let extensionToggle, toggleLabel, statusText, settingsBtn, refreshBtn, currentUrl;

// Initialize the popup
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    loadSettings();
    setupEventListeners();
    checkCurrentTab();
});

function initializeElements() {
    extensionToggle = document.getElementById('extensionToggle');
    toggleLabel = document.getElementById('toggleLabel');
    statusText = document.getElementById('statusText');
    settingsBtn = document.getElementById('settingsBtn');
    refreshBtn = document.getElementById('refreshBtn');
    currentUrl = document.getElementById('currentUrl');
}

function setupEventListeners() {
    // Extension toggle
    extensionToggle.addEventListener('click', function() {
        extensionToggle.classList.toggle('active');
        updateExtensionState();
    });
    
    // Settings button
    settingsBtn.addEventListener('click', function() {
        chrome.runtime.openOptionsPage();
    });
    
    // Refresh button
    refreshBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0]) {
                chrome.tabs.reload(tabs[0].id);
                window.close();
            }
        });
    });
}

function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(items) {
        if (items.extensionEnabled) {
            extensionToggle.classList.add('active');
            toggleLabel.textContent = 'Extension';
            statusText.textContent = 'Enabled';
        } else {
            extensionToggle.classList.remove('active');
            toggleLabel.textContent = 'Extension';
            statusText.textContent = 'Disabled';
        }
        
        // Show current API URL
        const url = items.apiUrl || DEFAULT_SETTINGS.apiUrl;
        currentUrl.textContent = `API: ${url}`;
    });
}

function updateExtensionState() {
    const isEnabled = extensionToggle.classList.contains('active');
    
    chrome.storage.sync.set({extensionEnabled: isEnabled}, function() {
        if (chrome.runtime.lastError) {
            console.error('Error saving extension state:', chrome.runtime.lastError);
            // Revert toggle state
            extensionToggle.classList.toggle('active');
            return;
        }
        
        statusText.textContent = isEnabled ? 'Enabled' : 'Disabled';
        
        // Notify content scripts of state change
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs[0] && tabs[0].url.includes('youtube.com/watch')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'extensionToggled',
                    enabled: isEnabled
                });
            }
        });
    });
}

function checkCurrentTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
            if (tabs[0].url.includes('youtube.com/watch')) {
                statusText.textContent = statusText.textContent + ' (on YouTube)';
            } else {
                statusText.textContent = statusText.textContent + ' (not on YouTube)';
            }
        }
    });
}
