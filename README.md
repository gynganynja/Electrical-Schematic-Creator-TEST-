# Circuit Generator

An interactive automotive electrical schematic editor with a live circuit simulator. Draw a circuit from
~60 automotive components — batteries, fuses, relays, switches, loads, sensors, gauges, ECUs and CAN
networks — then press **Run** and watch it work: wires colour by voltage, lamps light, relays click, fuses
blow, and ECUs execute their logic and exchange CAN frames.

Runs in the browser, and as an Android/iOS app via Capacitor (see [MOBILE_SETUP.md](MOBILE_SETUP.md)).

## Getting started

```bash
npm install
npm run dev        # opens http://localhost:5173
```

On Windows you can also double-click `Start Circuit Generator.bat`.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm test` | Simulator test suite (Vitest) |
| `npm run lint` | ESLint |

## Using it

- **Add components** by dragging them from the palette, or click one to drop it in the middle of the view.
  The search box filters the palette. On phones, tap **+**.
- **Wire** by dragging from one handle to another. Select a wire to set its colour and gauge.
- **Run / Step / Reset** control the simulation. Reset restores fuses, breakers and relays but keeps your
  switch positions and sensor readings.
- **Inspector** (right) edits the selected component's parameters and shows its live state.
- **Examples** at the bottom of the palette load complete circuits, from a basic lamp to a BCM/PCM CAN network.
- Your work **autosaves** in the browser and is restored on reload. **Save/Load** exchange `.json` project
  files; **Export PDF** prints the canvas (one page per Schematic Frame).

| Shortcut | Action |
|---|---|
| Ctrl+Z / Ctrl+Y (Ctrl+Shift+Z) | Undo / redo |
| Ctrl+C / Ctrl+V | Copy / paste selected components (with the wires between them) |
| Ctrl+D | Duplicate selection |
| Ctrl+A | Select all |
| Delete / Backspace | Delete selection |

[CIRCUIT_GUIDE.md](CIRCUIT_GUIDE.md) documents every component, its handles and parameters, the ECU rule
blocks, CAN networking, and common circuit patterns.

## How the simulator works

`src/simulation/solver.ts` performs DC **Modified Nodal Analysis** every 200 ms tick:

1. Wires, splices, net labels and harness entry/exit pairs are merged into electrical nets (union-find).
2. Each component is stamped as resistors and voltage sources — a closed contact is 1 mΩ, an open one 1 GΩ.
3. The linear system is solved by Gaussian elimination with partial pivoting.
4. Stateful parts — relay coils (with pull-in/release hysteresis), fuses, breakers, diode junctions, ECU
   rules, sensor supplies — are re-evaluated against the solution, and the netlist is re-solved until nothing
   changes (max 20 iterations; relays that would oscillate are latched).

Notable models:

- **Diodes, LEDs, zeners and TVS clamps** are piecewise-linear: blocking, forward (Vf + series R), or reverse
  breakdown (zener/TVS).
- **Delay relays** and **auto-reset breakers** use real elapsed time.
- **Sensors** output 0 V unless their reference supply is present.
- **Advanced ECUs** run a block-based rule engine (`src/simulation/ecu/LogicRuntime.ts`) and talk over CAN via
  a J1939-aware scheduler (`src/simulation/can/`).

Capacitors are open and inductors are their DC resistance — this is a steady-state DC simulator, not a
transient (SPICE) one.

## Project layout

```
src/
  App.tsx                 simulation loop, CAN/ECU orchestration, file actions
  store/useStore.ts       circuit state (zustand), undo/redo, clipboard
  simulation/             MNA solver (+ tests), ECU logic runtime, CAN scheduler
  components/             canvas, palette, toolbar, inspector, console
  components/nodes/       one React component per circuit part
  examples/circuits.ts    built-in example projects
  utils/                  component defaults, autosave, auto-layout, PDF export
Saved/                    example project files
```
