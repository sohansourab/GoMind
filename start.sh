#!/bin/bash

# Quick Start Script for Satori Go Game
# This script automates the initial setup process

echo "🎮 Satori Go Game - Quick Start"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
    echo ""
else
    echo "✅ Dependencies already installed"
    echo ""
fi

# Ask user what they want to do
echo "What would you like to do?"
echo "1) Start development server"
echo "2) Run tests"
echo "3) Build for production"
echo "4) All of the above (test, build, then start dev server)"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Starting development server..."
        echo "Press Ctrl+C to stop"
        echo ""
        npm run dev
        ;;
    2)
        echo ""
        echo "🧪 Running tests..."
        echo ""
        npm test
        ;;
    3)
        echo ""
        echo "🏗️  Building for production..."
        echo ""
        npm run build
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Build successful!"
            echo "Production files are in the 'dist' directory"
            echo ""
            read -p "Would you like to preview the build? (y/n): " preview
            if [ "$preview" = "y" ]; then
                npm run preview
            fi
        fi
        ;;
    4)
        echo ""
        echo "🧪 Running tests..."
        npm test
        if [ $? -ne 0 ]; then
            echo "❌ Tests failed!"
            exit 1
        fi
        
        echo ""
        echo "🏗️  Building for production..."
        npm run build
        if [ $? -ne 0 ]; then
            echo "❌ Build failed!"
            exit 1
        fi
        
        echo ""
        echo "✅ All checks passed!"
        echo ""
        echo "🚀 Starting development server..."
        echo "Press Ctrl+C to stop"
        echo ""
        npm run dev
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
