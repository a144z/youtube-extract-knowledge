# YouTube Learning Extension - Modular Structure

This extension has been refactored into a modular architecture for better maintainability and organization.

## Module Structure

### Core Modules

1. **`modules/core.js`** - CoreModule
   - Handles initialization, cleanup, and navigation
   - Manages module lifecycle and dependencies
   - Handles YouTube SPA navigation

2. **`modules/styles.js`** - StylesModule
   - Manages all CSS styling
   - Injects styles into the page
   - Handles cleanup of injected styles

3. **`modules/utils.js`** - UtilsModule
   - Utility functions and helpers
   - System prompts configuration
   - Text processing and formatting functions
   - AI response renderers

### Feature Modules

4. **`modules/caption.js`** - CaptionModule
   - Caption detection and observation
   - Text extraction from YouTube captions
   - MutationObserver setup for caption changes
   - Text processing and debouncing

5. **`modules/bubble.js`** - BubbleModule
   - Caption bubble UI creation and management
   - Drag and resize functionality
   - Bubble positioning and visibility
   - Status indicator management

6. **`modules/knowledge-mode.js`** - KnowledgeModeModule
   - AI integration and LLM communication
   - Ollama API interaction
   - Prompt management and processing
   - Error handling for AI responses

7. **`modules/transcript.js`** - TranscriptModule
   - Transcript panel creation and management
   - Transcript collection and storage
   - Interactive transcript display
   - Video time synchronization

8. **`modules/ui-controls.js`** - UIControlsModule
   - YouTube player control button creation
   - Knowledge Mode and Transcript toggle buttons
   - Prompt selection dropdown
   - Button state management

### Entry Point

9. **`content-modular.js`** - Main Entry Point
   - Initializes the CoreModule
   - Handles DOM ready state
   - Sets up cleanup on page unload

## Module Dependencies

```
CoreModule
├── StylesModule (no dependencies)
├── UtilsModule (no dependencies)
├── BubbleModule (depends on StylesModule)
├── CaptionModule (depends on BubbleModule, UtilsModule)
├── KnowledgeModeModule (depends on UtilsModule, BubbleModule)
├── TranscriptModule (depends on UtilsModule, CaptionModule)
└── UIControlsModule (depends on UtilsModule, KnowledgeModeModule, TranscriptModule)
```

## Features

### Knowledge Mode
- Floating caption bubble always visible when captions are available
- AI-powered explanations using Ollama (when Knowledge Mode is active)
- Multiple prompt types (Definitions, Diagram, Emoji Summary)
- Real-time caption processing with AI inference
- Original captions always displayed

### Transcript Panel
- Full video transcript collection
- Interactive word and segment clicking
- Video time synchronization
- Auto-caption enabling

### Advanced UI
- Draggable and resizable caption bubble
- Status indicators for AI processing
- Smooth animations and transitions
- Responsive design

## Installation

1. Load the extension in Chrome/Edge developer mode
2. Navigate to any YouTube video
3. Enable captions (CC button)
4. Use the Knowledge Mode button to activate AI features
5. Use the Transcript button to view full transcript

## API Integration

The extension integrates with Ollama API running on `localhost:11434`:
- Model: `hf.co/LiquidAI/LFM2-350M-GGUF:Q4_K_M`
- Endpoint: `/api/chat`
- Features: Definitions, concept mapping, emoji summaries

## Browser Compatibility

- Chrome/Chromium-based browsers
- Manifest V3 compatible
- YouTube.com video pages only

## Development

Each module is self-contained and can be modified independently. The modular structure makes it easy to:
- Add new features
- Debug specific functionality
- Maintain and update code
- Test individual components
