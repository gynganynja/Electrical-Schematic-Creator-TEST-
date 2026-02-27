# Automotive Circuit Schematic JSON Specification v1.1

This document defines the strict JSON contract and component catalog for the automotive circuit generator. Every JSON output must be a single valid object conforming to this specification.

## 1. JSON Structural Contract

```json
{
  "version": 1,
  "nodes": [ { "NODE_SCHEMA" } ],
  "edges": [ { "EDGE_SCHEMA" } ]
}
```

### Node Schema Constraints
*   **Id Parity**: `node.id` MUST be identical to `node.data.id`.
*   **Type Parity**: `node.type` MUST be identical to `node.data.type`.
*   **Position**: Must be integers. Must snap to a **20px grid** (multiples of 20).
*   **Rotation**: `node.data.rotation` MUST be one of: `0`, `90`, `180`, `270`.
*   **Unique IDs**: IDs must be unique strings (e.g., `"1"`, `"2"`, `"3"`).

### Edge Schema Constraints
*   **Handle Routing**: `sourceHandle` must connect to a **Source** terminal. `targetHandle` must connect to a **Target** terminal.
*   **Resistance**: Default value is `0.001` (Ω).
*   **Unique IDs**: IDs must be unique strings (e.g., `"e1"`, `"e2"`).

---

## 2. Component Catalog

### Power & Ground
| Type | params | state | Handle IDs (Direction/Side) |
|:---|:---|:---|:---|
| `battery` | `voltage`, `internalResistance` | `{}` | `positive` (Src, Top), `negative` (Src, Bottom) |
| `ground` | `{}` | `{}` | `gnd` (Tgt, Top) |

### Protection Devices
| Type | params | state | Handle IDs (Direction/Side) |
|:---|:---|:---|:---|
| `fuse` | `tripCurrent`, `tripTimeMs` | `blown` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `breaker_manual`| `tripCurrent` | `tripped` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `breaker_auto` | `tripCurrent`, `resetDelayMs` | `tripped` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `fusible_link` | `tripCurrent`, `tripTimeMs` | `blown` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `tvs_clamp` | `clampVoltage`, `forwardDrop`| `{}` | `anode` (Tgt, L), `cathode` (Src, R) |

### Switching (Standard)
| Type | params | state | Handle IDs (Direction/Side) |
|:---|:---|:---|:---|
| `switch_spst` | `{}` | `closed` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `switch_master` | `{}` | `closed` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `switch_momentary_no` | `{}` | `closed` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `switch_momentary_nc` | `{}` | `open` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `switch_spdt` | `{}` | `position` ("nc"\|"no") | `com`(Tgt, L), `out_nc`(Src, R_T), `out_no`(Src, R_B) |
| `switch_dpdt` | `{}` | `position` ("nc"\|"no") | `in_a`(Tgt, L_T), `out_a_nc`, `out_a_no`, `in_b`, `out_b_nc`, `out_b_no` |
| `switch_ignition`| `{}` | `position` (Enum*) | `batt` (Tgt, L), `acc`, `ign`, `start` (all Src, R) |
*Enum: "off", "acc", "on", "start"*

### Progressive Loads
| Type | params | state | Handle IDs (Direction/Side) |
|:---|:---|:---|:---|
| `lamp` | `resistance` | `on` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `led` | `resistance`, `color` | `on` (bool) | `anode` (Tgt, L), `cathode` (Src, R) |
| `motor` | `resistance` | `running` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `solenoid` | `resistance` | `activated` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `heater` | `resistance` | `on` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `buzzer` | `resistance` | `on` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `compressor_clutch`| `resistance` | `activated` (bool) | `in` (Tgt, L), `out` (Src, R) |
| `wiper_motor` | `resistance` | `running` (bool) | `in` (Tgt, L), `out`(Src, R), `park`(Src, B) |

