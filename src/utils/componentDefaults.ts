import type { Node } from '@xyflow/react';
import useStore from '../store/useStore';

/** Generate a unique node ID that won't collide with any existing node */
export function getNextNodeId(): string {
    const nodes = useStore.getState().nodes;
    let maxId = 0;
    for (const node of nodes) {
        const num = parseInt(node.id, 10);
        if (!isNaN(num) && num > maxId) maxId = num;
    }
    return String(maxId + 1);
}

export function makeDefaultData(type: string, id: string): Record<string, any> {
    switch (type) {
        case 'battery':
            return { id, type, label: `BAT${id}`, state: {}, params: { voltage: 12, internalResistance: 0.05 } };
        case 'ground':
            return { id, type, label: `GND${id}`, state: {}, params: {} };
        case 'resistor':
            return { id, type, label: `R${id}`, state: {}, params: { resistance: 100 } };
        case 'lamp':
            return { id, type, label: `L${id}`, state: { on: false }, params: { resistance: 24 } };
        case 'switch_spst':
            return { id, type, label: `S${id}`, state: { closed: false }, params: {} };
        case 'switch_momentary':
            return { id, type: 'switch_spst', label: `MOM${id}`, state: { closed: false }, params: {} };
        case 'fuse':
            return { id, type, label: `F${id}`, state: { blown: false }, params: { tripCurrent: 15, tripTimeMs: 100 } };
        case 'relay_spdt':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'splice':
            return { id, type, label: `SP${id}`, state: {}, params: {} };
        case 'motor':
            return { id, type, label: `M${id}`, state: { running: false }, params: { resistance: 4 } };
        case 'led':
            return { id, type, label: `LED${id}`, state: { on: false }, params: { resistance: 150, color: '#ef4444' } };
        case 'diode':
            return { id, type, label: `D${id}`, state: {}, params: { forwardDrop: 0.7 } };
        case 'flasher':
            return { id, type, label: `FL${id}`, state: { outputOn: false }, params: { rateHz: 1.5, resistance: 1 } };
        case 'buzzer':
            return { id, type, label: `BZ${id}`, state: { on: false }, params: { resistance: 50 } };
        case 'solenoid':
            return { id, type, label: `SOL${id}`, state: { activated: false }, params: { resistance: 10 } };
        case 'switch_momentary_no':
            return { id, type, label: `PB_NO${id}`, state: { closed: false }, params: {} };
        case 'switch_momentary_nc':
            return { id, type, label: `PB_NC${id}`, state: { open: false }, params: {} };
        case 'switch_spdt':
            return { id, type, label: `SW${id}`, state: { position: 'nc' }, params: {} };
        case 'switch_dpdt':
            return { id, type, label: `DPDT${id}`, state: { position: 'nc' }, params: {} };
        case 'switch_ignition':
            return { id, type, label: `IGN${id}`, state: { position: 'off' }, params: {} };
        case 'switch_master':
            return { id, type, label: `MSTR${id}`, state: { closed: false }, params: {} };
        case 'breaker_manual':
            return { id, type, label: `CB${id}`, state: { tripped: false }, params: { tripCurrent: 20, tripTimeMs: 50 } };
        case 'breaker_auto':
            return { id, type, label: `ACB${id}`, state: { tripped: false }, params: { tripCurrent: 20, tripTimeMs: 50, resetDelayMs: 2000 } };
        case 'fusible_link':
            return { id, type, label: `FL${id}`, state: { blown: false }, params: { tripCurrent: 80, tripTimeMs: 500 } };
        case 'tvs_clamp':
            return { id, type, label: `TVS${id}`, state: {}, params: { clampVoltage: 36, forwardDrop: 0.7 } };
        case 'cable_resistance':
            return { id, type, label: `W${id}`, state: {}, params: { resistance: 0.1, length_m: 10, gauge: '10 AWG' } };
        case 'relay_spst':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'relay_dual87':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'relay_latching':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } };
        case 'relay_delay_on':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8, delayMs: 2000 } };
        case 'relay_delay_off':
            return { id, type, label: `K${id}`, state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8, delayMs: 5000 } };
        case 'heater':
            return { id, type, label: `HTR${id}`, state: { on: false }, params: { resistance: 12 } };
        case 'compressor_clutch':
            return { id, type, label: `AC${id}`, state: { activated: false }, params: { resistance: 3 } };
        case 'wiper_motor':
            return { id, type, label: `WPR${id}`, state: { running: false, parkClosed: true }, params: { resistance: 6 } };
        case 'capacitor':
            return { id, type, label: `C${id}`, state: {}, params: { capacitance: '100µF' } };
        case 'inductor':
            return { id, type, label: `L${id}`, state: {}, params: { inductance: '10mH', resistance: 0.5 } };
        case 'zener':
            return { id, type, label: `ZD${id}`, state: {}, params: { breakdownVoltage: 5.1, forwardDrop: 0.7 } };
        case 'potentiometer':
            return { id, type, label: `POT${id}`, state: { position: 50 }, params: { resistance: 10000 } };
        case 'ecu':
            return { id, type, label: `ECU${id}`, state: {}, params: { numInputs: 4, numOutputs: 4 } };
        case 'connector':
            return { id, type, label: `J${id}`, state: {}, params: { numPins: 4 } };
        case 'net_label':
            return { id, type, label: `NET${id}`, state: {}, params: { color: '#38bdf8' } };
        case 'harness_entry':
            return { id, type, label: `H${id}`, state: {}, params: { numPins: 6, color: '#64748b' } };
        case 'harness_exit':
            return { id, type, label: `H${id}`, state: {}, params: { numPins: 6, color: '#64748b' } };
        case 'temp_sensor':
            return { id, type, label: `TEMP${id}`, state: { temperature: 25 }, params: {} };
        case 'oil_press_sensor':
            return { id, type, label: `OIL${id}`, state: { pressure: 40 }, params: {} };
        case 'air_press_sensor':
            return { id, type, label: `AIR${id}`, state: { pressure: 101.3 }, params: {} };
        case 'maf_sensor':
            return { id, type, label: `MAF${id}`, state: { flow: 5 }, params: {} };
        case 'tps_sensor':
            return { id, type, label: `TPS${id}`, state: { position: 0 }, params: { vMin: 0.5, vMax: 4.5 } };
        case 'ignition_coil':
            return { id, type, label: `IGN${id}`, state: { activated: false }, params: { resistance: 1.2 } };
        case 'throttle_actuator':
            return { id, type, label: `THA${id}`, state: { activated: false, position: 0 }, params: { resistance: 2.5 } };
        case 'rpm_sensor':
            return { id, type, label: `RPM${id}`, state: { rpm: 0 }, params: {} };
        case 'wss_sensor':
            return { id, type, label: `WSS${id}`, state: { speed: 0 }, params: {} };
        case 'speedo_gauge':
            return { id, type, label: `SPD${id}`, state: { voltage: 0 }, params: {} };
        case 'tacho_gauge':
            return { id, type, label: `TACH${id}`, state: { voltage: 0 }, params: {} };
        case 'fuel_gauge':
            return { id, type, label: `FUEL${id}`, state: { voltage: 0 }, params: {} };
        case 'can_bus':
            return { id, type, label: `CAN${id}`, state: {}, params: { bitrate: 500000, mode: 'HS-CAN' } };
        case 'can_transceiver':
            return { id, type, label: `XCVR${id}`, state: { vcc: 0 }, params: {} };
        case 'can_terminator':
            return { id, type, label: `TERM${id}`, state: {}, params: {} };
        case 'ecu_advanced':
            return { id, type, label: `ECU${id}`, state: { vcc: 0 }, params: { canMode: 'J1939', sourceAddress: 0x01 } };
        case 'schematic_frame':
            return { id, type, label: `FRAME${id}`, state: {}, params: { frameName: `Sheet ${id}`, frameDescription: '' } };
        default:
            return { id, type: 'resistor', label: `R${id}`, state: {}, params: { resistance: 100 } };
    }
}

