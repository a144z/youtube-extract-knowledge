# YouTube Learning Extension

A Chrome extension that enhances YouTube learning by providing AI-powered explanations, knowledge graphs, and interactive visualizations of video content.

> **💡 Perfect for Brainstorming!** This project serves as an excellent foundation for exploring innovative learning technologies, AI integration, and educational tool development. The modular architecture and comprehensive feature set make it ideal for experimenting with new ideas and expanding into a full learning ecosystem.

## 🚀 Features

### 📚 **Knowledge Mode**
- **AI Explanations**: Get detailed explanations of YouTube captions using configurable AI models
- **Multiple Output Formats**: 
  - **Definitions**: Detailed explanations of key terms and concepts
  - **Diagrams**: Visual representations of concepts and relationships
  - **Graphs**: Interactive knowledge graphs with nodes and edges
  - **Explore**: Creative discovery of hidden connections and novel insights

### 🎯 **Interactive Graph Visualization**
- **Real-time Graph Rendering**: Live D3.js visualization of knowledge graphs
- **Interactive Controls**: Zoom, pan, cluster, spread, and focus on nodes
- **Node Highlighting**: Hover to see connections and relationships
- **Graph Manipulation**: Drag nodes, double-click to focus, restart simulation

### 🔧 **Configurable Settings**
- **Extension Toggle**: Enable/disable the extension
- **AI API Configuration**: Customize API URL and model
- **Graph Push Settings**: Configure server endpoint and API key
- **Auto-push Toggle**: Automatically send graphs to server or manual control

### 📊 **Data Sharing**
- **Graph Metadata Push**: Send knowledge graphs to configurable endpoints
- **Multi-user Support**: Server handles multiple users' graph data
- **Live Dashboard**: Real-time visualization of received graphs

## 📁 Repository Structure

```
youtube-learning-extension/
├── 📁 modules/                    # Extension modules
│   ├── settings.js               # Settings management
│   ├── utils.js                  # Utility functions
│   ├── styles.js                 # Dynamic styling
│   ├── marked.js                 # Markdown rendering
│   ├── bubble.js                 # Floating UI bubble
│   ├── caption.js                # Caption processing
│   ├── knowledge-mode.js          # AI integration
│   ├── graph-push.js             # Graph data transmission
│   ├── transcript.js             # Transcript handling
│   ├── ui-controls.js            # UI controls
│   └── core.js                   # Main initialization
├── 📁 server/                    # Python server
│   ├── live_graph_server.py      # Flask server with D3.js dashboard
│   ├── requirements.txt          # Python dependencies
│   ├── start_live_server.py      # Server startup script
│   ├── start_server.py           # Alternative startup script
│   └── README.md                 # Server documentation
├── manifest.json                 # Chrome extension manifest
├── content-modular.js            # Main content script
├── options.html                  # Settings page
├── options.js                    # Settings page logic
├── popup.html                    # Extension popup
├── popup.js                      # Popup logic
├── styles.css                    # Extension styles
└── README.md                     # This file
```

## 🛠️ Installation

### Chrome Extension

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd youtube-learning-extension
   ```

2. **Load the extension**:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the repository folder

3. **Configure settings**:
   - Click the extension icon and select "Options"
   - Set your AI API URL and model
   - Configure graph push settings if desired

### Python Server (Optional)

The server provides live graph visualization and data collection:

**Option 1 - From server directory:**
```bash
cd server
python start_server.py
```

**Option 2 - Direct server start:**
```bash
cd server
python start_live_server.py
```

Then visit `http://localhost:5000` for the live dashboard.

## ⚙️ Configuration

### Extension Settings

Access settings via the extension popup or options page:

- **Extension Enabled**: Toggle the extension on/off
- **AI API URL**: Your AI service endpoint (e.g., Ollama, OpenAI)
- **AI Model**: Model name to use for explanations
- **Graph Push URL**: Server endpoint for sending graph data
- **Graph Push API Key**: Authentication key for the server
- **Auto-push Enabled**: Automatically send graphs to server

### AI API Integration

The extension supports various AI services:

- **Ollama**: Local AI models
- **OpenAI**: GPT models
- **Custom APIs**: Any REST API with JSON responses