### Relays
| Type | params | state | Handle IDs (Direction/Side) |
|:---|:---|:---|:---|
| `relay_spst` | `coilResistance`, `pullInVoltage` | `energized` (bool) | `coil_in` (86), `coil_out` (85), `in` (30), `no` (87) |
| `relay_spdt` | `coilResistance`, `pullInVoltage` | `energized` (bool) | `coil_in`, `coil_out`, `com`, `nc`, `no` |
| `relay_dual87` | `coilResistance`, `pullInVoltage` | `energized` (bool) | `coil_in`, `coil_out`, `com`, `no_a`, `no_b` |
| `relay_latching`| `coilResistance`, `pullInVoltage` | `energized` (bool) | `set_in`, `set_out`, `reset_in`, `reset_out`, `com`, `no` |
| `relay_delay_on`| `coilResistance`, `delayMs` | `energized` (bool) | `coil_in`, `coil_out`, `com`, `nc`, `no` |
| `relay_delay_off`| `coilResistance`, `delayMs` | `energized` (bool) | `coil_in`, `coil_out`, `com`, `nc`, `no` |

### Passive & Control (Advanced)
| Type | params | state | Handle IDs (Direction/Side) |
|:---|:---|:---|:---|
| `resistor` | `resistance` | `{}` | `in` (Tgt, L), `out` (Src, R) |
| `diode` | `forwardDrop` | `{}` | `anode` (Tgt, L), `cathode` (Src, R) |
| `zener` | `breakdownVoltage`, `forwardDrop` | `{}` | `anode` (Tgt, L), `cathode` (Src, R) |
| `capacitor` | `capacitance` | `{}` | `in` (Tgt, L), `out` (Src, R) |
| `inductor` | `inductance`, `resistance` | `{}` | `in` (Tgt, L), `out` (Src, R) |
| `potentiometer`| `resistance` | `position` (0-100) | `a` (Tgt, L), `b` (Src, R), `wiper` (Src, B) |
| `ecu` | `numInputs`, `numOutputs`, `rules`*, `outputDrives`* | `{}` | `vcc`, `gnd`, `in1-N`, `out1-N` |
| `flasher` | `rateHz`, `resistance` | `outputOn` (bool) | `in` (Tgt, L), `out` (Src, R) |

***ECU Special Fields***:
- `rules`: Array of `{ inputPin: "in1", compareType: "value"|"pin", condition: ">"|"<"|"==", threshold: num, comparePin: "in2", outputPin: "out1", action: "on"|"off" }`
- `outputDrives`: Object mapping `{ "out1": "hsd"|"lsd"|"push-pull" }`
  - `hsd`: High-Side Drive. ON = VCC, OFF = High-Z (Standard for power).
  - `lsd`: Low-Side Drive. ON = GND, OFF = High-Z (Standard for sinking).
  - `push-pull`: ON = VCC, OFF = GND (Standard for signals).

### Wiring infrastructure
| Type | params | Handle IDs | Usage |
|:---|:---|:---|:---|
| `splice` | `{}` | `l`, `r`, `t`, `b` (Tgt), `l_out`, etc (Src) | 4-way wire junction |
| `connector` | `numPins` | `in1-N` (Tgt), `out1-N` (Src) | Inline multi-pin plug |
| `net_label` | `color` | `in` (Tgt) | Same-name labels connected |
| `cable_resistance` | `resistance`, `length_m` | `in`, `out` | Specific wire loss model |
| `harness_entry` | `numPins`, `color` | `pin_1-N` (Tgt) | Multi-wire start |
| `harness_exit` | `numPins`, `color` | `pin_1-N` (Src) | Multi-wire arrival |

---

## 3. Electrical Logic & Layout Rules

### Mandatory Constraints
1.  **System Grounding**: Battery `negative` terminal MUST connect to `ground`.
2.  **Circuit Path**: Every Load MUST have a continuous edge path from Battery(+) to Ground.
3.  **Protection Placement**: Fuses/Breakers MUST be placed on the power-side of any load (between power source and load).
4.  **Relay Separation**: Coil circuits (85/86) and Contact circuits (30/87) MUST be independently wired.
5.  **Diode Polarity**: Cathode (negative bar) connects to the higher potential for flyback protection.
6.  **ECU Safety**: Never connect an `lsd` ECU output directly to a Battery(+) rail. This will cause a short circuit when the ECU is active. Always place a Load (Lamp, Relay Coil) between Power and an `lsd` output.

