# The Maze Runner - Claude Code Configuration

## Project Overview
Endless progressive-difficulty maze game with mobile-first touch controls, built with vanilla JavaScript (ES6 modules), Canvas API, and ROT.js.

## Bash Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Code Style Requirements
- Use ES6 modules (import/export)
- Separate game logic from rendering
- Centralized state management (StateManager)
- Comment complex algorithms (especially braiding and collision)
- Use descriptive variable names
- Keep functions small and focused
- Avoid magic numbers (use constants.js)

## Project Structure
```
/
├── index.html              # Main HTML entry
├── css/
│   └── style.css          # Mobile-first responsive styles
├── js/
│   ├── main.js            # Entry point
│   ├── core/              # Core game systems
│   │   ├── Game.js        # Main orchestrator
│   │   ├── GameLoop.js    # Fixed timestep loop
│   │   ├── StateManager.js # Game state + observers
│   │   └── SceneManager.js # Scene transitions
│   ├── systems/           # Game systems
│   │   ├── RenderSystem.js # Canvas rendering
│   │   ├── InputSystem.js  # Keyboard + touch
│   │   ├── CollisionSystem.js # Wall collision
│   │   └── ScoreSystem.js  # Scoring logic
│   ├── entities/          # Game entities
│   │   ├── Player.js      # Player entity
│   │   └── Entity.js      # Base entity class
│   ├── world/             # Maze generation
│   │   ├── MazeGenerator.js # ROT.js wrapper + braiding
│   │   └── Level.js        # Level data structure
│   └── utils/             # Utilities
│       ├── constants.js    # Game constants
│       ├── helpers.js      # Helper functions
│       └── storage.js      # LocalStorage wrapper
```

## Game-Specific Guidelines
- **Frame Rate**: Target 30fps for mobile, use `requestAnimationFrame`
- **Game Loop**: Fixed timestep with accumulator pattern (separate update/render)
- **State Management**: Use StateManager observer pattern for all game state
- **Collision**: Grid-based collision detection (check before moving)
- **Touch Controls**: Aggressive scroll/zoom prevention (`touch-action: none`, `passive: false`)
- **Maze Generation**: Use ROT.js + custom braiding post-processing
- **Difficulty Scaling**: Follow 5-tier system in constants.js
- **Performance**: Object pooling for particles, viewport culling for large mazes

## Critical Rules
- NEVER mix game state updates with rendering
- ALWAYS validate player input bounds
- Maze coordinates are 0-indexed
- Frame delta time is in milliseconds
- ALWAYS prevent default touch behaviors to avoid scrolling
- Test on mobile (Chrome DevTools with 6x CPU throttling)

## Development Workflow
1. Read relevant files before making changes
2. Request detailed plans for complex features
3. Implement with verification
4. Commit with descriptive messages
5. Test on multiple devices/browsers

## Testing
- Test collision detection edge cases
- Test touch controls on real devices
- Test performance with large mazes (100×100)
- Test save/load functionality
- Playtest difficulty curve (levels 1-50)

## Performance Targets
- 30fps on mid-range Android devices
- Smooth touch controls with no lag
- Fast maze generation (<100ms for 50×50)
- No memory leaks on level transitions
