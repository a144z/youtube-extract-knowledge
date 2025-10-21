const ExtensionState = {
  isInitialized: false,
  isExtensionEnabled: true, // New: tracks if extension is enabled via settings
  isKnowledgeModeActive: false,
  isBubbleVisible: false,
  currentPrompt: 'definitions',
  lastProcessedText: '',
  currentStatus: 'idle',
  lastCaptionText: '',
  knowledgeModeBtn: null,
  transcriptToggleBtn: null,
  promptSelect: null,
  // Accumulation system
  captionBuffer: [],
  bufferThreshold: 10, // Number of captions to accumulate (fallback)
  wordThreshold: 150, // Number of words to accumulate (primary trigger)
  bufferTimeThreshold: 30000, // 30 seconds in milliseconds
  lastBufferReset: Date.now(),
  isAccumulating: false,
  currentBatchId: 0
};

const CoreModule = (function() {
  let urlObserver = null;

  function init() {
    if (ExtensionState.isInitialized) return;
    
    // Check if extension is enabled via settings
    if (!SettingsModule.isExtensionEnabled()) {
      console.log('YouTube Caption Bubble: Extension is disabled via settings');
      return;
    }

    const player = document.querySelector('#movie_player');
    if (!player) {
      setTimeout(init, 1000);
      return;
    }

    console.log('YouTube Caption Bubble: Initializing with Knowledge Mode (original-style)...');

    StylesModule.injectStyles();
    BubbleModule.createBubble();
    UIControlsModule.createControls();
    CaptionModule.startCaptionObservation();

    ExtensionState.isInitialized = true;
    console.log('YouTube Caption Bubble: Initialized successfully with Knowledge Mode');

    setupUrlObserver();
  }

  function cleanup() {
    StylesModule.removeStyles();
    BubbleModule.cleanup();
    CaptionModule.cleanup();
    TranscriptModule.cleanup();
    UIControlsModule.cleanup();

    if (urlObserver) {
      urlObserver.disconnect();
      urlObserver = null;
    }

    // Reset accumulation state
    ExtensionState.captionBuffer = [];
    ExtensionState.lastBufferReset = Date.now();
    ExtensionState.isAccumulating = false;
    ExtensionState.currentBatchId = 0;

    ExtensionState.isInitialized = false;
    ExtensionState.isKnowledgeModeActive = false;
    ExtensionState.isBubbleVisible = false;
  }

  function setupUrlObserver() {
    let currentUrl = window.location.href;
    urlObserver = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        cleanup();
        setTimeout(init, 1000);
      }
    });

    urlObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  return {
    init,
    cleanup
  };
})();
