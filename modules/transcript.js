const TranscriptModule = (function() {
  let transcriptPanel = null;
  let transcriptObserver = null;
  let isTranscriptPanelVisible = false;
  let transcriptData = [];
  let videoPlayer = null;

  function createTranscriptPanel() {
    if (transcriptPanel) return;

    transcriptPanel = document.createElement('div');
    transcriptPanel.id = 'transcript-panel';
    transcriptPanel.innerHTML = `
      <div id="transcript-header">
        <div id="transcript-title">Video Transcript</div>
        <div id="transcript-stats">Loading transcript...</div>
      </div>
      <div id="transcript-content">
        <div style="text-align: center; padding: 20px; color: #888;">
          <div class="loader"></div>
          <p>Collecting transcript data...</p>
        </div>
      </div>
    `;

    document.body.appendChild(transcriptPanel);
  }

  function toggleTranscriptPanel() {
    if (!transcriptPanel) {
      createTranscriptPanel();
      startTranscriptCollection();
    }

    isTranscriptPanelVisible = !isTranscriptPanelVisible;

    if (isTranscriptPanelVisible) {
      transcriptPanel.classList.add('visible');
      ExtensionState.transcriptToggleBtn.classList.add('active');

      setTimeout(() => {
        autoEnableCaptions();
      }, 500);

      updateTranscriptDisplay();
    } else {
      transcriptPanel.classList.remove('visible');
      ExtensionState.transcriptToggleBtn.classList.remove('active');
    }
  }

  function startTranscriptCollection() {
    console.log('📚 Starting transcript collection...');

    transcriptData = [];

    const captionSelectors = [
      '.ytp-caption-segment',
      '.ytp-caption-window-container .ytp-caption-segment',
      '.ytp-caption-window',
      '.ytp-caption-window-container',
      '.ytp-caption-line',
      '.ytp-caption-line-container',
      '.ytp-caption-text',
      '.ytp-caption-text-container',
      '[class*="caption-segment"]',
      '[class*="caption-window"]',
      '[class*="ytp-caption"]',
      '[class*="caption"]',
      '[class*="subtitle"]',
      'ytd-player .ytp-caption-segment',
      'ytd-player .ytp-caption-window',
      '#movie_player .ytp-caption-segment',
      '#movie_player .ytp-caption-window'
    ];

    let captionContainer = null;
    let foundSelector = '';

    for (const selector of captionSelectors) {
      captionContainer = document.querySelector(selector);
      if (captionContainer) {
        foundSelector = selector;
        console.log(`✅ Found transcript container with selector: ${selector}`);
        break;
      }
    }

    if (!captionContainer) {
      console.log('❌ No transcript container found - trying fallback approach...');

      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        if (element.className && 
            (element.className.includes('caption') || 
             element.className.includes('subtitle') ||
             element.className.includes('ytp'))) {
          console.log(`🔍 Found potential transcript element: ${element.tagName}.${element.className}`);
          captionContainer = element;
          foundSelector = 'fallback';
          break;
        }
      }
    }

    if (!captionContainer) {
      console.log('❌ No transcript container found - retrying in 3 seconds...');
      setTimeout(startTranscriptCollection, 3000);
      return;
    }

    console.log(`📡 Observing transcript container: ${foundSelector}`);

    transcriptObserver = new MutationObserver((mutations) => {
      let hasChanges = false;

      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          hasChanges = true;
        }
      });

      if (hasChanges) {
        console.log('📝 Transcript change detected');
        collectTranscriptSegment();
      }
    });

    transcriptObserver.observe(captionContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });

    videoPlayer = document.querySelector('video');
    if (videoPlayer) {
      videoPlayer.addEventListener('timeupdate', updateCurrentTime);
      console.log('✅ Video player found for time tracking');
    } else {
      console.log('⚠️ Video player not found');
    }

    setTimeout(() => {
      const initialText = CaptionModule.getCaptionText();
      if (initialText) {
        console.log('✅ Initial transcript text found:', initialText);
        collectTranscriptSegment();
      } else {
        console.log('⚠️ No initial transcript text found - waiting for captions...');
      }
    }, 1000);
  }

  function collectTranscriptSegment() {
    const currentText = CaptionModule.getCaptionText();

    if (!currentText) return;

    if (currentText === ExtensionState.lastProcessedText) return;

    const currentTime = videoPlayer ? videoPlayer.currentTime : 0;

    const lastSegment = transcriptData[transcriptData.length - 1];
    if (lastSegment && lastSegment.text === currentText) return;

    const newSegment = {
      id: transcriptData.length,
      text: currentText,
      time: currentTime,
      timestamp: UtilsModule.formatTime(currentTime)
    };

    transcriptData.push(newSegment);

    ExtensionState.lastProcessedText = currentText;

    if (isTranscriptPanelVisible) {
      updateTranscriptDisplay();
    }
  }

  function updateTranscriptDisplay() {
    if (!transcriptPanel) return;

    const content = transcriptPanel.querySelector('#transcript-content');
    const stats = transcriptPanel.querySelector('#transcript-stats');

    if (transcriptData.length === 0) {
      content.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #888;">
          <div style="font-size: 24px; margin-bottom: 16px;">📺</div>
          <p><strong>No transcript data available yet.</strong></p>
          <p style="font-size: 12px; margin: 8px 0;">Make sure captions are enabled on YouTube:</p>
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin: 12px 0; font-size: 12px;">
            <p>1. Click the <strong>CC</strong> button in the video player</p>
            <p>2. Select your preferred language</p>
            <p>3. Wait for captions to appear</p>
          </div>
          <button onclick="TranscriptModule.checkCaptionsManually()" style="background: #4ecdc4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
            🔍 Check for Captions
          </button>
        </div>
      `;
      stats.textContent = 'No segments collected - Enable captions';
      return;
    }

    const totalWords = transcriptData.reduce((sum, segment) => 
      sum + segment.text.split(' ').length, 0);
    stats.textContent = `${transcriptData.length} segments • ${totalWords} words`;

    content.innerHTML = transcriptData.map(segment => `
      <div class="transcript-segment" data-time="${segment.time}" data-id="${segment.id}">
        <div class="transcript-time">${segment.timestamp}</div>
        <div class="transcript-text">${createInteractiveText(segment.text)}</div>
      </div>
    `).join('');

    content.querySelectorAll('.transcript-segment').forEach(segment => {
      segment.addEventListener('click', (e) => {
        const time = parseFloat(e.currentTarget.dataset.time);
        if (videoPlayer) {
          videoPlayer.currentTime = time;
          videoPlayer.play();
          console.log(`⏯️ Jumped to ${UtilsModule.formatTime(time)}`);
        }
      });
    });

    content.querySelectorAll('.transcript-word').forEach(word => {
      word.addEventListener('click', (e) => {
        e.stopPropagation();
        handleWordClick(e.target.textContent);
      });
    });

    highlightCurrentSegment();
  }

  function autoEnableCaptions() {
    console.log('🤖 Auto-enabling captions...');

    const currentCaptionText = CaptionModule.getCaptionText();
    if (currentCaptionText) {
      console.log('✅ Captions already enabled');
      return;
    }

    const ccSelectors = [
      '.ytp-subtitles-button',
      '.ytp-caption-button', 
      '[class*="caption-button"]',
      '[class*="subtitle-button"]',
      '[aria-label*="Caption"]',
      '[aria-label*="Subtitle"]',
      '[title*="Caption"]',
      '[title*="Subtitle"]'
    ];

    let ccButton = null;
    for (const selector of ccSelectors) {
      ccButton = document.querySelector(selector);
      if (ccButton) {
        console.log(`✅ Found CC button with selector: ${selector}`);
        break;
      }
    }

    if (ccButton) {
      console.log('🖱️ Clicking CC button...');
      ccButton.click();

      setTimeout(() => {
        const captionText = CaptionModule.getCaptionText();
        if (captionText) {
          console.log('✅ Captions enabled successfully');
          collectTranscriptSegment();
          updateTranscriptDisplay();
        } else {
          console.log('⚠️ Captions still not visible - may need manual selection');
          const content = transcriptPanel.querySelector('#transcript-content');
          content.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #888;">
              <div style="font-size: 24px; margin-bottom: 16px;">🎯</div>
              <p><strong>Captions Clicked!</strong></p>
              <p style="font-size: 12px; margin: 8px 0;">If captions still don't appear:</p>
              <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin: 12px 0; font-size: 12px;">
                <p>1. Look for language options in the CC menu</p>
                <p>2. Select your preferred language</p>
                <p>3. Wait a few seconds for captions to load</p>
              </div>
              <button onclick="TranscriptModule.checkCaptionsManually()" style="background: #4ecdc4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
                🔄 Check Again
              </button>
            </div>
          `;
        }
      }, 2000);
    } else {
      console.log('❌ CC button not found - showing manual instructions');
      const content = transcriptPanel.querySelector('#transcript-content');
      content.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #888;">
          <div style="font-size: 24px; margin-bottom: 16px;">📺</div>
          <p><strong>Enable Captions Manually</strong></p>
          <p style="font-size: 12px; margin: 8px 0;">Please enable captions to view the transcript:</p>
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin: 12px 0; font-size: 12px;">
            <p>1. Look for the <strong>CC</strong> button in the video player</p>
            <p>2. Click it to enable captions</p>
            <p>3. Select your preferred language</p>
            <p>4. Wait for captions to appear</p>
          </div>
          <button onclick="TranscriptModule.checkCaptionsManually()" style="background: #4ecdc4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
            🔍 Check for Captions
          </button>
        </div>
      `;
    }
  }

  function checkCaptionsManually() {
    console.log('🔍 Manual caption check initiated...');

    const ccButton = document.querySelector('.ytp-subtitles-button, .ytp-caption-button, [class*="caption-button"], [class*="subtitle-button"]');
    if (ccButton) {
      console.log('✅ Found CC button, clicking...');
      ccButton.click();

      setTimeout(() => {
        const captionText = CaptionModule.getCaptionText();
        if (captionText) {
          console.log('✅ Captions found after clicking CC button');
          collectTranscriptSegment();
          updateTranscriptDisplay();
        } else {
          console.log('❌ Still no captions found');
        }
      }, 2000);
    } else {
      console.log('❌ CC button not found');

      const content = transcriptPanel.querySelector('#transcript-content');
      content.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #888;">
          <div style="font-size: 24px; margin-bottom: 16px;">⚠️</div>
          <p><strong>CC Button Not Found</strong></p>
          <p style="font-size: 12px; margin: 8px 0;">Please manually enable captions:</p>
          <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin: 12px 0; font-size: 12px;">
            <p>1. Right-click on the video</p>
            <p>2. Select "Subtitles/CC"</p>
            <p>3. Choose your language</p>
            <p>4. Or look for the CC icon in the player controls</p>
          </div>
          <button onclick="TranscriptModule.checkCaptionsManually()" style="background: #4ecdc4; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 8px;">
            🔄 Try Again
          </button>
        </div>
      `;
    }
  }

  function createInteractiveText(text) {
    return text.split(' ').map(word => 
      `<span class="transcript-word">${word}</span>`
    ).join(' ');
  }

  function handleWordClick(word) {
    document.querySelectorAll('.transcript-word.selected').forEach(el => {
      el.classList.remove('selected');
    });

    event.target.classList.add('selected');

    console.log(`Word clicked: ${word}`);
  }

  function highlightCurrentSegment() {
    if (!videoPlayer || !transcriptPanel) return;

    const currentTime = videoPlayer.currentTime;

    transcriptPanel.querySelectorAll('.transcript-segment').forEach(segment => {
      segment.classList.remove('active');
    });

    const currentSegment = transcriptPanel.querySelector(`[data-time="${Math.floor(currentTime)}"]`);
    if (currentSegment) {
      currentSegment.classList.add('active');
      currentSegment.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function updateCurrentTime() {
    if (isTranscriptPanelVisible) {
      highlightCurrentSegment();
    }
  }

  function cleanup() {
    if (transcriptObserver) {
      transcriptObserver.disconnect();
      transcriptObserver = null;
    }

    if (transcriptPanel && transcriptPanel.parentNode) {
      transcriptPanel.parentNode.removeChild(transcriptPanel);
      transcriptPanel = null;
    }

    if (videoPlayer) {
      videoPlayer.removeEventListener('timeupdate', updateCurrentTime);
      videoPlayer = null;
    }

    transcriptData = [];
    isTranscriptPanelVisible = false;
  }

  return {
    toggleTranscriptPanel,
    checkCaptionsManually,
    cleanup
  };
})();
