#!/bin/bash
cd /home/z/my-project
while true; do
  rm -rf .next/cache 2>/dev/null
  npx next dev -p 3000 2>&1
  echo "=== Restarting in 3s ===" >> /home/z/my-project/dev.log
  sleep 3
done
