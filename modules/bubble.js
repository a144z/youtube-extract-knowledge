const BubbleModule = (function() {
  let learningPanel = null;
  let statusIndicator = null;
  let isResizing = false;
  let resizeHandle = null;
  let currentCaptionVisible = true;
  let accumulatedVisible = true;
  let graphVisible = true;

  // Lightweight render guards to avoid unnecessary DOM work
  const lastRendered = {
    captionText: '',
    accumulatedCount: 0,
    accumulatedTextLen: 0,
  };

  function createBubble() {
    if (learningPanel) return;

    learningPanel = document.createElement('div');
    learningPanel.id = 'learning-panel';
    learningPanel.className = 'hidden';

    // Create header with improved layout
    const headerDiv = document.createElement('div');
    headerDiv.className = 'panel-header';
    
    // Top row: Title and Status
    const topRow = document.createElement('div');
    topRow.className = 'header-top-row';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'title-section';
    titleDiv.innerHTML = `
      <div class="panel-title">
        <span class="title-icon">🧠</span>
        <span class="title-text">YouTube Learning</span>
      </div>
      <div class="panel-subtitle">AI-powered analysis</div>
    `;
    topRow.appendChild(titleDiv);

    // Create status indicator integrated into header
    statusIndicator = document.createElement('div');
    statusIndicator.className = 'status-indicator';
    statusIndicator.textContent = 'Ready';
    topRow.appendChild(statusIndicator);

    headerDiv.appendChild(topRow);

    // Bottom row: Control buttons
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'panel-controls';
    
    // Current caption toggle
    const captionToggle = document.createElement('button');
    captionToggle.className = 'control-btn caption-toggle active';
    captionToggle.innerHTML = '<span class="btn-icon">📺</span><span class="btn-label">Caption</span>';
    captionToggle.title = 'Toggle Current Caption';
    captionToggle.addEventListener('click', () => toggleCurrentCaption());
    controlsDiv.appendChild(captionToggle);

    // Accumulated toggle
    const accumulatedToggle = document.createElement('button');
    accumulatedToggle.className = 'control-btn accumulated-toggle active';
    accumulatedToggle.innerHTML = '<span class="btn-icon">📚</span><span class="btn-label">Accumulated</span>';
    accumulatedToggle.title = 'Toggle Accumulated Content';
    accumulatedToggle.addEventListener('click', () => toggleAccumulated());
    controlsDiv.appendChild(accumulatedToggle);

    // Graph toggle
    const graphToggle = document.createElement('button');
    graphToggle.className = 'control-btn graph-toggle active';
    graphToggle.innerHTML = '<span class="btn-icon">🕸️</span><span class="btn-label">Graph</span>';
    graphToggle.title = 'Toggle Graph Visualization';
    graphToggle.addEventListener('click', () => toggleGraph());
    controlsDiv.appendChild(graphToggle);

    // Mode selector dropdown
    const modeSelect = document.createElement('select');
    modeSelect.className = 'mode-selector';
    modeSelect.id = 'bubble-mode-select';
    modeSelect.title = 'Select Analysis Mode';
    
    // Add mode options based on available system prompts
    const modeOptions = [
      { value: 'definitions', text: '📚 Definitions' },
      { value: 'diagram', text: '🔗 Diagram' },
      { value: 'graph', text: '🔗 Graph' }
    ];
    
    modeOptions.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.text;
      modeSelect.appendChild(option);
    });
    
    // Set default mode to definitions
    modeSelect.value = 'definitions';
    
    // Prevent header drag from swallowing interactions
    modeSelect.addEventListener('mousedown', (e) => e.stopPropagation());
    modeSelect.addEventListener('click', (e) => e.stopPropagation());
    modeSelect.addEventListener('touchstart', (e) => e.stopPropagation());

    // Add change event handler
    modeSelect.addEventListener('change', (e) => {
      const selectedMode = e.target.value;
      console.log('Analysis mode changed to:', selectedMode);
      
      // Store the selected mode in ExtensionState
      ExtensionState.currentPrompt = selectedMode;
      
      // Show brief feedback
      updateStatus('complete', `Mode: ${UtilsModule.systemPrompts[selectedMode]?.name || selectedMode}`);
      setTimeout(() => {
        if (ExtensionState.isKnowledgeModeActive) {
          updateStatus('ready', 'Ready');
        }
      }, 2000);
    });
    
    controlsDiv.appendChild(modeSelect);

    // Minimize/maximize toggle
    const minimizeToggle = document.createElement('button');
    minimizeToggle.className = 'control-btn minimize-toggle';
    minimizeToggle.innerHTML = '<span class="btn-icon">−</span>';
    minimizeToggle.title = 'Minimize Panel';
    minimizeToggle.addEventListener('click', () => toggleMinimize());
    controlsDiv.appendChild(minimizeToggle);

    headerDiv.appendChild(controlsDiv);

    learningPanel.appendChild(headerDiv);

    // Create content area
    const contentDiv = document.createElement('div');
    contentDiv.className = 'panel-content';
    learningPanel.appendChild(contentDiv);

    // Create resize handle
    resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    learningPanel.appendChild(resizeHandle);

    document.body.appendChild(learningPanel);

    setupDragFunctionality();
    setupResizeFunctionality();
  }

  function showBubble() {
    if (learningPanel) {
      learningPanel.classList.remove('hidden');
      learningPanel.style.display = 'flex';
      // Ensure mode dropdown is properly initialized
      refreshModeDropdown();
    }
  }

  function hideBubble() {
    if (learningPanel) {
      learningPanel.classList.add('hidden');
      learningPanel.style.display = 'none';
    }
  }

  function updateOriginalCaption(text) {
    if (!learningPanel) return;

    if (text === lastRendered.captionText) return; // no-op if unchanged
    lastRendered.captionText = text;

    const contentDiv = learningPanel.querySelector('.panel-content');
    let captionSection = contentDiv.querySelector('.caption-section');
    if (!captionSection) {
      captionSection = document.createElement('div');
      captionSection.className = 'caption-section collapsible-section';
      captionSection.innerHTML = `
        <div class="section-header" onclick="toggleSection(this)">
          <div class="section-title">
            <span>📺</span>
            Current Caption
            <span class="expand-icon">▼</span>
          </div>
        </div>
        <div class="section-content expanded">
          <div class="caption-text"></div>
        </div>
      `;
      contentDiv.insertBefore(captionSection, contentDiv.firstChild);
    }

    const textEl = captionSection.querySelector('.caption-text');
    if (textEl) textEl.textContent = text;
    captionSection.style.display = currentCaptionVisible ? 'block' : 'none';

    if (!ExtensionState.isKnowledgeModeActive) {
      const batchDiv = contentDiv.querySelector('.batch-results');
      if (batchDiv) batchDiv.remove();
    }
  }

  function updateAccumulatedTitle() {
    if (!learningPanel) return;

    const titleDiv = learningPanel.querySelector('.panel-title');
    if (!titleDiv) return;

    // Always show "YouTube Learning Assistant" regardless of buffer state
    titleDiv.innerHTML = `
      <span>🧠</span>
      YouTube Learning Assistant
    `;

    // Still update the accumulated section
    updateAccumulatedSection();
  }

  function updateAccumulatedSection() {
    if (!learningPanel) return;
    const contentDiv = learningPanel.querySelector('.panel-content');
    if (!contentDiv) return;

    let accumulatedSection = contentDiv.querySelector('.accumulated-section');
    const count = ExtensionState.captionBuffer.length;

    if (count === 0) {
      if (accumulatedSection) accumulatedSection.remove();
      lastRendered.accumulatedCount = 0;
      lastRendered.accumulatedTextLen = 0;
      return;
    }

    // Only re-render when count changes to avoid heavy joins each tick
    if (!accumulatedSection) {
      accumulatedSection = document.createElement('div');
      accumulatedSection.className = 'accumulated-section collapsible-section';
      const captionSection = contentDiv.querySelector('.caption-section');
      if (captionSection) captionSection.insertAdjacentElement('afterend', accumulatedSection);
      else contentDiv.insertBefore(accumulatedSection, contentDiv.firstChild);

      accumulatedSection.innerHTML = `
        <div class="section-header" onclick="toggleSection(this)">
          <div class="section-title">
            <span>📚</span>
            Accumulated Transcript (${count} captions)
            <span class="expand-icon">▼</span>
          </div>
        </div>
        <div class="section-content expanded">
          <div class="caption-text"></div>
        </div>
      `;
    }

    if (count !== lastRendered.accumulatedCount) {
      const accumulatedText = ExtensionState.captionBuffer.map(e => e.text).join(' ').trim();
      const textEl = accumulatedSection.querySelector('.caption-text');
      if (textEl) textEl.textContent = accumulatedText;
      
      // Update the entire section title with new count
      const sectionTitle = accumulatedSection.querySelector('.section-title');
      if (sectionTitle) {
        sectionTitle.innerHTML = `
          <span>📚</span>
          Accumulated Transcript (${count} captions)
          <span class="expand-icon">▼</span>
        `;
      }
      
      lastRendered.accumulatedCount = count;
      lastRendered.accumulatedTextLen = accumulatedText.length;
    }

    accumulatedSection.style.display = accumulatedVisible ? 'block' : 'none';
  }

  function refreshModeDropdown() {
    if (!learningPanel) return;
    
    const modeSelect = learningPanel.querySelector('#bubble-mode-select');
    if (!modeSelect) return;
    
    // Ensure the current mode is valid
    if (!ExtensionState.currentPrompt) {
      ExtensionState.currentPrompt = 'definitions';
    }
    
    // Update the selected value to match current state
    modeSelect.value = ExtensionState.currentPrompt;
    
    console.log('Mode dropdown refreshed. Current mode:', ExtensionState.currentPrompt);
  }

  function displayBatchResults(batchData) {
    const contentDiv = BubbleModule.getBubbleContent();
    if (!contentDiv) return;

    let batchDiv = contentDiv.querySelector('.batch-results');
    if (!batchDiv) {
      batchDiv = document.createElement('div');
      batchDiv.className = 'batch-results collapsible-section';
      contentDiv.appendChild(batchDiv);
    }

    // Create expanded display with original input and prompt
    let inputSection = '';
    if (batchData.originalInput && batchData.masterPrompt) {
      // Dynamic preview length based on content size
      const promptPreviewLength = Math.min(200, Math.max(50, batchData.masterPrompt.length / 4));
      const inputPreviewLength = Math.min(400, Math.max(100, batchData.originalInput.length / 3));
      
      inputSection = `
        <div class="input-details">
          <div class="input-header">
            <span>📝</span>
            Input & Prompt Used
          </div>
          <div class="prompt-info">
            <div class="prompt-name">System Prompt: ${batchData.promptName || 'Custom'}</div>
            <div class="prompt-preview">
              ${batchData.masterPrompt.substring(0, promptPreviewLength)}${batchData.masterPrompt.length > promptPreviewLength ? '...' : ''}
            </div>
          </div>
          <div class="input-info">
            <div class="input-label">Input Text (${batchData.captionCount} captions):</div>
            <div class="input-preview">
              ${batchData.originalInput.substring(0, inputPreviewLength)}${batchData.originalInput.length > inputPreviewLength ? '...' : ''}
            </div>
          </div>
        </div>
      `;
    }

    // Render AI analysis as pure text (no special rendering)
    let processedContent = '';
    const escapeHtml = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    processedContent = `<pre style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(batchData.content)}</pre>`;

    batchDiv.innerHTML = `
      <div class="section-header" onclick="toggleSection(this)">
        <div class="section-title">
          <span>🎯</span>
          Batch Analysis (${batchData.captionCount} captions)
          <span class="expand-icon">▼</span>
        </div>
      </div>
      <div class="section-content expanded">
        ${inputSection}
        <div class="ai-result">
          <div class="ai-header">
            <span>🤖</span>
            AI Analysis Result:
          </div>
          <div class="ai-content">${processedContent}</div>
        </div>
      </div>
    `;

    // If current mode is graph, append a separate graph section below AI analysis
    const isGraphMode = (batchData.promptKey || ExtensionState.currentPrompt) === 'graph';
    if (isGraphMode) {
      const sectionContent = batchDiv.querySelector('.section-content');
      if (sectionContent) {
        const graphSection = document.createElement('div');
        graphSection.className = 'graph-section collapsible-section';
        graphSection.style.display = graphVisible ? 'block' : 'none';
        graphSection.innerHTML = `
          <div class="section-header" onclick="toggleSection(this)">
            <div class="section-title">
              <span>🕸️</span>
              Knowledge Graph
              <span class="expand-icon">▼</span>
            </div>
          </div>
          <div class="section-content expanded">
            <div class="graph-container"></div>
            <div class="graph-controls" style="margin-top: 10px; text-align: center;">
              <button class="control-btn" id="pushGraphBtn" style="font-size: 12px; padding: 6px 12px;" title="Push Graph Data to Server (works even if auto-push is disabled)">
                📤 Push Graph Data
              </button>
              <button class="control-btn" id="testParsingBtn" style="font-size: 12px; padding: 6px 12px; margin-left: 5px;" title="Test raw AI content push to server">
                🧪 Test Push
              </button>
            </div>
          </div>
        `;
        sectionContent.appendChild(graphSection);

        // Render the graph into the container
        const graphContainer = graphSection.querySelector('.graph-container');
        if (graphContainer) {
          UtilsModule.renderGraph(batchData.content, graphContainer);
        }
        
        // Add push button functionality
        const pushBtn = graphSection.querySelector('#pushGraphBtn');
        if (pushBtn) {
          pushBtn.addEventListener('click', async () => {
            pushBtn.disabled = true;
            pushBtn.textContent = 'Pushing...';
            
            try {
              await GraphPushModule.pushGraphData(batchData.content, {
                batchId: batchData.batchId,
                captionCount: batchData.captionCount,
                promptName: batchData.promptName
              }, true); // forcePush = true for manual push
              pushBtn.textContent = '✅ Pushed!';
              setTimeout(() => {
                pushBtn.textContent = '📤 Push Graph Data';
                pushBtn.disabled = false;
              }, 2000);
            } catch (error) {
              console.error('Error pushing graph data:', error);
              pushBtn.textContent = '❌ Failed';
              pushBtn.title = `Error: ${error.message}`;
              setTimeout(() => {
                pushBtn.textContent = '📤 Push Graph Data';
                pushBtn.title = 'Push Graph Data to Server';
                pushBtn.disabled = false;
              }, 3000);
            }
          });
        }
        
        // Add test parsing button functionality
        const testBtn = graphSection.querySelector('#testParsingBtn');
        if (testBtn) {
          testBtn.addEventListener('click', () => {
            console.log('Testing raw AI content push...');
            // Test with sample AI content
            const sampleContent = `(class,topic,first_class)
(learning,semester_framework,provided_framework)
(ideas,connection_to_understanding,important_for_attention)
(teacher,addresses_kant,Emmanuel_Kant)
(philosopher,history_category,western_history)
(knowledge,connected_to,learning_process)
(confusion,prompts_action,ask_question)
(clarity_in_learning,enhances_mastery,learn_more)
(questions_encourage_deeper_engagement,habit_formation,student_behavior)
(knowledge_graph,structure_type,triples_format)`;
            
            GraphPushModule.pushGraphData(sampleContent, {
              batchId: 'test',
              captionCount: 1,
              promptName: 'test-prompt'
            }, true).then(() => {
              testBtn.textContent = '✅ Test Sent!';
              setTimeout(() => {
                testBtn.textContent = '🧪 Test Push';
              }, 3000);
            }).catch(error => {
              console.error('Test push failed:', error);
              testBtn.textContent = '❌ Test Failed';
              setTimeout(() => {
                testBtn.textContent = '🧪 Test Push';
              }, 3000);
            });
          });
        }
      }
    }
  }

  function updateStatus(status, text) {
    ExtensionState.currentStatus = status;
    if (statusIndicator) {
      statusIndicator.textContent = text;
      statusIndicator.className = `status-indicator ${status}`;
      
      // Always show status indicator when accumulating or when knowledge mode is active
      if (status === 'accumulating' || ExtensionState.isKnowledgeModeActive) {
        statusIndicator.style.display = 'flex';
      } else {
        statusIndicator.style.display = 'none';
      }
    }
  }

  function getBubbleContent() {
    return learningPanel ? learningPanel.querySelector('.panel-content') : null;
  }

  function setupDragFunctionality() {
    if (!learningPanel) return;

    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let animationFrame = null;

    const headerDiv = learningPanel.querySelector('.panel-header');
    
    headerDiv.addEventListener('mousedown', (e) => {
      // Don't start dragging if clicking on controls (buttons/selects)
      if (e.target.closest('.panel-controls')) return;
      
      isDragging = true;
      learningPanel.classList.add('dragging');

      const rect = learningPanel.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;

      document.addEventListener('mousemove', onMouseMove, { passive: true });
      document.addEventListener('mouseup', onMouseUp, { passive: true });

      e.preventDefault();
    });

    function onMouseMove(e) {
      if (!isDragging) return;

      // Cancel any pending animation frame
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }

      // Use requestAnimationFrame for smooth dragging
      animationFrame = requestAnimationFrame(() => {
        const x = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - learningPanel.offsetWidth));
        const y = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - learningPanel.offsetHeight));

        // Use left/top positioning for proper dragging behavior
        learningPanel.style.left = x + 'px';
        learningPanel.style.top = y + 'px';
        learningPanel.style.right = 'auto';
        learningPanel.style.bottom = 'auto';
        learningPanel.style.transform = 'none';
      });
    }

    function onMouseUp() {
      if (isDragging) {
        isDragging = false;
        learningPanel.classList.remove('dragging');
        
        // Cancel any pending animation frame
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = null;
        }
        
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }
    }
  }

  function setupResizeFunctionality() {
    if (!resizeHandle) return;

    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      startWidth = parseInt(window.getComputedStyle(learningPanel).width, 10);
      startHeight = parseInt(window.getComputedStyle(learningPanel).height, 10);

      document.addEventListener('mousemove', onResizeMove);
      document.addEventListener('mouseup', onResizeEnd);

      e.preventDefault();
    });

    function onResizeMove(e) {
      if (!isResizing) return;

      const newWidth = Math.max(300, Math.min(800, startWidth + e.clientX - startX));
      const newHeight = Math.max(200, Math.min(1000, startHeight + e.clientY - startY));

      learningPanel.style.width = newWidth + 'px';
      learningPanel.style.height = newHeight + 'px';
    }

    function onResizeEnd() {
      isResizing = false;
      document.removeEventListener('mousemove', onResizeMove);
      document.removeEventListener('mouseup', onResizeEnd);
    }
  }

  function toggleCurrentCaption() {
    currentCaptionVisible = !currentCaptionVisible;
    const captionSection = learningPanel?.querySelector('.caption-section');
    const toggle = learningPanel?.querySelector('.caption-toggle');
    
    if (captionSection) {
      if (currentCaptionVisible) {
        captionSection.style.display = 'block';
      } else {
        captionSection.style.display = 'none';
      }
    }
    
    if (toggle) {
      toggle.classList.toggle('active', currentCaptionVisible);
    }
  }

  function toggleAccumulated() {
    accumulatedVisible = !accumulatedVisible;
    const accumulatedSection = learningPanel?.querySelector('.accumulated-section');
    const toggle = learningPanel?.querySelector('.accumulated-toggle');
    
    if (accumulatedSection) {
      if (accumulatedVisible) {
        accumulatedSection.style.display = 'block';
      } else {
        accumulatedSection.style.display = 'none';
      }
    }
    
    if (toggle) {
      toggle.classList.toggle('active', accumulatedVisible);
    }
  }

  function toggleGraph() {
    graphVisible = !graphVisible;
    const graphSections = learningPanel?.querySelectorAll('.graph-section');
    const toggle = learningPanel?.querySelector('.graph-toggle');

    if (graphSections && graphSections.length > 0) {
      graphSections.forEach(section => {
        section.style.display = graphVisible ? 'block' : 'none';
      });
    }

    if (toggle) {
      toggle.classList.toggle('active', graphVisible);
    }
  }


  function toggleMinimize() {
    const contentDiv = learningPanel?.querySelector('.panel-content');
    const minimizeBtn = learningPanel?.querySelector('.minimize-toggle');
    
    if (contentDiv && minimizeBtn) {
      const isMinimized = contentDiv.classList.contains('minimized');
      
      if (isMinimized) {
        contentDiv.classList.remove('minimized');
        minimizeBtn.innerHTML = '−';
        minimizeBtn.title = 'Minimize Panel';
      } else {
        contentDiv.classList.add('minimized');
        minimizeBtn.innerHTML = '+';
        minimizeBtn.title = 'Expand Panel';
      }
    }
  }

  function cleanup() {
    if (learningPanel && learningPanel.parentNode) {
      learningPanel.parentNode.removeChild(learningPanel);
      learningPanel = null;
    }
    statusIndicator = null;
    resizeHandle = null;
  }

  // Global function for section toggling
  window.toggleSection = function(headerElement) {
    const section = headerElement.closest('.collapsible-section');
    const content = section.querySelector('.section-content');
    const icon = headerElement.querySelector('.expand-icon');
    
    if (content.classList.contains('expanded')) {
      content.classList.remove('expanded');
      content.classList.add('collapsed');
      icon.textContent = '▶';
    } else {
      content.classList.remove('collapsed');
      content.classList.add('expanded');
      icon.textContent = '▼';
    }
  };

  return {
    createBubble,
    showBubble,
    hideBubble,
    updateOriginalCaption,
    updateAccumulatedTitle,
    updateAccumulatedSection,
    refreshModeDropdown,
    displayBatchResults,
    updateStatus,
    getBubbleContent,
    toggleCurrentCaption,
    toggleAccumulated,
    toggleMinimize,
    cleanup
  };
})();
