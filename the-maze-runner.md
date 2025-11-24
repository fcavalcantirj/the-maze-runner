# Building an Endless Maze Game with Claude Code: Complete Technical Guide

The key to creating an engaging endless maze game is **selecting algorithms that generate rich branching paths** (Prim's and Kruskal's naturally create 30%+ dead ends with many decision points) combined with progressive braiding to add loops as difficulty increases, all rendered on Canvas with drag-to-move touch controls. This creates the strategic depth needed for compelling gameplay while scaling from 15×15 beginner mazes to 100×100+ expert levels with 50-75% braiding.

This guide provides actionable implementation details across maze algorithms, rendering technologies, mobile optimization, and Claude Code integration patterns. The research reveals that **ROT.js with custom post-processing** offers the best balance for JavaScript web implementation, while Canvas API dramatically outperforms SVG for mobile maze rendering. Most critically, no JavaScript library natively generates non-perfect mazes—you'll need to implement braiding algorithms to create bifurcations beyond what perfect maze algorithms provide.

## Maze generation algorithms that create meaningful bifurcations

Perfect mazes contain exactly one path between any two points with zero loops—a spanning tree structure. While mathematically elegant, they create tedious gameplay where all "wrong" choices lead to dead ends. Imperfect or braided mazes with multiple paths between points provide the strategic depth your endless game requires.

**Prim's algorithm creates the most branching structure naturally** with a bushy, tree-like texture spreading from the starting point. It generates approximately 30-36% dead ends (among the highest of any algorithm) with very low "river factor"—meaning many short branches rather than long corridors. The algorithm expands uniformly from all frontier cells simultaneously, creating dense decision points with multiple short paths. With solution paths averaging just 2.3% of total maze length, Prim's forces players to make frequent choices. Performance is excellent at 30-59 time units for generation, making it ideal for real-time level creation.

Kruskal's algorithm provides similar branching characteristics to Prim's but with different generation dynamics. It unifies disjoint sets randomly across the entire maze, creating scattered passage segments that appear anywhere rather than expanding from a center. This produces about 30% dead ends with solution paths around 4.1% of maze length. The random, unpredictable branching pattern prevents players from exploiting systematic exploration strategies.

**Growing Tree algorithm offers maximum flexibility** through configurable cell selection strategies that can mimic any other algorithm. Select the newest cell for Recursive Backtracker behavior (long corridors), random cells for Prim's behavior (bushy branches), or oldest cells for lowest possible river factor. Mix strategies for hybrid characteristics—a 50% newest / 50% random split balances corridors with branches excellently. Dead end percentages range from 10-49% depending on configuration, with solution paths from 2.3-11%. This tunability makes Growing Tree ideal for creating distinct "personalities" across different difficulty levels.

Wilson's algorithm generates mathematically uniform spanning trees where all possible mazes are equally likely through loop-erased random walks. It produces unbiased mazes with 29% dead ends and 4.5% solution path length, identical to Aldous-Broder but 5x faster at 48 time units versus 279. The uniform distribution prevents algorithmic artifacts that players might learn to exploit.

Recursive Backtracker (DFS) represents the opposite end of the spectrum with extremely long, winding corridors and the highest "river" factor. It generates only 10% dead ends with solution paths comprising 19% of the maze—the longest and most twisty of any algorithm. Depth-first exploration creates dramatic snake-like passages but fewer branches. While this can feel monotonous with obvious main corridors, it offers value for harder difficulty tiers where long backtracking increases challenge.

Hunt-and-Kill provides balanced compromise between corridors and branches. It creates long winding passages periodically interrupted by "hunt" mode scans that identify unvisited cells, generating 11-21% dead ends with 9.5% solution path length. The algorithm requires zero extra memory but runs slower (100-143 time units) due to hunting phases. Tune branching frequency by adjusting when hunt mode activates—more frequent hunting creates more branches.

**For endless progression, algorithm selection dramatically affects perceived difficulty**. Binary Tree and Sidewinder create heavily biased mazes with obvious solutions (levels 1-10). Prim's and Kruskal's provide moderate branching suitable for skill building (levels 11-25). Hunt-and-Kill and mixed Growing Tree increase challenge (levels 26-50). At expert levels (51+), rotate between all algorithms with increasing braid percentages to prevent pattern recognition.

## Converting perfect mazes into bifurcating multi-path structures

Braiding transforms perfect mazes by removing dead ends to create loops and multiple solution paths. The technique provides precise control over difficulty by adjusting what percentage of dead ends you eliminate—0% braiding maintains the perfect maze, 50% removes half the dead ends, and 100% creates a pure braid maze with zero dead ends.

