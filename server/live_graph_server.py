#!/usr/bin/env python3
"""
YouTube Learning Extension - Live Graph Visualization Server
Receives graph data from the browser extension and displays live graph visualizations
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import json
import logging
from datetime import datetime
import threading
import time
import uuid
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('graph_data.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for browser extension

# Store received data
received_graphs = []
stats = {
    'total_received': 0,
    'unique_videos': set(),
    'unique_users': set(),
    'start_time': datetime.now()
}

def parse_ai_triples(raw_content):
    """Parse raw AI triple content into nodes, edges, and triples"""
    nodes = set()
    edges = []
    raw_triples = []
    
    # Split by lines and process each line
    lines = raw_content.strip().split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Look for patterns like (a,b,c) or (a,b,c,d)
        # Use regex to find all parenthesized groups
        matches = re.findall(r'\(([^)]+)\)', line)
        
        for match in matches:
            # Split by comma and clean up
            parts = [part.strip() for part in match.split(',')]
            
            if len(parts) >= 3:
                # Handle both 3-part and 4-part tuples
                if len(parts) == 3:
                    # Standard triple: (subject, predicate, object)
                    subject, predicate, object = parts
                    nodes.add(subject)
                    nodes.add(object)
                    edges.append((subject, predicate, object))
                    raw_triples.append((subject, predicate, object))
                elif len(parts) == 4:
                    # 4-part tuple: (subject, predicate, object, additional)
                    subject, predicate, object, additional = parts
                    nodes.add(subject)
                    nodes.add(object)
                    nodes.add(additional)
                    # Create multiple relationships
                    edges.append((subject, predicate, object))
                    edges.append((object, 'related_to', additional))
                    raw_triples.append((subject, predicate, object))
                    raw_triples.append((object, 'related_to', additional))
                else:
                    # Handle longer tuples by taking first 3 parts
                    subject, predicate, object = parts[:3]
                    nodes.add(subject)
                    nodes.add(object)
                    edges.append((subject, predicate, object))
                    raw_triples.append((subject, predicate, object))
    
    return {
        'nodes': list(nodes),
        'edges': edges,
        'raw_triples': raw_triples
    }

# HTML template for the live dashboard
DASHBOARD_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YouTube Learning Extension - Live Graph Dashboard</title>
    <script src="https://d3js.org/d3.v7.min.js"></script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        
        .header p {
            margin: 10px 0 0 0;
            opacity: 0.9;
            font-size: 16px;
        }
        
        .stats-bar {
            display: flex;
            justify-content: space-around;
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .stat-item {
            text-align: center;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .main-content {
            display: flex;
            min-height: 600px;
        }
        
        .graph-panel {
            flex: 2;
            padding: 20px;
            border-right: 1px solid #eee;
        }
        
        .info-panel {
            flex: 1;
            padding: 20px;
            background: #f8f9fa;
        }
        
        .graph-container {
            width: 100%;
            height: 500px;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            background: white;
            position: relative;
        }
        
        .graph-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #333;
        }
        
        .video-info {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .video-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
        }
        
        .video-channel {
            color: #666;
            font-size: 14px;
        }
        
        .graph-stats {
            background: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .stat-row:last-child {
            margin-bottom: 0;
        }
        
        .recent-graphs {
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .graph-item {
            padding: 8px 0;
            border-bottom: 1px solid #eee;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .graph-item:hover {
            background: #f8f9fa;
        }
        
        .graph-item:last-child {
            border-bottom: none;
        }
        
        .graph-time {
            font-size: 12px;
            color: #666;
        }
        
        .graph-preview {
            font-size: 14px;
            color: #333;
            margin-top: 2px;
        }
        
        .status-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-online {
            background: #28a745;
            animation: pulse 2s infinite;
        }
        
        .status-offline {
            background: #dc3545;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .graph-controls rect:hover {
            fill: #f0f0f0;
            stroke: #999;
        }
        
        .graph-controls text {
            pointer-events: none;
        }
        
        .controls {
            margin-bottom: 20px;
            text-align: center;
        }
        
        .btn {
            background: #667eea;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            margin: 0 5px;
            font-size: 14px;
            transition: background 0.3s;
        }
        
        .btn:hover {
            background: #5a6fd8;
        }
        
        .btn-secondary {
            background: #6c757d;
        }
        
        .btn-secondary:hover {
            background: #5a6268;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧠 YouTube Learning Extension - Live Graph Dashboard</h1>
            <p>Real-time knowledge graph visualization from YouTube videos</p>
        </div>
        
        <div class="stats-bar">
            <div class="stat-item">
                <div class="stat-number" id="totalGraphs">0</div>
                <div class="stat-label">Total Graphs</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="uniqueVideos">0</div>
                <div class="stat-label">Unique Videos</div>
            </div>
            <div class="stat-item">
                <div class="stat-number" id="serverUptime">00:00:00</div>
                <div class="stat-label">Server Uptime</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">
                    <span class="status-indicator status-online" id="statusIndicator"></span>
                    <span id="statusText">Online</span>
                </div>
                <div class="stat-label">Status</div>
            </div>
        </div>
        
        <div class="main-content">
            <div class="graph-panel">
                <div class="controls">
                    <button class="btn" onclick="refreshGraph()">🔄 Refresh</button>
                    <button class="btn btn-secondary" onclick="clearGraph()">🗑️ Clear</button>
                    <button class="btn btn-secondary" onclick="toggleAutoRefresh()">⏸️ Auto Refresh</button>
                </div>
                
                <div class="graph-title" id="graphTitle">No Graph Data</div>
                <div class="graph-container" id="graphContainer">
                    <div class="no-data">Waiting for graph data from YouTube Learning Extension...</div>
                </div>
            </div>
            
            <div class="info-panel">
                <div class="video-info" id="videoInfo">
                    <div class="video-title">No video selected</div>
                    <div class="video-channel">Select a graph to view details</div>
                </div>
                
                <div class="graph-stats" id="graphStats">
                    <div class="stat-row">
                        <span>Nodes:</span>
                        <span id="nodeCount">0</span>
                    </div>
                    <div class="stat-row">
                        <span>Edges:</span>
                        <span id="edgeCount">0</span>
                    </div>
                    <div class="stat-row">
                        <span>Triples:</span>
                        <span id="tripleCount">0</span>
                    </div>
                    <div class="stat-row">
                        <span>Caption Count:</span>
                        <span id="captionCount">0</span>
                    </div>
                </div>
                
                <div class="recent-graphs">
                    <h4>Recent Graphs</h4>
                    <div id="recentGraphsList">
                        <div class="no-data">No graphs received yet</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentGraphData = null;
        let autoRefresh = true;
        let refreshInterval;
        
        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            loadStats();
            loadRecentGraphs();
            startAutoRefresh();
        });
        
        function startAutoRefresh() {
            if (refreshInterval) clearInterval(refreshInterval);
            refreshInterval = setInterval(() => {
                if (autoRefresh) {
                    loadStats();
                    loadRecentGraphs();
                }
            }, 2000); // Refresh every 2 seconds
        }
        
        function toggleAutoRefresh() {
            autoRefresh = !autoRefresh;
            const btn = event.target;
            btn.textContent = autoRefresh ? '⏸️ Auto Refresh' : '▶️ Auto Refresh';
            btn.className = autoRefresh ? 'btn btn-secondary' : 'btn';
        }
        
        function loadStats() {
            fetch('/api/stats')
                .then(response => response.json())
                .then(data => {
                    document.getElementById('totalGraphs').textContent = data.total_received;
                    document.getElementById('uniqueVideos').textContent = data.unique_videos;
                    
                    // Calculate uptime
                    const uptime = new Date() - new Date(data.start_time);
                    const hours = Math.floor(uptime / 3600000);
                    const minutes = Math.floor((uptime % 3600000) / 60000);
                    const seconds = Math.floor((uptime % 60000) / 1000);
                    document.getElementById('serverUptime').textContent = 
                        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                })
                .catch(error => console.error('Error loading stats:', error));
        }
        
        function loadRecentGraphs() {
            fetch('/api/graphs?limit=10')
                .then(response => response.json())
                .then(data => {
                    console.log('Recent graphs response:', data);
                    const container = document.getElementById('recentGraphsList');
                    if (data.graphs.length === 0) {
                        container.innerHTML = '<div class="no-data">No graphs received yet</div>';
                        return;
                    }
                    
                    container.innerHTML = data.graphs.map(graph => {
                        const metadata = graph.data.metadata || {};
                        const time = new Date(graph.timestamp).toLocaleTimeString();
                        const preview = `${graph.data.nodes?.length || 0} nodes, ${graph.data.edges?.length || 0} edges`;
                        
                        return `
                            <div class="graph-item" onclick="loadGraph('${graph.timestamp}')">
                                <div class="graph-time">${time}</div>
                                <div class="graph-preview">${metadata.videoTitle || 'Unknown Video'} - ${preview}</div>
                            </div>
                        `;
                    }).join('');
                })
                .catch(error => console.error('Error loading recent graphs:', error));
        }
        
        function loadGraph(timestamp) {
            fetch('/api/graphs')
                .then(response => response.json())
                .then(data => {
                    const graph = data.graphs.find(g => g.timestamp === timestamp);
                    if (graph) {
                        renderGraph(graph.data);
                        updateGraphInfo(graph.data);
                    }
                })
                .catch(error => console.error('Error loading graph:', error));
        }
        
        function renderGraph(graphData) {
            currentGraphData = graphData;
            const container = document.getElementById('graphContainer');
            container.innerHTML = '';
            
            console.log('Rendering graph with data:', graphData);
            
            if (!graphData.nodes || graphData.nodes.length === 0) {
                container.innerHTML = '<div class="no-data">No graph data available</div>';
                console.log('No nodes found in graph data');
                return;
            }
            
            console.log('Graph has', graphData.nodes.length, 'nodes and', graphData.edges.length, 'edges');
            
            const width = container.offsetWidth;
            const height = 600;
            
            // Create SVG with zoom container
            const svg = d3.select(container)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .style('border', '1px solid #ccc')
                .style('background', '#fafafa');
            
            // Create zoom container
            const g = svg.append('g');
            
            // Set up zoom behavior
            const zoom = d3.zoom()
                .scaleExtent([0.1, 4])
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                });
            
            svg.call(zoom);
            
            // Convert edges to D3.js format (source/target instead of from/to)
            const d3Edges = graphData.edges.map(edge => ({
                source: edge.from,
                target: edge.to,
                label: edge.label
            }));
            
            // Create force simulation with tighter clustering
            const simulation = d3.forceSimulation(graphData.nodes)
                .force('link', d3.forceLink(d3Edges).id(d => d.id).distance(60))
                .force('charge', d3.forceManyBody().strength(-200))
                .force('center', d3.forceCenter(width / 2, height / 2))
                .force('collision', d3.forceCollide().radius(15))
                .force('x', d3.forceX(width / 2).strength(0.1))
                .force('y', d3.forceY(height / 2).strength(0.1));
            
            // Create links
            const link = g.append('g')
                .selectAll('line')
                .data(d3Edges)
                .enter().append('line')
                .attr('stroke', '#999')
                .attr('stroke-opacity', 0.6)
                .attr('stroke-width', 2)
                .style('cursor', 'pointer');
            
            // Create link labels
            const linkLabel = g.append('g')
                .selectAll('text')
                .data(d3Edges)
                .enter().append('text')
                .attr('font-size', 10)
                .attr('fill', '#666')
                .text(d => d.label || '')
                .attr('text-anchor', 'middle')
                .style('pointer-events', 'none')
                .style('user-select', 'none');
            
            // Create nodes
            const node = g.append('g')
                .selectAll('circle')
                .data(graphData.nodes)
                .enter().append('circle')
                .attr('r', 12)
                .attr('fill', '#69b3a2')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .style('cursor', 'pointer')
                .call(d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended));
            
            // Add interactive effects to nodes
            node
                .on('mouseover', function(event, d) {
                    d3.select(this)
                        .attr('r', 16)
                        .attr('fill', '#ff6b6b');
                    
                    // Highlight connected links
                    link.style('stroke', l => 
                        l.source.id === d.id || l.target.id === d.id ? '#ff6b6b' : '#999'
                    ).style('stroke-width', l => 
                        l.source.id === d.id || l.target.id === d.id ? 4 : 2
                    );
                    
                    // Highlight connected nodes
                    node.style('opacity', n => 
                        n.id === d.id || d3Edges.some(e => 
                            (e.source.id === d.id && e.target.id === n.id) || 
                            (e.target.id === d.id && e.source.id === n.id)
                        ) ? 1 : 0.3
                    );
                })
                .on('mouseout', function(event, d) {
                    d3.select(this)
                        .attr('r', 12)
                        .attr('fill', '#69b3a2');
                    
                    // Reset all styles
                    link.style('stroke', '#999').style('stroke-width', 2);
                    node.style('opacity', 1);
                })
                .on('dblclick', function(event, d) {
                    // Focus on this node by centering the view
                    const scale = 2;
                    const translate = [
                        width / 2 - scale * d.x,
                        height / 2 - scale * d.y
                    ];
                    
                    svg.transition()
                        .duration(750)
                        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
                });
            
            // Create node labels
            const nodeLabel = g.append('g')
                .selectAll('text')
                .data(graphData.nodes)
                .enter().append('text')
                .attr('font-size', 12)
                .attr('fill', '#333')
                .text(d => d.label || d.id)
                .attr('text-anchor', 'middle')
                .attr('dy', 3)
                .style('pointer-events', 'none')
                .style('user-select', 'none');
            
            // Add tooltips
            node.append('title')
                .text(d => `${d.label || d.id}\\nType: ${d.type || 'concept'}`);
            
            // Update positions on simulation tick
            simulation.on('tick', () => {
                link
                    .attr('x1', d => d.source.x)
                    .attr('y1', d => d.source.y)
                    .attr('x2', d => d.target.x)
                    .attr('y2', d => d.target.y);
                
                linkLabel
                    .attr('x', d => (d.source.x + d.target.x) / 2)
                    .attr('y', d => (d.source.y + d.target.y) / 2);
                
                node
                    .attr('cx', d => d.x)
                    .attr('cy', d => d.y);
                
                nodeLabel
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
            });
            
            // Drag functions
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }
            
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            
            // Add control buttons
            addGraphControls(svg, simulation, zoom);
        }
        
        function addGraphControls(svg, simulation, zoom) {
            const controls = svg.append('g')
                .attr('class', 'graph-controls')
                .attr('transform', 'translate(10, 10)');
            
            // Zoom in button
            controls.append('rect')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', '#fff')
                .attr('stroke', '#ccc')
                .attr('rx', 4)
                .style('cursor', 'pointer')
                .on('click', () => {
                    svg.transition().call(zoom.scaleBy, 1.5);
                });
            
            controls.append('text')
                .attr('x', 15)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '16px')
                .attr('fill', '#333')
                .text('+');
            
            // Zoom out button
            controls.append('rect')
                .attr('x', 35)
                .attr('y', 0)
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', '#fff')
                .attr('stroke', '#ccc')
                .attr('rx', 4)
                .style('cursor', 'pointer')
                .on('click', () => {
                    svg.transition().call(zoom.scaleBy, 1 / 1.5);
                });
            
            controls.append('text')
                .attr('x', 50)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '16px')
                .attr('fill', '#333')
                .text('−');
            
            // Reset view button
            controls.append('rect')
                .attr('x', 70)
                .attr('y', 0)
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', '#fff')
                .attr('stroke', '#ccc')
                .attr('rx', 4)
                .style('cursor', 'pointer')
                .on('click', () => {
                    svg.transition().call(zoom.transform, d3.zoomIdentity);
                });
            
            controls.append('text')
                .attr('x', 85)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', '#333')
                .text('⌂');
            
            // Restart simulation button
            controls.append('rect')
                .attr('x', 105)
                .attr('y', 0)
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', '#fff')
                .attr('stroke', '#ccc')
                .attr('rx', 4)
                .style('cursor', 'pointer')
                .on('click', () => {
                    simulation.alpha(0.3).restart();
                });
            
            controls.append('text')
                .attr('x', 120)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', '#333')
                .text('↻');
            
            // Cluster nodes button
            controls.append('rect')
                .attr('x', 140)
                .attr('y', 0)
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', '#fff')
                .attr('stroke', '#ccc')
                .attr('rx', 4)
                .style('cursor', 'pointer')
                .on('click', () => {
                    // Make nodes cluster tighter
                    simulation.force('charge').strength(-100);
                    simulation.force('link').distance(40);
                    simulation.alpha(0.3).restart();
                });
            
            controls.append('text')
                .attr('x', 155)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', '#333')
                .text('●');
            
            // Spread nodes button
            controls.append('rect')
                .attr('x', 175)
                .attr('y', 0)
                .attr('width', 30)
                .attr('height', 30)
                .attr('fill', '#fff')
                .attr('stroke', '#ccc')
                .attr('rx', 4)
                .style('cursor', 'pointer')
                .on('click', () => {
                    // Make nodes spread out more
                    simulation.force('charge').strength(-300);
                    simulation.force('link').distance(80);
                    simulation.alpha(0.3).restart();
                });
            
            controls.append('text')
                .attr('x', 190)
                .attr('y', 20)
                .attr('text-anchor', 'middle')
                .attr('font-size', '12px')
                .attr('fill', '#333')
                .text('○');
            
            // Add legend
            const legend = svg.append('g')
                .attr('class', 'graph-legend')
                .attr('transform', `translate(${width - 200}, 10)`);
            
            legend.append('rect')
                .attr('width', 190)
                .attr('height', 80)
                .attr('fill', 'rgba(255, 255, 255, 0.9)')
                .attr('stroke', '#ccc')
                .attr('rx', 4);
            
            legend.append('text')
                .attr('x', 10)
                .attr('y', 20)
                .attr('font-size', '12px')
                .attr('font-weight', 'bold')
                .attr('fill', '#333')
                .text('Controls:');
            
            legend.append('text')
                .attr('x', 10)
                .attr('y', 35)
                .attr('font-size', '10px')
                .attr('fill', '#666')
                .text('+/- Zoom | ⌂ Reset | ↻ Restart');
            
            legend.append('text')
                .attr('x', 10)
                .attr('y', 50)
                .attr('font-size', '10px')
                .attr('fill', '#666')
                .text('● Cluster | ○ Spread');
            
            legend.append('text')
                .attr('x', 10)
                .attr('y', 65)
                .attr('font-size', '10px')
                .attr('fill', '#666')
                .text('Hover: Highlight | Double-click: Focus');
        }
        
        function updateGraphInfo(graphData) {
            const metadata = graphData.metadata || {};
            
            // Update video info
            document.getElementById('videoInfo').innerHTML = `
                <div class="video-title">${metadata.videoTitle || 'Unknown Video'}</div>
                <div class="video-channel">${metadata.channelName || 'Unknown Channel'}</div>
            `;
            
            // Update graph stats
            document.getElementById('nodeCount').textContent = graphData.nodes?.length || 0;
            document.getElementById('edgeCount').textContent = graphData.edges?.length || 0;
            document.getElementById('tripleCount').textContent = graphData.rawTriples?.length || 0;
            document.getElementById('captionCount').textContent = metadata.captionCount || 0;
            
            // Update graph title
            document.getElementById('graphTitle').textContent = 
                `${metadata.videoTitle || 'Graph'} - ${graphData.nodes?.length || 0} nodes, ${graphData.edges?.length || 0} edges`;
        }
        
        function refreshGraph() {
            if (currentGraphData) {
                renderGraph(currentGraphData);
            } else {
                loadRecentGraphs();
            }
        }
        
        function clearGraph() {
            document.getElementById('graphContainer').innerHTML = '<div class="no-data">Graph cleared</div>';
            document.getElementById('graphTitle').textContent = 'No Graph Data';
            document.getElementById('videoInfo').innerHTML = `
                <div class="video-title">No video selected</div>
                <div class="video-channel">Select a graph to view details</div>
            `;
            document.getElementById('nodeCount').textContent = '0';
            document.getElementById('edgeCount').textContent = '0';
            document.getElementById('tripleCount').textContent = '0';
            document.getElementById('captionCount').textContent = '0';
            currentGraphData = null;
        }
        
        // Auto-load latest graph if available
        setInterval(() => {
            if (!currentGraphData) {
                console.log('Auto-loading latest graph...');
                fetch('/api/graphs?limit=1')
                    .then(response => response.json())
                    .then(data => {
                        console.log('Auto-load response:', data);
                        if (data.graphs.length > 0) {
                            console.log('Auto-loading graph:', data.graphs[0].data);
                            renderGraph(data.graphs[0].data);
                            updateGraphInfo(data.graphs[0].data);
                        } else {
                            console.log('No graphs available for auto-load');
                        }
                    })
                    .catch(error => console.error('Error auto-loading graph:', error));
            }
        }, 5000);
    </script>
</body>
</html>
"""

