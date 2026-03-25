#!/bin/bash

# Quick start script for Yelp Prototype
# This starts both backend and frontend servers

echo "🚀 Starting Yelp Prototype..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Terminal 1: Backend
echo -e "${YELLOW}📌 Terminal 1: Starting Backend...${NC}"
echo "   Command: cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8000"
echo ""

# Start backend in a new terminal window (macOS)
open -a Terminal "cd '${DIR}/backend' && source venv/bin/activate && uvicorn main:app --reload --port 8000; exec bash"

sleep 3

# Terminal 2: Frontend  
echo -e "${YELLOW}📌 Terminal 2: Starting Frontend...${NC}"
echo "   Command: cd frontend && npm run dev"
echo ""

# Start frontend in another new terminal window
open -a Terminal "cd '${DIR}/frontend' && npm run dev; exec bash"

sleep 2

echo ""
echo -e "${GREEN}✅ Starting servers...${NC}"
echo ""
echo "📋 What's happening:"
echo "   • Backend:  http://localhost:8000"
echo "   • Frontend: http://localhost:3000 or http://localhost:5173"
echo ""
echo "🔐 Test Credentials:"
echo "   Email:    prakhar@demo.com"
echo "   Password: password123"
echo ""
echo "⚠️  If frontend shows CORS error:"
echo "   Edit backend/main.py CORS config to include your frontend port"
echo ""
echo "💡 Check terminal windows opened above for API and frontend output"