The dead-end culling process works systematically: generate a perfect maze with any algorithm, identify all dead ends (cells with three walls), randomly decide whether to remove each based on your target percentage, and carve through one adjacent wall for each removed dead end. **This simple post-processing step converts any perfect maze into an imperfect maze with controllable loop density**.

Implementation requires detecting dead ends by counting walls per cell. For each dead end selected for removal, identify walled neighbors and randomly carve a passage to one. The JavaScript implementation pattern:

```javascript
function braidMaze(maze, percentage) {
  const deadEnds = findAllDeadEnds(maze);
  
  deadEnds.forEach(cell => {
    if (Math.random() * 100 < percentage) {
      const neighbors = getWalledNeighbors(cell);
      if (neighbors.length > 0) {
        const target = neighbors[Math.floor(Math.random() * neighbors.length)];
        removeWall(cell, target);
      }
    }
  });
}

function isDeadEnd(cell) {
  let wallCount = 0;
  ['north', 'south', 'east', 'west'].forEach(dir => {
    if (cell.walls[dir]) wallCount++;
  });
  return wallCount === 3;
}
```

Progressive braiding creates the difficulty curve for endless games. Start with 0% braiding for levels 1-10 (perfect mazes help players learn). Introduce 10-25% braiding for levels 26-50 as size increases. Scale to 25-50% for levels 51-100 where loops make tracking difficult. At master levels (101+), use 50-100% braiding combined with sparse maze passes that remove unnecessary corridors.

Alternative loop addition techniques include random wall removal where you select random interior walls and remove 5-20% after perfect maze generation. The controlled addition approach only removes walls not on the solution path to maintain a unique entrance-to-exit solution while creating loops in less-critical areas. Roger Buck's "Rooms and Mazes" method gives culled connectors during spanning tree connection a small chance (e.g., 1 in 50) to open anyway, creating occasional extra connections organically during generation rather than post-processing.

## Recommended JavaScript libraries and their capabilities

