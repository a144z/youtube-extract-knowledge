const UtilsModule = (function() {

  const systemPrompts = {
    definitions: {
      name: 'Definitions',
      prompt: `Define the key terms mentioned in this transcript. Write each definition as "Term: Definition" on a separate line. Keep definitions short and clear.

Transcript:`,
      renderer: renderDefinitions,
    },
    diagram: {
      name: 'Diagram',
      prompt: `List the main concepts and their relationships from this transcript. Write "Concepts:" followed by the main ideas, then "Relationships:" followed by how they connect.

Transcript:`,
      renderer: renderDiagram,
    },
    emoji: {
      name: 'Graph',
      prompt: `Extract knowledge graph triples from this transcript in the format (subject,predicate,object). For example: (electricity,cuts,5_minutes) (people,not_back_on,rescheduling). Only output the top 20 triples in this exact format, one per line, give me nothing else in the result.

Transcript:`,
      renderer: renderGraph,
    },
  };

  function cleanCaptionText(text) {
    const patternsToRemove = [
      /\(auto-generated\)/gi,
      /\(automatic captions\)/gi,
      /english\s*\(auto-generated\)/gi,
      /spanish\s*\(auto-generated\)/gi,
      /french\s*\(auto-generated\)/gi,
      /german\s*\(auto-generated\)/gi,
      /\(english\)/gi,
      /\(spanish\)/gi,
      /\(french\)/gi,
      /\(german\)/gi,
      /captions\s*by\s*youtube/gi,
      /auto-generated\s*captions/gi,
      /\[music\]/gi,
      /\[applause\]/gi,
      /\[laughter\]/gi,
      /\[speaking\s*foreign\s*language\]/gi,
      /\[inaudible\]/gi,
      /\[unclear\]/gi,
      /^\s*[a-z]+\s*\(auto-generated\)\s*/gi,
      /^\s*[a-z]+\s*\(automatic\s*captions\)\s*/gi,
    ];

    let cleanedText = text;

    patternsToRemove.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });

    cleanedText = cleanedText.replace(/\s+/g, ' ').trim();

    cleanedText = cleanedText.replace(/^\s*\([^)]*\)\s*/, '');

    return cleanedText;
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function renderDefinitions(data, container) {
    container.innerHTML = '';

    if (typeof data === 'string') {
      const lines = data.split('\n').filter(line => line.trim());
      if (lines.length > 0) {
        lines.forEach(line => {
          const textDiv = document.createElement('div');
          textDiv.style.marginBottom = '8px';
          textDiv.style.fontSize = '14px';
          textDiv.style.lineHeight = '1.4';
          textDiv.textContent = line.trim();
          container.appendChild(textDiv);
        });
      } else {
        container.textContent = 'No definitions found.';
      }
    } else if (data.definitions && data.definitions.length > 0) {
      data.definitions.forEach(item => {
        const textDiv = document.createElement('div');
        textDiv.style.marginBottom = '8px';
        textDiv.style.fontSize = '14px';
        textDiv.style.lineHeight = '1.4';
        textDiv.textContent = `${item.term}: ${item.definition}`;
        container.appendChild(textDiv);
      });
    } else {
      container.textContent = 'No definitions found.';
    }
  }

  function renderDiagram(data, container) {
    container.innerHTML = '';

    if (typeof data === 'string') {
      const textDiv = document.createElement('div');
      textDiv.style.fontSize = '14px';
      textDiv.style.lineHeight = '1.4';
      textDiv.style.whiteSpace = 'pre-line';
      textDiv.textContent = data.trim();
      container.appendChild(textDiv);
    } else if (data.nodes && data.edges) {
      if (data.nodes.length > 0) {
        const nodesDiv = document.createElement('div');
        nodesDiv.style.marginBottom = '8px';
        nodesDiv.textContent = 'Concepts: ' + data.nodes.map(node => node.label).join(', ');
        container.appendChild(nodesDiv);
      }

      if (data.edges.length > 0) {
        const edgesDiv = document.createElement('div');
        edgesDiv.style.fontSize = '14px';
        edgesDiv.style.lineHeight = '1.4';
        edgesDiv.textContent = 'Relationships: ' + data.edges.map(edge => {
          const fromNode = data.nodes.find(n => n.id === edge.from);
          const toNode = data.nodes.find(n => n.id === edge.to);
          return `${fromNode?.label || edge.from} ${edge.label} ${toNode?.label || edge.to}`;
        }).join('; ');
        container.appendChild(edgesDiv);
      }
    } else {
      container.textContent = 'No diagram data available.';
    }
  }

  function renderGraph(data, container) {
    container.innerHTML = '';

    if (typeof data === 'string') {
      // Parse the tuple format: (node1,edge,node2)
      const tuples = parseTuples(data);
      
      if (tuples.length > 0) {
        createVisualGraph(tuples, container);
      } else {
        // Fallback to text display if parsing fails
      const p = document.createElement('div');
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.4';
        p.style.whiteSpace = 'pre-line';
      p.textContent = data.trim();
      container.appendChild(p);
      }
    } else if (data.summary) {
      const p = document.createElement('div');
      p.style.fontSize = '16px';
      p.style.lineHeight = '1.4';
      p.textContent = data.summary;
      container.appendChild(p);
    } else {
      container.textContent = 'No graph data available.';
    }
  }

  function parseTuples(text) {
    const tuples = [];
    // Match patterns like (node1,edge,node2) or (node1, edge, node2)
    const tupleRegex = /\(([^,]+),([^,]+),([^)]+)\)/g;
    let match;
    
    while ((match = tupleRegex.exec(text)) !== null) {
      tuples.push({
        from: match[1].trim(),
        edge: match[2].trim(),
        to: match[3].trim()
      });
    }
    
    return tuples;
  }

  function createVisualGraph(tuples, container) {
    // Create graph container with enhanced styling
    const graphContainer = document.createElement('div');
    graphContainer.className = 'knowledge-graph';
    graphContainer.style.cssText = `
      width: 100%;
      min-height: 300px;
      max-height: 500px;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(59, 130, 246, 0.2);
      position: relative;
      overflow: hidden;
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    `;

    // Extract unique nodes and calculate connections
    const nodes = new Set();
    const connections = new Map();
    
    tuples.forEach(tuple => {
      nodes.add(tuple.from);
      nodes.add(tuple.to);
      
      // Track connections for better layout
      if (!connections.has(tuple.from)) connections.set(tuple.from, []);
      if (!connections.has(tuple.to)) connections.set(tuple.to, []);
      connections.get(tuple.from).push(tuple.to);
      connections.get(tuple.to).push(tuple.from);
    });

    const nodeArray = Array.from(nodes);
    const nodePositions = calculateForceDirectedLayout(nodeArray, connections, tuples);

    // Create SVG for the graph with better dimensions
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.style.cssText = `
      width: 100%;
      height: ${Math.max(300, Math.min(500, nodeArray.length * 25 + 150))}px;
      position: relative;
    `;

    // Add gradient definitions for enhanced visuals
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Node gradient
    const nodeGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    nodeGradient.setAttribute('id', 'nodeGradient');
    nodeGradient.setAttribute('cx', '30%');
    nodeGradient.setAttribute('cy', '30%');
    nodeGradient.setAttribute('r', '70%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', 'rgba(59, 130, 246, 0.4)');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', 'rgba(37, 99, 235, 0.2)');
    
    nodeGradient.appendChild(stop1);
    nodeGradient.appendChild(stop2);
    defs.appendChild(nodeGradient);
    
    // Edge gradient
    const edgeGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    edgeGradient.setAttribute('id', 'edgeGradient');
    edgeGradient.setAttribute('x1', '0%');
    edgeGradient.setAttribute('y1', '0%');
    edgeGradient.setAttribute('x2', '100%');
    edgeGradient.setAttribute('y2', '100%');
    
    const edgeStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    edgeStop1.setAttribute('offset', '0%');
    edgeStop1.setAttribute('stop-color', 'rgba(59, 130, 246, 0.8)');
    const edgeStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    edgeStop2.setAttribute('offset', '100%');
    edgeStop2.setAttribute('stop-color', 'rgba(147, 197, 253, 0.6)');
    
    edgeGradient.appendChild(edgeStop1);
    edgeGradient.appendChild(edgeStop2);
    defs.appendChild(edgeGradient);
    
    svg.appendChild(defs);

    // Draw edges first (so they appear behind nodes) with enhanced styling
    tuples.forEach(tuple => {
      const fromPos = nodePositions[tuple.from];
      const toPos = nodePositions[tuple.to];
      
      if (fromPos && toPos) {
        // Calculate edge properties
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create curved edge for better visual appeal
        const controlPointOffset = Math.min(length * 0.3, 50);
        const controlX = fromPos.x + dx * 0.5 + Math.cos(angle + Math.PI/2) * controlPointOffset;
        const controlY = fromPos.y + dy * 0.5 + Math.sin(angle + Math.PI/2) * controlPointOffset;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`);
        path.setAttribute('class', 'graph-edge');
        path.setAttribute('stroke', 'url(#edgeGradient)');
        path.setAttribute('stroke-width', '2.5');
        path.setAttribute('fill', 'none');
        path.style.cssText = `
          stroke-dasharray: 8,4;
          filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.3));
          transition: all 0.3s ease;
        `;
        svg.appendChild(path);

        // Add edge label with enhanced styling
        const midX = (fromPos.x + toPos.x) / 2;
        const midY = (fromPos.y + toPos.y) / 2;
        
        // Create background circle for the label
        const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        labelBg.setAttribute('cx', midX);
        labelBg.setAttribute('cy', midY);
        labelBg.setAttribute('r', Math.max(12, tuple.edge.length * 2.5));
        labelBg.style.cssText = `
          fill: rgba(15, 23, 42, 0.9);
          stroke: rgba(59, 130, 246, 0.4);
          stroke-width: 1.5;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
        `;
        svg.appendChild(labelBg);
        
        // Add the text label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX);
        text.setAttribute('y', midY + 3);
        text.setAttribute('class', 'edge-label');
        text.textContent = tuple.edge.length > 8 ? tuple.edge.substring(0, 8) + '...' : tuple.edge;
        text.style.cssText = `
          fill: rgba(147, 197, 253, 0.95);
          font-size: 10px;
          font-weight: 600;
          text-anchor: middle;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        `;
        svg.appendChild(text);
      }
    });

    // Draw nodes with enhanced styling
    nodeArray.forEach((node, index) => {
      const pos = nodePositions[node];
      const connections = tuples.filter(t => t.from === node || t.to === node).length;
      const nodeSize = Math.max(20, Math.min(35, 20 + connections * 2));
      
      // Create node shadow
      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      shadow.setAttribute('cx', pos.x + 2);
      shadow.setAttribute('cy', pos.y + 2);
      shadow.setAttribute('r', nodeSize);
      shadow.style.cssText = `
        fill: rgba(0, 0, 0, 0.3);
        filter: blur(3px);
      `;
      svg.appendChild(shadow);
      
      // Create main node circle
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x);
      circle.setAttribute('cy', pos.y);
      circle.setAttribute('r', nodeSize);
      circle.setAttribute('class', 'graph-node');
      circle.setAttribute('data-node', node);
      circle.style.cssText = `
        fill: url(#nodeGradient);
        stroke: rgba(59, 130, 246, 0.8);
        stroke-width: 2.5;
        filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2));
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      svg.appendChild(circle);

      // Add node label with better text handling
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x);
      text.setAttribute('y', pos.y + 4);
      text.setAttribute('class', 'node-label');
      text.setAttribute('data-node', node);
      
      // Smart text truncation based on node size
      const maxLength = nodeSize > 25 ? 15 : 10;
      const displayText = node.length > maxLength ? node.substring(0, maxLength) + '...' : node;
      text.textContent = displayText;
      
      text.style.cssText = `
        fill: rgba(255, 255, 255, 0.95);
        font-size: ${Math.max(9, Math.min(12, nodeSize * 0.4))}px;
        font-weight: 600;
        text-anchor: middle;
        font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        pointer-events: none;
        user-select: none;
      `;
      svg.appendChild(text);
    });

    // Add interactive features
    addGraphInteractions(svg, nodePositions, tuples);

    graphContainer.appendChild(svg);
    container.appendChild(graphContainer);
  }

  function calculateForceDirectedLayout(nodes, connections, tuples) {
    const positions = {};
    const containerWidth = 400;
    const containerHeight = Math.max(300, Math.min(500, nodes.length * 25 + 150));
    const margin = 80;
    
    // Initialize positions randomly within the container
    nodes.forEach(node => {
      positions[node] = {
        x: margin + Math.random() * (containerWidth - 2 * margin),
        y: margin + Math.random() * (containerHeight - 2 * margin),
        vx: 0,
        vy: 0
      };
    });
    
    // Force-directed simulation parameters
    const iterations = 200;
    const k = Math.sqrt((containerWidth * containerHeight) / nodes.length); // Spring constant
    const c = 0.1; // Damping factor
    const repulsionStrength = k * k;
    const attractionStrength = 0.1;
    
    // Run force-directed simulation
    for (let iter = 0; iter < iterations; iter++) {
      // Calculate repulsive forces between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          const pos1 = positions[node1];
          const pos2 = positions[node2];
          
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          
          const force = repulsionStrength / (distance * distance);
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          pos1.vx += fx;
          pos1.vy += fy;
          pos2.vx -= fx;
          pos2.vy -= fy;
        }
      }
      
      // Calculate attractive forces for connected nodes
      tuples.forEach(tuple => {
        const pos1 = positions[tuple.from];
        const pos2 = positions[tuple.to];
        
        const dx = pos2.x - pos1.x;
        const dy = pos2.y - pos1.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const force = (distance * distance) / k * attractionStrength;
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        pos1.vx += fx;
        pos1.vy += fy;
        pos2.vx -= fx;
        pos2.vy -= fy;
      });
      
      // Update positions and apply damping
      nodes.forEach(node => {
        const pos = positions[node];
        
        pos.vx *= c;
        pos.vy *= c;
        pos.x += pos.vx;
        pos.y += pos.vy;
        
        // Keep nodes within bounds
        pos.x = Math.max(margin, Math.min(containerWidth - margin, pos.x));
        pos.y = Math.max(margin, Math.min(containerHeight - margin, pos.y));
      });
    }
    
    // Remove velocity properties and return clean positions
    const cleanPositions = {};
    nodes.forEach(node => {
      cleanPositions[node] = {
        x: positions[node].x,
        y: positions[node].y
      };
    });
    
    return cleanPositions;
  }

  function addGraphInteractions(svg, nodePositions, tuples) {
    let isDragging = false;
    let draggedNode = null;
    let dragOffset = { x: 0, y: 0 };
    
    // Add mouse event listeners for node dragging
    svg.addEventListener('mousedown', (e) => {
      const node = e.target.closest('.graph-node');
      if (node) {
        isDragging = true;
        draggedNode = node.getAttribute('data-node');
        const rect = svg.getBoundingClientRect();
        const nodePos = nodePositions[draggedNode];
        dragOffset.x = e.clientX - rect.left - nodePos.x;
        dragOffset.y = e.clientY - rect.top - nodePos.y;
        
        node.style.cursor = 'grabbing';
        e.preventDefault();
      }
    });
    
    svg.addEventListener('mousemove', (e) => {
      if (isDragging && draggedNode) {
        const rect = svg.getBoundingClientRect();
        const newX = e.clientX - rect.left - dragOffset.x;
        const newY = e.clientY - rect.top - dragOffset.y;
        
        // Update node position
        nodePositions[draggedNode].x = Math.max(30, Math.min(370, newX));
        nodePositions[draggedNode].y = Math.max(30, Math.min(470, newY));
        
        // Update visual elements
        const nodeCircle = svg.querySelector(`[data-node="${draggedNode}"].graph-node`);
        const nodeText = svg.querySelector(`[data-node="${draggedNode}"].node-label`);
        
        if (nodeCircle) {
          nodeCircle.setAttribute('cx', nodePositions[draggedNode].x);
          nodeCircle.setAttribute('cy', nodePositions[draggedNode].y);
        }
        if (nodeText) {
          nodeText.setAttribute('x', nodePositions[draggedNode].x);
          nodeText.setAttribute('y', nodePositions[draggedNode].y + 4);
        }
        
        // Update connected edges
        updateConnectedEdges(svg, draggedNode, nodePositions, tuples);
      }
    });
    
    svg.addEventListener('mouseup', () => {
      if (isDragging && draggedNode) {
        const node = svg.querySelector(`[data-node="${draggedNode}"].graph-node`);
        if (node) {
          node.style.cursor = 'pointer';
        }
        isDragging = false;
        draggedNode = null;
      }
    });
    
    // Add hover effects
    svg.addEventListener('mouseover', (e) => {
      const node = e.target.closest('.graph-node');
      if (node && !isDragging) {
        node.style.transform = 'scale(1.1)';
        node.style.filter = 'drop-shadow(0 6px 12px rgba(59, 130, 246, 0.4))';
        
        // Highlight connected edges
        const nodeName = node.getAttribute('data-node');
        highlightConnectedEdges(svg, nodeName, tuples);
      }
    });
    
    svg.addEventListener('mouseout', (e) => {
      const node = e.target.closest('.graph-node');
      if (node && !isDragging) {
        node.style.transform = 'scale(1)';
        node.style.filter = 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.2))';
        
        // Remove edge highlighting
        const edges = svg.querySelectorAll('.graph-edge');
        edges.forEach(edge => {
          edge.style.strokeWidth = '2.5';
          edge.style.stroke = 'url(#edgeGradient)';
        });
      }
    });
  }

  function updateConnectedEdges(svg, nodeName, nodePositions, tuples) {
    tuples.forEach(tuple => {
      if (tuple.from === nodeName || tuple.to === nodeName) {
        const fromPos = nodePositions[tuple.from];
        const toPos = nodePositions[tuple.to];
        
        if (fromPos && toPos) {
          // Find and update the edge path
          const edges = svg.querySelectorAll('.graph-edge');
          edges.forEach(edge => {
            const path = edge.getAttribute('d');
            if (path.includes(`M ${fromPos.x} ${fromPos.y}`) || path.includes(`M ${toPos.x} ${toPos.y}`)) {
              const dx = toPos.x - fromPos.x;
              const dy = toPos.y - fromPos.y;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx);
              
              const controlPointOffset = Math.min(length * 0.3, 50);
              const controlX = fromPos.x + dx * 0.5 + Math.cos(angle + Math.PI/2) * controlPointOffset;
              const controlY = fromPos.y + dy * 0.5 + Math.sin(angle + Math.PI/2) * controlPointOffset;
              
              edge.setAttribute('d', `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`);
            }
          });
          
          // Update edge label position
          const midX = (fromPos.x + toPos.x) / 2;
          const midY = (fromPos.y + toPos.y) / 2;
          
          const labelBgs = svg.querySelectorAll('circle');
          const edgeLabels = svg.querySelectorAll('.edge-label');
          
          labelBgs.forEach(bg => {
            if (bg.getAttribute('cx') === midX.toString() || bg.getAttribute('cy') === midY.toString()) {
              bg.setAttribute('cx', midX);
              bg.setAttribute('cy', midY);
            }
          });
          
          edgeLabels.forEach(label => {
            if (label.getAttribute('x') === midX.toString() || label.getAttribute('y') === midY.toString()) {
              label.setAttribute('x', midX);
              label.setAttribute('y', midY + 3);
            }
          });
        }
      }
    });
  }

  function highlightConnectedEdges(svg, nodeName, tuples) {
    const connectedNodes = new Set();
    tuples.forEach(tuple => {
      if (tuple.from === nodeName) connectedNodes.add(tuple.to);
      if (tuple.to === nodeName) connectedNodes.add(tuple.from);
    });
    
    const edges = svg.querySelectorAll('.graph-edge');
    edges.forEach(edge => {
      const path = edge.getAttribute('d');
      const isConnected = Array.from(connectedNodes).some(node => {
        const pos = nodePositions[node];
        return pos && (path.includes(`M ${pos.x} ${pos.y}`) || path.includes(`Q ${pos.x} ${pos.y}`));
      });
      
      if (isConnected) {
        edge.style.strokeWidth = '3.5';
        edge.style.stroke = 'rgba(59, 130, 246, 1)';
      }
    });
  }

  return {
    systemPrompts,
    cleanCaptionText,
    formatTime,
    renderDefinitions,
    renderDiagram,
    renderGraph,
    parseTuples,
    createVisualGraph,
    calculateForceDirectedLayout,
    addGraphInteractions,
    updateConnectedEdges,
    highlightConnectedEdges
  };
})();