### Layout Conventions
*   **Power (Red)**: Placed on the Left side.
*   **Loads (Colored/Grey)**: Placed in the Center/Right.
*   **Grounds (Green)**: Placed at the Bottom edge.
*   **Spacing**: Maintain at least 160px horizontal / 120px vertical between node centers.

---

## 4. Minimal Validity Example

```json
{
  "version": 1,
  "nodes": [
    { "id": "1", "type": "battery", "position": { "x": 100, "y": 200 }, "data": { "id": "1", "type": "battery", "rotation": 0, "params": { "voltage": 24 } } },
    { "id": "2", "type": "ground", "position": { "x": 100, "y": 600 }, "data": { "id": "2", "type": "ground", "rotation": 0, "params": {} } }
  ],
  "edges": [
    { "id": "e1", "source": "1", "sourceHandle": "negative", "target": "2", "targetHandle": "gnd", "data": { "resistance": 0.001, "wireColor": "Black" } }
  ]
}
```

---

## 5. Relay Control Example (Standard Pattern)

```json
{
  "version": 1,
  "nodes": [
    { "id": "1", "type": "battery", "position": { "x": 40, "y": 240 }, "data": { "id": "1", "type": "battery", "rotation": 0, "params": { "voltage": 12 } } },
    { "id": "2", "type": "fuse", "position": { "x": 200, "y": 100 }, "data": { "id": "2", "type": "fuse", "rotation": 0, "params": { "tripCurrent": 15 } } },
    { "id": "3", "type": "switch_spst", "position": { "x": 400, "y": 100 }, "data": { "id": "3", "type": "switch_spst", "rotation": 0, "state": { "closed": false } } },
    { "id": "4", "type": "relay_spst", "position": { "x": 600, "y": 200 }, "data": { "id": "4", "type": "relay_spst", "rotation": 0, "params": { "coilResistance": 80 } } },
    { "id": "5", "type": "lamp", "position": { "x": 840, "y": 300 }, "data": { "id": "5", "type": "lamp", "rotation": 0, "params": { "resistance": 24 } } },
    { "id": "6", "type": "ground", "position": { "x": 400, "y": 500 }, "data": { "id": "6", "type": "ground", "rotation": 0, "params": {} } }
  ],
  "edges": [
    { "id": "e1", "source": "1", "sourceHandle": "positive", "target": "2", "targetHandle": "in" },
    { "id": "e2", "source": "2", "sourceHandle": "out", "target": "3", "targetHandle": "in" },
    { "id": "e3", "source": "3", "sourceHandle": "out", "target": "4", "targetHandle": "coil_in" },
    { "id": "e4", "source": "1", "sourceHandle": "positive", "target": "4", "targetHandle": "in" },
    { "id": "e5", "source": "4", "sourceHandle": "no", "target": "5", "targetHandle": "in" },
    { "id": "e6", "source": "4", "sourceHandle": "coil_out", "target": "6", "targetHandle": "gnd" },
    { "id": "e7", "source": "5", "sourceHandle": "out", "target": "6", "targetHandle": "gnd" },
    { "id": "e8", "source": "1", "sourceHandle": "negative", "target": "6", "targetHandle": "gnd" }
  ]
}
```

---

## 6. Validation Checklist

1.  [ ] **Schema**: All IDs and Types match between `node` and `node.data`.
2.  [ ] **Grid**: All positions are multiples of 20.
3.  [ ] **Rotation**: All nodes have a `rotation` property (0, 90, 180, 270).
4.  [ ] **Connectivity**: Every battery negative is wired to a ground node.
5.  [ ] **Direction**: `sourceHandle` connects to a **Src** terminal; `targetHandle` to a **Tgt** terminal.
6.  [ ] **Uniqueness**: All `id` strings (nodes/edges) are globally unique.
7.  [ ] **Completeness**: No markdown comments or prose in final JSON output.
8.  [ ] **ECU Rules**: `rules` follow the structured object schema if ECU is present.
