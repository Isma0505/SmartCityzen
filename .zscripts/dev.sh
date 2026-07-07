#!/bin/bash
cd /home/z/my-project

# Auto-restart loop for dev server
while true; do
  echo "[DEV] Starting Next.js dev server..."
  rm -rf .next/cache 2>/dev/null
  npx next dev -p 3000 2>&1
  EXIT_CODE=$?
  echo "[DEV] Server exited with code $EXIT_CODE, restarting in 3s..."
  sleep 3
done
