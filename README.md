<div align="center">

# 🎮 Satori

### The Game of Go

*A premium, modern web-based implementation of the ancient strategy game*

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-go--mind.vercel.app-c9a55a?style=for-the-badge&logo=vercel)](https://go-mind.vercel.app/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[✨ Features](#-features) • [🚀 Quick Start](#-quick-start) • [🎯 How to Play](#-how-to-play) • [🛠️ Tech Stack](#-tech-stack) • [📸 Screenshots](#-screenshots)

---

</div>

## 🌟 Overview

**Satori** (悟り) is a beautiful, fully-featured Go game that brings the elegance of this 2,500-year-old strategy game to the modern web. Built with a focus on premium design, smooth gameplay, and accessibility.

> *"Go is a game of balance, harmony, and profound simplicity."*

🎮 **[Play Now at go-mind.vercel.app](https://go-mind.vercel.app/)**

---

## ✨ Features

### 🎯 Game Modes
- **👥 Human vs Human** - Challenge a friend locally
- **🤖 Human vs AI** - Battle against our intelligent AI opponent
  - 🌱 **Beginner** - Perfect for learning the basics
  - ⚔️ **Easy** - Balanced challenge for casual players
  - 🎯 **Medium** - Strategic gameplay with tactical awareness
  - 🔥 **Hard** - Advanced AI with deep lookahead
  - 💀 **Expert** - Maximum difficulty for serious players

### 📐 Board Sizes
- **9×9** - Quick games, perfect for beginners
- **13×13** - Intermediate challenge
- **19×19** - Full-size traditional Go board

### 🎨 Premium Design
- 🪵 **Realistic wooden board** with authentic texture
- ⚫ **Beautiful stone rendering** with shadows and gradients
- 🎭 **Smooth animations** for stone placement
- 🌙 **Elegant dark theme** inspired by Zen aesthetics
- 📱 **Fully responsive** - works on desktop, tablet, and mobile
- 👻 **Ghost stone preview** shows where you'll place your stone

### 🎮 Complete Go Rules
- ✅ Stone placement and capture mechanics
- ✅ Group detection and liberty counting
- ✅ Ko rule implementation
- ✅ Suicide prevention
- ✅ Pass and resignation
- ✅ Chinese area scoring
- ✅ Configurable komi (compensation points)

### 📊 Game Features
- 📜 **Move history** - Review every move of the game
- 🔍 **Review mode** - Navigate through game history
- 🎯 **Last move indicator** - Never lose track
- 💡 **Rulebook** - Built-in rules reference
- 🏆 **Score display** - Real-time territory counting
- ⏸️ **Undo/redo** - Navigate through moves

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/satori-go.git
cd satori-go

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build optimized version
npm run build

# Preview production build
npm run preview
```

---

## 🎯 How to Play

### Basic Rules

1. **Objective**: Control more territory than your opponent
2. **Turns**: Black plays first, players alternate
3. **Placement**: Place stones on empty intersections
4. **Capture**: Surround opponent's stones to capture them
5. **Liberties**: Empty points adjacent to stones
6. **Territory**: Empty points surrounded by your stones

### Controls

| Action | How |
|--------|-----|
| Place stone | Click on an intersection |
| Pass | Click "Pass" button |
| Resign | Click "Resign" button |
| New game | Click "New Game" |
| Review moves | Use ← → buttons or click move history |
| View rules | Click "Rules" button |

### Tips for Beginners

- Start with 9×9 boards to learn quickly
- Focus on connecting your stones
- Don't play too close to the edge
- Capture opponent stones to gain territory
- Use the rulebook if you're unsure about rules

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Lightning-fast build tool
- **CSS3** - Custom styling with CSS variables

### Game Engine
- **Pure TypeScript** - No external dependencies
- **Immutable state** - Predictable game logic
- **Functional architecture** - Clean, testable code

### Testing
- **Vitest** - Fast unit testing
- **Comprehensive coverage** - All game rules tested

### Deployment
- **Vercel** - Lightning-fast hosting
- **Automatic deployments** - Push to deploy

---

## 📸 Screenshots

<div align="center">

### Game Board
![Satori Game Board](https://github.com/sohansourab/GoMind/blob/main/gameboard.jpeg)

### New Game Dialog
*Choose your board size, game mode, and AI difficulty*
![Game dialog](https://github.com/sohansourab/GoMind/blob/main/dia.jpeg?raw=true)


### Move History
*Review every move with our intuitive interface*
![Move History](https://github.com/sohansourab/GoMind/blob/main/movehis.jpeg)
</div>

---

## 🏗️ Project Structure

```
satori-go/
├── src/
│   ├── components/         # React components
│   │   ├── GoBoard/       # Board rendering
│   │   ├── GameControls/  # Game controls
│   │   ├── MoveHistory/   # Move history panel
│   │   ├── ScorePanel/    # Score display
│   │   ├── NewGameDialog/ # New game modal
│   │   ├── GameOverDialog/# Game over modal
│   │   ├── PlayerPanel/   # Player info
│   │   ├── GameStatus/    # Game status
│   │   └── Rulebook/      # Rules reference
│   ├── game/              # Game engine (pure logic)
│   │   ├── types.ts       # Type definitions
│   │   ├── board.ts       # Board operations
│   │   ├── groups.ts      # Group detection
│   │   ├── capture.ts     # Capture logic
│   │   ├── rules.ts       # Move validation
│   │   ├── ko.ts          # Ko rule
│   │   ├── scoring.ts     # Scoring system
│   │   ├── ai.ts          # AI implementation
│   │   └── gameState.ts   # State management
│   ├── hooks/             # React hooks
│   │   └── useGoGame.ts   # Main game hook
│   ├── tests/             # Test files
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage
- ✅ Board operations
- ✅ Group detection
- ✅ Capture mechanics
- ✅ Ko rule
- ✅ Suicide prevention
- ✅ Scoring system
- ✅ AI behavior
- ✅ Game state management

---

## 🎨 Design Philosophy

**Satori** follows these design principles:

1. **Minimalism** - Clean, uncluttered interface
2. **Zen Aesthetics** - Calm, focused experience
3. **Premium Feel** - High-quality visuals and interactions
4. **Accessibility** - Works on all devices
5. **Performance** - Fast, smooth gameplay

---

## 🌍 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest features
- 📝 Improve documentation
- 🔧 Submit pull requests

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by the ancient game of Go (围碁/囲碁)
- Design influenced by traditional Japanese aesthetics
- Built with modern web technologies

---

## 📬 Contact

Created with ❤️ by **Sohan**

🌐 Live Demo: [go-mind.vercel.app](https://go-mind.vercel.app/)

---

<div align="center">

**Enjoy the game!** 🎮

*Place your stones wisely, young player.*

⭐ **Star this repo if you like it!** ⭐

</div>
