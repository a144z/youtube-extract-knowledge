# Live Graph Server

A Flask-based web server that receives, processes, and visualizes knowledge graphs from the YouTube Learning Extension.

## 🚀 Features

### 📊 **Live Graph Visualization**
- **D3.js Dashboard**: Interactive force-directed graph visualization
- **Real-time Updates**: Automatically displays new graphs as they arrive
- **Interactive Controls**: Zoom, pan, cluster, spread, and focus on nodes
- **Node Highlighting**: Hover effects to show connections

### 🔧 **Graph Processing**
- **Server-side Parsing**: Handles complex AI output formats
- **Multi-format Support**: Processes both 3-part and 4-part tuples
- **Data Validation**: Ensures graph integrity and structure
- **Error Handling**: Graceful handling of malformed data

### 📈 **Analytics & Monitoring**
- **Graph Statistics**: Track total graphs, unique videos, server uptime
- **Recent Graphs**: Display latest received graphs with metadata
- **Live Logging**: Comprehensive logging of all received data
- **Performance Metrics**: Monitor server performance and usage

## 📁 Files

```
server/
├── live_graph_server.py      # Main Flask server with D3.js dashboard
├── requirements.txt           # Python dependencies
├── start_live_server.py      # Server startup script
├── start_server.py           # Alternative startup script (from root)
└── README.md                 # This file
```

## 🛠️ Installation

### Prerequisites

- Python 3.7+
- pip (Python package manager)

### Quick Start

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the server**:
   ```bash
   python start_server.py
   ```

   Or use the direct startup script:
   ```bash
   python start_live_server.py
   ```

   **Note**: `start_server.py` can be run from the root directory and will automatically navigate to the server folder. `start_live_server.py` must be run from within the server directory.

4. **Access the dashboard**:
   Open your browser and go to `http://localhost:5000`

## ⚙️ Configuration

### Server Settings

The server runs on `localhost:5000` by default. To change the port or host:

