#!/bin/bash

# Create a minimal 1x1 PNG and scale it
# This is a valid 1x1 blue PNG in base64
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > temp.png

# Use sips (built into macOS) to resize
sips -z 1024 1024 temp.png --out icon.png > /dev/null 2>&1
sips -z 1024 1024 temp.png --out adaptive-icon.png > /dev/null 2>&1
sips -z 2778 1284 temp.png --out splash.png > /dev/null 2>&1
sips -z 48 48 temp.png --out favicon.png > /dev/null 2>&1

rm temp.png
echo "Assets created"