Example Ollama configuration:
- **API URL**: `http://localhost:11434/api/generate`
- **Model**: `llama2` or `mistral`

## 🎮 Usage

### Basic Usage

1. **Enable extension**: Toggle on
2. **Add AI API URL**: Configure your API link
3. **Navigate to YouTube**: Go to any YouTube video
4. **Enable Knowledge Mode**: Click inside the Youtube player toggle "Knowledge Mode"(next to Caption button after installed)
5. **View Explanations**: Captions will be processed and displayed in the floating bubble
6. **Switch Modes**: Use the mode selector to switch between definitions, diagrams, graphs, and explore modes

*Note: Do not turn off caption, this extension require caption to be on

### Graph Visualization

1. **Generate Graph**: Select "Graph" mode to create knowledge graphs
2. **View Live**: Graphs are automatically sent to the server (if configured)
3. **Interactive Exploration**:
   - **Zoom**: Mouse wheel or +/- buttons
   - **Pan**: Drag to move around
   - **Focus**: Double-click any node
   - **Cluster**: Use ● button to group nodes closer
   - **Spread**: Use ○ button to spread nodes apart
   - **Reset**: Use ⌂ to reset view or ↻ to restart

### Explore Mode

1. **Select Explore Mode**: Choose "🔍 Explore" from the mode selector
2. **Discover Hidden Connections**: AI analyzes the transcript to find:
   - **Key Concepts**: Main ideas and terms from the content
   - **Hidden Connections**: Indirect relationships and patterns
   - **Novel Insights**: New ideas and perspectives that emerge
   - **Cross-Domain Links**: Connections to other fields and disciplines
   - **Exploration Questions**: Thought-provoking questions for deeper investigation
3. **Creative Thinking**: The AI acts as a polymath, detective, and creative thinker to help you discover connections you never considered

### Manual Graph Push

Even with auto-push disabled, you can manually send graphs:
- Click "Push Graph Data" button in the graph section
- Use "Test Push" for debugging

## 🔧 Development

### Extension Development

The extension uses a modular architecture:

- **Content Scripts**: Run on YouTube pages
- **Modules**: Separate concerns (settings, AI, UI, etc.)
- **Message Passing**: Communication between scripts
- **Storage**: Chrome storage API for settings

### Server Development

The Python server uses:
- **Flask**: Web framework
- **D3.js**: Interactive graph visualization
- **CORS**: Cross-origin requests
- **JSON**: Data exchange format

### Adding New Features

1. **Extension**: Add modules in the `modules/` folder
2. **Server**: Extend Flask routes in `live_graph_server.py`
3. **UI**: Modify HTML/CSS in the respective files

## 📊 Data Format

### Graph Data Structure

```json
{
  "timestamp": "2025-10-21T22:49:51.520Z",
  "source": "youtube-learning-extension",
  "version": "1.2",
  "metadata": {
    "videoId": "ajFXykT9Joo",
    "videoTitle": "Secret History #1: How Power Works",
    "channelName": "Predictive History",
    "url": "https://www.youtube.com/watch?v=ajFXykT9Joo",
    "batchId": 1,
    "captionCount": 1,
    "promptName": "Graph",
    "promptUsed": "emoji"
  },
  "rawContent": "(Emmanuel Kant,teaches,semester)\\n(philosophy,is_part_of,semester)...",
  "contentType": "ai_triples"
}
```

### Parsed Graph Structure

