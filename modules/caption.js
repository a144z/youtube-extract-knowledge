const CaptionModule = (function() {
  let captionObserver = null;
  let bodyObserver = null;
  let lastProcessedText = '';
  let apiCallTimeout = null;
  let isBubbleVisible = false;

  function startCaptionObservation() {
    console.log('🎬 Starting caption observation...');

    const captionSelectors = [
      '.ytp-caption-window-container',
      '.ytp-caption-segment',
      '.ytp-caption-window',
      '.ytp-caption-line-container',
      '.ytp-caption-text-container',
      '[class*="caption-window"]',
      '[class*="caption-segment"]',
      '[class*="ytp-caption"]',
      '[class*="caption"]',
      'ytd-player',
      '#movie_player'
    ];

    let captionContainer = null;
    let foundSelector = '';

    for (const selector of captionSelectors) {
      captionContainer = document.querySelector(selector);
      if (captionContainer) {
        foundSelector = selector;
        console.log(`✅ Found caption container with selector: ${selector}`);
        break;
      }
    }

    if (!captionContainer) {
      console.log('❌ No caption container found - trying alternative approach...');
      
      const allElements = document.querySelectorAll('*');
      for (const element of allElements) {
        if (element.className && 
            (element.className.includes('caption') || 
             element.className.includes('subtitle') ||
             element.className.includes('ytp'))) {
          console.log(`🔍 Found potential caption element: ${element.tagName}.${element.className}`);
          captionContainer = element;
          foundSelector = 'fallback';
          break;
        }
      }
    }

    if (!captionContainer) {
      console.log('❌ No caption container found - ensure captions are enabled in YouTube settings.');
      console.log('🔄 Retrying in 3 seconds...');
      setTimeout(startCaptionObservation, 3000);
      return;
    }

    console.log(`📡 Observing caption container: ${foundSelector}`);

    captionObserver = new MutationObserver((mutations) => {
      let hasChanges = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          hasChanges = true;
        }
      });

      if (hasChanges) {
        console.log('📝 Caption change detected');
        updateCaptionText();
      }
    });

    captionObserver.observe(captionContainer, {
      childList: true,
      subtree: true,
      characterData: true
    });

    bodyObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const captionElements = node.querySelectorAll ? 
                node.querySelectorAll('.ytp-caption-segment, .ytp-caption-window-container, [class*="caption"]') : [];
              if (captionElements.length > 0) {
                console.log('🆕 New caption elements detected');
                updateCaptionText();
              }
            }
          });
        }
      });
    });

    bodyObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      const initialText = getCaptionText();
      if (initialText) {
        console.log('✅ Initial captions found:', initialText);
        updateCaptionText();
      } else {
        console.log('⚠️ No initial captions found - waiting for captions to appear...');
      }
    }, 1000);
  }

  function updateCaptionText(forceUpdate = false) {
    const currentText = getCaptionText();
  
    const lastText = ExtensionState.lastCaptionText || '';

    // Skip if no text change (prevent duplicates)
    if (!forceUpdate && currentText === lastText) {
      return;
    }

    // Skip empty or very short captions
    if (!currentText || currentText.trim().length < 2) {
      return;
    }

    ExtensionState.lastCaptionText = currentText;

    // Only show bubble and process captions if knowledge mode is active
    if (ExtensionState.isKnowledgeModeActive) {
      if (currentText) {
        isBubbleVisible = true;
        
        BubbleModule.showBubble();
        BubbleModule.updateOriginalCaption(currentText);
        accumulateCaption(currentText);
        BubbleModule.updateAccumulatedTitle();
      } else {
        isBubbleVisible = false;
        BubbleModule.hideBubble();
      }
    } else {
      // Knowledge mode is off - hide bubble completely
      isBubbleVisible = false;
      BubbleModule.hideBubble();
    }
  }

  function getNewContent(currentText) {
    // Get the current accumulated text
    const accumulatedText = ExtensionState.captionBuffer
      .map(entry => entry.text)
      .join(' ')
      .trim();

    if (!accumulatedText) return currentText;

    // Find longest common prefix between current caption and end of accumulated
    let overlapLength = 0;
    const minLength = Math.min(accumulatedText.length, currentText.length);
    
    for (let i = minLength; i > 0; i--) {
      if (accumulatedText.endsWith(currentText.substring(0, i))) {
        overlapLength = i;
        break;
      }
    }

    // Return the new part
    const newPart = currentText.substring(overlapLength).trim();
    return newPart;
  }

  function accumulateCaption(text) {
    if (!text || text.trim() === '') return;

    const trimmedText = text.trim();

    // Get only new content
    const newContent = getNewContent(trimmedText);

    // Skip if no new content or too short
    if (!newContent || newContent.length < 1) {
      console.log(`📝 No new content found in: "${trimmedText.substring(0, 50)}..."`);
      return;
    }

    // Add to buffer
    const captionEntry = {
      text: newContent,
      timestamp: Date.now(),
      id: ExtensionState.captionBuffer.length
    };

    ExtensionState.captionBuffer.push(captionEntry);
    ExtensionState.isAccumulating = true;

    console.log(`📝 Added new content: "${newContent}" (from: "${trimmedText.substring(0, 50)}...")`);

    // Check if we should process the batch
    const shouldProcess = checkBufferThreshold();
    
    if (shouldProcess) {
      processBatch();
    } else {
      // Use consistent word count function for display
      const currentWords = getWordCount();
      BubbleModule.updateStatus('accumulating', `Accumulating... (${currentWords}/${ExtensionState.wordThreshold} words)`);
    }

    // Update UI
    BubbleModule.updateAccumulatedTitle();
  }

  function getWordCount() {
    return ExtensionState.captionBuffer
      .map(entry => entry.text)
      .join(' ')
      .split(/\s+/)
      .filter(word => word.trim().length > 0)
      .length;
  }

  function checkBufferThreshold() {
    const totalWords = getWordCount();
    
    // ONLY trigger on 150+ words - no other conditions
    if (totalWords >= ExtensionState.wordThreshold) {
      console.log(`✅ Word threshold reached: ${totalWords} words (target: ${ExtensionState.wordThreshold})`);
      return true;
    }
    
    return false;
  }

  function processBatch() {
    if (ExtensionState.captionBuffer.length === 0) return;

    // Use consistent word count function
    const wordCount = getWordCount();

    // Double-check we actually have 150+ words before processing
    if (wordCount < ExtensionState.wordThreshold) {
      console.log(`⚠️ Batch processing cancelled: only ${wordCount} words (need ${ExtensionState.wordThreshold})`);
      return;
    }

    console.log(`🔄 Processing batch with ${ExtensionState.captionBuffer.length} captions (${wordCount} words)`);
    
    ExtensionState.currentBatchId++;
    const batchId = ExtensionState.currentBatchId;
    
    // Save current buffer data before clearing
    const currentBuffer = [...ExtensionState.captionBuffer];
    
    // Combine all captions in buffer
    const combinedText = currentBuffer
      .map(entry => entry.text)
      .join(' ')
      .trim();

    // Clear buffer immediately to start accumulating next batch
    ExtensionState.captionBuffer = [];
    ExtensionState.lastBufferReset = Date.now();
    ExtensionState.isAccumulating = false;
    
    // Update UI to show we're ready for next batch
    BubbleModule.updateStatus('sending', `Processing batch ${batchId}...`);
    BubbleModule.updateAccumulatedTitle();

    console.log(`📤 Batch ${batchId} sent to API, buffer cleared for next accumulation`);

    // Send to AI for batch processing (async, don't wait)
    KnowledgeModeModule.getBatchExplanation(combinedText, currentBuffer.length, batchId)
      .then(() => {
        console.log(`✅ Batch ${batchId} processed successfully`);
        BubbleModule.updateStatus('idle', 'Ready');
      })
      .catch((error) => {
        console.error(`❌ Batch ${batchId} processing error:`, error);
        BubbleModule.updateStatus('idle', 'Batch processing failed');
      });
  }

  function resetBuffer() {
    console.log(`🔄 Resetting buffer (was ${ExtensionState.captionBuffer.length} captions)`);
    ExtensionState.captionBuffer = [];
    ExtensionState.lastBufferReset = Date.now();
    ExtensionState.isAccumulating = false;
    ExtensionState.lastCaptionText = ''; // Reset to prevent duplicate detection issues
    BubbleModule.updateStatus('idle', 'Ready');
    
    // Update title and accumulated section after reset
    BubbleModule.updateAccumulatedTitle();
  }

  function getCaptionText() {
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
      '[class*="transcript"]',
      'ytd-player .ytp-caption-segment',
      'ytd-player .ytp-caption-window',
      '#movie_player .ytp-caption-segment',
      '#movie_player .ytp-caption-window'
    ];

    let currentText = '';
    let foundSelector = '';
    const collectedTexts = new Set(); // Use Set to prevent duplicates

    console.log('🔍 Searching for captions with multiple selectors...');

    for (const selector of captionSelectors) {
      try {
        const segments = document.querySelectorAll(selector);
        if (segments.length > 0) {
          console.log(`✅ Found ${segments.length} caption elements with selector: ${selector}`);
          foundSelector = selector;
          
          segments.forEach((seg, index) => {
            const text = (seg.textContent || seg.innerText || '').trim();
            if (text && !collectedTexts.has(text)) {
              collectedTexts.add(text);
              currentText += text + ' ';
              console.log(`📝 Caption ${index + 1}: "${text}"`);
            } else if (text && collectedTexts.has(text)) {
              console.log(`⏭️ Skipped duplicate caption: "${text}"`);
            }
          });
          break;
        }
      } catch (error) {
        console.log(`❌ Error with selector ${selector}:`, error);
      }
    }

    if (!foundSelector) {
      console.log('❌ No caption elements found with any selector');
      console.log('🔍 Available elements with "caption" in class name:');
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        if (el.className && el.className.includes && el.className.includes('caption')) {
          console.log(`  - ${el.tagName}.${el.className}: "${el.textContent?.trim()}"`);
        }
      });
    }

    const cleanedText = UtilsModule.cleanCaptionText(currentText.trim());
    console.log(`📋 Final caption text: "${cleanedText}"`);

    return cleanedText;
  }

  function shouldProcessText(text) {
    const hasCompleteSentence = /[.!?]\s*$/.test(text.trim());
    const hasSignificantNewContent = text.length - lastProcessedText.length > 10;
    const hasMinimumContent = text.length >= 3;

    return hasCompleteSentence || hasSignificantNewContent || (lastProcessedText === '' && hasMinimumContent);
  }

  function processTextWithDebounce(text) {
    if (apiCallTimeout) {
      clearTimeout(apiCallTimeout);
    }

    BubbleModule.updateStatus('sending', 'Sending...');

    apiCallTimeout = setTimeout(() => {
      if (text !== lastProcessedText) {
        lastProcessedText = text;
        KnowledgeModeModule.getLLMExplanation(text);
      }
    }, 1000);
  }

  function cleanup() {
    if (captionObserver) {
      captionObserver.disconnect();
      captionObserver = null;
    }

    if (bodyObserver) {
      bodyObserver.disconnect();
      bodyObserver = null;
    }

    if (apiCallTimeout) {
      clearTimeout(apiCallTimeout);
      apiCallTimeout = null;
    }

    lastProcessedText = '';
    isBubbleVisible = false;
  }

  return {
    startCaptionObservation,
    getCaptionText,
    updateCaptionText,
    accumulateCaption,
    processBatch,
    resetBuffer,
    cleanup
  };
})();

