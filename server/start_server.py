#!/usr/bin/env python3
"""
YouTube Learning Extension - Server Startup Script

This script starts the live graph visualization server.
Run this from the root directory of the project.
"""

import os
import sys
import subprocess

def main():
    """Start the live graph server."""
    print("Starting YouTube Learning Extension Server...")
    print("=" * 50)
    
    # Change to server directory
    server_dir = os.path.join(os.path.dirname(__file__), 'server')
    
    if not os.path.exists(server_dir):
        print("Error: Server directory not found!")
        print(f"Expected: {server_dir}")
        sys.exit(1)
    
    # Check if requirements are installed
    requirements_file = os.path.join(server_dir, 'requirements.txt')
    if os.path.exists(requirements_file):
        print("Installing dependencies...")
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', requirements_file], 
                         check=True, cwd=server_dir)
            print("Dependencies installed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"Error installing dependencies: {e}")
            sys.exit(1)
    
    # Start the server
    server_file = os.path.join(server_dir, 'live_graph_server.py')
    if not os.path.exists(server_file):
        print(f"Error: Server file not found: {server_file}")
        sys.exit(1)
    
    print("Starting Flask server...")
    print("Dashboard will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        # Change to server directory and run the server
        os.chdir(server_dir)
        subprocess.run([sys.executable, 'live_graph_server.py'], check=True)
    except KeyboardInterrupt:
        print("\nServer stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
