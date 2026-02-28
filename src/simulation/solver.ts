/**
 * Circuit Simulation Engine
 *
 * Uses Modified Nodal Analysis (MNA) to solve for node voltages and branch currents.
 * Iteratively resolves stateful components (relays, fuses) until stable.
 *
 * Strategy:
 *  1. Build a netlist from the React Flow graph.
 *  2. Assign node IDs (unique net names) to each connected terminal.
 *  3. Stamp the MNA matrix.
 *  4. Solve Ax = z for node voltages + voltage-source currents.
 *  5. Evaluate stateful components (relays, fuses).
 *  6. Iterate until stable or max iterations reached.
 */

import { multiply, inv, Matrix, matrix } from 'mathjs';
import type { CircuitNode, CircuitEdge, AnyComponentData } from '../types/circuit';

// ----- Solver output types -----
export interface SimEvent {
    level: 'info' | 'warn' | 'error';
    message: string;
}

export interface NodeUpdate {
    id: string;
    data: Partial<AnyComponentData>;
}

export interface EdgeUpdate {
    id: string;
    style?: Record<string, any>;
    animated?: boolean;
    data?: Record<string, any>;
}

export interface SolveResult {
    nodeUpdates: NodeUpdate[];
    edgeUpdates: EdgeUpdate[];
    events: SimEvent[];
    nodeVoltages: Record<string, number>;
    netMap: Record<string, string>;
}

// ----- Internal netlist types -----

interface NetComponent {
    nodeId: string;     // React Flow node id
    type: string;
    n1: string;         // net name for terminal 1
    n2: string;         // net name for terminal 2
    value: number;      // resistance, voltage, etc.
    data: AnyComponentData;
    // For relay: extra terminals
    n3?: string;
    n4?: string;
    n5?: string;
}

/**
 * Build net names from edges. Each handle on a node is "nodeId:handleId".
 * Connected handles share the same net.
 */
function buildNets(nodes: CircuitNode[], edges: CircuitEdge[]): Record<string, string> {
    // Union-Find
    const parent: Record<string, string> = {};

    function find(x: string): string {
        if (!parent[x]) parent[x] = x;
        if (parent[x] !== x) parent[x] = find(parent[x]);
        return parent[x];
    }

    function union(a: string, b: string) {
        const ra = find(a);
        const rb = find(b);
        if (ra !== rb) parent[ra] = rb;
    }

    // Initialize all terminals
    for (const node of nodes) {
        const d = node.data as AnyComponentData;
        const terminalIds = getTerminals(d.type, node.data as any);
        for (const t of terminalIds) {
            const key = `${node.id}:${t}`;
            find(key);
        }
    }

    // Union terminals connected by edges (wires)
    for (const edge of edges) {
        const sourceKey = `${edge.source}:${(edge.sourceHandle || 'out').toLowerCase()}`;
        const targetKey = `${edge.target}:${(edge.targetHandle || 'in').toLowerCase()}`;
        union(sourceKey, targetKey);
    }

    // Build the final net map: terminal key -> net name
    const netMap: Record<string, string> = {};
    for (const key of Object.keys(parent)) {
        netMap[key] = find(key);
    }

    return netMap;
}

function getTerminals(type: string, _data?: any): string[] {
    switch (type) {
        case 'battery': return ['positive', 'negative'];
        case 'ground': return ['gnd'];
        case 'resistor':
        case 'lamp':
        case 'fuse':
        case 'switch_spst':
        case 'switch_momentary':
        case 'switch_momentary_no':
        case 'switch_momentary_nc':
        case 'switch_master':
        case 'breaker_manual':
        case 'breaker_auto':
        case 'fusible_link':
        case 'cable_resistance':
        case 'heater':
        case 'compressor_clutch':
        case 'capacitor':
        case 'inductor': return ['in', 'out'];
        case 'wiper_motor': return ['in', 'out', 'park'];
        case 'diode':
        case 'led':
        case 'tvs_clamp':
        case 'zener': return ['anode', 'cathode'];
        case 'potentiometer': return ['a', 'b', 'wiper'];
        case 'relay_spdt':
        case 'relay_delay_on':
        case 'relay_delay_off': return ['coil_in', 'coil_out', 'com', 'no', 'nc'];
        case 'relay_spst': return ['coil_in', 'coil_out', 'in', 'no'];
        case 'relay_dual87': return ['coil_in', 'coil_out', 'com', 'no_a', 'no_b'];
        case 'relay_latching': return ['set_in', 'set_out', 'reset_in', 'reset_out', 'com', 'no'];
        case 'battery': return ['positive', 'negative'];
        case 'ground': return ['gnd'];
        case 'splice': return ['t', 'r', 'b', 'l', 't_out', 'r_out', 'b_out', 'l_out'];
        case 'switch_spdt': return ['com', 'out_nc', 'out_no'];
        case 'switch_dpdt': return ['in_a', 'out_a_nc', 'out_a_no', 'in_b', 'out_b_nc', 'out_b_no'];
        case 'switch_ignition': return ['batt', 'acc', 'ign', 'start'];
        case 'motor':
        case 'lamp':
        case 'buzzer':
        case 'solenoid':
        case 'heater':
        case 'compressor_clutch':
        case 'temp_sensor':
        case 'oil_press_sensor':
        case 'air_press_sensor':
        case 'wss_sensor':
        case 'rpm_sensor':
        case 'speedo_gauge':
        case 'tacho_gauge':
        case 'fuel_gauge': return ['in', 'out'];
        case 'maf_sensor': return ['vcc', 'gnd', 'out'];
        case 'can_bus': return ['can_h_l', 'can_h_r', 'can_l_l', 'can_l_r'];
        case 'can_transceiver': return ['vcc', 'gnd', 'txd', 'rxd', 'can_h', 'can_l', 'en'];
        case 'can_terminator': return ['can_h', 'can_l'];
        case 'ecu_advanced': {
            const inputs = (Array.isArray(_data?.params?.inputs) ? _data.params.inputs : ['in1', 'in2']).map((s: string) => s.toLowerCase());
            const outputs = (Array.isArray(_data?.params?.outputs) ? _data.params.outputs : ['out1', 'out2']).map((s: string) => s.toLowerCase());
            return ['vcc', 'gnd', 'txd', 'rxd', ...inputs, ...outputs];
        }
        default: return ['in', 'out'];
    }
}