```json
{
  "nodes": [
    {"id": "Emmanuel Kant", "label": "Emmanuel Kant", "type": "person"},
    {"id": "philosophy", "label": "philosophy", "type": "concept"}
  ],
  "edges": [
    {"from": "Emmanuel Kant", "to": "semester", "label": "teaches"},
    {"from": "philosophy", "to": "semester", "label": "is_part_of"}
  ],
  "rawTriples": [
    ["Emmanuel Kant", "teaches", "semester"],
    ["philosophy", "is_part_of", "semester"]
  ]
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Extension not working**:
   - Check if extension is enabled in Chrome settings
   - Verify you're on a YouTube video page
   - Check browser console for errors

2. **AI API not responding**:
   - Verify API URL is correct
   - Check if the AI service is running
   - Test API endpoint manually

3. **Graph not displaying**:
   - Check server is running (`python live_graph_server.py`)
   - Verify graph push URL is configured
   - Check browser console for errors

4. **Graph push failing**:
   - Verify server endpoint is accessible
   - Check API key if required
   - Test with "Test Push" button

### Debug Mode

Enable debug logging:
1. Open Chrome DevTools (F12)
2. Go to Console tab
3. Look for extension logs and errors

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Make changes**: Follow the modular architecture
4. **Test thoroughly**: Test on various YouTube videos
5. **Submit pull request**: Include description of changes

### Code Style

- **JavaScript**: Use ES6+ features, modular structure
- **Python**: Follow PEP 8, use type hints
- **CSS**: Use consistent naming conventions
- **Comments**: Document complex logic

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **D3.js**: For interactive graph visualization
- **Flask**: For the Python web server
- **Chrome Extensions API**: For browser integration
- **AI Services**: Ollama, OpenAI, and other AI providers

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Search existing issues
3. Create a new issue with detailed description
4. Include browser console logs if applicable

## 🚀 Future Roadmap & TODO

This project has excellent potential for brainstorming and expanding into a comprehensive learning and knowledge management platform. Here's our detailed roadmap:

### 🎨 **UI/UX Improvements**

#### 1. **Clean Up Graph UI in Extension Bubble** ✅ **COMPLETED**
- **Current State**: Enhanced graph display with interactive controls and new Explore mode
- **Completed Improvements**:
  - **Interactive Graph Controls**: Add zoom, pan, and node manipulation directly in the bubble
  - **Graph Modes**: Toggle between different visualization styles (force-directed, hierarchical, circular)
  - **Node Styling**: Color-code nodes by type (concepts, people, events, etc.)
  - **Edge Labels**: Better positioning and readability of relationship labels
  - **Responsive Design**: Adapt graph size to bubble dimensions
  - **Export Options**: Save graph as image or export to various formats
  - **Graph Search**: Search within the graph to find specific nodes
  - **Graph Statistics**: Show node count, edge count, and connectivity metrics
  - **🆕 Explore Mode**: Creative discovery of hidden connections and novel insights

### 🔗 **Integration & API Support**

#### 2. **Note-Taking App Integration**
- **Target Apps**: Obsidian, Notion, Logseq, Roam Research
- **Implementation Strategy**:
  - **Obsidian Plugin**: Create official Obsidian plugin for seamless integration
  - **MCP Server Support**: Implement Model Context Protocol for real-time command generation
  - **API Endpoints**: RESTful APIs for popular note-taking apps
  - **Real-time Sync**: Live updates to notes while watching YouTube
  - **Command Generation**: AI-powered suggestions for note organization and linking
  - **Template System**: Pre-built templates for different content types
  - **Bidirectional Sync**: Sync notes back to the extension for enhanced context

#### 3. **Multi-Platform Support**
- **Instagram Integration**:
  - **Reels Processing**: Extract audio and visual content from Instagram Reels
  - **Caption Analysis**: Process Instagram captions and comments
  - **Story Support**: Analyze Instagram Stories for educational content
  - **Hashtag Intelligence**: Extract and analyze trending educational hashtags
- **TikTok Support**:
  - **Short Video Analysis**: Process TikTok educational content
  - **Trend Detection**: Identify educational trends and topics
  - **Creator Analysis**: Track educational content creators
- **Twitter/X Integration**:
  - **Thread Analysis**: Process educational Twitter threads
  - **Tweet Summarization**: Convert tweet threads into structured knowledge
  - **Real-time Monitoring**: Track educational hashtags and topics
- **LinkedIn Learning**:
  - **Course Integration**: Connect with LinkedIn Learning courses
  - **Professional Development**: Track learning progress and certifications

### 🧠 **Advanced Learning Modes**

#### 4. **Multi-Mode Learning System**
- **Diffuse Mode**:
  - **Background Processing**: Continuous, low-intensity content analysis
  - **Passive Learning**: Subtle notifications and insights while browsing
  - **Ambient Intelligence**: Learn from user's browsing patterns
  - **Gentle Reminders**: Soft prompts for reflection and connection
- **Explore Mode**:
  - **Deep Dive**: Intensive analysis of specific topics
  - **Multi-Source Research**: Cross-reference with multiple sources
  - **Critical Thinking**: Challenge assumptions and explore alternatives
  - **Creative Connections**: Find unexpected relationships between concepts
- **Consolidate Mode**:
  - **Knowledge Synthesis**: Combine information from multiple sources
  - **Pattern Recognition**: Identify recurring themes and concepts
  - **Memory Reinforcement**: Spaced repetition and active recall
  - **Knowledge Mapping**: Create comprehensive knowledge networks
- **Hybrid Modes**:
  - **Half Explore, Half Consolidate**: Balanced learning approach
  - **Adaptive Mode**: AI-determined optimal learning strategy
  - **Custom Modes**: User-defined learning preferences

#### 5. **Enhanced Output Formats**
- **Diagram Modes**:
  - **Flowcharts**: Process flows and decision trees
  - **Mind Maps**: Hierarchical knowledge organization
  - **Concept Maps**: Relationship-focused visualizations
  - **Timeline Diagrams**: Chronological event visualization
  - **Venn Diagrams**: Overlapping concept analysis
- **Structured Data**:
  - **JSON Export**: Machine-readable knowledge graphs
  - **Markdown**: Formatted text for documentation
  - **CSV**: Tabular data for spreadsheet analysis
  - **XML**: Structured markup for complex data
  - **RDF**: Semantic web standards for knowledge representation
- **Interactive Formats**:
  - **HTML Reports**: Rich, interactive web pages
  - **PDF Generation**: Professional documentation
  - **Presentation Slides**: Ready-to-use educational materials
  - **Quiz Generation**: Automated assessment creation

### ⚡ **Performance & Speed Options**

#### 6. **Inference Speed Modes**
- **Fast Mode**:
  - **Smaller Context Window**: 2-4K tokens for quick responses
  - **Lightweight Models**: Faster, smaller AI models
  - **Cached Responses**: Pre-computed common explanations
  - **Streaming**: Real-time response generation
  - **Use Case**: Quick overviews and basic explanations
- **Medium Mode**:
  - **Balanced Context**: 8-16K tokens for comprehensive analysis
  - **Standard Models**: Balanced speed and quality
  - **Selective Caching**: Cache frequently requested content
  - **Batch Processing**: Process multiple captions together
  - **Use Case**: Detailed explanations and moderate analysis
- **Slow Mode**:
  - **Large Context Window**: 32K+ tokens for deep analysis
  - **Advanced Models**: Highest quality, most comprehensive
  - **Full Context**: Complete video transcript analysis
  - **Multi-pass Processing**: Iterative refinement of understanding
  - **Use Case**: Research-grade analysis and comprehensive knowledge extraction

### 🔍 **Real-Time Intelligence**

#### 7. **Web Search Integration**
- **Live Fact-Checking**: Real-time verification of claims
- **Context Enhancement**: Enrich explanations with current information
- **Source Verification**: Cross-reference with authoritative sources
- **Trend Analysis**: Identify current trends and developments
- **News Integration**: Connect content with recent news and events
- **Academic Search**: Integration with Google Scholar, PubMed, etc.
- **Social Media Monitoring**: Track discussions and reactions
- **Expert Networks**: Connect with subject matter experts

### 🏗️ **Technical Architecture**

#### 8. **Scalability & Performance**
- **Microservices Architecture**: Modular, scalable backend services
- **Edge Computing**: Local processing for privacy and speed
- **Caching Strategy**: Multi-level caching for optimal performance
- **Database Optimization**: Efficient storage and retrieval of knowledge graphs
- **API Rate Limiting**: Fair usage policies and optimization
- **Load Balancing**: Distribute processing across multiple servers
- **Real-time Updates**: WebSocket connections for live data
- **Offline Support**: Local processing when internet is unavailable

#### 9. **Privacy & Security**
- **Local Processing**: Keep sensitive data on user's device
- **Encryption**: End-to-end encryption for all data transmission
- **Privacy Controls**: Granular privacy settings and data control
- **GDPR Compliance**: Full compliance with privacy regulations
- **Audit Logging**: Comprehensive logging for security monitoring
- **Access Controls**: Role-based access to different features
- **Data Anonymization**: Remove personally identifiable information
- **Secure APIs**: OAuth 2.0 and JWT token authentication

### 🎯 **User Experience Enhancements**

#### 10. **Personalization & AI**
- **Learning Style Detection**: Adapt to individual learning preferences
- **Progress Tracking**: Monitor learning progress and achievements
- **Recommendation Engine**: Suggest relevant content and resources
- **Adaptive Difficulty**: Adjust complexity based on user understanding
- **Learning Paths**: Personalized learning journeys
- **Gamification**: Points, badges, and achievements for motivation
- **Social Learning**: Connect with other learners and share insights
- **Expert Mentorship**: Connect with subject matter experts

#### 11. **Accessibility & Inclusion**
- **Multi-language Support**: Support for multiple languages
- **Accessibility Features**: Screen reader support, keyboard navigation
- **Visual Impairment Support**: Audio descriptions and high contrast modes
- **Learning Disabilities**: Specialized support for different learning needs
- **Cultural Adaptation**: Content adaptation for different cultural contexts
- **Age-appropriate Content**: Different interfaces for different age groups
- **Educational Standards**: Alignment with educational curricula
- **Teacher Tools**: Specialized tools for educators

### 📊 **Analytics & Insights**

#### 12. **Learning Analytics**
- **Knowledge Mapping**: Track knowledge growth over time
- **Learning Patterns**: Identify effective learning strategies
- **Content Analysis**: Understand what content is most effective
- **Progress Metrics**: Detailed progress tracking and reporting
- **Predictive Analytics**: Predict learning outcomes and needs
- **Comparative Analysis**: Compare learning across different users
- **Trend Identification**: Identify emerging learning trends
- **Performance Optimization**: Continuous improvement based on data

### 🌐 **Ecosystem Integration**

#### 13. **Third-Party Integrations**
- **Learning Management Systems**: Integration with Canvas, Blackboard, Moodle
- **Content Management**: Integration with WordPress, Drupal, etc.
- **Social Platforms**: Facebook, Twitter, LinkedIn integration
- **E-commerce**: Integration with educational marketplaces
- **Cloud Storage**: Google Drive, Dropbox, OneDrive integration
- **Calendar Systems**: Google Calendar, Outlook integration
- **Communication Tools**: Slack, Discord, Teams integration
- **Development Tools**: GitHub, GitLab integration for technical content

### 💡 **Innovation & Research**

#### 14. **Cutting-Edge Features**
- **Augmented Reality**: AR overlays for enhanced learning
- **Virtual Reality**: Immersive learning environments
- **Voice Interaction**: Natural language voice commands
- **Gesture Control**: Hand gesture navigation and control
- **Eye Tracking**: Attention monitoring and optimization
- **Brain-Computer Interface**: Direct neural feedback integration
- **Quantum Computing**: Quantum-enhanced learning algorithms
- **Blockchain**: Decentralized learning records and credentials

### 🎓 **Educational Impact**

This project has tremendous potential for revolutionizing how people learn from video content. The combination of AI-powered analysis, interactive visualizations, and multi-platform integration creates a powerful learning ecosystem that can:

- **Democratize Education**: Make high-quality learning accessible to everyone
- **Personalize Learning**: Adapt to individual learning styles and needs
- **Enhance Retention**: Use proven learning techniques and spaced repetition
- **Foster Critical Thinking**: Encourage analysis and synthesis of information
- **Build Knowledge Networks**: Create interconnected understanding across domains
- **Support Lifelong Learning**: Continuous learning and skill development
- **Bridge Knowledge Gaps**: Connect different fields and disciplines
- **Accelerate Innovation**: Faster knowledge transfer and application

---

**This roadmap represents a vision for transforming passive video consumption into active, intelligent learning experiences that adapt to each user's needs and preferences.** 🚀🧠✨

---

**Happy Learning!** 🎓✨