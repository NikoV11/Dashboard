#!/bin/bash
# FRED Dashboard Server Startup Script (Node.js)
# This script starts the local server on port 3000

echo "========================================"
echo "FRED Dashboard Server"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo ""
    echo "Please install Node.js from: https://nodejs.org"
    exit 1
fi

echo "Starting server on http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the server
node server.js
