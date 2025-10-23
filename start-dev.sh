#!/bin/bash

echo "Starting Habit Tracker Development Environment..."
echo

echo "Starting Backend (FastAPI)..."
gnome-terminal -- bash -c "cd $(dirname "$0") && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000; exec bash"

echo "Waiting for backend to start..."
sleep 3

echo "Starting Frontend (React)..."
gnome-terminal -- bash -c "cd $(dirname "$0")/frontend && npm run dev; exec bash"

echo
echo "Development environment started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo
