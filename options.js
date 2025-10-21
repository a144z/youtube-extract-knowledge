// Default settings
const DEFAULT_SETTINGS = {
    extensionEnabled: true,
    apiUrl: 'http://localhost:11434/api/chat',
    apiModel: 'hf.co/LiquidAI/LFM2-8B-A1B-GGUF:LFM2-8B-A1B-Q4_0.gguf',
    graphPushEnabled: false,
    graphPushUrl: '',
    graphPushApiKey: ''
};

// DOM elements
let extensionToggle, extensionLabel, apiUrlInput, apiModelInput, saveBtn, resetBtn, testApiBtn, statusMessage, testResult;
let graphPushToggle, graphPushLabel, graphPushUrlInput, graphPushApiKeyInput, testGraphPushBtn, testGraphPushResult;

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
    
    // Graph push elements
    graphPushToggle = document.getElementById('graphPushToggle');
    graphPushLabel = document.getElementById('graphPushLabel');
    graphPushUrlInput = document.getElementById('graphPushUrl');
    graphPushApiKeyInput = document.getElementById('graphPushApiKey');
    testGraphPushBtn = document.getElementById('testGraphPushBtn');
    testGraphPushResult = document.getElementById('testGraphPushResult');
}

function setupEventListeners() {
    // Extension toggle
    extensionToggle.addEventListener('click', function() {
        extensionToggle.classList.toggle('active');
        updateExtensionLabel();
    });
    
    // Graph push toggle
    graphPushToggle.addEventListener('click', function() {
        graphPushToggle.classList.toggle('active');
        updateGraphPushLabel();
    });
    
    // Save button
    saveBtn.addEventListener('click', saveSettings);
    
    // Reset button
    resetBtn.addEventListener('click', resetToDefaults);
    
    // Test API button
    testApiBtn.addEventListener('click', testApiConnection);
    
    // Test graph push button
    testGraphPushBtn.addEventListener('click', testGraphPushConnection);
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
        
        // Set graph push toggle
        if (items.graphPushEnabled) {
            graphPushToggle.classList.add('active');
        } else {
            graphPushToggle.classList.remove('active');
        }
        updateGraphPushLabel();
        
        // Set API settings
        apiUrlInput.value = items.apiUrl || DEFAULT_SETTINGS.apiUrl;
        apiModelInput.value = items.apiModel || DEFAULT_SETTINGS.apiModel;
        
        // Set graph push settings
        graphPushUrlInput.value = items.graphPushUrl || DEFAULT_SETTINGS.graphPushUrl;
        graphPushApiKeyInput.value = items.graphPushApiKey || DEFAULT_SETTINGS.graphPushApiKey;
    });
}

function updateExtensionLabel() {
    const isEnabled = extensionToggle.classList.contains('active');
    extensionLabel.textContent = isEnabled ? 'Extension Enabled' : 'Extension Disabled';
}

function updateGraphPushLabel() {
    const isEnabled = graphPushToggle.classList.contains('active');
    graphPushLabel.textContent = isEnabled ? 'Auto-push Enabled' : 'Auto-push Disabled';
}

function saveSettings() {
    const settings = {
        extensionEnabled: extensionToggle.classList.contains('active'),
        apiUrl: apiUrlInput.value.trim(),
        apiModel: apiModelInput.value.trim(),
        graphPushEnabled: graphPushToggle.classList.contains('active'),
        graphPushUrl: graphPushUrlInput.value.trim(),
        graphPushApiKey: graphPushApiKeyInput.value.trim()
    };
    
    // Validate API URL
    if (settings.apiUrl && !isValidUrl(settings.apiUrl)) {
        showStatus('Please enter a valid URL for the API endpoint.', 'error');
        return;
    }
    
    // Validate graph push URL if enabled
    if (settings.graphPushEnabled && settings.graphPushUrl && !isValidUrl(settings.graphPushUrl)) {
        showStatus('Please enter a valid URL for the graph push endpoint.', 'error');
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

async function testGraphPushConnection() {
    const graphPushUrl = graphPushUrlInput.value.trim();
    const apiKey = graphPushApiKeyInput.value.trim();
    
    if (!graphPushUrl) {
        showTestGraphPushResult('Please enter a graph push URL first.', 'error');
        return;
    }
    
    if (!isValidUrl(graphPushUrl)) {
        showTestGraphPushResult('Please enter a valid URL.', 'error');
        return;
    }
    
    testGraphPushBtn.disabled = true;
    testGraphPushBtn.textContent = 'Testing...';
    showTestGraphPushResult('Testing graph push connection...', 'info');
    
    try {
        // Create sample graph data for testing
        const testGraphData = {
            timestamp: new Date().toISOString(),
            source: 'youtube-learning-extension',
            version: '1.2',
            test: true,
            metadata: {
                videoId: 'test-video-id',
                videoTitle: 'Test Video',
                channelName: 'Test Channel',
                timestamp: new Date().toISOString(),
                captionCount: 1,
                batchId: 0,
                promptUsed: 'test-prompt'
            },
            nodes: [
                { id: 'test-node-1', label: 'Test Concept 1', type: 'concept' },
                { id: 'test-node-2', label: 'Test Concept 2', type: 'concept' }
            ],
            edges: [
                { from: 'test-node-1', to: 'test-node-2', label: 'relates to', type: 'relationship' }
            ],
            rawTriples: [
                ['test-concept-1', 'relates to', 'test-concept-2']
            ]
        };
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        
        const response = await fetch(graphPushUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(testGraphData)
        });
        
        if (response.ok) {
            showTestGraphPushResult('✅ Graph push connection successful!', 'success');
        } else {
            const errorText = await response.text();
            showTestGraphPushResult(`❌ Server returned error: ${response.status} - ${errorText}`, 'error');
        }
    } catch (error) {
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            showTestGraphPushResult('❌ Network error: Unable to connect to the graph push server.', 'error');
        } else {
            showTestGraphPushResult(`❌ Connection failed: ${error.message}`, 'error');
        }
    } finally {
        testGraphPushBtn.disabled = false;
        testGraphPushBtn.textContent = 'Test Graph Push';
    }
}

function showTestGraphPushResult(message, type) {
    testGraphPushResult.textContent = message;
    testGraphPushResult.style.color = type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#6c757d';
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
