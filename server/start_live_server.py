#!/usr/bin/env python3
"""
Startup script for YouTube Learning Extension Live Graph Server
"""

import subprocess
import sys
import os
import webbrowser
import time
import threading

def install_requirements():
    """Install required packages"""
    print("📦 Installing required packages...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Packages installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 6):
        print("❌ Python 3.6 or higher is required")
        return False
    print(f"✅ Python {sys.version.split()[0]} detected")
    return True

def open_browser():
    """Open browser after a short delay"""
    time.sleep(3)
    webbrowser.open('http://localhost:5000')

def main():
    print("🧠 YouTube Learning Extension - Live Graph Server Setup")
    print("=" * 60)
    
    # Check Python version
    if not check_python_version():
        return
    
    # Install requirements
    if not install_requirements():
        return
    
    print("\n🚀 Starting Live Graph Server...")
    print("📱 The dashboard will open automatically in your browser")
    print("🔧 Configure your extension:")
    print("   Graph Push API URL: http://localhost:5000/api/graph-data")
    print("\n⏳ Starting server in 3 seconds...")
    
    # Open browser in background
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Start the server
    try:
        subprocess.run([sys.executable, "live_graph_server.py"])
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Goodbye!")

if __name__ == "__main__":
    main()
