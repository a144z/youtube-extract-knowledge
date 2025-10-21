const UIControlsModule = (function() {
  let knowledgeModeBtn = null;
  let transcriptToggleBtn = null;
  let promptSelect = null;

  function createControls() {
    const waitForControls = () => {
      const controlsContainer = document.querySelector('.ytp-right-controls') || 
                               document.querySelector('.ytp-chrome-bottom .ytp-chrome-controls .ytp-right-controls');

      if (!controlsContainer) {
        setTimeout(waitForControls, 500);
        return;
      }

      if (document.querySelector('.knowledge-mode-btn')) {
        return;
      }

      const actionContainer = document.createElement('div');
      actionContainer.style.display = 'flex';
      actionContainer.style.alignItems = 'center';

      knowledgeModeBtn = document.createElement('button');
      knowledgeModeBtn.className = 'knowledge-mode-btn ytp-button';
      knowledgeModeBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>
        </svg>
      `;
      knowledgeModeBtn.title = 'Knowledge Mode - Toggle floating caption bubble';
      actionContainer.appendChild(knowledgeModeBtn);

      transcriptToggleBtn = document.createElement('button');
      transcriptToggleBtn.className = 'transcript-toggle-btn ytp-button';
      transcriptToggleBtn.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
        </svg>
      `;
      transcriptToggleBtn.title = 'Transcript Panel - View full video transcript';
      transcriptToggleBtn.addEventListener('click', TranscriptModule.toggleTranscriptPanel);
      actionContainer.appendChild(transcriptToggleBtn);

      // Prompt select will be moved to the bubble

      knowledgeModeBtn.addEventListener('click', toggleKnowledgeMode);

      const captionButton = controlsContainer.querySelector('.ytp-subtitles-button') ||
                           controlsContainer.querySelector('[class*="caption"]') ||
                           controlsContainer.querySelector('[class*="subtitle"]');

      if (captionButton) {
        captionButton.parentNode.insertBefore(actionContainer, captionButton.nextSibling);
      } else {
        controlsContainer.appendChild(actionContainer);
      }

      console.log('YouTube Caption Bubble: Knowledge Mode button added');

      ExtensionState.knowledgeModeBtn = knowledgeModeBtn;
      ExtensionState.transcriptToggleBtn = transcriptToggleBtn;
      ExtensionState.promptSelect = promptSelect;
    };

    waitForControls();
  }

  function toggleKnowledgeMode() {
    ExtensionState.isKnowledgeModeActive = !ExtensionState.isKnowledgeModeActive;

    if (knowledgeModeBtn) {
      knowledgeModeBtn.classList.toggle('active', ExtensionState.isKnowledgeModeActive);
    }

    if (ExtensionState.isKnowledgeModeActive) {
      console.log('YouTube Caption Bubble: Knowledge Mode activated');

      const captionButton = document.querySelector('.ytp-subtitles-button');
      if (captionButton && captionButton.getAttribute('aria-pressed') === 'false') {
        console.log('YouTube Caption Bubble: Forcing captions ON for Knowledge Mode.');
        captionButton.click();
      }
      
      // Reset buffer when activating knowledge mode
      CaptionModule.resetBuffer();
      CaptionModule.updateCaptionText(true);

      if (ExtensionState.isBubbleVisible) {
        BubbleModule.showBubble();
      }
    } else {
      console.log('YouTube Caption Bubble: Knowledge Mode deactivated');
      
      // Hide bubble completely when deactivating knowledge mode
      BubbleModule.hideBubble();
      
      // Clear buffer when deactivating
      CaptionModule.resetBuffer();
      BubbleModule.updateStatus('idle', 'Ready');
      
      // Clear batch results if any
      const contentDiv = BubbleModule.getBubbleContent();
      if (contentDiv) {
        const batchDiv = contentDiv.querySelector('.batch-results');
        if (batchDiv) {
          batchDiv.remove();
        }
      }
    }
  }

  function cleanup() {
    if (knowledgeModeBtn && knowledgeModeBtn.parentNode) {
      knowledgeModeBtn.parentNode.removeChild(knowledgeModeBtn);
      knowledgeModeBtn = null;
    }

    if (transcriptToggleBtn && transcriptToggleBtn.parentNode) {
      transcriptToggleBtn.parentNode.removeChild(transcriptToggleBtn);
      transcriptToggleBtn = null;
    }

    if (promptSelect && promptSelect.parentNode) {
      promptSelect.parentNode.removeChild(promptSelect);
      promptSelect = null;
    }
  }

  return {
    createControls,
    cleanup
  };
})();