function buildNetlist(nodes: CircuitNode[], _edges: CircuitEdge[], netMap: Record<string, string>): NetComponent[] {
    const components: NetComponent[] = [];

    for (const node of nodes) {
        const d = node.data as any;
        const net = (handle: string) => { const h = handle.toLowerCase(); return netMap[`${node.id}:${h}`] || `__floating_${node.id}_${h}`; };

        switch (d.type) {
            case 'battery': {
                const hasIntR = (d.params.internalResistance ?? 0) > 0;
                const posNet = net('positive');
                const internalPos = hasIntR ? (posNet + '_int') : posNet;

                // Main voltage source
                components.push({
                    nodeId: node.id,
                    type: 'vsource',
                    n1: internalPos,
                    n2: net('negative'),
                    value: d.params.voltage,
                    data: d,
                });

                // Series internal resistance
                if (hasIntR) {
                    components.push({
                        nodeId: node.id + '_rint',
                        type: 'resistor',
                        n1: posNet,
                        n2: internalPos,
                        value: d.params.internalResistance,
                        data: d,
                    });
                }
                break;
            }

            case 'ground':
                components.push({
                    nodeId: node.id,
                    type: 'ground',
                    n1: net('gnd'),
                    n2: '0',
                    value: 0,
                    data: d,
                });
                break;

            case 'resistor':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params.resistance,
                    data: d,
                });
                break;

            case 'lamp':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params.resistance,
                    data: d,
                });
                break;

            case 'fuse':
                if (d.state.blown) {
                    // Blown fuse = open circuit (very high resistance)
                    components.push({
                        nodeId: node.id,
                        type: 'resistor',
                        n1: net('in'),
                        n2: net('out'),
                        value: 1e9,
                        data: d,
                    });
                } else {
                    // Good fuse = very low resistance
                    components.push({
                        nodeId: node.id,
                        type: 'resistor',
                        n1: net('in'),
                        n2: net('out'),
                        value: 0.001,
                        data: d,
                    });
                }
                break;

            case 'switch_spst':
            case 'switch_momentary':
            case 'switch_master':
                if (d.state.closed) {
                    components.push({
                        nodeId: node.id,
                        type: 'resistor',
                        n1: net('in'),
                        n2: net('out'),
                        value: 0.001,
                        data: d,
                    });
                } else {
                    components.push({
                        nodeId: node.id,
                        type: 'resistor',
                        n1: net('in'),
                        n2: net('out'),
                        value: 1e9,
                        data: d,
                    });
                }
                break;

            case 'switch_momentary_no':
                // NO = default open, closed when pressed
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.state.closed ? 0.001 : 1e9,
                    data: d,
                });
                break;

            case 'switch_momentary_nc':
                // NC = default closed, open when pressed
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.state.open ? 1e9 : 0.001,
                    data: d,
                });
                break;

            case 'switch_spdt': {
                const pos = d.state?.position || 'nc';
                // COM → NC
                components.push({
                    nodeId: node.id + '_nc',
                    type: 'resistor',
                    n1: net('com'),
                    n2: net('out_nc'),
                    value: pos === 'nc' ? 0.001 : 1e9,
                    data: d,
                });
                // COM → NO
                components.push({
                    nodeId: node.id + '_no',
                    type: 'resistor',
                    n1: net('com'),
                    n2: net('out_no'),
                    value: pos === 'no' ? 0.001 : 1e9,
                    data: d,
                });
                break;
            }

            case 'switch_dpdt': {
                const dpos = d.state?.position || 'nc';
                // Pole A: in_a → out_a_nc / out_a_no
                components.push({
                    nodeId: node.id + '_a_nc',
                    type: 'resistor',
                    n1: net('in_a'),
                    n2: net('out_a_nc'),
                    value: dpos === 'nc' ? 0.001 : 1e9,
                    data: d,
                });
                components.push({
                    nodeId: node.id + '_a_no',
                    type: 'resistor',
                    n1: net('in_a'),
                    n2: net('out_a_no'),
                    value: dpos === 'no' ? 0.001 : 1e9,
                    data: d,
                });
                // Pole B: in_b → out_b_nc / out_b_no
                components.push({
                    nodeId: node.id + '_b_nc',
                    type: 'resistor',
                    n1: net('in_b'),
                    n2: net('out_b_nc'),
                    value: dpos === 'nc' ? 0.001 : 1e9,
                    data: d,
                });
                components.push({
                    nodeId: node.id + '_b_no',
                    type: 'resistor',
                    n1: net('in_b'),
                    n2: net('out_b_no'),
                    value: dpos === 'no' ? 0.001 : 1e9,
                    data: d,
                });
                break;
            }

            case 'switch_ignition': {
                const ipos = d.state?.position || 'off';
                // BATT → ACC: active in acc, on, start
                components.push({
                    nodeId: node.id + '_acc',
                    type: 'resistor',
                    n1: net('batt'),
                    n2: net('acc'),
                    value: ['acc', 'on', 'start'].includes(ipos) ? 0.001 : 1e9,
                    data: d,
                });
                // BATT → IGN: active in on, start
                components.push({
                    nodeId: node.id + '_ign',
                    type: 'resistor',
                    n1: net('batt'),
                    n2: net('ign'),
                    value: ['on', 'start'].includes(ipos) ? 0.001 : 1e9,
                    data: d,
                });
                // BATT → START: active only in start
                components.push({
                    nodeId: node.id + '_start',
                    type: 'resistor',
                    n1: net('batt'),
                    n2: net('start'),
                    value: ipos === 'start' ? 0.001 : 1e9,
                    data: d,
                });
                break;
            }

            case 'relay_spdt':
            case 'relay_delay_on':
            case 'relay_delay_off': {
                // Coil as a resistor
                components.push({
                    nodeId: node.id + '_coil',
                    type: 'resistor',
                    n1: net('coil_in'),
                    n2: net('coil_out'),
                    value: d.params.coilResistance,
                    data: d,
                });
                // Contact: COM connects to NO if energized, NC if not
                if (d.state.energized) {
                    // COM -> NO = low R
                    components.push({
                        nodeId: node.id + '_no',
                        type: 'resistor',
                        n1: net('com'),
                        n2: net('no'),
                        value: 0.001,
                        data: d,
                    });
                    // COM -> NC = open
                    components.push({
                        nodeId: node.id + '_nc',
                        type: 'resistor',
                        n1: net('com'),
                        n2: net('nc'),
                        value: 1e9,
                        data: d,
                    });
                } else {
                    // COM -> NC = low R
                    components.push({
                        nodeId: node.id + '_nc',
                        type: 'resistor',
                        n1: net('com'),
                        n2: net('nc'),
                        value: 0.001,
                        data: d,
                    });
                    // COM -> NO = open
                    components.push({
                        nodeId: node.id + '_no',
                        type: 'resistor',
                        n1: net('com'),
                        n2: net('no'),
                        value: 1e9,
                        data: d,
                    });
                }
                break;
            }

            // ---- SPST Relay (NO only) ----
            case 'relay_spst': {
                // Coil
                components.push({
                    nodeId: node.id + '_coil',
                    type: 'resistor',
                    n1: net('coil_in'),
                    n2: net('coil_out'),
                    value: d.params.coilResistance ?? 80,
                    data: d,
                });
                // Contact: IN → NO
                components.push({
                    nodeId: node.id + '_no',
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('no'),
                    value: d.state.energized ? 0.001 : 1e9,
                    data: d,
                });
                break;
            }

            // ---- Dual-87 Relay ----
            case 'relay_dual87': {
                // Coil
                components.push({
                    nodeId: node.id + '_coil',
                    type: 'resistor',
                    n1: net('coil_in'),
                    n2: net('coil_out'),
                    value: d.params.coilResistance ?? 80,
                    data: d,
                });
                // COM → NO A
                components.push({
                    nodeId: node.id + '_no_a',
                    type: 'resistor',
                    n1: net('com'),
                    n2: net('no_a'),
                    value: d.state.energized ? 0.001 : 1e9,
                    data: d,
                });
                // COM → NO B
                components.push({
                    nodeId: node.id + '_no_b',
                    type: 'resistor',
                    n1: net('com'),
                    n2: net('no_b'),
                    value: d.state.energized ? 0.001 : 1e9,
                    data: d,
                });
                break;
            }

            // ---- Latching Relay ----
            case 'relay_latching': {
                // SET coil
                components.push({
                    nodeId: node.id + '_set',
                    type: 'resistor',
                    n1: net('set_in'),
                    n2: net('set_out'),
                    value: d.params.coilResistance ?? 80,
                    data: d,
                });
                // RESET coil
                components.push({
                    nodeId: node.id + '_reset',
                    type: 'resistor',
                    n1: net('reset_in'),
                    n2: net('reset_out'),
                    value: d.params.coilResistance ?? 80,
                    data: d,
                });
                // COM → NO contact
                components.push({
                    nodeId: node.id + '_no',
                    type: 'resistor',
                    n1: net('com'),
                    n2: net('no'),
                    value: d.state.energized ? 0.001 : 1e9,
                    data: d,
                });
                break;
            }

            case 'splice': {
                // Splice is a junction — connect all terminals with near-zero resistance
                const terminals = ['t', 'r', 'b', 'l', 't_out', 'r_out', 'b_out', 'l_out'];
                const firstNet = net(terminals[0]);
                for (let i = 1; i < terminals.length; i++) {
                    components.push({
                        nodeId: node.id + `_sp${i}`,
                        type: 'resistor',
                        n1: firstNet,
                        n2: net(terminals[i]),
                        value: 0.001,
                        data: d,
                    });
                }
                break;
            }

            // ---- Motor: resistive load ----
            case 'motor':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 4,
                    data: d,
                });
                break;

            // ---- LED: resistive load (forward-biased model) ----
            case 'led':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('anode'),
                    n2: net('cathode'),
                    value: d.params?.resistance ?? 150,
                    data: d,
                });
                break;

            // ---- Diode: polarity-aware iterative model ----
            // forward=true (default) → 0.01Ω; reverse → 1e9Ω (open)
            case 'diode': {
                const diodeFwd = (d as any).state?.forward !== false;
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('anode'),
                    n2: net('cathode'),
                    value: diodeFwd ? 0.01 : 1e9,
                    data: d,
                });
                break;
            }

            // ---- Wiper Motor (3-pin model: in, out, park) ----
            case 'wiper_motor': {
                // Motor coil
                components.push({
                    nodeId: node.id + '_motor',
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 6,
                    data: d,
                });
                // Park Switch (internal to motor)
                // If the state parkClosed is true, 'in' connects to 'park'
                const parkClosed = d.state?.parkClosed ?? true;
                components.push({
                    nodeId: node.id + '_park',
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('park'),
                    value: parkClosed ? 0.001 : 1e9,
                    data: d,
                });
                break;
            }

            // ---- Flasher: resistive pass-through (timer toggles state externally) ----
            case 'flasher': {
                const flasherOn = d.state?.outputOn || false;
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: flasherOn ? (d.params?.resistance ?? 1) : 1e9,
                    data: d,
                });
                break;
            }

            // ---- Buzzer: resistive load ----
            case 'buzzer':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 50,
                    data: d,
                });
                break;

            // ---- Solenoid: resistive coil ----
            case 'solenoid':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 10,
                    data: d,
                });
                break;

            // ---- Circuit Breaker (manual & auto): same as fuse ----
            case 'breaker_manual':
            case 'breaker_auto':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.state.tripped ? 1e9 : 0.001,
                    data: d,
                });
                break;

            // ---- Fusible Link: same as fuse but higher trip ----
            case 'fusible_link':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.state.blown ? 1e9 : 0.001,
                    data: d,
                });
                break;

            // ---- TVS Clamp: bidirectional, low R when clamping ----
            case 'tvs_clamp':
                // Simplified: always looks like a very high resistance unless voltage exceeds clamp
                // (Real clamping behavior is handled in state eval)
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('anode'),
                    n2: net('cathode'),
                    value: 1e6, // Very high R in standby
                    data: d,
                });
                break;

            // ---- Cable Resistance: pure resistor ----
            case 'cable_resistance':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 0.1,
                    data: d,
                });
                break;

            // ---- Heater / Compressor Clutch: resistive loads ----
            case 'heater':
            case 'compressor_clutch':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 12,
                    data: d,
                });
                break;

            // ---- Wiper Motor: resistive motor + park switch ----
            case 'wiper_motor':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 6,
                    data: d,
                });
                break;

            // ---- Capacitor: open circuit in DC steady-state ----
            case 'capacitor':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: 1e9, // Open for DC
                    data: d,
                });
                break;

            // ---- Inductor: short circuit in DC steady-state ----
            case 'inductor':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('out'),
                    value: d.params?.resistance ?? 0.5, // DC resistance of coil
                    data: d,
                });
                break;

            // ---- Zener Diode: same as diode for DC ----
            case 'zener':
                components.push({
                    nodeId: node.id,
                    type: 'resistor',
                    n1: net('anode'),
                    n2: net('cathode'),
                    value: 1e6, // Simplified
                    data: d,
                });
                break;

            // ---- Potentiometer: two resistors A-wiper and wiper-B ----
            case 'potentiometer': {
                const totalR = d.params?.resistance ?? 10000;
                const pos = d.state?.position ?? 50;
                // pos=100 means wiper is closest to 'a'. So rAW is minimum.
                const rAW = (totalR * (100 - pos) / 100) || 0.001;
                const rWB = (totalR * pos / 100) || 0.001;
                components.push({
                    nodeId: node.id + '_aw',
                    type: 'resistor',
                    n1: net('a'),
                    n2: net('wiper'),
                    value: rAW,
                    data: d,
                });
                components.push({
                    nodeId: node.id + '_wb',
                    type: 'resistor',
                    n1: net('wiper'),
                    n2: net('b'),
                    value: rWB,
                    data: d,
                });
                break;
            }

            // ---- ECU: programmable controller ----
            case 'ecu': {
                const ni = d.params?.numInputs ?? 4;
                const no = d.params?.numOutputs ?? 4;
                const inputPulls = d.params?.inputPulls || {};
                const PULL_R = 4700; // 4.7 kΩ — typical automotive pull resistor
                // Inputs: sense + optional pull-up/pull-down
                for (let i = 1; i <= ni; i++) {
                    const pinId = `in${i}`;
                    const pull = inputPulls[pinId] || 'none';
                    if (pull === 'pullup') {
                        // Pull-up: 4.7kΩ from ECU VCC net to pin — only active when ECU is powered
                        components.push({
                            nodeId: node.id + `_pull${i}`,
                            type: 'resistor',
                            n1: net('vcc'),
                            n2: net(pinId),
                            value: PULL_R,
                            data: d,
                        });
                    } else if (pull === 'pulldown') {
                        // Pull-down: 4.7kΩ from pin to absolute ground
                        components.push({
                            nodeId: node.id + `_pull${i}`,
                            type: 'resistor',
                            n1: net(pinId),
                            n2: '0',
                            value: PULL_R,
                            data: d,
                        });
                    } else {
                        // No pull: high-impedance sense to ECU gnd
                        components.push({
                            nodeId: node.id + `_sense${i}`,
                            type: 'resistor',
                            n1: net(pinId),
                            n2: net('gnd'),
                            value: 1e6,
                            data: d,
                        });
                    }
                }
                // Outputs: if rule says active, path to chosen rail (VCC or GND); else check mode
                const outputStates = (d as any).state?.outputs || {};
                const outputDrives = d.params?.outputDrives || {};

                for (let i = 1; i <= no; i++) {
                    const pinId = `out${i}`;
                    const isActive = outputStates[pinId] || false;
                    const driveType = (outputDrives[pinId] || 'hsd').toLowerCase();

                    if (isActive) {
                        // All modes connect to their active target when ON
                        // Support both 'hsd'/'lsd' and 'high'/'low' aliases
                        const isHighSide = driveType === 'hsd' || driveType === 'high' || driveType === 'push-pull';
                        const targetRail = isHighSide ? 'vcc' : 'gnd';
                        components.push({
                            nodeId: node.id + `_drv${i}`,
                            type: 'resistor',
                            n1: net(targetRail),
                            n2: net(pinId),
                            value: 1, // 1Ω when driving
                            data: d,
                        });
                    } else {
                        // OFF state behavior
                        if (driveType === 'push-pull') {
                            // Push-pull pulls to ground when OFF
                            components.push({
                                nodeId: node.id + `_drv${i}`,
                                type: 'resistor',
                                n1: net('gnd'),
                                n2: net(pinId),
                                value: 1, // 1Ω when pulling low
                                data: d,
                            });
                        } else {
                            // HSD/LSD are High-Z when OFF (open drain/source)
                            components.push({
                                nodeId: node.id + `_drv${i}`,
                                type: 'resistor',
                                n1: net('gnd'), // Arbitrary rail for resistor, value determines state
                                n2: net(pinId),
                                value: 1e9, // High-Z
                                data: d,
                            });
                        }
                    }
                }
                break;
            }

            // ---- Connector: pass-through wires per pin ----
            case 'connector': {
                const numPins = d.params?.numPins ?? 4;
                for (let i = 1; i <= numPins; i++) {
                    components.push({
                        nodeId: node.id + `_p${i}`,
                        type: 'resistor',
                        n1: net(`in${i}`),
                        n2: net(`out${i}`),
                        value: 0.001,
                        data: d,
                    });
                }
                break;
            }

            // ---- Net Label: no components, handled by net merging ----
            case 'net_label':
                break;

            // ---- Temp Sensor: Linear voltage output (0.5-4.5V over min..max range) ----
            case 'temp_sensor': {
                const temp = d.state?.temperature ?? 25;
                const minTemp = (d as any).params?.minVal ?? -40;
                const maxTemp = (d as any).params?.maxVal ?? 150;
                const vMin = (d as any).params?.vMin ?? 0.5;
                const vMax = (d as any).params?.vMax ?? 4.5;
                const vOut = vMin + ((temp - minTemp) / (maxTemp - minTemp)) * (vMax - vMin);
                components.push({
                    nodeId: node.id,
                    type: 'vsource',
                    n1: net('out'),
                    n2: net('in'),
                    value: Math.max(0, Math.min(vMax + 0.5, vOut)),
                    data: d,
                });
                break;
            }

            // ---- Oil Pressure Sensor: Linear voltage output (0.5-4.5V over 0..maxPress) ----
            case 'oil_press_sensor': {
                const press = d.state?.pressure ?? 40;
                const maxPress = (d as any).params?.maxVal ?? 100;
                const vMin = (d as any).params?.vMin ?? 0.5;
                const vMax = (d as any).params?.vMax ?? 4.5;
                const vOut = vMin + (press / maxPress) * (vMax - vMin);
                components.push({
                    nodeId: node.id,
                    type: 'vsource',
                    n1: net('out'),
                    n2: net('in'),
                    value: Math.max(0, Math.min(vMax + 0.5, vOut)),
                    data: d,
                });
                break;
            }

            // ---- Air Pressure Sensor: MAP Sensor (Voltage Output, 3-wire: in=ref, out=signal) ----
            case 'air_press_sensor': {
                const press = d.state?.pressure ?? 101.3;
                const maxPress = (d as any).params?.maxVal ?? 250;
                const vMin = (d as any).params?.vMin ?? 0.5;
                const vMax = (d as any).params?.vMax ?? 4.5;
                const vOut = vMin + (press / maxPress) * (vMax - vMin);
                components.push({
                    nodeId: node.id,
                    type: 'vsource',
                    n1: net('out'),
                    n2: net('in'),
                    value: Math.max(0, vOut),
                    data: d,
                });
                break;
            }

            // ---- MAF Sensor: 3-wire (VCC, GND, OUT) ----
            case 'maf_sensor': {
                const flow = d.state?.flow ?? 5;
                const maxFlow = (d as any).params?.maxVal ?? 500;
                const vMin = (d as any).params?.vMin ?? 1.0;
                const vMax = (d as any).params?.vMax ?? 5.0;
                const vOut = vMin + (flow / maxFlow) * (vMax - vMin);
                components.push({
                    nodeId: node.id + '_pwr',
                    type: 'resistor',
                    n1: net('vcc'),
                    n2: net('gnd'),
                    value: 1000,
                    data: d,
                });
                components.push({
                    nodeId: node.id + '_out',
                    type: 'vsource',
                    n1: net('out'),
                    n2: net('gnd'),
                    value: Math.max(0, vOut),
                    data: d,
                });
                break;
            }

            // ---- Wheel Speed Sensor: VR Generator (in=ref/gnd, out=signal) ----
            case 'wss_sensor': {
                const speed = d.state?.speed ?? 0;
                const maxSpeed = (d as any).params?.maxVal ?? 300;
                const vMin = (d as any).params?.vMin ?? 0;
                const vMax = (d as any).params?.vMax ?? 12;
                const vOut = vMin + (speed / maxSpeed) * (vMax - vMin);
                components.push({
                    nodeId: node.id,
                    type: 'vsource',
                    n1: net('out'),
                    n2: net('in'),
                    value: Math.max(0, vOut),
                    data: d,
                });
                break;
            }

            // ---- RPM Sensor: Linear voltage output (0.5-4.5V over 0..maxRPM) ----
            case 'rpm_sensor': {
                const rpm = d.state?.rpm ?? 0;
                const maxRpm = (d as any).params?.maxVal ?? 8000;
                const vMin = (d as any).params?.vMin ?? 0.5;
                const vMax = (d as any).params?.vMax ?? 4.5;
                const vOut = vMin + (rpm / maxRpm) * (vMax - vMin);
                components.push({
                    nodeId: node.id,
                    type: 'vsource',
                    n1: net('out'),
                    n2: net('in'),
                    value: Math.max(0, Math.min(vMax + 0.5, vOut)),
                    data: d,
                });
                break;
            }

            // ---- Gauges: Voltage Sense lines (High-Z) ----
            case 'speedo_gauge':
            case 'tacho_gauge':
            case 'fuel_gauge': {
                components.push({
                    nodeId: node.id + '_sense',
                    type: 'resistor',
                    n1: net('in'),
                    n2: net('gnd'),
                    value: 1e6, // High impedance sense
                    data: d,
                });
                break;
            }

            // ---- CAN Networking Components ----
            case 'can_terminator': {
                components.push({
                    nodeId: node.id + '_term',
                    type: 'resistor',
                    n1: net('can_h'),
                    n2: net('can_l'),
                    value: 120,
                    data: d,
                });
                break;
            }

            case 'ecu_advanced': {
                // Power sink (VCC to absolute ground)
                components.push({
                    nodeId: node.id + '_pwr',
                    type: 'resistor',
                    n1: net('vcc'),
                    n2: '0',
                    value: 1000,
                    data: d,
                });
                // Inputs: high-impedance sense (1MΩ) + optional pull-up/pull-down
                const inputs = Array.isArray(d.params?.inputs) ? d.params.inputs : ['in1', 'in2'];
                const advInputPulls = d.params?.inputPulls || {};
                const ADV_PULL_R = 4700; // 4.7 kΩ
                inputs.forEach((pinName: string, idx: number) => {
                    const pull = advInputPulls[pinName] || 'none';
                    if (pull === 'pullup') {
                        // Pull-up: 4.7kΩ from ECU VCC net to pin — only active when ECU is powered
                        components.push({
                            nodeId: `${node.id}_pull_${pinName}`,
                            type: 'resistor',
                            n1: net('vcc'),
                            n2: net(pinName),
                            value: ADV_PULL_R,
                            data: d,
                        });
                    } else if (pull === 'pulldown') {
                        components.push({
                            nodeId: `${node.id}_pull_${pinName}`,
                            type: 'resistor',
                            n1: net(pinName),
                            n2: '0',
                            value: ADV_PULL_R,
                            data: d,
                        });
                    } else {
                        components.push({
                            nodeId: `${node.id}_sense_${pinName}_${idx}`,
                            type: 'resistor',
                            n1: net(pinName),
                            n2: '0',
                            value: 1e6,
                            data: d,
                        });
                    }
                });

                // Outputs based on logic state
                const outputNames = Array.isArray(d.params?.outputs) ? d.params.outputs : ['out1', 'out2'];
                const outputStates = d.state?.outputs || {};
                outputNames.forEach((pin: string) => {
                    const val = outputStates[pin];
                    if (typeof val === 'number' && !isNaN(val)) {
                        // Drive to voltage relative to absolute ground
                        components.push({
                            nodeId: node.id + '_out_' + pin,
                            type: 'vsource',
                            n1: net(pin),
                            n2: '0',
                            value: val,
                            data: d,
                        });
                    } else {
                        // High-Z: output not driven, add pulldown to prevent floating net
                        components.push({
                            nodeId: node.id + '_out_' + pin,
                            type: 'resistor',
                            n1: net(pin),
                            n2: '0',
                            value: 1e9,
                            data: d,
                        });
                    }
                });
                break;
            }

            case 'can_transceiver': {
                // Pin mapping for MNA
                // We model the transceiver as high-impedance loads on the bus
                // and a power-sink resistor for VCC/GND
                components.push({
                    nodeId: node.id + '_pwr',
                    type: 'resistor',
                    n1: net('vcc'),
                    n2: net('gnd'),
                    value: 1000, // 1k load
                    data: d,
                });
                const isTransmitting = d.state?.isTransmitting;

                if (isTransmitting) {
                    // Dominant State: Actively drive CAN_H to 3.5V and CAN_L to 1.5V
                    components.push({
                        nodeId: node.id + '_h_drv',
                        type: 'vsource',
                        n1: net('can_h'),
                        n2: net('gnd'),
                        value: 3.5, // Dominant High
                        data: d,
                    });
                    components.push({
                        nodeId: node.id + '_l_drv',
                        type: 'vsource',
                        n1: net('can_l'),
                        n2: net('gnd'),
                        value: 1.5, // Dominant Low
                        data: d,
                    });
                } else {
                    // Recessive State: Float around 2.5V with high impedance 
                    // (Actual bus gets pulled strongly to 2.5V by terminators, but we model weak transceiver bias)
                    // We'll use a resistor to 2.5V (can't easily do a V-source with series R in MNA if not modeled specifically, 
                    // so we do a simple high-Z path to ground and rely on bus biasing or assume 2.5V)
                    // Let's actually model it as a thevenin equivalent if we had vsource+R, 
                    // but for MNA simplicity with pure vsource/resistor components, we can just use 100k resistors to ground.
                    // To actually bias to 2.5V, we would need an internal node. 
                    // For now, let's just make it high-Z and let the App.tsx simulation read it. 
                    // Wait, if we want to SEE 2.5V, let's just provide a weak 2.5V source (we don't have series resistance easily without extra nodes)
                    // Let's use a 100k ohm resistor to a 2.5V node? Too complex. 
                    // We'll just leave it high-Z and if nothing drives it, MNA might read 0V or undefined.
                    // Let's just do a 1M to Ground for recessive for now so matrix doesn't become singular.
                    components.push({
                        nodeId: node.id + '_h_z',
                        type: 'resistor',
                        n1: net('can_h'),
                        n2: net('gnd'),
                        value: 1e6,
                        data: d,
                    });
                    components.push({
                        nodeId: node.id + '_l_z',
                        type: 'resistor',
                        n1: net('can_l'),
                        n2: net('gnd'),
                        value: 1e6,
                        data: d,
                    });
                }
                break;
            }

            case 'can_bus': {
                // Bridge left and right pins for CAN_H and CAN_L
                components.push({
                    nodeId: node.id + '_h_bridge',
                    type: 'resistor',
                    n1: net('can_h_l'),
                    n2: net('can_h_r'),
                    value: 0.001,
                    data: d,
                });
                components.push({
                    nodeId: node.id + '_l_bridge',
                    type: 'resistor',
                    n1: net('can_l_l'),
                    n2: net('can_l_r'),
                    value: 0.001,
                    data: d,
                });
                break;
            }

            // ---- Harness Entry/Exit: no local components, handled by harness net merging ----
            case 'harness_entry':
            case 'harness_exit':
                break;
        }
    }

    return components;
}

