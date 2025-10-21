const KnowledgeModeModule = (function() {

  async function getBatchExplanation(text, captionCount, batchId) {
    const contentDiv = BubbleModule.getBubbleContent();
    if (!contentDiv) return;

    BubbleModule.updateStatus('waiting', `Processing batch ${batchId}...`);

    const selectedPrompt = UtilsModule.systemPrompts[ExtensionState.currentPrompt];

    try {
      console.log(`Sending batch ${batchId} to Ollama API with ${captionCount} captions`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      let response;
      try {
        response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'hf.co/LiquidAI/LFM2-8B-A1B-GGUF:LFM2-8B-A1B-Q4_0.gguf',
            messages: [{ role: 'user', content: selectedPrompt.prompt + text }],
            stream: false,
            options: {
              temperature: 0.7,
              num_gpu: 99,
              num_predict: 1500, // Increased for batch processing
              num_ctx: 4096,    // Increased context window
              keep_alive: true
            },
          }),
          signal: controller.signal
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - Ollama API took too long to respond');
        }
        throw new Error(`Network error: ${fetchError.message}. Make sure Ollama is running at http://localhost:11434`);
      }
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.message || !data.message.content) {
        throw new Error(`Invalid API response structure: ${JSON.stringify(data)}`);
      }

      let contentText = data.message.content;
      const codeBlockMatch = contentText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        contentText = codeBlockMatch[1].trim();
      }

      // Display batch results with original input and prompt
      const batchData = {
        content: contentText,
        captionCount: captionCount,
        batchId: batchId,
        originalInput: text,
        masterPrompt: selectedPrompt.prompt,
        promptName: selectedPrompt.name,
        promptKey: ExtensionState.currentPrompt
      };

      BubbleModule.displayBatchResults(batchData);
      BubbleModule.updateStatus('complete', `Batch ${batchId} complete`);

      console.log(`✅ Batch ${batchId} processed successfully`);

    } catch (error) {
      console.error(`Batch ${batchId} processing error:`, error);
      
      const errorData = {
        content: `Error processing batch ${batchId}: ${error.message}`,
        captionCount: captionCount,
        batchId: batchId
      };

      BubbleModule.displayBatchResults(errorData);
      BubbleModule.updateStatus('idle', `Batch ${batchId} failed`);
    }
  }

  async function getLLMExplanation(text) {
    const contentDiv = BubbleModule.getBubbleContent();
    if (!contentDiv) return;

    BubbleModule.updateStatus('waiting', 'Waiting for response...');

    let aiDiv = contentDiv.querySelector('#ai-explanation');
    if (!aiDiv) {
      aiDiv = document.createElement('div');
      aiDiv.id = 'ai-explanation';
      contentDiv.appendChild(aiDiv);
    }

    aiDiv.innerHTML = '<div class="loader"></div>';

    const selectedPrompt = UtilsModule.systemPrompts[ExtensionState.currentPrompt];

    try {
      console.log('Sending request to Ollama API with text:', text);
      console.log('Using prompt:', selectedPrompt.prompt);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      let response;
      try {
        response = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'hf.co/LiquidAI/LFM2-350M-GGUF:Q4_K_M',
            messages: [{ role: 'user', content: selectedPrompt.prompt + text }],
            stream: false,
            options: {
              temperature: 0.7,
              num_gpu: 99,
              num_predict: 1000,
              num_ctx: 2048,
              keep_alive: true
            },
          }),
          signal: controller.signal
        });
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout - Ollama API took too long to respond');
        }
        throw new Error(`Network error: ${fetchError.message}. Make sure Ollama is running at http://localhost:11434`);
      }
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.message || !data.message.content) {
        throw new Error(`Invalid API response structure: ${JSON.stringify(data)}`);
      }

      let contentText = data.message.content;
      const codeBlockMatch = contentText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        contentText = codeBlockMatch[1].trim();
      }

      try {
        const content = JSON.parse(contentText);
        selectedPrompt.renderer(content, aiDiv);
        BubbleModule.updateStatus('complete', 'Complete');
      } catch (jsonError) {
        selectedPrompt.renderer(contentText, aiDiv);
        BubbleModule.updateStatus('complete', 'Complete');
      }
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error stack:', error.stack);

      aiDiv.innerHTML = `
        <div style="color: red; font-size: 12px;">
          <h4>API Error:</h4>
          <p><strong>Error Type:</strong> ${error.name}</p>
          <p><strong>Error Message:</strong> ${error.message}</p>
          <p><strong>Request Text:</strong> ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}</p>
          <details>
            <summary>Full Error Stack</summary>
            <pre style="background: #f0f0f0; padding: 10px; margin: 5px 0; overflow-x: auto; font-size: 11px;">${error.stack}</pre>
          </details>
          <details>
            <summary>Request Details</summary>
            <pre style="background: #f0f0f0; padding: 10px; margin: 5px 0; overflow-x: auto; font-size: 11px;">Model: hf.co/LiquidAI/LFM2-350M-GGUF:Q4_K_M
Prompt: ${selectedPrompt.name}
Text Length: ${text.length}
Temperature: 0.7</pre>
          </details>
        </div>
      `;
      BubbleModule.updateStatus('idle', 'Error');
    }
  }

  return {
    getBatchExplanation,
    getLLMExplanation
  };
})();