```python
# In live_graph_server.py
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### Environment Variables

You can set these environment variables:

- `FLASK_HOST`: Server host (default: localhost)
- `FLASK_PORT`: Server port (default: 5000)
- `FLASK_DEBUG`: Debug mode (default: True)

## 🔌 API Endpoints

### POST `/api/graph-data`

Receives graph data from the YouTube Learning Extension.

**Request Body**:
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

**Response**:
```json
{
  "status": "success",
  "message": "Graph data received and processed",
  "graphId": "unique-graph-id",
  "nodes": 27,
  "edges": 19
}
```

### GET `/api/graphs`

Retrieves stored graph data.

**Query Parameters**:
- `limit`: Number of graphs to return (default: 10)

**Response**:
```json
{
  "graphs": [
    {
      "timestamp": "2025-10-21T22:49:51.520Z",
      "data": {
        "nodes": [...],
        "edges": [...],
        "metadata": {...}
      }
    }
  ]
}
```

### GET `/api/stats`

Returns server statistics.

**Response**:
```json
{
  "totalGraphs": 15,
  "uniqueVideos": 8,
  "serverUptime": "2:30:45",
  "lastGraphTime": "2025-10-21T22:49:51.520Z"
}
```

## 🎮 Dashboard Features

### Interactive Graph Visualization

The dashboard provides a rich, interactive experience:

#### **Zoom & Pan Controls**
- **Mouse Wheel**: Zoom in/out
- **Drag**: Pan around the graph
- **+/- Buttons**: Manual zoom controls
- **⌂ Button**: Reset view to original position

#### **Node Manipulation**
- **Drag Nodes**: Move individual nodes around
- **Hover**: Highlight connected nodes and edges
- **Double-click**: Focus/zoom on specific node
- **↻ Button**: Restart simulation with new random positions

#### **Layout Controls**
- **● Button**: Cluster nodes tighter
- **○ Button**: Spread nodes apart

#### **Visual Effects**
- **Hover Highlighting**: Connected nodes fade to 30% opacity
- **Edge Highlighting**: Related edges turn red and thicker
- **Smooth Transitions**: All interactions have smooth animations

### Recent Graphs Panel

- **Graph List**: Shows all received graphs with timestamps
- **Quick Load**: Click any graph to load and visualize it
- **Metadata Display**: Shows video title, node count, edge count

### Statistics Panel

- **Total Graphs**: Number of graphs received
- **Unique Videos**: Number of different videos processed
- **Server Uptime**: How long the server has been running
- **Last Graph**: Timestamp of most recent graph

## 🔧 Graph Processing

### AI Content Parsing

The server handles various AI output formats:

#### **3-Part Tuples**
```
(Emmanuel Kant,teaches,semester)
(philosophy,is_part_of,semester)
```

#### **4-Part Tuples**
```
(Kant,_teaches_about,_world_work,philosophical_concept)
```
*Creates two relationships: (Kant,teaches_about,world_work) and (world_work,related_to,philosophical_concept)*

### Data Validation

- **Node Validation**: Ensures all nodes have valid IDs
- **Edge Validation**: Verifies all edges have valid source/target nodes
- **Duplicate Handling**: Removes duplicate nodes and edges
- **Empty Filtering**: Removes empty or malformed tuples

## 📊 Logging

### Log Levels

- **INFO**: Normal operations, graph reception
- **WARNING**: Non-critical issues, malformed data
- **ERROR**: Critical errors, server issues

### Log Format

```
2025-10-22 06:49:51,843 - INFO - Video: Secret History #1: How Power Works
2025-10-22 06:49:51,843 - INFO - Channel: Predictive History
2025-10-22 06:49:51,843 - INFO - Parsed Graph Structure:
2025-10-22 06:49:51,844 - INFO -    Nodes: 27
2025-10-22 06:49:51,844 - INFO -    Edges: 19
```

### Debug Mode

Enable detailed logging by setting `debug=True` in the Flask app configuration.

## 🐛 Troubleshooting

### Common Issues

1. **Server won't start**:
   - Check Python version (3.7+ required)
   - Verify all dependencies are installed
   - Check if port 5000 is available

2. **Graphs not displaying**:
   - Check browser console for JavaScript errors
   - Verify D3.js is loading correctly
   - Check if graph data is being received

3. **CORS errors**:
   - Ensure Flask-CORS is installed
   - Check if CORS is properly configured
   - Verify extension is sending requests to correct URL

4. **Parsing errors**:
   - Check server logs for parsing issues
   - Verify AI output format matches expected patterns
   - Test with sample data

### Debug Steps

1. **Check server logs**: Look for error messages
2. **Test API endpoints**: Use curl or Postman to test endpoints
3. **Browser console**: Check for JavaScript errors
4. **Network tab**: Verify requests are being sent/received

### Performance Issues

- **Large graphs**: Consider limiting node/edge counts
- **Memory usage**: Monitor server memory consumption
- **Response time**: Check for slow parsing operations

## 🔒 Security Considerations

### API Security

- **Input Validation**: All input is validated and sanitized
- **Rate Limiting**: Consider implementing rate limiting for production
- **Authentication**: Add API key validation if needed

### Production Deployment

For production deployment:

1. **Disable Debug Mode**: Set `debug=False`
2. **Use Production WSGI**: Use Gunicorn or similar
3. **Add Authentication**: Implement proper authentication
4. **HTTPS**: Use SSL/TLS encryption
5. **Database**: Consider using a database for persistent storage

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature-name`
3. **Make changes**: Follow Python best practices
4. **Test thoroughly**: Test with various graph formats
5. **Submit pull request**: Include description of changes

### Code Style

- **Python**: Follow PEP 8
- **Type Hints**: Use type hints for function parameters
- **Docstrings**: Document all functions and classes
- **Error Handling**: Use proper exception handling

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy Visualizing!** 📊✨
