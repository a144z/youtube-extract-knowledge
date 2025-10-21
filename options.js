// Default settings
const DEFAULT_SETTINGS = {
    extensionEnabled: true,
    apiUrl: 'http://localhost:11434/api/chat',
    apiModel: 'hf.co/LiquidAI/LFM2-8B-A1B-GGUF:LFM2-8B-A1B-Q4_0.gguf'
};

// DOM elements
let extensionToggle, extensionLabel, apiUrlInput, apiModelInput, saveBtn, resetBtn, testApiBtn, statusMessage, testResult;

// Initialize the options page
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    loadSettings();
    setupEventListeners();
});

function initializeElements() {
    extensionToggle = document.getElementById('extensionToggle');
    extensionLabel = document.getElementById('extensionLabel');
    apiUrlInput = document.getElementById('apiUrl');
    apiModelInput = document.getElementById('apiModel');
    saveBtn = document.getElementById('saveBtn');
    resetBtn = document.getElementById('resetBtn');
    testApiBtn = document.getElementById('testApiBtn');
    statusMessage = document.getElementById('statusMessage');
    testResult = document.getElementById('testResult');
}

function setupEventListeners() {
    // Extension toggle
    extensionToggle.addEventListener('click', function() {
        extensionToggle.classList.toggle('active');
        updateExtensionLabel();
    });
    
    // Save button
    saveBtn.addEventListener('click', saveSettings);
    
    // Reset button
    resetBtn.addEventListener('click', resetToDefaults);
    
    // Test API button
    testApiBtn.addEventListener('click', testApiConnection);
}

function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(items) {
        // Set extension toggle
        if (items.extensionEnabled) {
            extensionToggle.classList.add('active');
        } else {
            extensionToggle.classList.remove('active');
        }
        updateExtensionLabel();
        
        // Set API settings
        apiUrlInput.value = items.apiUrl || DEFAULT_SETTINGS.apiUrl;
        apiModelInput.value = items.apiModel || DEFAULT_SETTINGS.apiModel;
    });
}

function updateExtensionLabel() {
    const isEnabled = extensionToggle.classList.contains('active');
    extensionLabel.textContent = isEnabled ? 'Extension Enabled' : 'Extension Disabled';
}

function saveSettings() {
    const settings = {
        extensionEnabled: extensionToggle.classList.contains('active'),
        apiUrl: apiUrlInput.value.trim(),
        apiModel: apiModelInput.value.trim()
    };
    
    // Validate API URL
    if (settings.apiUrl && !isValidUrl(settings.apiUrl)) {
        showStatus('Please enter a valid URL for the API endpoint.', 'error');
        return;
    }
    
    chrome.storage.sync.set(settings, function() {
        if (chrome.runtime.lastError) {
            showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
        } else {
            showStatus('Settings saved successfully!', 'success');
            
            // Notify content scripts of settings change
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs[0] && tabs[0].url.includes('youtube.com/watch')) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'settingsUpdated',
                        settings: settings
                    });
                }
            });
        }
    });
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        chrome.storage.sync.clear(function() {
            loadSettings();
            showStatus('Settings reset to defaults.', 'success');
        });
    }
}

async function testApiConnection() {
    const apiUrl = apiUrlInput.value.trim();
    const apiModel = apiModelInput.value.trim();
    
    if (!apiUrl) {
        showTestResult('Please enter an API URL first.', 'error');
        return;
    }
    
    if (!isValidUrl(apiUrl)) {
        showTestResult('Please enter a valid URL.', 'error');
        return;
    }
    
    testApiBtn.disabled = true;
    testApiBtn.textContent = 'Testing...';
    showTestResult('Testing API connection...', 'info');
    
    try {
        const testPayload = {
            model: apiModel || 'test-model',
            messages: [{ role: 'user', content: 'Hello, this is a test message.' }],
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 10
            }
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testPayload)
        });
        
        if (response.ok) {
            showTestResult('✅ API connection successful!', 'success');
        } else {
            const errorText = await response.text();
            showTestResult(`❌ API returned error: ${response.status} - ${errorText}`, 'error');
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showTestResult('❌ Network error: Unable to connect to the API. Check the URL and ensure the service is running.', 'error');
        } else {
            showTestResult(`❌ Connection failed: ${error.message}`, 'error');
        }
    } finally {
        testApiBtn.disabled = false;
        testApiBtn.textContent = 'Test API Connection';
    }
}

function showTestResult(message, type) {
    testResult.textContent = message;
    testResult.style.color = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#6c757d';
}

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message status-${type}`;
    statusMessage.style.display = 'block';
    
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 3000);
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}