/**
 * MNA Solver
 *
 * For a circuit with N non-ground nodes and M voltage sources:
 *   [G  B] [v]   [i]
 *   [C  D] [j] = [e]
 *
 * G: conductance matrix (NxN)
 * B, C: voltage source coupling (NxM, MxN)
 * D: zero matrix (MxM)
 * v: node voltages (N)
 * j: voltage source currents (M)
 * i: current source vector (N)
 * e: voltage source values (M)
 */
function solveMNA(
    components: NetComponent[],
    groundNets: Set<string>,
): { voltages: Record<string, number>; currents: Record<string, number> } {
    // Collect all unique net names, excluding ground
    const allNets = new Set<string>();
    for (const c of components) {
        if (c.type === 'ground') continue;
        if (c.n1 && c.n1 !== '0') allNets.add(c.n1);
        if (c.n2 && c.n2 !== '0') allNets.add(c.n2);
    }

    // Remove ground nets from the unknown set
    for (const gn of groundNets) {
        allNets.delete(gn);
    }

    const netList = Array.from(allNets);
    const netIndex: Record<string, number> = {};
    netList.forEach((n, i) => { netIndex[n] = i; });

    const N = netList.length;

    // Collect voltage sources
    const vsources = components.filter(c => c.type === 'vsource');
    const M = vsources.length;

    const size = N + M;

    if (size === 0) {
        return { voltages: {}, currents: {} };
    }

    // Build matrices as 2D arrays
    const A: number[][] = Array.from({ length: size }, () => new Array(size).fill(0));
    const z: number[] = new Array(size).fill(0);

    // Helper to get index (-1 means ground)
    const idx = (net: string): number => {
        if (net === '0' || groundNets.has(net)) return -1;
        return netIndex[net] ?? -1;
    };

    // Stamp resistors
    for (const c of components) {
        if (c.type !== 'resistor') continue;
        const g = 1 / c.value;
        const i1 = idx(c.n1);
        const i2 = idx(c.n2);

        if (i1 >= 0) A[i1][i1] += g;
        if (i2 >= 0) A[i2][i2] += g;
        if (i1 >= 0 && i2 >= 0) {
            A[i1][i2] -= g;
            A[i2][i1] -= g;
        }
    }

    // Gmin - Small conductance to ground for all nodes to ensure matrix is non-singular
    const Gmin = 1e-12;
    for (let i = 0; i < N; i++) {
        A[i][i] += Gmin;
    }

    // Stamp voltage sources
    vsources.forEach((vs, k) => {
        const i1 = idx(vs.n1); // positive
        const i2 = idx(vs.n2); // negative
        const col = N + k;
        const row = N + k;

        if (i1 >= 0) {
            A[i1][col] += 1;
            A[row][i1] += 1;
        }
        if (i2 >= 0) {
            A[i2][col] -= 1;
            A[row][i2] -= 1;
        }

        z[row] = vs.value;
    });

    // Solve Ax = z using mathjs
    try {
        const matA = matrix(A);
        const matZ = matrix(z);
        const matAinv = inv(matA);
        const result = multiply(matAinv, matZ) as Matrix;
        const x = result.toArray() as number[];

        const voltages: Record<string, number> = {};
        for (let i = 0; i < N; i++) {
            voltages[netList[i]] = x[i];
        }
        // Ground nets are 0V
        for (const gn of groundNets) {
            voltages[gn] = 0;
        }

        const currents: Record<string, number> = {};
        vsources.forEach((vs, k) => {
            currents[vs.nodeId] = x[N + k];
        });

        return { voltages, currents };
    } catch (e) {
        // Singular matrix — likely open circuit or floating net
        console.error('MNA solve failed:', e);
        return { voltages: {}, currents: {} };
    }
}

