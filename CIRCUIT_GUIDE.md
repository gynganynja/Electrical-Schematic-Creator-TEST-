# Circuit Generator — Master Guide

This guide covers every component in the application, how to wire them, how the simulation works, and best practices for clean, readable schematics.

---

## Table of Contents

1. [Core Concepts](#1-core-concepts)
2. [Power Sources & Ground](#2-power-sources--ground)
3. [Protection Components](#3-protection-components)
4. [Switches](#4-switches)
5. [Loads (Lamps, Motors, Buzzers, etc.)](#5-loads)
6. [Semiconductors (Diodes, LEDs, Zeners, TVS)](#6-semiconductors)
7. [Passive Components (Resistor, Capacitor, Inductor, Potentiometer)](#7-passive-components)
8. [Relays](#8-relays)
9. [Sensors](#9-sensors)
10. [Gauges](#10-gauges)
11. [ECU (Advanced)](#11-ecu-advanced)
12. [CAN Bus Network](#12-can-bus-network)
13. [Wiring Utilities (Splice, Net Label, Connector, Cable Resistance)](#13-wiring-utilities)
14. [Wiper Motor](#14-wiper-motor)
15. [Simulation Controls](#15-simulation-controls)
16. [Layout & Visual Best Practices](#16-layout--visual-best-practices)
17. [Common Circuit Patterns](#17-common-circuit-patterns)
18. [Troubleshooting](#18-troubleshooting)

---

## 1. Core Concepts

### How the Simulator Works

The simulator uses **Modified Nodal Analysis (MNA)** — the same mathematical technique used in SPICE. Every wire connection forms a **net** (a set of electrically connected points). The solver calculates the voltage at every net and the current through every component.

### Handles and Wiring

Every component has colored dots called **handles**. These are the connection points:

- **Red dots** = power input / positive terminal
- **Green dots** = ground
- **Slate/gray dots** = general-purpose terminal
- **Purple dots** = coil connections (relays)
- **Yellow/amber dots** = common/output (relays)
- **Blue dots** = normally-open contacts (relays)
- **Indigo dots** = CAN bus connections

To wire two components: **click and drag from one handle to another**. The wire will snap into place.

### Current Flow Convention

Current flows from **higher voltage to lower voltage**. In a typical automotive circuit:
- Battery positive (+12V) is at the top
- Loads are in the middle
- Ground (0V / chassis earth) is at the bottom

### Flipping Components

Every component supports **Flip X** and **Flip Y** in the Inspector panel. This mirrors the component and its handles, allowing you to orient components for cleaner wiring without crossing wires.

### Wire Colors

Wires are color-coded by voltage when the simulation is running. You can also manually set wire colors and gauge in the Inspector when a wire is selected.

---

## 2. Power Sources & Ground

### Battery

| Property | Details |
|----------|---------|
| **Type** | `battery` |
| **Handles** | `positive` (top, red), `negative` (bottom, dark) |
| **Parameters** | `voltage` — default 12V |
| **Size** | 132px wide |

The battery is the primary voltage source. It provides a constant DC voltage between its positive and negative terminals.

**How to use:**
1. Place the battery at the **top-left** of your schematic
2. Wire `positive` to your first fuse or master switch
3. Wire `negative` to a **Ground** node

**Inspector settings:** You can change the voltage (e.g., 24V for heavy equipment).

### Ground (N-EARTH)

| Property | Details |
|----------|---------|
| **Type** | `ground` |
| **Handles** | `gnd` (top, green) |
| **Size** | Small — ~40px wide |

The ground node defines the **0V reference** for the entire circuit. Without at least one ground node, the simulator cannot solve.

**How to use:**
1. Place ground nodes at the **bottom** of your schematic
2. Wire the `gnd` handle to any point that should be at chassis potential
3. Use **multiple ground nodes** connected to different parts of the circuit for cleaner layout — all grounds are electrically equivalent

**Critical rule:** Every circuit MUST have at least one ground node, and the battery negative MUST connect to ground (directly or through a master switch).

---

## 3. Protection Components

### Fuse

| Property | Details |
|----------|---------|
| **Type** | `fuse` |
| **Handles** | `in` (left, orange), `out` (right, orange) |
| **Parameters** | `tripCurrent` — amperage rating (default 15A) |
| **State** | `blown` — true when current exceeds rating |
| **Size** | 80px wide |

Fuses protect downstream circuits from overcurrent. When current exceeds the trip rating, the fuse **blows** (open circuit, shown in red). Blown fuses do not auto-reset — you must reset the simulation.

**How to use:**
1. Place between the power source and the load
2. Wire `in` to battery positive (or switched power)
3. Wire `out` to the load's power input
4. Set the `tripCurrent` in the Inspector to match the circuit's expected max current

### Fusible Link

| Property | Details |
|----------|---------|
| **Type** | `fusible_link` |
| **Handles** | `in` (left, red), `out` (right, red) |
| **Parameters** | `tripCurrent` — default 80A |
| **State** | `blown` |
| **Size** | 96px wide |

Higher-rated protection for main battery cables. Behaves like a fuse but with much higher current ratings.

**How to use:** Place directly after the battery positive terminal, before the main distribution point.

### Manual Reset Circuit Breaker

| Property | Details |
|----------|---------|
| **Type** | `breaker_manual` |
| **Handles** | `in` (left, amber), `out` (right, amber) |
| **Parameters** | `tripCurrent` — default 20A |
| **State** | `tripped` |
| **Size** | 96px wide |

Trips like a fuse when overcurrent occurs. Shows a **RESET** button when tripped — click to restore.

### Auto Reset Circuit Breaker

| Property | Details |
|----------|---------|
| **Type** | `breaker_auto` |
| **Handles** | `in` (left, amber), `out` (right, amber) |
| **Parameters** | `tripCurrent` — default 20A |
| **State** | `tripped` |
| **Size** | 96px wide |

Trips on overcurrent and automatically resets after a delay. No manual intervention needed.

---

## 4. Switches

All switches are **symmetrical** — the simulator treats both terminals equally regardless of which side power enters.

### SPST Switch (Toggle)

| Property | Details |
|----------|---------|
| **Type** | `switch_spst` |
| **Handles** | `in` (left, gray), `out` (right, gray) |
| **State** | `closed` — click the toggle icon to flip |
| **Size** | 80px wide |

Simple on/off switch. **Click the toggle icon** to open/close.

- **Closed** = 0.001 ohm (short circuit)
- **Open** = 1 gigaohm (open circuit)

### Momentary NO (Normally Open)

| Property | Details |
|----------|---------|
| **Type** | `switch_momentary_no` |
| **Handles** | `in` (left), `out` (right) |
| **State** | `closed` — click to press/release |
| **Size** | 96px wide |

Default state is **OPEN** (no current). Click to press (close). In the real world this would spring back open — in the simulator you click again to release.

**Use for:** Door switches, brake pedal switches, push buttons, momentary inputs to ECUs.

### Momentary NC (Normally Closed)

| Property | Details |
|----------|---------|
| **Type** | `switch_momentary_nc` |
| **Handles** | `in` (left), `out` (right) |
| **State** | `open` — click to press/release |
| **Size** | 96px wide |

Default state is **CLOSED** (current flows). Click to press (open). Opposite of NO.

**Use for:** Safety interlocks, seat switches, pressure switches that open on high pressure.

### Master / Battery Isolator

| Property | Details |
|----------|---------|
| **Type** | `switch_master` |
| **Handles** | `in` (left, red), `out` (right, red) |
| **State** | `closed` |
| **Size** | 112px wide |

Large prominent switch for disconnecting the entire battery bus. Shows green (CONNECTED) or red (ISOLATED) state prominently.

**How to use:** Place between battery positive and the main fuse panel/distribution.

### SPDT (Single Pole Double Throw)

| Property | Details |
|----------|---------|
| **Type** | `switch_spdt` |
| **Handles** | `com` (left, amber), `out_nc` (right top, green), `out_no` (right bottom, blue) |
| **State** | `position` — `'nc'` or `'no'` |
| **Size** | 112px wide |

A changeover switch. COM connects to either NC or NO position. Click the button to toggle.

- **NC position**: COM → out_nc connected, out_no disconnected
- **NO position**: COM → out_no connected, out_nc disconnected

**Use for:** Selecting between two circuits (e.g., high/low beam selector).

### DPDT (Double Pole Double Throw)

| Property | Details |
|----------|---------|
| **Type** | `switch_dpdt` |
| **Handles** | `in_a` (left top), `out_a_nc`, `out_a_no` (right top), `in_b` (left bottom), `out_b_nc`, `out_b_no` (right bottom) |
| **State** | `position` — `'nc'` or `'no'` |
| **Size** | 128px wide |

Two ganged changeover switches that flip together. Both poles switch simultaneously.

**Use for:** Motor polarity reversal (power windows), switching between two independent circuits simultaneously.

### Ignition Switch

| Property | Details |
|----------|---------|
| **Type** | `switch_ignition` |
| **Handles** | `batt` (left, red), `acc` (right top, amber), `ign` (right middle, green), `start` (right bottom, red) |
| **State** | `position` — `'off'`, `'acc'`, `'on'`, `'start'` |
| **Size** | 112px wide |

Multi-position rotary switch. Click to cycle through positions:

| Position | BATT→ACC | BATT→IGN | BATT→START |
|----------|----------|----------|------------|
| OFF      | No       | No       | No         |
| ACC      | Yes      | No       | No         |
| ON       | Yes      | Yes      | No         |
| START    | Yes      | Yes      | Yes        |

**How to use:**
1. Wire `batt` to the main (fused) battery positive
2. Wire `acc` to accessories (radio, power windows)
3. Wire `ign` to ignition-dependent circuits (fuel pump, ECU power)
4. Wire `start` to the starter motor relay coil

---

## 5. Loads

All loads have **in** (left, power input) and **out** (right, ground return) handles unless otherwise noted.

### Lamp

| Property | Details |
|----------|---------|
| **Type** | `lamp` |
| **Handles** | `in` (left), `out` (right) |
| **Parameters** | `resistance` — default 12 ohm |
| **State** | `on`, `brightness` (0–1) |
| **Size** | 64px round |

Incandescent bulb. Glows proportional to applied voltage. Shows brightness percentage when dimmed.

### Motor

| Property | Details |
|----------|---------|
| **Type** | `motor` |
| **Handles** | `in` (left, red), `out` (right, gray) |
| **Parameters** | `resistance` — default 2 ohm |
| **State** | `running`, `speedRatio` (0–1) |
| **Size** | 80px round |

DC motor with animated spinning indicator. Speed proportional to voltage.

### Buzzer / Horn

| Property | Details |
|----------|---------|
| **Type** | `buzzer` |
| **Handles** | `in` (left, red), `out` (right, gray) |
| **Parameters** | `resistance` — default 8 ohm |
| **State** | `on` |
| **Size** | 70×65px |

Audible alert component. Shows sound wave animation when active.

### Solenoid

| Property | Details |
|----------|---------|
| **Type** | `solenoid` |
| **Handles** | `in` (left, red), `out` (right, gray) |
| **Parameters** | `resistance` — default 5 ohm |
| **State** | `activated` |
| **Size** | 80×55px |

Electromagnetic actuator (door lock, valve, starter solenoid). Shows plunger animation when energized.

### Heater

| Property | Details |
|----------|---------|
| **Type** | `heater` |
| **Handles** | `in` (left, orange), `out` (right, orange) |
| **Parameters** | `resistance` — default 12 ohm |
| **State** | `on` |
| **Size** | 96px wide |

Heating element (seat heater, rear defroster grid). Flame icon glows when active.

### Compressor Clutch (A/C)

| Property | Details |
|----------|---------|
| **Type** | `compressor_clutch` |
| **Handles** | `in` (left, cyan), `out` (right, cyan) |
| **Parameters** | `resistance` — default 3 ohm |
| **State** | `activated` |
| **Size** | 96px wide |

Air conditioning compressor electromagnetic clutch.

---

## 6. Semiconductors

### Diode

| Property | Details |
|----------|---------|
| **Type** | `diode` |
| **Handles** | `anode` (left, red), `cathode` (right, gray) |
| **Size** | 60×50px |

Allows current flow **anode → cathode only**. Blocks reverse current.

- **Forward biased** (anode more positive): Very low resistance (0.01 ohm)
- **Reverse biased**: Very high resistance (1 gigaohm)

**Polarity matters!** The triangle points from anode to cathode. Current flows in the direction the triangle points.

**Use for:** Flyback protection across relay coils, blocking reverse battery, steering current in one direction.

### LED

| Property | Details |
|----------|---------|
| **Type** | `led` |
| **Handles** | `anode` (left, red), `cathode` (right, gray) |
| **Parameters** | `color` — LED color (default red) |
| **State** | `on` |
| **Size** | 60×60px |

Light-emitting diode. Same polarity rules as a diode. Glows with the configured color when forward biased.

**Important:** Always use a current-limiting resistor in series with an LED (typically 470–1000 ohm for 12V systems).

### Zener Diode

| Property | Details |
|----------|---------|
| **Type** | `zener` |
| **Handles** | `anode` (left, yellow), `cathode` (right, yellow) |
| **Parameters** | `breakdownVoltage` — default 5.1V |
| **Size** | 65×50px |

Conducts in reverse when voltage exceeds breakdown voltage. Used for voltage regulation and clamping.

**How to use:** Place cathode toward the higher-voltage side. The zener clamps at its breakdown voltage.

### TVS Clamp

| Property | Details |
|----------|---------|
| **Type** | `tvs_clamp` |
| **Handles** | `anode` (left, purple), `cathode` (right, purple) |
| **Parameters** | `clampVoltage` — default 36V |
| **Size** | 65×55px |

Transient Voltage Suppressor. Clamps voltage spikes above the threshold. Protects against load dump and inductive kickback.

---

## 7. Passive Components

### Resistor

| Property | Details |
|----------|---------|
| **Type** | `resistor` |
| **Handles** | `in` (left), `out` (right) |
| **Parameters** | `resistance` — in ohms (default 100) |
| **Size** | 80×56px |

Standard resistor. Symmetrical — current can flow either direction.

**Use for:** Current limiting (LED series resistor), pull-up/pull-down networks, voltage dividers.

### Capacitor

| Property | Details |
|----------|---------|
| **Type** | `capacitor` |
| **Handles** | `in` (left, cyan), `out` (right, cyan) |
| **Parameters** | `capacitance` — display string (default "100µF") |
| **Size** | 55×50px |

Note: The capacitor is primarily a visual/schematic component. The MNA solver treats it as a high-impedance element in DC steady-state.

### Inductor

| Property | Details |
|----------|---------|
| **Type** | `inductor` |
| **Handles** | `in` (left, violet), `out` (right, violet) |
| **Parameters** | `inductance` — display string (default "10mH") |
| **Size** | 65×40px |

Like the capacitor, primarily for schematic completeness. Treated as a low-impedance element in DC steady-state.

### Potentiometer

| Property | Details |
|----------|---------|
| **Type** | `potentiometer` |
| **Handles** | `a` (left, teal), `b` (right, teal), `wiper` (bottom, amber) |
| **Parameters** | `resistance` — total resistance (default 10000 ohm) |
| **State** | `position` — 0 to 100% (slider control) |
| **Size** | 112px wide |

Variable resistor with three terminals. The slider on the node adjusts the wiper position. Terminal A to wiper resistance = position%, wiper to B = (100-position)%.

**How to use:**
1. Wire `a` to voltage source
2. Wire `b` to ground
3. Wire `wiper` to wherever you need the divided voltage (e.g., ECU analog input)
4. Drag the slider to adjust

The wiper voltage is displayed on the node.

---

## 8. Relays

Relays are electromagnetic switches. Applying voltage across the **coil** causes the **contacts** to change position.

### Standard SPDT Relay (5-Pin)

| Property | Details |
|----------|---------|
| **Type** | `relay_spdt` |
| **Handles** | `coil_in` (86, bottom-left, purple), `coil_out` (85, bottom-right, purple), `com` (30, bottom-center, yellow), `no` (87, top, blue), `nc` (87a, right, gray) |
| **Parameters** | `coilResistance` — default 85 ohm |
| **State** | `energized` |
| **Size** | 120×164px |

Standard automotive 5-pin relay:
- **Pin 86** = coil_in (coil positive)
- **Pin 85** = coil_out (coil negative / ground)
- **Pin 30** = com (common — power input)
- **Pin 87** = no (normally open — output when energized)
- **Pin 87a** = nc (normally closed — output when de-energized)

**How to wire:**
1. Wire `coil_in` (86) to a switched +12V source
2. Wire `coil_out` (85) to ground
3. Wire `com` (30) to battery positive (through a fuse!)
4. Wire `no` (87) to your load's power input
5. Optionally wire `nc` (87a) to an alternate load

**When coil is de-energized:** COM connects to NC (87a)
**When coil is energized:** COM connects to NO (87)

### SPST Relay (4-Pin)

| Property | Details |
|----------|---------|
| **Type** | `relay_spst` |
| **Handles** | `coil_in` (86, bottom-left, purple), `coil_out` (85, bottom-right, purple), `in` (30, bottom-center, yellow), `no` (87, top, blue) |
| **Size** | 100×140px |

Simplified 4-pin relay. No NC contact — just open/closed.

**When de-energized:** Contact is OPEN
**When energized:** IN connects to NO

### Dual-87 Relay

| Property | Details |
|----------|---------|
| **Type** | `relay_dual87` |
| **Handles** | `coil_in` (86), `coil_out` (85), `com` (30), `no_a` (87a, top-left), `no_b` (87b, top-right) |
| **Size** | 120×164px |

When energized, COM connects to BOTH no_a and no_b simultaneously. Used to power two loads from one relay.

### Latching (Bistable) Relay

| Property | Details |
|----------|---------|
| **Type** | `relay_latching` |
| **Handles** | `set_in` (left top, green), `set_out` (left bottom, green), `reset_in` (right top, red), `reset_out` (right bottom, red), `com` (bottom, yellow), `no` (top, blue) |
| **Size** | 120×164px |

Has two separate coils — SET and RESET. A pulse on the SET coil latches the relay ON. A pulse on the RESET coil latches it OFF. State persists without continuous power.

**How to wire:**
1. Wire `set_in` to the SET signal, `set_out` to ground
2. Wire `reset_in` to the RESET signal, `reset_out` to ground
3. Wire `com` to power, `no` to load

### Delay-On Relay

| Property | Details |
|----------|---------|
| **Type** | `relay_delay_on` |
| **Handles** | Same as SPDT: `coil_in`, `coil_out`, `com`, `no`, `nc` |
| **Parameters** | `delayMs` — delay in milliseconds (default 2000) |
| **Size** | 120×164px |

Standard SPDT relay with a time delay before energizing. When coil power is applied, the relay waits `delayMs` before switching contacts.

### Delay-Off Relay

| Property | Details |
|----------|---------|
| **Type** | `relay_delay_off` |
| **Handles** | Same as SPDT: `coil_in`, `coil_out`, `com`, `no`, `nc` |
| **Parameters** | `delayMs` — delay in milliseconds (default 5000) |
| **Size** | 120×164px |

Standard SPDT relay that stays energized for `delayMs` after coil power is removed. Useful for courtesy lights, cooldown timers.

---

## 9. Sensors

Sensors are interactive components with sliders. They output a voltage proportional to the measured value. All 2-pin sensors have `in` (left, power) and `out` (right, signal output).

### Temperature Sensor

| Property | Details |
|----------|---------|
| **Type** | `temp_sensor` |
| **Handles** | `in` (left, red), `out` (right, orange) |
| **Parameters** | `minVal` (-40°C), `maxVal` (150°C), `vMin` (0.5V), `vMax` (4.5V) |
| **State** | `temperature` — adjustable via slider |
| **Size** | 112px wide |

Outputs a linear voltage from vMin to vMax based on temperature. Drag the slider to simulate temperature changes.

### Oil Pressure Sensor

| Property | Details |
|----------|---------|
| **Type** | `oil_press_sensor` |
| **Handles** | `in` (left, red), `out` (right, amber) |
| **Parameters** | `maxVal` (100 PSI), `vMin` (0.5V), `vMax` (4.5V) |
| **State** | `pressure` — adjustable via slider |
| **Size** | 112px wide |

### Air Pressure Sensor

| Property | Details |
|----------|---------|
| **Type** | `air_press_sensor` |
| **Handles** | `in` (left, red), `out` (right, teal) |
| **Parameters** | `maxVal` (150 PSI), `vMin` (0.5V), `vMax` (4.5V) |
| **State** | `pressure` — adjustable via slider |
| **Size** | 112px wide |

### MAF Sensor (Mass Air Flow)

| Property | Details |
|----------|---------|
| **Type** | `maf_sensor` |
| **Handles** | `vcc` (top, red), `gnd` (bottom, green), `out` (right, purple) |
| **Parameters** | `maxVal` (500 g/s), `vMin` (1.0V), `vMax` (5.0V) |
| **State** | `flow` — adjustable via slider |
| **Size** | 112px wide |

Three-wire sensor — requires both VCC and GND connections in addition to the signal output.

### Wheel Speed Sensor (WSS)

| Property | Details |
|----------|---------|
| **Type** | `wss_sensor` |
| **Handles** | `in` (left), `out` (right) |
| **State** | `speed` — adjustable via slider |

### RPM Sensor

| Property | Details |
|----------|---------|
| **Type** | `rpm_sensor` |
| **Handles** | `in` (left), `out` (right) |
| **State** | `rpm` — adjustable via slider |

---

## 10. Gauges

### Speedometer Gauge

| Property | Details |
|----------|---------|
| **Type** | `speedo_gauge` |
| **Handles** | `in` (bottom, blue — signal input), `gnd` (top, green — optional) |
| **Parameters** | `maxVal` (240), `vMin` (0.5V), `vMax` (4.5V), `warnVal` |
| **Size** | 128px round |

Analog-style gauge with needle. Reads a voltage on `in` and displays the corresponding value. Has a warning zone (red arc) above `warnVal`.

**How to use:** Wire the `in` handle to a sensor's output. The gauge automatically converts voltage to display value.

### Tachometer Gauge / Fuel Gauge

Similar to speedometer but with different default ranges and labels.

---

## 11. ECU (Advanced)

| Property | Details |
|----------|---------|
| **Type** | `ecu_advanced` |
| **Handles** | `vcc` (left, red), `gnd` (left, green), `txd` (left, amber), `rxd` (left, emerald), plus configurable input and output pins (right side) |
| **Parameters** | `inputs`, `outputs`, `inputPulls`, `inputPullVoltages`, `outputDrives`, `rules`, `canMode`, `sourceAddress` |
| **Size** | 280×340px |

The most complex component. A programmable controller with configurable I/O pins and logic rules.

### Setting Up an ECU

1. **Place the ECU** on the canvas
2. **Wire power:** Connect `vcc` to +12V (through a fuse!) and `gnd` to ground
3. **Configure pins** in the Inspector:
   - **Inputs:** Name your input pins (e.g., "door", "brake", "temp"). Click **+ Add Input**
   - **Outputs:** Name your output pins (e.g., "alarm", "pump"). Click **+ Add Output**
4. **Set pull-ups/pull-downs** for each input:
   - **none** = floating input (reads whatever is wired to it)
   - **pullup** = internal 4.7k ohm resistor to +12V (reads 12V when unconnected or through an open switch)
   - **pulldown** = internal 4.7k ohm resistor to ground (reads 0V when unconnected)
5. **Wire inputs** to sensors, switches, or other signal sources
6. **Wire outputs** to loads (through relays for high-current loads)

### Pull-Up Resistors (Important!)

When an ECU input is configured with **pullup**, the simulator adds an internal 4.7k ohm resistor between that pin and +12V. This is critical for switch inputs:

- **Open switch** → pull-up pulls the input to ~12V
- **Closed switch** (connected to ground) → switch shorts the input to ~0V

This is how real automotive ECUs sense switch positions (e.g., door ajar switch to ground).

### ECU Logic Rules

Click **"Open Rules"** on the ECU to open the Rules Editor. Rules execute **top-to-bottom every simulation tick**. Results from earlier rules (stored in variables) are immediately visible to later rules in the same tick.

---

#### COMPARE Rule

Compares an input pin or variable to a threshold, another pin, or another variable. Drives an output and/or stores the boolean result to a variable.

| Field | Options | Description |
|-------|---------|-------------|
| **IF source** | Pin / Var | Read from an input pin or an internal variable |
| **Operator** | `>` `<` `>=` `<=` `==` `!=` | Comparison operator |
| **Compare against** | Value / Pin / Var | A fixed voltage, another pin, or a variable |
| **AND conditions** | (optional, add multiple) | All AND conditions must also be true for the rule to fire |
| **THEN drive** | Output pin | Which output to drive |
| **Drive type** | `12V (+)` / `GND (-)` / `Custom V` | Voltage level to apply when condition is true. When false, output is High-Z (not driven) |
| **Store result to variable** | (optional) | Saves `1.0` (true) or `0.0` (false) to a named variable for use in later rules |

**AND Conditions:** Click **Add AND condition** to chain additional comparisons. All must be true simultaneously. Each AND condition has the same source/operator/compare-against fields as the primary condition.

**Examples:**
```
IF door < 3V          → THEN drive alarm = 12V
IF brake < 1V         → THEN drive brake_light = 12V
IF temp > 4.2V AND fan_enable > 0.5V → THEN drive fan = 12V
IF ign > 10V AND door < 1V → THEN drive interior_lamp = 12V
```

---

#### TIMER Rule

Adds a time delay to an input trigger. The trigger input is considered active when its voltage exceeds **0.5V**.

| Field | Options | Description |
|-------|---------|-------------|
| **Mode** | `Delay ON` | Output fires N ms *after* the input goes active. Cancels if input drops before the delay expires |
| **Mode** | `Delay OFF` | Output fires immediately when input goes active. Stays on for N ms *after* input drops |
| **Delay** | milliseconds | How long to wait |
| **Trigger input** | Input pin | Pin to monitor |
| **Drive output** | Output pin + drive type | What to drive when timer fires |

**Examples:**
```
TIMER delay_on  500ms: IF crank > 0.5V → drive fuel_pump = 12V after 500ms
TIMER delay_off 3000ms: IF door > 0.5V → keep courtesy_lamp on for 3s after door closes
```

---

#### LATCH Rule

A Set/Reset flip-flop. The output latches ON when the SET input exceeds its threshold, and latches OFF when the RESET input exceeds its threshold. State persists across ticks until explicitly toggled.

| Field | Description |
|-------|-------------|
| **SET when** | Input pin > threshold (V) latches output ON |
| **RESET when** | Input pin > threshold (V) latches output OFF |
| **Drive output** | Output pin + drive type |
| **Store result to variable** | Optional — saves `1.0`/`0.0` to a named variable |

**Note:** RESET takes priority over SET if both are active simultaneously.

**Example:**
```
SET when: hazard_btn > 0.5V
RESET when: hazard_btn > 0.5V (second press via variable + COMPARE)
→ drive hazard_relay = 12V
```

---

#### MATH Rule

Scales, offsets, and clamps an input voltage. Has two modes:

**Formula mode:** `output = clamp(input × gain + offset, min, max)`

| Field | Description |
|-------|-------------|
| **Input** | Pin or variable to read |
| **Gain** | Multiply factor (default 1.0) |
| **Offset** | Add after multiply (default 0) |
| **Clamp min/max** | Output is clamped to this range |

**Re-range mode:** Maps one voltage range to another automatically.

| Field | Description |
|-------|-------------|
| **Input range** | The input voltage range (e.g. 0.5V–4.5V from a sensor) |
| **Output range** | The output voltage range (e.g. 0V–12V to drive a gauge) |

The gain and offset are calculated automatically. A live preview shows the mid-point result.

**Output destinations:**
- **Drive output pin** — applies the calculated voltage directly to an ECU output
- **Store to variable** — saves the result for use by later COMPARE/TIMER rules

**Example:**
```
MAF sensor (0.5–5V) → re-range to 0–12V → store to var "maf_scaled"
COMPARE: IF maf_scaled > 8V → drive boost_solenoid = 12V
```

---

#### CAN_TX Rule

Transmits a **J1939 CAN frame** periodically when a condition is met.

| Field | Options | Description |
|-------|---------|-------------|
| **Trigger** | `Always` | Transmit every interval regardless of inputs |
| **Trigger** | `Pin Active (> 0.5V)` | Only transmit while a pin is high |
| **Trigger** | `Comparison` | Only transmit when a full comparison is true |
| **PGN** | Number | J1939 Parameter Group Number to use |
| **Priority** | 0–7 | CAN frame priority (lower = higher priority) |
| **Interval** | ms | How often to transmit while condition is met |
| **Signals** | signal_name → pin/var | Named signals embedded in the frame for CAN_RX rules to receive |

**Signals:** Each signal maps a named label to a pin or variable value. The receiving ECU's CAN_RX rule extracts these by label name.

---

#### CAN_RX Rule

Listens for a J1939 frame by PGN and extracts signal values into internal variables.

| Field | Description |
|-------|-------------|
| **PGN** | J1939 PGN to listen for |
| **Timeout** | If no frame arrives within this many ms, signals reset to 0 |
| **Source filter** | Optional — only accept frames from a specific source address |
| **Drive output** | Optional — drives an output pin while frames are actively arriving |
| **Receive signals → variables** | Maps named signal labels from the transmitter to local variable names |

Once extracted into variables, values can be used by COMPARE/MATH rules on the same ECU.

**Example chain:**
```
ECU-A CAN_TX: signal "oil_temp" → pin oil_temp_sensor
ECU-B CAN_RX: signal "oil_temp" → var "rx_oil_temp"
ECU-B COMPARE: IF rx_oil_temp > 4.0V → drive oil_temp_warning = 12V
```

---

### Internal Variables

Variables are named values (e.g. `"fan_enabled"`, `"rx_speed"`) that persist across simulation ticks within an ECU. They allow rules to communicate:

- **COMPARE** with *Store result* → writes `1.0` or `0.0`
- **MATH** with *Store to var* → writes the calculated voltage
- **CAN_RX** signal extraction → writes received values
- Any rule can **read** a variable by choosing `Var` as the input source

Variables are **ECU-local** — each ECU has its own namespace.

---

### Rule Execution Order

Rules execute **sequentially, top to bottom** each tick. This means:
1. A MATH or COMPARE rule that stores to a variable
2. Can be immediately used by the next COMPARE/TIMER rule below it

Reorder rules using the delete/re-add approach to control execution order.

---

### Drive Types

| Type | Condition true | Condition false |
|------|---------------|----------------|
| **12V (+) HIGH_SIDE** | Output = 12V | High-Z (not driven) |
| **GND (-) LOW_SIDE** | Output = 0V | High-Z (not driven) |
| **Custom V** | Output = specified voltage | High-Z (not driven) |

High-Z means the output pin is not actively driven — it floats to whatever the external circuit sets it to (pull-up/pull-down).

---

### ECU Live I/O Panel

When the ECU is powered (VCC > 10V), a **Live I/O** panel appears showing real-time voltage readings for all inputs and outputs. Use this to verify your wiring and rule logic.

---

## 12. CAN Bus Network

### CAN Bus Backbone

| Property | Details |
|----------|---------|
| **Type** | `can_bus` |
| **Handles** | `can_h_l` (left top), `can_l_l` (left bottom), `can_h_r` (right top), `can_l_r` (right bottom) |
| **Parameters** | `bitrate` (default 500000), `mode` ("HS-CAN") |
| **Size** | 192px wide |

The physical CAN bus backbone. Has left and right CAN_H/CAN_L connections for daisy-chaining.

### CAN Transceiver

| Property | Details |
|----------|---------|
| **Type** | `can_transceiver` |
| **Handles** | `vcc` (left, red), `gnd` (left, green), `txd` (left, amber), `rxd` (left, emerald), `can_h` (right, indigo), `can_l` (right, indigo) |
| **Size** | 180×140px |

Bridges between an ECU's digital TXD/RXD pins and the physical CAN_H/CAN_L bus.

**How to wire a CAN network:**
1. Place a CAN Bus backbone node
2. Place CAN Transceivers for each ECU
3. Wire each ECU's `txd` → transceiver's `txd`, ECU's `rxd` → transceiver's `rxd`
4. Wire transceiver's `can_h` → CAN Bus `can_h_l` or `can_h_r`
5. Wire transceiver's `can_l` → CAN Bus `can_l_l` or `can_l_r`
6. Place CAN Terminators at each end of the bus

### CAN Terminator

| Property | Details |
|----------|---------|
| **Type** | `can_terminator` |
| **Handles** | `can_h` (top, indigo), `can_l` (bottom, indigo) |
| **Size** | 64×96px |

120-ohm termination resistor. Place one at each end of the CAN bus to prevent signal reflections.

---

## 13. Wiring Utilities

### Wire Splice

| Property | Details |
|----------|---------|
| **Type** | `splice` |
| **Handles** | `t`/`t_out` (top), `r`/`r_out` (right), `b`/`b_out` (bottom), `l`/`l_out` (left) — each direction has both source and target |
| **Size** | 16×16px (tiny dot) |

Joins multiple wires at a single point. Has handles on all four sides, each with both source and target variants so wires can connect from any direction.

**How to use:** Place a splice wherever you need to branch a wire to multiple destinations. All handles on a splice are electrically connected.

**Important:** The splice is very small. Place it carefully to keep it visible and avoid overlap with other components.

### Net Label

| Property | Details |
|----------|---------|
| **Type** | `net_label` |
| **Handles** | `in` (left), `out` (right) |
| **Parameters** | `color` — label color |
| **Size** | 80×30px |

Electrically connects all net labels with the **same name** without visible wires. Use for cleaner schematics when wires would be very long or crossing.

**How to use:**
1. Place a net label, set its label to a meaningful name (e.g., "IGN_12V")
2. Place another net label with the **exact same name** elsewhere on the schematic
3. They are now electrically connected — no wire needed between them

### Connector

| Property | Details |
|----------|---------|
| **Type** | `connector` |
| **Handles** | `in1`..`inN` (left), `out1`..`outN` (right) |
| **Parameters** | `numPins` — 1 to 8 (default 4) |
| **Size** | 96px wide, height varies |

Multi-pin pass-through connector. Each input pin connects directly to its corresponding output pin. Used to represent physical connectors in the harness.

### Cable Resistance

| Property | Details |
|----------|---------|
| **Type** | `cable_resistance` |
| **Handles** | `in` (left, orange), `out` (right, orange) |
| **Parameters** | `resistance`, `length_m`, `gauge` |
| **Size** | 112px wide |

Models the resistance of a long cable run. Parameterized by length, gauge, and material. Shows the calculated resistance and voltage drop.

### Flasher

| Property | Details |
|----------|---------|
| **Type** | `flasher` |
| **Handles** | `in` (left, red), `out` (right, amber) |
| **Parameters** | `onTime`, `offTime` (in ms) |
| **State** | `outputOn` — oscillates automatically |
| **Size** | 70×70px |

Timer relay that oscillates the output on and off. Used for turn signal flashers and warning light blinkers.

---

## 14. Wiper Motor

| Property | Details |
|----------|---------|
| **Type** | `wiper_motor` |
| **Handles** | `in` (left top, blue — motor power), `out` (left bottom, blue — motor ground), `park` (right, green — park switch) |
| **State** | `running`, `pos` (0–359), `parkClosed` |
| **Size** | 112px wide |

Animated wiper motor with park switch. The motor spins when powered and the wiper arm swings back and forth. The park switch (`park` handle) closes when the wiper is in the parked position.

**How to wire:**
1. Wire `in` to switched power (through relay/switch)
2. Wire `out` to ground
3. Wire `park` to the wiper control circuit for park-after-run behavior

---

## 15. Simulation Controls

### Running the Simulation

- **Reset** — Clears all state (blown fuses, relay positions, etc.) and resets to initial conditions
- **Run** — Starts the continuous simulation loop. The solver runs repeatedly, updating voltages and component states
- **Pause** — Halts the simulation loop while preserving current state

### What Happens During Simulation

1. The solver builds a net map (which handles are connected)
2. MNA matrices are built and solved for node voltages
3. Component states are updated (relay energize, fuse blow, lamp brightness, motor speed)
4. ECU logic rules are evaluated based on input voltages
5. ECU outputs are applied
6. Wire colors update to show voltage levels
7. The loop repeats (~60Hz)

### Interactive Controls During Simulation

While running, you can:
- **Click switches** to toggle them
- **Drag sensor sliders** to change readings
- **Click the ignition switch** to cycle positions
- **Click relay manual reset buttons**
- **Observe live voltages** in wire colors and ECU I/O panels

---

## 16. Layout & Visual Best Practices

### General Principles

1. **Power flows top-to-bottom, left-to-right**
   - Battery and power sources at the **top-left**
   - Protection (fuses, breakers) immediately after the battery
   - Switches and control logic in the **middle**
   - Loads near the **bottom-right**
   - Ground nodes at the **bottom**

2. **Standard spacing between nodes**
   - Leave at least **100–150px** between component centers
   - Leave at least **200px** vertically between rows
   - Leave at least **250–300px** horizontal space for relay and ECU nodes (they are large)

3. **Use consistent alignment**
   - Align components in horizontal rows by function:
     - Row 1: Power source, master switch
     - Row 2: Fuse panel
     - Row 3: Switches and relays
     - Row 4: Loads
     - Row 5: Ground
   - Use vertical alignment for related signal paths

### Avoiding Overlap

| Component | Approximate Size | Recommended Clearance |
|-----------|-----------------|----------------------|
| Battery | 132×100px | 160px horizontal |
| Ground | 40×60px | 60px horizontal |
| Fuse | 80×60px | 100px horizontal |
| Switch (SPST) | 80×70px | 100px horizontal |
| Lamp | 64×64px | 90px horizontal |
| Motor | 80×80px | 100px horizontal |
| Resistor | 80×56px | 100px horizontal |
| Diode/LED | 60×60px | 80px horizontal |
| Relay (SPDT) | 120×164px | 160px horizontal, 200px vertical |
| ECU | 280×340px | 320px horizontal, 380px vertical |
| CAN Bus | 192×100px | 220px horizontal |
| Splice | 16×16px | 40px (keep visible!) |

### Wire Routing Tips

1. **Minimize crossings** — rearrange components before adding wires
2. **Use splices** to branch wires cleanly instead of stacking connections
3. **Use net labels** for long-distance connections (e.g., IGN power distributed to multiple ECUs)
4. **Use the Flip X/Y** feature to orient handles toward the components they connect to
5. **Wire from left to right** where possible (source handle → target handle)
6. **Keep wire runs short** — move related components closer together

### Color Coding Convention

When manually setting wire colors in the Inspector:
- **Red** — Battery positive / unswitched power
- **Orange/Yellow** — Switched power (after ignition)
- **Green** — Ground / earth
- **Blue** — Signal wires / sensor outputs
- **White** — CAN bus
- **Purple** — Relay coil circuits
- **Pink** — Accessory circuits

### Label Everything

- **Every component** should have a meaningful label (set in the Inspector)
- Use standard naming: "F1" for fuse 1, "K1" for relay 1, "S1" for switch 1
- ECU pins should describe their function: "DOOR", "BRAKE", "ALARM" not "in1", "in2"

---

## 17. Common Circuit Patterns

### Pattern 1: Simple Light Circuit
```
Battery(+) → Fuse → Switch → Lamp → Ground
```
Layout: Single horizontal row, left to right.

### Pattern 2: Relay-Controlled Load
```
Battery(+) → Fuse1 → Relay(30/COM)
                       Relay(87/NO) → Motor → Ground
Switch → Relay(86/Coil+)
          Relay(85/Coil-) → Ground
Battery(+) → Fuse2 → Switch (for coil power)
```
Layout: Relay in center. Power path across the top (Battery→Fuse→COM→NO→Load). Control path below (Switch→Coil).

### Pattern 3: ECU with Door Switch Input
```
Battery(+) → Fuse → ECU(VCC)
                     ECU(GND) → Ground
Door Switch → ECU(DOOR input, pull-up enabled)
Door Switch other terminal → Ground
ECU(ALARM output) → Buzzer → Ground
```
**ECU Rule:** `IF DOOR < 3V THEN ALARM = 12V`

When the door switch closes (grounds the DOOR pin), the pull-up voltage drops from 12V to ~0V. The rule fires and drives the ALARM output high.

### Pattern 4: Ignition System
```
Battery(+) → Master Switch → Fusible Link → Ignition Switch(BATT)
  IGN Switch(ACC) → Fuse → Radio → Ground
  IGN Switch(IGN) → Fuse → ECU(VCC) / Fuel Pump Relay
  IGN Switch(START) → Starter Relay(Coil)
```

### Pattern 5: CAN Bus Network
```
ECU1(TXD/RXD) ↔ Transceiver1(TXD/RXD)
  Transceiver1(CAN_H/CAN_L) ↔ CAN Bus(Left)

CAN Bus(Right) ↔ Transceiver2(CAN_H/CAN_L)
  Transceiver2(TXD/RXD) ↔ ECU2(TXD/RXD)

CAN Terminator on each end of the bus
```

---

## 18. Troubleshooting

### "No ground node found"
Every circuit needs at least one Ground node connected to the circuit.

### Fuse keeps blowing
Your load resistance is too low for the fuse rating. Either increase the fuse rating or add more resistance to the load path.

### Lamp/Motor not turning on
Check for a complete path: Battery(+) → through all switches/fuses (all closed/good) → Load → Ground. Any break in the path stops current flow.

### ECU input shows wrong voltage
1. Check that VCC and GND are wired and powered
2. Check that the input pin name matches what you wired to (case-sensitive in some edge cases)
3. If using pull-ups, verify the pull-up is set in the Inspector for that pin
4. Check for stale/duplicate wires — delete all wires to the pin and re-wire

### ECU rule not firing
1. Open the Rules Editor and verify the rule's input pin matches your actual pin name
2. Check the Live I/O panel to see what voltage the ECU is actually reading
3. Verify the comparison operator and threshold are correct
4. If the input shows "—", the ECU is not powered (check VCC/GND)

### Wire shows wrong color / no voltage
1. Verify the wire connects to valid handles on both ends
2. Check that both handles exist (pin wasn't renamed after wiring)
3. Delete the wire and re-draw it

### "MNA solve failed"
This usually means the circuit has a topological problem:
- A voltage source is short-circuited (battery positive wired directly to ground with no resistance)
- Two voltage sources conflict (e.g., two batteries wired in parallel with different voltages)
- Add a small resistance in the problematic path

---

*This guide covers every component available in the Circuit Generator application. For the most up-to-date behavior, always verify against the running simulation.*