@app.route('/api/graph-data', methods=['POST'])
def receive_graph_data():
    """Receive graph data from the YouTube Learning Extension"""
    try:
        # Get the JSON data
        data = request.get_json()
        
        if not data:
            logger.warning("Received empty or invalid JSON data")
            return jsonify({'error': 'No data received'}), 400
        
        # Log the received data
        logger.info("=" * 80)
        logger.info("NEW GRAPH DATA RECEIVED")
        logger.info(f"Timestamp: {data.get('timestamp', 'N/A')}")
        logger.info(f"Source: {data.get('source', 'N/A')}")
        logger.info(f"Version: {data.get('version', 'N/A')}")
        
        # Print complete JSON received
        logger.info("COMPLETE JSON DATA RECEIVED:")
        logger.info(json.dumps(data, indent=2, ensure_ascii=False))
        
        # Log metadata
        metadata = data.get('metadata', {})
        logger.info(f"Video: {metadata.get('videoTitle', 'N/A')}")
        logger.info(f"Channel: {metadata.get('channelName', 'N/A')}")
        logger.info(f"Video ID: {metadata.get('videoId', 'N/A')}")
        logger.info(f"Caption Count: {metadata.get('captionCount', 'N/A')}")
        logger.info(f"Batch ID: {metadata.get('batchId', 'N/A')}")
        logger.info(f"Prompt Used: {metadata.get('promptUsed', 'N/A')}")
        
        # Handle raw AI content
        raw_content = data.get('rawContent', '')
        content_type = data.get('contentType', '')
        
        if raw_content and content_type == 'ai_triples':
            logger.info("Raw AI Content Received:")
            logger.info(f"   Content Type: {content_type}")
            logger.info(f"   Raw Content Length: {len(raw_content)} characters")
            
            # Parse the raw AI content
            parsed_data = parse_ai_triples(raw_content)
            nodes = parsed_data['nodes']
            edges = parsed_data['edges']
            raw_triples = parsed_data['raw_triples']
            
            logger.info("Parsed Graph Structure:")
            logger.info(f"   Nodes: {len(nodes)}")
            logger.info(f"   Edges: {len(edges)}")
            logger.info(f"   Raw Triples: {len(raw_triples)}")
            
            # Log parsed nodes
            if nodes:
                logger.info("Parsed Nodes:")
                for node in nodes[:10]:  # Show first 10 nodes
                    logger.info(f"   - {node}")
                if len(nodes) > 10:
                    logger.info(f"   ... and {len(nodes) - 10} more nodes")
            
            # Log parsed edges
            if edges:
                logger.info("Parsed Edges:")
                for edge in edges[:10]:  # Show first 10 edges
                    logger.info(f"   - {edge}")
                if len(edges) > 10:
                    logger.info(f"   ... and {len(edges) - 10} more edges")
            
            # Log raw triples
            if raw_triples:
                logger.info("Raw Triples:")
                for triple in raw_triples[:10]:  # Show first 10 triples
                    logger.info(f"   - {triple}")
                if len(raw_triples) > 10:
                    logger.info(f"   ... and {len(raw_triples) - 10} more triples")
            
            # Update the data with parsed content
            data['nodes'] = [{'id': node, 'label': node, 'type': 'concept'} for node in nodes]
            data['edges'] = [{'from': edge[0], 'to': edge[2], 'label': edge[1], 'type': 'relationship'} for edge in edges]
            data['rawTriples'] = raw_triples
            
        else:
            # Handle legacy format
            nodes = data.get('nodes', [])
            edges = data.get('edges', [])
            raw_triples = data.get('rawTriples', [])
            
            logger.info("Legacy Graph Structure:")
            logger.info(f"   Nodes: {len(nodes)}")
            logger.info(f"   Edges: {len(edges)}")
            logger.info(f"   Raw Triples: {len(raw_triples)}")
        
        # Update statistics
        stats['total_received'] += 1
        stats['unique_videos'].add(metadata.get('videoId', 'unknown'))
        
        # Store the data
        received_graphs.append({
            'timestamp': datetime.now().isoformat(),
            'data': data
        })
        
        # Log statistics
        logger.info("Statistics:")
        logger.info(f"   Total Graphs Received: {stats['total_received']}")
        logger.info(f"   Unique Videos: {len(stats['unique_videos'])}")
        logger.info(f"   Server Uptime: {datetime.now() - stats['start_time']}")
        
        logger.info("=" * 80)
        
        # Return success response
        return jsonify({
            'success': True,
            'message': 'Graph data received successfully',
            'timestamp': datetime.now().isoformat(),
            'graph_id': len(received_graphs)
        }), 200
        
    except Exception as e:
        logger.error(f"Error processing graph data: {str(e)}")
        return jsonify({'error': f'Processing error: {str(e)}'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get server statistics"""
    return jsonify({
        'total_received': stats['total_received'],
        'unique_videos': len(stats['unique_videos']),
        'server_uptime': str(datetime.now() - stats['start_time']),
        'start_time': stats['start_time'].isoformat(),
        'latest_graphs': len(received_graphs)
    })

@app.route('/api/graphs', methods=['GET'])
def get_graphs():
    """Get all received graphs"""
    limit = request.args.get('limit', 10, type=int)
    return jsonify({
        'graphs': received_graphs[-limit:],
        'total': len(received_graphs)
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'uptime': str(datetime.now() - stats['start_time'])
    })

@app.route('/', methods=['GET'])
def index():
    """Live graph dashboard"""
    return render_template_string(DASHBOARD_TEMPLATE)

def print_startup_info():
    """Print startup information"""
    print("\n" + "="*80)
    print("YouTube Learning Extension - Live Graph Visualization Server")
    print("="*80)
    print("Server starting...")
    print(f"Dashboard URL: http://localhost:5000")
    print(f"Graph Data Endpoint: http://localhost:5000/api/graph-data")
    print(f"Stats Endpoint: http://localhost:5000/api/stats")
    print(f"Logs: Check console and graph_data.log file")
    print("\nExtension Configuration:")
    print("   Graph Push API URL: http://localhost:5000/api/graph-data")
    print("   API Key: (leave empty for testing)")
    print("\nTo test:")
    print("   1. Open http://localhost:5000 in your browser")
    print("   2. Enable graph push in extension settings")
    print("   3. Set analysis mode to 'Graph'")
    print("   4. Watch a YouTube video with captions")
    print("   5. Watch the dashboard update in real-time!")
    print("="*80 + "\n")

if __name__ == '__main__':
    print_startup_info()
    
    # Start the server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )
