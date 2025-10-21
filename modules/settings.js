const SettingsModule = (function() {
  const DEFAULT_SETTINGS = {
    extensionEnabled: true,
    apiUrl: 'http://localhost:11434/api/chat',
    apiModel: 'hf.co/LiquidAI/LFM2-8B-A1B-GGUF:LFM2-8B-A1B-Q4_0.gguf',
    graphPushEnabled: false,
    graphPushUrl: '',
    graphPushApiKey: ''
  };

  let currentSettings = { ...DEFAULT_SETTINGS };

  function init() {
    loadSettings();
    setupMessageListener();
  }

  function loadSettings() {
    chrome.storage.sync.get(DEFAULT_SETTINGS, function(items) {
      if (chrome.runtime.lastError) {
        console.error('Error loading settings:', chrome.runtime.lastError);
        return;
      }
      
      currentSettings = { ...items };
      console.log('Settings loaded:', currentSettings);
      
      // Apply settings to extension state
      if (!currentSettings.extensionEnabled) {
        ExtensionState.isExtensionEnabled = false;
        // If extension is disabled, hide the bubble
        if (BubbleModule) {
          BubbleModule.hideBubble();
        }
      } else {
        ExtensionState.isExtensionEnabled = true;
      }
    });
  }

  function setupMessageListener() {
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (request.action === 'settingsUpdated') {
        console.log('Settings updated:', request.settings);
        currentSettings = { ...request.settings };
        
        // Apply new settings
        ExtensionState.isExtensionEnabled = currentSettings.extensionEnabled;
        
        if (currentSettings.extensionEnabled) {
          // Re-initialize if extension was disabled and now enabled
          if (!ExtensionState.isInitialized) {
            CoreModule.init();
          }
        } else {
          // Clean up if extension was enabled and now disabled
          if (ExtensionState.isInitialized) {
            CoreModule.cleanup();
          }
        }
        
        sendResponse({success: true});
      } else if (request.action === 'extensionToggled') {
        console.log('Extension toggled:', request.enabled);
        ExtensionState.isExtensionEnabled = request.enabled;
        
        if (request.enabled) {
          if (!ExtensionState.isInitialized) {
            CoreModule.init();
          }
        } else {
          if (ExtensionState.isInitialized) {
            CoreModule.cleanup();
          }
        }
        
        sendResponse({success: true});
      }
    });
  }

  function getSettings() {
    return { ...currentSettings };
  }

  function isExtensionEnabled() {
    return currentSettings.extensionEnabled;
  }

  function getApiUrl() {
    return currentSettings.apiUrl;
  }

  function getApiModel() {
    return currentSettings.apiModel;
  }

  function isGraphPushEnabled() {
    return currentSettings.graphPushEnabled;
  }

  function getGraphPushUrl() {
    return currentSettings.graphPushUrl;
  }

  function getGraphPushApiKey() {
    return currentSettings.graphPushApiKey;
  }

  return {
    init,
    getSettings,
    isExtensionEnabled,
    getApiUrl,
    getApiModel,
    isGraphPushEnabled,
    getGraphPushUrl,
    getGraphPushApiKey
  };
})();
