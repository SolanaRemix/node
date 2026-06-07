#!/bin/bash
# Deploy Atomic Swarm Gods Elite on Render or any Node.js host
echo "?? Deploying Atomic Swarm Gods Elite..."

# Install dependencies
npm install

# Ensure required directories exist
mkdir -p blockchain surgery-room/repairs public

# Start the server
export PORT=${PORT:-3001}
node server.js