**ROT.js (Roguelike Toolkit) emerges as the most comprehensive option** with 2,325+ GitHub stars and active maintenance. Written in TypeScript, it provides web-optimized code working in browsers and Node.js through ES2015 modules, CommonJS, or pre-built bundles. The library includes three maze algorithms: DividedMaze (recursive division), IceyMaze (configurable regularity where 0 equals most random), and EllerMaze (perfect maze using Eller's algorithm with memory-efficient 2*N storage for N×N mazes). Beyond mazes, ROT.js includes dungeon generators (Digger, Uniform, Rogue), cellular automata, FOV calculation, pathfinding, scheduling systems, and RNG utilities.

The critical limitation: **all built-in ROT.js algorithms create perfect mazes** with single paths between points. GitHub Issue #76 discusses non-perfect maze feature requests but this remains unimplemented. The workaround requires generating perfect mazes then randomly removing walls to create loops. ROT.js dungeon algorithms (Digger, Uniform, Rogue) can create multiple routes by connecting rooms with guaranteed paths, offering an alternative approach. Documentation quality is excellent with an interactive manual at ondras.github.io/rot.js/manual/ and active community tutorials. Bundle size remains reasonable with modular structure allowing tree-shaking, and performance proves fast enough for real-time generation. However, ROT.js lacks native circular or polar maze support, focusing exclusively on rectangular grids (though it supports hexagonal topology in pathfinding with topology parameters 4/6/8).

**@sbj42/maze-generator provides focused maze generation** through a clean plugin architecture. Published as separate npm packages for each algorithm, it offers three primary options: recursive backtracking (100% speed baseline, 10% dead ends, 9.9% branches, long winding passages), Prim's algorithm (58% speed, 35.6% dead ends, 29.4% branches, more shorter dead ends), and Kruskal's algorithm (50% speed, 30.6% dead ends, 26.5% branches, balanced branching). The library includes statistical data comparing algorithm characteristics on 100×100 mazes.

Like ROT.js, @sbj42/maze-generator generates only perfect mazes but supports GridMask for custom shapes within rectangular bounds. The modular design allows importing only needed algorithms for lightweight bundles. API design is clean with straightforward cell access—each cell provides north(), east(), south(), west() methods returning true for passages or false for walls. Documentation includes clear README files with algorithm comparisons. The main drawback is requiring separate npm installs for each algorithm plugin and no circular/polar maze support.

**codebox/mazes stands out for circular maze support**, offering the only JavaScript implementation with native polar coordinate handling. Based on Jamis Buck's book "Mazes for Programmers," it provides 10 different algorithms across four grid types: square, triangular, hexagonal, and **circular/polar grids**. The online demo at codebox.net/pages/maze-generator/online provides excellent visualization with interactive algorithm animations, distance map coloring, built-in maze solving with optimality scoring, and SVG export functionality with or without solutions.

While not packaged as an npm module (requiring GitHub clone with submodules), codebox/mazes serves as an invaluable reference implementation and can be adapted for your project. All algorithms create perfect mazes but support masks for custom shapes. The interactive demo allows seed-based generation for reproducibility and adjustable animation speeds for understanding algorithm behavior. For circular maze rendering specifically, this represents the gold standard JavaScript implementation.

Three simpler libraries round out the options. **generate-maze** implements Eller's algorithm exclusively, providing lightweight single-algorithm functionality with seed support for reproducibility. Published 4 years ago with minimal updates, it handles width/height parameters and optionally opens maze edges. **maze-generation** offers two algorithms (Depth First and Hunt-and-Kill) with built-in solution generation and ASCII visualization through toString() methods. It includes path finding from start to goal with arrow-based visual solutions and JSON export. Both were last updated 4 years ago but remain functional for basic needs.

**For your endless maze game, use ROT.js or @sbj42/maze-generator with custom braiding post-processing**. ROT.js provides the better choice if you want a full roguelike toolkit with pathfinding and FOV, while @sbj42/maze-generator offers cleaner separation if you only need maze generation. Neither supports non-perfect mazes natively, requiring you to implement the braiding algorithms detailed earlier. For circular maze levels, adapt techniques from codebox/mazes or implement polar coordinate systems from scratch using the patterns detailed in later sections.

## Mobile-first rendering, controls, and performance optimization

Canvas API dramatically outperforms SVG for maze games through direct pixel manipulation versus expensive DOM updates. Canvas handles 10,000+ objects at 60fps while SVG performance degrades linearly with element count. On mobile Android devices (the primary bottleneck), Canvas provides excellent animation smoothness at 60fps with lower CPU usage and better battery efficiency. Canvas performance degrades with canvas *size* rather than object count, making it ideal for maze rendering where you'll draw hundreds of wall segments. SVG creates each wall as a separate DOM element, causing rendering overhead. The main trade-off: Canvas requires manual accessibility implementation while SVG provides built-in DOM accessibility.

For maze rendering specifically, Canvas allows drawing all walls in one batch operation using beginPath(), multiple rect() calls, and a single fill(). Individual player dots and goal markers render efficiently with arc() calls. Responsive canvas sizing requires accounting for device pixel ratio to prevent blurriness on high-DPI displays. The implementation pattern multiplies canvas dimensions by window.devicePixelRatio then scales the context accordingly. Consider SVG only for static maze layouts that don't change, minimal animations under 5 moving objects, or educational games where DOM inspection adds value.

**Drag-to-move controls provide the superior navigation method** over swipe or tap-to-move for maze games. Dragging offers continuous, precise control for navigating tight corridors, allows variable speed control based on drag distance, and feels natural for guiding a dot through complex paths. It prevents accidental double-taps that could skip positions. The implementation requires touch event listeners with preventDefault() to stop scrolling and extracting clientX/clientY coordinates relative to canvas bounding rectangles.

Preventing unwanted scrolling and zooming requires aggressive handling. The simplest approach uses CSS `touch-action: none` on the canvas element to prevent all default touch behaviors. JavaScript-based prevention requires setting `{passive: false}` on touchmove listeners to allow preventDefault() execution—passive listeners cannot call preventDefault(). Selective prevention allows vertical scrolling outside the game area by tracking whether touches begin inside the canvas. Additional gesturestart event listeners prevent pinch-zoom gestures.

Touch control best practices include 44×44 pixel minimum touch targets for buttons (Apple Human Interface Guidelines standard), immediate visual feedback on touches through highlight or ripple effects, small buffer zones around maze walls to forgive imprecise touches, velocity dampening that smooths movement by interpolating between touch positions, and explicit decisions about multi-touch support (most maze games disable it). The complete touch handling pattern:

```javascript
canvas.style.touchAction = 'none';
let touchActive = false;

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  touchActive = true;
  updatePlayerPosition(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (touchActive) updatePlayerPosition(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchend', () => {
  touchActive = false;
});

function updatePlayerPosition(touch) {
  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  // Apply collision detection before moving
}
```

Mobile optimization requires targeting 30fps instead of 60fps on lower-end devices for achievable performance. Implement adaptive FPS that reduces visual effects when measured framerate drops below 25fps—disable particles, reduce shadows, and lower target framerate. Battery and memory considerations demand object pooling to minimize garbage collection by reusing particle and entity objects rather than creating new ones each frame. Clean up on level transitions by clearing large arrays and explicitly resetting pooled objects.

Screen size adaptation detects device type through navigator.userAgent matching and window.innerWidth thresholds. Scale UI elements—use 60px buttons and 18px fonts on mobile versus 40px/14px on desktop. Larger touch targets compensate for finger imprecision. The viewport meta tag must include `maximum-scale=1.0, user-scalable=no` to prevent zoom gestures. Chrome DevTools mobile testing with CPU throttling (6x slowdown setting) simulates older Android device performance.

**Frame rate management using fixed timestep ensures consistent gameplay** across devices. The pattern accumulates delta time between frames, performs multiple fixed-time updates when accumulated time exceeds the timestep, and renders as fast as possible with interpolation. This decouples simulation updates from rendering framerate, preventing physics bugs on different speed devices. Include panic checking to prevent "spiral of death" where updates fall behind—if update count exceeds 240 iterations, discard unsimulated time and reset.

Endless progression systems track current level, score, high score, lives, difficulty parameters, and player state. State management follows observer patterns where components subscribe to specific state changes and receive notifications when those values update. Level transition effects use fade-out callbacks that regenerate mazes, then fade-in new content. Simple transitions work better on mobile than complex morphing. Progressive difficulty scales maze dimensions logarithmically (10×10 starting to 100×100+ at expert levels), increases enemy count and speed linearly, and decreases time limits gradually. Composite difficulty formulas weight multiple factors: maze size (30% weight), solution length percentage (20%), braid percentage (25%), junction count (15%), and average corridor length (10%).

## Implementing circular and polar coordinate maze layouts

Circular mazes (theta mazes) use polar coordinates where the traditional x-axis becomes angle (0° to 360°) and y-axis becomes distance from center. Cells are wedge-shaped with each "ring" divided into sectors. The fundamental insight: **all standard maze algorithms work on polar mazes because they operate on graph structures, not coordinate systems**. Algorithms don't care about geometry—only cell connections. Recursive Backtracker, Prim's, Kruskal's, Eller's, and Growing Tree all adapt perfectly by treating wedge cells as nodes.

Store neighbor references directly in each cell rather than relying on coordinate math. Each cell maintains its own list of adjacent cells, and cells can have variable numbers of neighbors (not just four). The four neighbor types in polar coordinates: inward to cell(s) in inner ring (may map to 1 cell), outward to cell(s) in outer ring (may map to 2+ cells due to subdivision), clockwise to adjacent cell in same ring, and counter-clockwise to adjacent cell in same ring.

Ring-based organization starts with a center cell (ring 0), then ring 1 with N cells calculated for uniform size, ring 2 with approximately 2N cells, ring 3 with roughly 3N cells, continuing outward. **Outer rings need more cells than inner rings to maintain consistent cell sizes** because circumference increases with radius. The cell subdivision logic calculates desired cell width based on inner radius, determines cell count per ring as (2π × radius) / desired_width, and subdivides cells when they become too wide relative to height. Cells in outer rings may connect to multiple cells in adjacent inner rings.

The formula for cells per ring prevents excessive width: `Math.max(1, Math.round((2 * Math.PI * radius) / desiredCellWidth))` where radius equals ringIndex × baseRingHeight and desiredCellWidth typically matches baseRingHeight for roughly square cells. Dynamic calculation means ring 1 might have 6 cells, ring 2 has 12 cells, ring 3 has 18 cells, etc.

Polar to Cartesian coordinate conversion for rendering: `x = r × cos(θ)` and `y = r × sin(θ)` where r represents radius (distance from origin) and theta is the angle in radians. Reverse conversion from Cartesian to polar: `r = sqrt(x² + y²)` and `theta = atan2(y, x)` which returns angle in radians handling all quadrants correctly (unlike atan which only works for the first quadrant).

Canvas rendering of wedge-shaped cells uses arc() commands for curved edges. Draw the inner arc from thetaStart to thetaEnd, lineTo() the outer radius point, draw the outer arc backwards (reverse direction flag), then closePath() back to the start. Only draw walls where passages don't exist—check cell connection data before rendering each wall segment. Handle variable cell widths by using small line widths at narrow centers (or skip the center point entirely) and allowing naturally wider cells at edges where subdivision prevents excessive width. Maintain consistent stroke width across all radii for visual uniformity.

SVG rendering requires path commands with arc segments. The createArcPath function converts angles to radians, calculates start and end points in Cartesian coordinates, and builds path data with move, arc, and line commands. SVG arcs cannot draw complete 360° circles in one command—split into two 180° arcs or use the circle element instead. For full wedge cells, construct paths combining straight radial lines with arc segments forming the cell boundaries.

**Handle the center point problem** where the innermost cell has zero width at the exact center. Solutions include leaving the center empty by starting the first ring at small radius (10% of total), creating a single circular center cell connecting to all cells in the first ring, or building a tight inner ring with few cells (4-8) that subdivides outward. The third approach balances aesthetic appeal with functional connectivity.

Neighbor mapping across rings handles one-to-many relationships. When connecting rings, each outer cell maps inward to exactly one inner cell while inner cells maintain arrays of outward connections to potentially multiple outer cells. Calculate the mapping: `const ratio = outerCell.sector / cellsInOuterRing` then `const innerSector = Math.floor(ratio × cellsInInnerRing)`. This ensures proper graph connectivity for maze algorithms despite geometric complexity.

**Transitioning between square and circular layouts requires regeneration rather than transformation**. Save game state (player position as percentage completion, score, inventory), generate the new circular maze with appropriate difficulty parameters, and map player position by converting relative coordinates (x/width, y/height) to new ring and sector positions. Visual transitions can fade out the old maze while fading in the new, optionally applying radial distortion effects to the square maze and scaling animation to the circular maze for smoother perception.

The complete implementation structure follows this pattern:

```javascript
class CircularGrid {
  constructor(ringCount, centerRadius = 20) {
    this.rings = [];
    for (let r = 0; r < ringCount; r++) {
      const cellCount = this.calculateCellsInRing(r);
      const ring = [];
      for (let s = 0; s < cellCount; s++) {
        ring.push(new CircularCell(r, s));
      }
      this.rings.push(ring);
    }
    this.linkNeighbors();
  }
  
  calculateCellsInRing(ringIndex) {
    if (ringIndex === 0) return 1;
    return Math.round(ringIndex * 6); // Or other formula
  }
  
  linkNeighbors() {
    // Link cells within rings (clockwise/counter-clockwise)
    // Link cells between rings (inward/outward)
  }
}
```

Apply standard algorithms unchanged once the grid structure exists—Recursive Backtracker, Prim's, and Kruskal's work identically on circular grids because they treat cells as graph nodes. The maze generation algorithms detailed earlier apply without modification. Rendering converts polar coordinates to Cartesian for Canvas drawing, using the center of the canvas as origin and calculating maxRadius as the minimum of centerX and centerY times 0.9 for margins.

## Optimal project structure and Claude Code integration

Claude Code excels at iterative development when given clear targets like visual mocks, test cases, or output specifications. Test-driven development produces the best results—Claude automatically iterates until all tests pass. The agent mode handles multi-step tasks independently with minimal human intervention, can agentically search codebases for context-aware recommendations, and performs file operations autonomously. However, running the same prompt multiple times produces different implementations with varying quality, scope creep adds features beyond requirements, one-shot generation isn't reliable for complete applications, and code quality varies between runs.

**CLAUDE.md files prove critical for game development success**. Create comprehensive configuration documenting bash commands (npm run dev, npm test, npm build), code style requirements (ES6 modules, separate game logic from rendering, centralized state management, comment complex algorithms), project structure (directories for game core, entities, systems, assets), and game-specific guidelines (frame rate targets, requestAnimationFrame usage, separate update/render methods, state management patterns). This configuration eliminates 90% of permission dialogs by allowing Edit, Bash(git commit:*), Bash(npm:*), and Bash(node:*) in tool allowlists.

The recommended workflow follows "Explore → Plan → Code → Commit" patterns. Ask Claude to read relevant game files first without coding, request detailed plans using "think hard" for complex features, implement solutions with verification, then commit with descriptive messages. Test-driven approaches work ideally for game mechanics by writing tests for collision, scoring, and movement, running tests to confirm they fail, having Claude implement code to pass tests, and iterating until all tests pass. Visual iteration produces significantly better results for UI and rendering—provide screenshots or design mocks, have Claude implement and screenshot results, then refine through 2-3 iterations.

Effective prompting requires specificity. Poor prompts like "add player movement" produce inconsistent results. Good prompts detail implementation: "implement WASD player movement with collision detection against walls. Movement speed should be 5 pixels per frame. Player should stop when hitting walls marked as type 1 in the map array." Break complex features into discrete tasks rather than requesting "create an endless maze game" all at once. Build incrementally: maze generation using ROT.js with configurable size, player entity with keyboard controls, collision detection with maze walls, scoring system for completion, and level progression with difficulty scaling.

**The optimal file structure for maze games separates concerns clearly**. At the project root: index.html, package.json, and CLAUDE.md. Under css/: style.css for game styling. The js/ directory contains main.js as the entry point, then subdirectories for core/ (Game.js orchestrator, GameLoop.js with requestAnimationFrame, StateManager.js for game state, SceneManager.js for transitions), systems/ (RenderSystem.js for Canvas, InputSystem.js for controls, CollisionSystem.js, ScoreSystem.js), entities/ (Player.js, Entity.js base class, Item.js collectibles), world/ (MazeGenerator.js wrapping ROT.js, Level.js data structure, TileMap.js for cells), and utils/ (constants.js, helpers.js, storage.js for LocalStorage).

Use ES6 modules throughout with import/export syntax. The Game class in core/Game.js acts as the main orchestrator, instantiating canvas context, state manager, game loop, and input system. Separation of concerns keeps rendering logic in RenderSystem classes, game logic in Entity update() methods, and never mixes state updates with rendering. The fixed timestep game loop pattern accumulates delta time, performs multiple fixed-time updates when accumulated time exceeds the timestep, renders as fast as possible with interpolation, and includes panic checking to prevent spiral of death scenarios.

ROT.js integration requires `npm install rot-js` then wrapping in a MazeGenerator class that accepts algorithm parameters (eller, cellular, digger), stores map data with 'x,y' string keys, provides isWall(x,y) and getWalkablePositions() helpers, and returns data structures for rendering. The key algorithms: EllerMaze for perfect mazes with minimal memory, IceyMaze for configurable regularity, DividedMaze for recursive division, Cellular for cave-like organic structures, and Digger for dungeon rooms with corridors. Remember all ROT.js algorithms create perfect mazes—implement braiding post-processing as detailed earlier.

State management centralizes game data through a StateManager class tracking currentLevel, score, highScore, lives, difficulty, playerPosition, inventory, completedLevels, totalPlayTime, and settings. Implement observer patterns where components subscribe to specific state keys and receive callbacks when those values change. Notify listeners only when values actually change to prevent unnecessary updates. LocalStorage integration requires a GameStorage wrapper handling save/load with version numbers for migration support, JSON serialization with error handling for quota exceeded errors, and timestamp tracking for auto-save debouncing.

Auto-save implementation saves on state changes with 5-second debouncing, performs periodic saves every 30 seconds, and saves on beforeunload events. Prevent save spamming by tracking lastSaveTime and refusing saves within 1-second windows. Difficulty scaling for endless progression calculates parameters logarithmically: `scale = Math.log(level + 1) × 0.5` then applies to maze size (base × (1 + scale × 0.2)), enemy count (base × (1 + scale)), item spawn rate (base × (1 - scale × 0.1)), and time limit (base × (1 - scale × 0.05)). This logarithmic approach prevents linear runaway difficulty while maintaining meaningful progression.

**Working effectively with Claude Code requires specific patterns**. Design architecture before prompting—map modules, data flow, and component responsibilities before generating code. Claude works best solving discrete tasks within clear architecture while you maintain control ensuring coherent design. Iterate in small chunks, building piece by piece and validating each part to catch mistakes early. Leverage Claude's strengths for algorithm implementation (pathfinding, collision, maze generation), boilerplate generation (entity classes, system scaffolding), refactoring code into better patterns, and documentation with inline comments and README files.

Maintain human oversight by reviewing all AI-generated game logic for correctness, testing game balance and feel manually (AI cannot judge "fun"), and fixing edge cases based on playtesting. Use parallel development with multiple terminal windows running separate Claude sessions working on independent systems simultaneously—player mechanics in one terminal, UI in another, maze generation in a third. This significantly accelerates game creation through concurrent development.

Course correction tools include Escape key to interrupt Claude mid-execution for redirection, Double Escape to jump back in history and edit prompts for different approaches, /clear command to reset context between major feature implementations, and always requesting plans before coding complex features. Document critical rules in CLAUDE.md: "NEVER mix game state updates with rendering," "ALWAYS validate player input bounds," "Maze coordinates are 0-indexed," "Frame delta time is in milliseconds."

## Progressive difficulty implementation and algorithm selection

Difficulty progression scales across three primary dimensions: maze size from small to large grids, algorithm selection from biased to complex, and structural parameters including braiding percentage. Size scaling begins with 10×10 to 20×20 cells for beginners, progresses through 30×30 to 50×50 for intermediate players, reaches 60×60 to 100×100 for advanced levels, and extends to 100×100+ for expert challenges. Larger mazes exponentially increase solution search space, but size alone doesn't create engaging difficulty—combine with algorithmic complexity.

**Algorithm progression creates distinct difficulty personalities**. Levels 1-3 use Binary Tree and Sidewinder with predictable bias allowing players to learn patterns, obvious solution paths, and fast solving. Levels 4-6 introduce Prim's, Kruskal's, and Eller's with more branches creating more decisions, shorter solution paths paradoxically harder due to more options, and no obvious bias preventing pattern exploitation. Levels 7-9 deploy Recursive Backtracker and Hunt-and-Kill featuring long winding passages, less obvious dead ends, and higher solution path percentages increasing backtracking. Levels 10+ rotate through Growing Tree with mixed strategies and braided mazes providing multiple solution paths where strategic choices matter and loops allow circling back.

The tier-based progression system implements: **Tier 1 (Levels 1-10) Learning Phase** using Binary Tree transitioning to Sidewinder, 15×15 to 25×25 size, 0% braiding, chosen because predictable patterns help players learn mechanics. **Tier 2 (Levels 11-25) Skill Building** using Prim's Modified or Kruskal's, 25×25 to 40×40 size, 0-10% braiding, providing true branching without bias and multiple short paths. **Tier 3 (Levels 26-50) Challenge** using Hunt-and-Kill or Growing Tree (50% newest, 50% random), 40×40 to 60×60 size, 10-25% braiding, creating balanced corridors and branches with harder navigation. **Tier 4 (Levels 51-100) Expert** using Growing Tree mixed strategies or Wilson's, 60×60 to 80×80 size, 25-50% braiding, generating complex decision trees where loops make tracking difficult. **Tier 5 (Levels 101+) Master** rotating between all algorithms, 80×80 to 100×100+ size, 50-100% braiding with sparse maze passes removing unnecessary corridors, preventing players from relying on pattern recognition through maximum variety.

Structural parameter tuning adjusts braiding percentage from 0% to 100% as difficulty increases—more loops make it harder to know if you're going in circles. Room density for dungeon-style mazes uses sparse rooms (10-20% coverage) for harder navigation without landmarks versus dense rooms (40-50% coverage) providing easier landmarks. Dead end removal affects sparseness where more dead ends create easier gameplay with clear wrong paths while fewer dead ends make all paths look promising. Corridor length varies—short corridors like Prim's create more decisions while long corridors like DFS produce fewer decision points but longer backtracking. Connection density scales from spanning tree only (perfect mazes, easiest navigation) to extra connections added (multiple paths, harder).

The composite difficulty formula weights multiple factors: `Difficulty Score = (Maze_Size × 0.3) + (Solution_Length_% × 0.2) + (Braid_% × 0.25) + (Num_Junctions × 0.15) + (Avg_Corridor_Length × 0.1)`. Tune progression by keeping all factors low for early levels, increasing size and junctions for mid levels, and adding braiding with increased solution complexity for late levels.

**Hybrid "Rooms and Mazes" approach from Bob Nystrom** creates the most engaging dungeons. Place random non-overlapping rooms (varies by level), fill remaining areas with maze algorithm (choose by tier), connect regions with spanning tree plus extra connections, apply sparseness pass to remove dead ends, and add braid percentage based on level. Progressive parameters: Levels 1-10 use 40% rooms with Prim's maze and 0% extra connections; Levels 11-30 use 30% rooms with Kruskal's and 5% extra; Levels 31-60 use 20% rooms with Hunt-and-Kill and 10% extra; Levels 61-100 use 15% rooms with Growing Tree and 15-25% extra; Levels 101+ use 10% rooms rotating algorithms with 25-50% extra connections.

Algorithm-specific tuning optimizes generation. For Prim's Modified, use random frontier selection with expansion_rate 0.7 where lower values create more uniform spread. For Growing Tree, blend selection strategies: 30% newest for some long corridors, 50% random for lots of branches, 20% oldest to fill gaps. For Hunt-and-Kill, trigger hunt_frequency on_stuck versus periodic for more branches, and use random_scan versus row_scan patterns. For braiding, progress from 0% to 75%, prefer removing longer dead ends first, and use connector_probability scaling from 2% to 10% for loop addition.

## Critical implementation insights and next steps

The convergence of research reveals several non-obvious insights critical for success. **No JavaScript library generates non-perfect mazes natively**—you must implement braiding algorithms regardless of your chosen library. This proves advantageous because it provides complete control over difficulty progression through adjustable loop density. ROT.js and @sbj42/maze-generator tie as top library choices with ROT.js winning for full roguelike features and @sbj42 winning for focused maze generation with cleaner APIs.

Canvas API's performance advantage on mobile devices isn't marginal—it's dramatic. DOM manipulation overhead makes SVG 2-3x slower for the same maze rendering, with the gap widening as maze complexity increases. The 30fps mobile target isn't a compromise but a realistic optimization allowing consistent performance across device tiers. Touch control implementation must aggressively prevent default behaviors using both CSS touch-action and JavaScript passive:false listeners—half-measures create frustrating scrolling glitches that ruin gameplay.

Circular maze implementation requires no special algorithms—only geometric adaptation. The identical graph algorithms work perfectly once you build proper ring-based neighbor connections. However, circular mazes significantly increase implementation complexity and codebox/mazes provides the only production-ready reference. Consider introducing circular mazes at higher difficulty tiers (levels 50+) where novelty provides appropriate challenge rather than overwhelming new players.

**Start with this minimum viable product approach**: Initialize project structure with Vite, ES6 modules, and ROT.js dependency. Implement Game class, fixed timestep GameLoop, and basic Canvas RenderSystem. Create MazeGenerator wrapping ROT.js EllerMaze with configurable width/height. Build Player entity with WASD keyboard movement and simple rectangle-based collision detection against maze walls. Add StateManager tracking currentLevel and score with LocalStorage persistence. Implement level completion detection when player reaches designated exit cell. Create level progression that increases maze size by 5 cells per dimension every 5 levels.

Once the MVP functions, add progressive features in this order: implement braiding algorithm with percentage scaling from 0% at level 1 to 50% at level 50, add touch controls with drag-to-move functionality and scroll prevention, create StateManager observer patterns for UI updates, implement difficulty scaling using the tier system with algorithm rotation, build transition effects between levels using fade or slide animations, optimize rendering with object pooling and adaptive FPS, add circular maze support for variety starting at level 50, and create menu screens with high score tracking and continue game functionality.

Claude Code integration throughout development uses test-driven workflows for game mechanics, visual iteration for UI polish, and incremental feature addition with frequent commits. Break each feature into specific prompts: "Implement collision detection that prevents player movement into cells where maze.isWall(x, y) returns true. Player should stop at wall boundaries without passing through. Test with multiple wall configurations." Provide visual feedback through screenshots when iterating on rendering. Use parallel Claude sessions for systems that don't interdepend—one implementing scoring while another builds the maze generator.

**The game design succeeds or fails on algorithm selection and braiding implementation**. Players quickly recognize patterns in biased algorithms like Binary Tree, exploit river-style corridors in Recursive Backtracker, and memorize branching patterns in unvarying Prim's mazes. Rotating algorithms every 10-15 levels prevents pattern recognition. Progressive braiding from 0% to 75% creates the difficulty curve—perfect mazes at low levels allow learning fundamentals, light braiding (10-25%) introduces strategic decisions, and heavy braiding (50%+) at expert levels creates true labyrinth complexity where all paths look viable.

The technical implementation proves straightforward given the research—Canvas rendering, drag-to-move touch controls, ROT.js generation with braiding post-processing, and fixed timestep game loops represent solved problems with clear implementation patterns. The challenge lies in game design: balancing maze size increases against braiding percentages, choosing when to switch algorithms, deciding circular maze introduction timing, and tuning the difficulty formula weights. Extensive playtesting across device types (high-end iPhone, mid-range Android, older tablets) ensures performance targets meet reality.

Build your endless progressive-difficulty maze game by starting with the project structure detailed in Section 6, implementing ROT.js integration from Section 3, adding braiding algorithms from Section 2, and following the progressive difficulty system from Section 7. Claude Code accelerates development when you provide clear architectural direction, break features into testable units, and iterate visually on rendering. The combination of Prim's branching characteristics, progressive braiding to 75%, Canvas rendering, drag-to-move controls, and logarithmic difficulty scaling creates engaging endless gameplay that scales from 15×15 beginner mazes to 100×100+ expert labyrinths.