/**
 * Main solver entry point.
 * Runs the iterative MNA loop.
 */
export function solveCircuit(nodes: CircuitNode[], edges: CircuitEdge[]): SolveResult {
    const events: SimEvent[] = [];
    const nodeUpdates: NodeUpdate[] = [];
    const edgeUpdates: EdgeUpdate[] = [];

    if (nodes.length === 0) {
        return { nodeUpdates, edgeUpdates, events, nodeVoltages: {}, netMap: {} };
    }

    const netMap = buildNets(nodes, edges);

    // ---- Net Label Merging ----
    // Group net_label nodes by their label name, then merge their nets.
    // First, merge each net label's 'in' and 'out' to the same net (bidirectional).
    for (const node of nodes) {
        const d = node.data as any;
        if (d.type === 'net_label') {
            const inNet = netMap[`${node.id}:in`];
            const outNet = netMap[`${node.id}:out`];
            if (inNet && outNet && inNet !== outNet) {
                for (const key of Object.keys(netMap)) {
                    if (netMap[key] === outNet) netMap[key] = inNet;
                }
            }
        }
    }
    // Then merge same-named labels
    const labelGroups: Record<string, string[]> = {};
    for (const node of nodes) {
        const d = node.data as any;
        if (d.type === 'net_label') {
            const name = d.label || 'NET';
            if (!labelGroups[name]) labelGroups[name] = [];
            const net = netMap[`${node.id}:in`];
            if (net) labelGroups[name].push(net);
        }
    }
    // For each group with 2+ nets, merge them by pointing all to the first
    for (const nets of Object.values(labelGroups)) {
        if (nets.length < 2) continue;
        const canonical = nets[0];
        for (let i = 1; i < nets.length; i++) {
            const old = nets[i];
            // Replace all occurrences of old net with canonical
            for (const key of Object.keys(netMap)) {
                if (netMap[key] === old) {
                    netMap[key] = canonical;
                }
            }
        }
    }

    // ---- Harness Entry/Exit Merging ----
    // For same-named harness_entry + harness_exit, merge pin_N nets
    const harnessGroups: Record<string, { entries: any[]; exits: any[] }> = {};
    for (const node of nodes) {
        const d = node.data as any;
        if (d.type === 'harness_entry' || d.type === 'harness_exit') {
            const name = d.label || 'H';
            if (!harnessGroups[name]) harnessGroups[name] = { entries: [], exits: [] };
            if (d.type === 'harness_entry') harnessGroups[name].entries.push(node);
            else harnessGroups[name].exits.push(node);
        }
    }
    for (const group of Object.values(harnessGroups)) {
        for (const entry of group.entries) {
            for (const exit of group.exits) {
                const entryPins = (entry.data as any).params?.numPins ?? 6;
                const exitPins = (exit.data as any).params?.numPins ?? 6;
                const pinCount = Math.min(entryPins, exitPins);
                for (let i = 1; i <= pinCount; i++) {
                    const entryNet = netMap[`${entry.id}:pin_${i}`];
                    const exitNet = netMap[`${exit.id}:pin_${i}`];
                    if (entryNet && exitNet && entryNet !== exitNet) {
                        // Merge exit net into entry net
                        for (const key of Object.keys(netMap)) {
                            if (netMap[key] === exitNet) {
                                netMap[key] = entryNet;
                            }
                        }
                    }
                }
            }
        }
    }

    // Build ground net set
    const groundNets = new Set<string>();
    for (const node of nodes) {
        const d = node.data as AnyComponentData;
        if (d.type === 'ground') {
            const gndNet = netMap[`${node.id}:gnd`];
            if (gndNet) groundNets.add(gndNet);
        }
    }

    // If no ground, we can't solve
    if (groundNets.size === 0) {
        events.push({ level: 'warn', message: 'No ground node found. Add a ground to complete the circuit.' });
        return { nodeUpdates, edgeUpdates, events, nodeVoltages: {}, netMap };
    }

    // Clone node states for iteration
    const nodeStates: Record<string, any> = {};
    for (const node of nodes) {
        nodeStates[node.id] = { ...(node.data as any).state };
    }

    let voltages: Record<string, number> = {};
    const MAX_ITERATIONS = 20;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
        // Build netlist from current states
        const augmentedNodes = nodes.map(n => ({
            ...n,
            data: {
                ...n.data,
                state: nodeStates[n.id] || (n.data as any).state,
            },
        })) as CircuitNode[];

        const components = buildNetlist(augmentedNodes, edges, netMap);
        const { voltages: newVoltages } = solveMNA(components, groundNets);
        voltages = newVoltages;

        let stateChanged = false;

        // Evaluate relays
        for (const node of nodes) {
            const d = node.data as AnyComponentData;
            if (d.type === 'relay_spdt' || (d as any).type === 'relay_spst' || (d as any).type === 'relay_dual87'
                || (d as any).type === 'relay_delay_on' || (d as any).type === 'relay_delay_off') {
                const vCoilIn = voltages[netMap[`${node.id}:coil_in`]] ?? 0;
                const vCoilOut = voltages[netMap[`${node.id}:coil_out`]] ?? 0;
                const coilVoltage = Math.abs(vCoilIn - vCoilOut);
                const wasEnergized = nodeStates[node.id]?.energized || false;
                const pullIn = (d as any).params.pullInVoltage ?? 8;
                const release = (d as any).params.releaseVoltage ?? 3;

                let nowEnergized = wasEnergized;
                if (!wasEnergized && coilVoltage >= pullIn) nowEnergized = true;
                if (wasEnergized && coilVoltage < release) nowEnergized = false;

                if (wasEnergized !== nowEnergized) {
                    nodeStates[node.id] = { ...nodeStates[node.id], energized: nowEnergized };
                    stateChanged = true;
                    events.push({
                        level: 'info',
                        message: `Relay ${d.label} ${nowEnergized ? 'ENERGIZED' : 'DE-ENERGIZED'} (coil: ${coilVoltage.toFixed(1)}V)`,
                    });
                }
            }

            // Latching relay: check SET and RESET coils
            if ((d as any).type === 'relay_latching') {
                const vSetIn = voltages[netMap[`${node.id}:set_in`]] ?? 0;
                const vSetOut = voltages[netMap[`${node.id}:set_out`]] ?? 0;
                const setV = Math.abs(vSetIn - vSetOut);
                const vRstIn = voltages[netMap[`${node.id}:reset_in`]] ?? 0;
                const vRstOut = voltages[netMap[`${node.id}:reset_out`]] ?? 0;
                const rstV = Math.abs(vRstIn - vRstOut);
                const pullIn = (d as any).params.pullInVoltage ?? 8;
                const wasEnergized = nodeStates[node.id]?.energized || false;
                let nowEnergized = wasEnergized;

                if (setV >= pullIn && !wasEnergized) nowEnergized = true;
                if (rstV >= pullIn && wasEnergized) nowEnergized = false;

                if (wasEnergized !== nowEnergized) {
                    nodeStates[node.id] = { ...nodeStates[node.id], energized: nowEnergized };
                    stateChanged = true;
                    events.push({
                        level: 'info',
                        message: `Latching Relay ${(d as any).label} ${nowEnergized ? 'SET' : 'RESET'}`,
                    });
                }
            }
        }

        // Evaluate ECU rules
        for (const node of nodes) {
            const d = node.data as any;
            if (d.type !== 'ecu') continue;
            const rules: any[] = d.params?.rules || [];
            if (rules.length === 0) continue;

            const prevOutputs: Record<string, boolean> = nodeStates[node.id]?.outputs || {};
            const newOutputs: Record<string, boolean> = {};

            // Initialize all outputs to false
            const numOut = d.params?.numOutputs ?? 4;
            for (let i = 1; i <= numOut; i++) newOutputs[`out${i}`] = false;

            // Evaluate each rule
            for (const rule of rules) {
                if (!rule.inputPin || !rule.outputPin) continue;
                const inNet = netMap[`${node.id}:${rule.inputPin}`];
                const gndNet = netMap[`${node.id}:gnd`];
                const vIn = (voltages[inNet] ?? 0) - (voltages[gndNet] ?? 0);
                let threshold = rule.threshold ?? 6;
                if (rule.compareType === 'pin' && rule.comparePin) {
                    const compNet = netMap[`${node.id}:${rule.comparePin}`];
                    threshold = (voltages[compNet] ?? 0) - (voltages[gndNet] ?? 0);
                }
                let conditionMet = false;

                switch (rule.condition) {
                    case '>': conditionMet = vIn > threshold; break;
                    case '<': conditionMet = vIn < threshold; break;
                    case '>=': conditionMet = vIn >= threshold; break;
                    case '<=': conditionMet = vIn <= threshold; break;
                    case '=': conditionMet = Math.abs(vIn - threshold) < 0.5; break;
                    default: conditionMet = vIn > threshold; break;
                }

                if (conditionMet) {
                    newOutputs[rule.outputPin] = true;
                }
            }

            // Check if any output changed
            let ecuChanged = false;
            for (const key of Object.keys(newOutputs)) {
                if (prevOutputs[key] !== newOutputs[key]) {
                    ecuChanged = true;
                    break;
                }
            }

            if (ecuChanged) {
                nodeStates[node.id] = { ...nodeStates[node.id], outputs: newOutputs };
                stateChanged = true;
                events.push({
                    level: 'info',
                    message: `ECU ${d.label} outputs updated`,
                });
            }
        }

        // Evaluate fuses
        for (const node of nodes) {
            const d = node.data as AnyComponentData;
            if (d.type === 'fuse' && !nodeStates[node.id]?.blown) {
                const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
                const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
                const fuseR = 0.001;
                const fuseCurrent = Math.abs(vIn - vOut) / fuseR;

                if (fuseCurrent > d.params.tripCurrent) {
                    nodeStates[node.id] = { ...nodeStates[node.id], blown: true };
                    stateChanged = true;
                    events.push({
                        level: 'error',
                        message: `Fuse ${d.label} BLOWN! (${fuseCurrent.toFixed(1)}A > ${d.params.tripCurrent}A)`,
                    });
                }
            }

            // Breakers trip like fuses
            if (((d as any).type === 'breaker_manual' || (d as any).type === 'breaker_auto') && !nodeStates[node.id]?.tripped) {
                const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
                const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
                const cbCurrent = Math.abs(vIn - vOut) / 0.001;
                if (cbCurrent > (d as any).params.tripCurrent) {
                    nodeStates[node.id] = { ...nodeStates[node.id], tripped: true };
                    stateChanged = true;
                    events.push({
                        level: 'error',
                        message: `Breaker ${(d as any).label} TRIPPED! (${cbCurrent.toFixed(1)}A > ${(d as any).params.tripCurrent}A)`,
                    });
                }
            }

            // Fusible link blows like a fuse
            if ((d as any).type === 'fusible_link' && !nodeStates[node.id]?.blown) {
                const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
                const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
                const flCurrent = Math.abs(vIn - vOut) / 0.001;
                if (flCurrent > (d as any).params.tripCurrent) {
                    nodeStates[node.id] = { ...nodeStates[node.id], blown: true };
                    stateChanged = true;
                    events.push({
                        level: 'error',
                        message: `Fusible Link ${(d as any).label} BLOWN! (${flCurrent.toFixed(1)}A > ${(d as any).params.tripCurrent}A)`,
                    });
                }
            }

            // Diode polarity check — flip forward/reverse state each iteration
            if ((d as any).type === 'diode') {
                const vAnode    = voltages[netMap[`${node.id}:anode`]]   ?? 0;
                const vCathode  = voltages[netMap[`${node.id}:cathode`]] ?? 0;
                const wasFwd    = nodeStates[node.id]?.forward !== false;
                const nowFwd    = vAnode > vCathode;
                if (wasFwd !== nowFwd) {
                    nodeStates[node.id] = { ...nodeStates[node.id], forward: nowFwd };
                    stateChanged = true;
                }
            }

            // Wiper motor park logic (Static check for iteration)
            if ((d as any).type === 'wiper_motor') {
                const pos = nodeStates[node.id]?.pos ?? 0;
                const nowParkClosed = pos !== 0; // Fixed: pos doesn't change during iteration
                const wasParkClosed = nodeStates[node.id]?.parkClosed ?? false;

                if (nowParkClosed !== wasParkClosed) {
                    nodeStates[node.id] = { ...nodeStates[node.id], parkClosed: nowParkClosed };
                    stateChanged = true;
                }
            }
        }

        if (!stateChanged) break;
    }

    // Build node updates
    for (const node of nodes) {
        const d = node.data as AnyComponentData;
        const newState = nodeStates[node.id];
        const oldState = (d as any).state;

        // Lamp on/off + proportional brightness
        if (d.type === 'lamp') {
            const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
            const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
            const voltageDrop = Math.abs(vIn - vOut);
            const ratedVoltage = (d as any).params?.ratedVoltage ?? 12;
            const brightness = voltageDrop < 0.5 ? 0 : Math.min(1, voltageDrop / ratedVoltage);
            const isOn = brightness > 0;
            if (isOn !== oldState?.on || Math.abs((oldState?.brightness ?? 0) - brightness) > 0.01) {
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, on: isOn, brightness } } as any });
            }
        }

        // Motor running + proportional speed
        if ((d as any).type === 'motor') {
            const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
            const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
            const voltageDrop = Math.abs(vIn - vOut);
            const ratedVoltage = (d as any).params?.ratedVoltage ?? 12;
            const speedRatio = voltageDrop < 0.5 ? 0 : Math.min(1, voltageDrop / ratedVoltage);
            const isRunning = speedRatio > 0;
            if (isRunning !== oldState?.running || Math.abs((oldState?.speedRatio ?? 0) - speedRatio) > 0.01) {
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, running: isRunning, speedRatio } } as any });
            }
        }

        // Wiper Motor running & position advancement
        if ((d as any).type === 'wiper_motor') {
            const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
            const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
            const isRunning = Math.abs(vIn - vOut) > 0.5;

            let pos = newState?.pos ?? 0;
            if (isRunning) {
                // Advance position (30 degree steps for clearer visual motion)
                pos = (pos + 30) % 360;
            }

            const parkClosed = pos !== 0;
            const updatedState = { ...newState, running: isRunning, pos, parkClosed };

            if (JSON.stringify(updatedState) !== JSON.stringify(oldState)) {
                nodeUpdates.push({ id: node.id, data: { state: updatedState } as any });
            }
        }

        // LED on/off
        if ((d as any).type === 'led') {
            const vIn = voltages[netMap[`${node.id}:anode`]] ?? 0;
            const vOut = voltages[netMap[`${node.id}:cathode`]] ?? 0;
            const isOn = Math.abs(vIn - vOut) > 0.5;
            if (isOn !== oldState?.on) {
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, on: isOn } } as any });
            }
        }

        // Buzzer on/off
        if ((d as any).type === 'buzzer') {
            const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
            const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
            const isOn = Math.abs(vIn - vOut) > 0.5;
            if (isOn !== oldState?.on) {
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, on: isOn } } as any });
            }
        }

        // Solenoid activated
        if ((d as any).type === 'solenoid') {
            const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
            const vOut = voltages[netMap[`${node.id}:out`]] ?? 0;
            const isActivated = Math.abs(vIn - vOut) > 1;
            if (isActivated !== oldState?.activated) {
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, activated: isActivated } } as any });
            }
        }

        // Flasher toggle (oscillates each simulation tick when powered)
        if ((d as any).type === 'flasher') {
            const vIn = voltages[netMap[`${node.id}:in`]] ?? 0;
            const hasPower = Math.abs(vIn) > 1;
            if (hasPower) {
                const wasOn = newState?.outputOn || false;
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, outputOn: !wasOn } } as any });
            } else if (newState?.outputOn) {
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, outputOn: false } } as any });
            }
        }

        // Potentiometer: write back wiper voltage for UI display
        if ((d as any).type === 'potentiometer') {
            const wiperVoltage = voltages[netMap[`${node.id}:wiper`]] ?? undefined;
            if (wiperVoltage !== oldState?.wiperVoltage) {
                nodeUpdates.push({ id: node.id, data: { state: { ...newState, wiperVoltage } } as any });
            }
        }

        // Gauges, Sensors & Networking: Update voltage/value state for UI display
        if (['speedo_gauge', 'tacho_gauge', 'fuel_gauge', 'temp_sensor', 'oil_press_sensor', 'air_press_sensor', 'maf_sensor', 'wss_sensor', 'rpm_sensor', 'can_transceiver', 'ecu_advanced'].includes(d.type as string)) {
            const vIn = voltages[netMap[`${node.id}:vcc`]] ?? voltages[netMap[`${node.id}:in`]] ?? voltages[netMap[`${node.id}:out`]] ?? 0;
            const vGnd = voltages[netMap[`${node.id}:gnd`]] ?? 0;
            const voltage = Math.abs(vIn - vGnd);

            const vH = voltages[netMap[`${node.id}:can_h`]] ?? 0;
            const vL = voltages[netMap[`${node.id}:can_l`]] ?? 0;

            if (voltage !== oldState?.vcc || vH !== oldState?.vH || vL !== oldState?.vL) {
                nodeUpdates.push({
                    id: node.id,
                    data: {
                        state: {
                            ...newState,
                            vcc: voltage,
                            vH,
                            vL
                        }
                    } as any
                });
            }
        }

        // Programmable Node state updates (ECU, Relays, etc.)
        if (['ecu', 'relay_spdt', 'relay_spst', 'relay_dual87', 'relay_latching', 'relay_delay_on', 'relay_delay_off', 'fuse', 'fusible_link', 'breaker_manual', 'breaker_auto'].includes(d.type as string)) {
            if (JSON.stringify(newState) !== JSON.stringify(oldState)) {
                nodeUpdates.push({ id: node.id, data: { state: newState } as any });
            }
        }
    }

    // Build edge updates (wire coloring)
    for (const edge of edges) {
        const sourceNet = netMap[`${edge.source}:${(edge.sourceHandle || 'out').toLowerCase()}`];
        const targetNet = netMap[`${edge.target}:${(edge.targetHandle || 'in').toLowerCase()}`];
        const vSource = voltages[sourceNet] ?? null;
        const vTarget = voltages[targetNet] ?? null;

        let color = '#9ca3af'; // grey / floating
        let animated = false;

        // Use the average voltage to determine color
        const voltage = vSource !== null && vTarget !== null
            ? (vSource + vTarget) / 2
            : vSource ?? vTarget;

        // Only animate when BOTH ends have meaningful voltage
        // (indicates actual current flow, not just a floating/open-circuit wire)
        const bothEndsLive = vSource !== null && vTarget !== null
            && Math.abs(vSource - vTarget) < 5  // not across an open contact
            && (Math.abs(vSource) > 0.5 || Math.abs(vTarget) > 0.5);

        if (voltage !== null) {
            if (Math.abs(voltage) < 0.1) {
                color = '#22c55e'; // green = ground
            } else if (voltage > 11) {
                color = '#ef4444'; // red = B+
                animated = bothEndsLive;
            } else if (voltage > 5) {
                color = '#f97316'; // orange = switched power
                animated = bothEndsLive;
            } else if (voltage > 0.5) {
                color = '#3b82f6'; // blue = signal
                animated = bothEndsLive;
            }
        }

        edgeUpdates.push({
            id: edge.id,
            style: { stroke: color, strokeWidth: 2 },
            animated,
            data: { voltage },
        });
    }

    return { nodeUpdates, edgeUpdates, events, nodeVoltages: voltages, netMap };
}
