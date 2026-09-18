# Satori - The Game of Go

A premium, modern web-based implementation of the traditional board game Go (囲碁), built with React, TypeScript, and Vite.

## 🎮 Features

### Game Modes
- **Human vs Human** - Play locally with a friend
- **Human vs AI** - Challenge the computer with 3 difficulty levels:
  - 🌱 **Easy** - Random play, great for learning
  - ⚔️ **Medium** - Balanced strategy with captures and defense
  - 🐉 **Hard** - Advanced play with look-ahead and territory awareness

### Board Sizes
- 9×9 (Beginner)
- 13×13 (Intermediate)
- 19×19 (Standard)

### Game Rules
- Complete Go rules implementation:
  - Stone placement and capture
  - Group detection and liberties
  - Suicide prevention
  - Ko rule (simple ko)
  - Pass and resignation
  - Chinese area scoring
  - Configurable komi

### UI Features
- Premium wooden board with realistic stone rendering
- Move history with review mode
- Last move indicator
- Ghost stone preview on hover
- Responsive design (desktop, tablet, mobile)
- Dark theme with elegant typography
- Rulebook with expandable sections
- Game over dialog with score breakdown

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Extract the tar file:**
   ```bash
   tar -xzf satori-go-game.tar.gz
   cd satori-go-game
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The project includes comprehensive tests for:
- Board operations
- Group detection
- Liberty calculation
- Capture logic
- Suicide prevention
- Ko rule
- Scoring
- Game state management
- AI behavior
- Coordinate system

## 🏗️ Building for Production

Create a production build:
```bash
npm run build
```

The optimized files will be in the `dist/` directory.

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── game/              # Pure game engine (no React dependencies)
│   ├── types.ts       # Type definitions
│   ├── board.ts       # Board operations
│   ├── groups.ts      # Group detection (BFS)
│   ├── capture.ts     # Capture logic
│   ├── rules.ts       # Move validation
│   ├── ko.ts          # Ko rule
│   ├── scoring.ts     # Chinese scoring
│   ├── ai.ts          # AI implementation
│   ├── aiLevels.ts    # AI difficulty configs
│   └── gameState.ts   # State management
│
├── components/        # React UI components
│   ├── GoBoard/       # Board rendering (SVG)
│   ├── PlayerPanel/   # Player info display
│   ├── GameControls/  # Pass, Resign, Review
│   ├── MoveHistory/   # Move list
│   ├── ScorePanel/    # Final score display
│   ├── NewGameDialog/ # Game setup modal
│   ├── GameOverDialog/# Game over modal
│   ├── GameStatus/    # Current game status
│   └── Rulebook/      # Rules reference
│
├── hooks/             # React hooks
│   └── useGoGame.ts   # Main game state hook
│
├── tests/             # Test files
│   ├── board.test.ts
│   ├── groups.test.ts
│   ├── capture.test.ts
│   ├── suicide.test.ts
│   ├── ko.test.ts
│   ├── scoring.test.ts
│   ├── gameState.test.ts
│   ├── ai.test.ts
│   └── coordinates.test.ts
│
├── App.tsx            # Main app component
├── main.tsx           # Entry point
└── index.css          # Global styles
```

## 🎯 How to Play

### Basic Rules
1. **Objective**: Control more territory than your opponent
2. **Turns**: Black plays first, players alternate
3. **Placement**: Place stones on empty intersections
4. **Capture**: Surround opponent stones to capture them
5. **Liberties**: Empty points adjacent to a stone/group
6. **Ko**: Can't immediately recreate the previous board position
7. **Suicide**: Can't play a stone with no liberties (unless it captures)
8. **Pass**: Skip your turn; two consecutive passes end the game
9. **Scoring**: Stones on board + territory enclosed

### Controls
- **Click** an intersection to place a stone
- **Pass** button to skip your turn
- **Resign** button to forfeit the game
- **New Game** to start a new game
- **Review** mode to navigate through move history
- **Rules** button to view the rulebook

## 🎨 Design Philosophy

**Satori** (悟り) means "enlightenment" or "understanding" in Japanese.

The design follows these principles:
- **Minimalism** - Clean, uncluttered interface
- **Zen aesthetics** - Calm, focused experience
- **Premium feel** - High-quality visuals and interactions
- **Accessibility** - Works on all devices and screen sizes
- **Performance** - Fast, smooth gameplay

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework
- **CSS3** - Styling with custom properties
- **SVG** - Board rendering

## 📋 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Known Limitations

- **Ko Rule**: Implements simple ko (not superko) - sufficient for most games
- **AI**: Heuristic-based, not using professional Go engines (KataGo, Leela Zero)
- **Dead Stone Detection**: Not implemented - assumes all stones are alive at game end
- **Offline Play**: No persistent storage yet

## 🚧 Future Enhancements

- [ ] Integration with KataGo/Leela Zero for stronger AI
- [ ] Online multiplayer
- [ ] Game persistence (save/load)
- [ ] AI move explanations
- [ ] Positional superko option
- [ ] Dead stone marking in scoring phase
- [ ] Sound effects
- [ ] Additional themes

## 📄 License

This project is created with ❤ by Sohan.

## 🙏 Acknowledgments

- Traditional Go rules and scoring
- Japanese aesthetic principles
- Modern web technologies

---

**Enjoy the game!** 🎮
