const StylesModule = (function() {
  const styleContent = `
  #learning-panel {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 420px;
    height: 580px;
    min-width: 320px;
    min-height: 200px;
    max-width: 90vw;
    max-height: 90vh;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    color: #ffffff;
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    border-radius: 20px;
    z-index: 9999;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Contain layout/paint for performance */
  #learning-panel, .panel-header, .panel-content, .collapsible-section {
    contain: layout paint style;
  }

  #learning-panel:hover:not(.dragging) {
    box-shadow: 
      0 30px 60px rgba(0, 0, 0, 0.5),
      0 0 0 1px rgba(255, 255, 255, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
    transform: translateY(-2px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  #learning-panel.dragging {
    user-select: none;
    transition: none !important;
    transform: none !important;
    box-shadow: 
      0 25px 50px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(255, 255, 255, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    will-change: left, top;
  }

  .panel-header {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    cursor: move;
    position: relative;
    flex-shrink: 0;
    overflow: visible;
  }

  .header-top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .title-section {
    flex: 1;
  }

  .panel-title {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .title-icon {
    font-size: 20px;
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
  }

  .title-text {
    background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .panel-subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
    white-space: nowrap;
    font-weight: 500;
  }

  .panel-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
    overflow: visible;
    z-index: 10000;
    position: relative;
    cursor: default;
    pointer-events: auto;
  }

  .control-btn {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.8);
    padding: 10px 14px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 100px;
    height: 36px;
    position: relative;
    overflow: hidden;
  }

  .control-btn::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .control-btn:hover::before {
    left: 100%;
  }

  .control-btn:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
    color: rgba(255, 255, 255, 0.95);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .control-btn.active {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%);
    border-color: rgba(59, 130, 246, 0.4);
    color: #60a5fa;
    box-shadow: 
      0 4px 15px rgba(59, 130, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .control-btn.active:hover {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.4) 0%, rgba(37, 99, 235, 0.3) 100%);
    transform: translateY(-2px);
    box-shadow: 
      0 8px 25px rgba(59, 130, 246, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.15);
  }

  .btn-icon {
    font-size: 14px;
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
  }

  .btn-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }

  .minimize-toggle {
    min-width: 36px !important;
    padding: 10px !important;
  }

  .minimize-toggle .btn-label {
    display: none;
  }

  .mode-selector {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 10px 30px 10px 14px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 120px;
    height: 36px;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    position: relative;
    z-index: 10000;
    display: block;
    visibility: visible;
    opacity: 1;
    letter-spacing: 0.5px;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.7)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 12px center;
    background-size: 12px;
  }

  .mode-selector:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }

  .mode-selector:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .mode-selector option {
    background: #0f172a;
    color: #fff;
    padding: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .mode-selector option:checked {
    background: rgba(59, 130, 246, 0.3);
    color: #60a5fa;
  }

  .panel-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    overflow-x: hidden;
    transition: all 0.3s ease;
  }

  .panel-content.minimized {
    display: none;
  }

  .panel-content::-webkit-scrollbar {
    width: 8px;
  }

  .panel-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .panel-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }

  .panel-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .collapsible-section {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    border-radius: 16px;
    margin-bottom: 20px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
  }

  .collapsible-section:hover {
    border-color: rgba(255, 255, 255, 0.15);
    transform: translateY(-1px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .section-header {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%);
    padding: 16px 20px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    overflow: hidden;
  }

  .section-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    transition: left 0.5s;
  }

  .section-header:hover::before {
    left: 100%;
  }

  .section-header:hover {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.06) 100%);
  }

  .section-title {
    font-size: 14px;
    font-weight: 700;
    color: #4ade80;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    letter-spacing: 0.5px;
  }

  .expand-icon {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
  }

  .section-content {
    padding: 20px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .section-content.expanded {
    max-height: none;
    opacity: 1;
  }

  .section-content.collapsed {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    opacity: 0;
  }

  .caption-section {
    background: rgba(76, 175, 80, 0.1);
    border-color: rgba(76, 175, 80, 0.2);
  }

  .caption-section .section-title {
    color: #4caf50;
  }

  .caption-text {
    font-size: 15px;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-weight: 400;
    letter-spacing: 0.3px;
  }

  .accumulated-section {
    background: rgba(59, 130, 246, 0.1);
    border-color: rgba(59, 130, 246, 0.2);
  }

  .accumulated-section .section-title {
    color: #3b82f6;
  }

  .batch-results {
    background: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.2);
  }

  .batch-results .section-title {
    color: #10b981;
  }

  .input-details {
    margin-bottom: 16px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    border-left: 3px solid #f59e0b;
  }

  .input-header {
    font-size: 13px;
    font-weight: 600;
    color: #f59e0b;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .prompt-info {
    margin-bottom: 8px;
  }

  .prompt-name {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
  }

  .prompt-preview {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    background: rgba(0, 0, 0, 0.2);
    padding: 8px;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .input-info {
    margin-bottom: 8px;
  }

  .input-label {
    font-size: 12px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
  }

  .input-preview {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(0, 0, 0, 0.2);
    padding: 8px;
    border-radius: 4px;
  }

  .ai-result {
    margin-top: 8px;
  }
  
  .ai-result .caption-text {
    font-size: 14px;
  }
  
  .ai-result h1, .ai-result h2, .ai-result h3 {
    color: #e2e8f0;
    margin-top: 1em;
    margin-bottom: 0.5em;
    font-weight: 600;
  }
  .ai-result h1 { font-size: 1.5em; }
  .ai-result h2 { font-size: 1.25em; }
  .ai-result h3 { font-size: 1.1em; }

  .ai-result ul, .ai-result ol {
    padding-left: 20px;
    margin-top: 0.5em;
    margin-bottom: 1em;
  }
  .ai-result li {
    margin-bottom: 0.5em;
    line-height: 1.6;
  }
  .ai-result p {
    line-height: 1.6;
    margin-bottom: 1em;
  }
  .ai-result strong, .ai-result b {
    color: #93c5fd;
    font-weight: 600;
  }
  .ai-result em, .ai-result i {
    font-style: italic;
    color: #a5b4fc;
  }
  .ai-result code {
    background: rgba(0,0,0,0.3);
    padding: 3px 6px;
    border-radius: 4px;
    font-family: 'Fira Code', 'Courier New', Courier, monospace;
    font-size: 0.9em;
  }
  .ai-result pre {
    background: rgba(0,0,0,0.3);
    padding: 12px;
    border-radius: 8px;
    overflow-x: auto;
  }
  .ai-result blockquote {
    border-left: 3px solid #60a5fa;
    padding-left: 12px;
    margin-left: 0;
    color: #cbd5e1;
  }

  .ai-header {
    font-size: 12px;
    font-weight: 600;
    color: #10b981;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .status-indicator {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    color: #ffffff;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    min-width: 80px;
    text-align: center;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    letter-spacing: 0.5px;
    text-transform: uppercase;
    position: relative;
    overflow: hidden;
  }

  .status-indicator::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .status-indicator:hover::before {
    left: 100%;
  }

  .status-indicator.accumulating { 
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(245, 158, 11, 0.2) 100%);
    color: #fbbf24;
    border-color: rgba(251, 191, 36, 0.3);
    box-shadow: 
      0 4px 15px rgba(251, 191, 36, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .status-indicator.sending { 
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.2) 100%);
    color: #ef4444;
    border-color: rgba(239, 68, 68, 0.3);
    box-shadow: 
      0 4px 15px rgba(239, 68, 68, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .status-indicator.waiting { 
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.2) 100%);
    color: #3b82f6;
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 
      0 4px 15px rgba(59, 130, 246, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  
  .status-indicator.complete { 
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.2) 100%);
    color: #10b981;
    border-color: rgba(16, 185, 129, 0.3);
    box-shadow: 
      0 4px 15px rgba(16, 185, 129, 0.2),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 
        0 4px 15px rgba(251, 191, 36, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    }
    50% {
      box-shadow: 
        0 6px 20px rgba(251, 191, 36, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.15);
    }
  }

  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 20px;
    height: 20px;
    cursor: se-resize;
    z-index: 10000;
  }

  .resize-handle::after {
    content: '';
    position: absolute;
    bottom: 4px;
    right: 4px;
    width: 8px;
    height: 8px;
    border-bottom: 2px solid rgba(255, 255, 255, 0.5);
    border-right: 2px solid rgba(255, 255, 255, 0.5);
    transition: all 0.2s;
  }

  .resize-handle:hover::after {
    border-color: rgba(255, 255, 255, 0.8);
  }

  #learning-panel.hidden { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95); 
    pointer-events: none;
  }

  #learning-panel.dragging {
    user-select: none;
  }

  .knowledge-mode-btn, .transcript-toggle-btn {
    background: transparent !important;
    border: none !important;
    color: #fff !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 !important;
    width: 48px !important;
    height: 48px !important;
    opacity: 0.9 !important;
    transition: opacity 0.2s !important;
    min-width: 48px !important;
    min-height: 48px !important;
    transform: translateY(4px) !important;
  }

  .knowledge-mode-btn:hover, .transcript-toggle-btn:hover {
    opacity: 1 !important;
  }

  .knowledge-mode-btn.active {
    background: transparent !important;
    color: #fff !important;
  }

  .knowledge-mode-btn.active:hover {
    background: transparent !important;
    color: #fff !important;
  }

  .knowledge-mode-btn svg, .transcript-toggle-btn svg {
    width: 24px !important;
    height: 24px !important;
    fill: currentColor !important;
    transition: all 0.2s ease !important;
  }

  .knowledge-mode-btn.active svg {
    fill: transparent !important;
    stroke: #fff !important;
    stroke-width: 1.5px !important;
  }

  /* Enhanced Knowledge Graph Styles */
  .knowledge-graph {
    position: relative;
    background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(59, 130, 246, 0.2);
    margin: 16px 0;
    overflow: hidden;
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
  }

  .knowledge-graph svg {
    width: 100%;
    height: auto;
    min-height: 300px;
    max-height: 500px;
    border-radius: 12px;
    overflow: visible;
  }

  .knowledge-graph .graph-node {
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2));
  }

  .knowledge-graph .graph-node:hover {
    transform: scale(1.15);
    filter: drop-shadow(0 6px 12px rgba(59, 130, 246, 0.4));
  }

  .knowledge-graph .graph-node:active {
    transform: scale(1.05);
    cursor: grabbing;
  }

  .knowledge-graph .graph-edge {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.3));
  }

  .knowledge-graph .graph-edge:hover {
    stroke-width: 3.5;
    stroke: rgba(59, 130, 246, 1);
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.5));
  }

  .knowledge-graph .edge-label {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    transition: all 0.3s ease;
  }

  .knowledge-graph .node-label {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    font-weight: 600;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
    pointer-events: none;
    user-select: none;
    transition: all 0.3s ease;
  }

  /* Graph section specific styling */
  .graph-section {
    background: rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.15);
  }

  .graph-section .section-title {
    color: #3b82f6;
  }

  /* Responsive graph container */
  @media (max-width: 480px) {
    .knowledge-graph {
      padding: 16px;
      margin: 12px 0;
    }
    
    .knowledge-graph svg {
      min-height: 250px;
      max-height: 400px;
    }
  }

  .loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    animation: spin 1s linear infinite;
    margin: 20px auto;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  `;

  let styleElement = null;

  function injectStyles() {
    if (styleElement) return;

    styleElement = document.createElement('style');
    styleElement.textContent = styleContent;
    document.head.appendChild(styleElement);
  }

  function removeStyles() {
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
      styleElement = null;
    }
  }

  return {
    injectStyles,
    removeStyles
  };
})();