/** Build a complete React Flow node for a palette component type. */
export function makeNode(type: string, position: { x: number; y: number }, id = getNextNodeId()): Node {
    const isFrame = type === 'schematic_frame';
    return {
        id,
        type,
        position,
        data: makeDefaultData(type, id),
        ...(isFrame ? { zIndex: -1, style: { width: 800, height: 500 } } : {}),
    } as Node;
}

/**
 * State keys written by the simulation (as opposed to user inputs such as a
 * switch position or sensor reading). Cleared when the simulation is reset.
 */
const RUNTIME_STATE_KEYS = [
    'blown', 'tripped', 'trippedAt', 'energized', 'coilOn', 'coilChangedAt',
    'on', 'brightness', 'running', 'speedRatio', 'activated', 'outputOn',
    'junction', 'forward', 'conducting', 'current', 'powered',
    'vcc', 'vH', 'vL', 'wiperVoltage', 'pos', 'parkClosed',
    'outputs', 'outputVoltages', 'inputVoltages', 'pendingCAN',
    'isTransmitting', 'isHealthy', 'lastFrames',
];

/** Return the node with all simulation-written state cleared. */
export function resetRuntimeState(node: Node): Node {
    const data = node.data as Record<string, any>;
    if (!data?.state) return node;
    const state = { ...data.state };
    for (const key of RUNTIME_STATE_KEYS) delete state[key];
    // The throttle actuator's position is driven by the sim, unlike TPS/pot positions
    if (data.type === 'throttle_actuator') state.position = 0;
    return { ...node, data: { ...data, state } };
}
