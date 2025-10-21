const GraphPushModule = (function() {
  
  async function pushGraphData(graphContent, metadata = {}, forcePush = false) {
    // Check if graph push is enabled (unless forced for manual push)
    if (!forcePush && !SettingsModule.isGraphPushEnabled()) {
      console.log('Graph push is disabled, skipping...');
      return;
    }
    
    const graphPushUrl = SettingsModule.getGraphPushUrl();
    const apiKey = SettingsModule.getGraphPushApiKey();
    
    if (!graphPushUrl) {
      const message = 'No graph push URL configured. Please configure the Graph Push API URL in extension settings.';
      console.log(message);
      if (forcePush) {
        throw new Error(message);
      }
      return;
    }
    
    try {
      // Send raw AI result directly without parsing - let server handle it
      console.log('Raw AI result to push:', graphContent);
      
      // Get current video information
      const videoInfo = getCurrentVideoInfo();
      
      // Create the graph data payload with raw content
      const graphData = {
        timestamp: new Date().toISOString(),
        source: 'youtube-learning-extension',
        version: '1.2',
        metadata: {
          ...videoInfo,
          ...metadata,
          timestamp: new Date().toISOString(),
          captionCount: ExtensionState.captionBuffer.length,
          batchId: ExtensionState.currentBatchId,
          promptUsed: ExtensionState.currentPrompt
        },
        rawContent: graphContent, // Send raw AI result
        contentType: 'ai_triples' // Indicate this is raw AI triple format
      };
      
      console.log('Graph data to push:', {
        rawContent: graphContent.substring(0, 200) + '...',
        contentType: 'ai_triples',
        metadata: graphData.metadata
      });
      
      // Prepare headers
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }
      
      // Send the data
      const response = await fetch(graphPushUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(graphData)
      });
      
      if (response.ok) {
        console.log('✅ Graph data pushed successfully');
        // Update status in the UI
        if (BubbleModule && BubbleModule.updateStatus) {
          BubbleModule.updateStatus('complete', 'Graph data pushed');
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Graph push failed:', response.status, errorText);
        throw new Error(`Graph push failed: ${response.status} - ${errorText}`);
      }
      
    } catch (error) {
      console.error('Error pushing graph data:', error);
      // Don't throw the error to avoid breaking the main flow
      // Just log it and continue
    }
  }
  
  function getCurrentVideoInfo() {
    try {
      const videoId = new URLSearchParams(window.location.search).get('v');
      const videoTitle = document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent?.trim() || 'Unknown Video';
      const channelName = document.querySelector('#channel-name a')?.textContent?.trim() || 'Unknown Channel';
      
      return {
        videoId: videoId || 'unknown',
        videoTitle: videoTitle,
        channelName: channelName,
        url: window.location.href
      };
    } catch (error) {
      console.error('Error getting video info:', error);
      return {
        videoId: 'unknown',
        videoTitle: 'Unknown Video',
        channelName: 'Unknown Channel',
        url: window.location.href
      };
    }
  }
  
  // Function to manually push current graph data (for testing)
  async function pushCurrentGraphData() {
    const contentDiv = BubbleModule.getBubbleContent();
    if (!contentDiv) return;
    
    // Find the latest graph section
    const graphSection = contentDiv.querySelector('.graph-section');
    if (!graphSection) {
      console.log('No graph section found');
      return;
    }
    
    // Try to extract graph data from the latest batch results
    const batchResults = contentDiv.querySelector('.batch-results');
    if (batchResults) {
      // Get the AI content which should contain the triples
      const aiContent = batchResults.querySelector('.ai-content pre');
      if (aiContent) {
        const graphContent = aiContent.textContent;
        await pushGraphData(graphContent, {}, true); // forcePush = true for manual push
      }
    }
  }
  
  return {
    pushGraphData,
    pushCurrentGraphData,
    getCurrentVideoInfo
  };
})();
