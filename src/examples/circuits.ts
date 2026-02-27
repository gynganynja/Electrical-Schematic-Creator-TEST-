/**
 * Starter example circuits as JSON project data.
 */
import type { CircuitNode, CircuitEdge } from '../types/circuit';

export interface ExampleProject {
    name: string;
    description: string;
    nodes: CircuitNode[];
    edges: CircuitEdge[];
}

/** 1. Basic Fused Headlight Circuit */
const headlightCircuit: ExampleProject = {
    name: 'Fused Headlight',
    description: 'Simple circuit: Battery → Fuse → Switch → Lamp → Ground',
    nodes: [
        { id: '1', type: 'battery', position: { x: 100, y: 200 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'fuse', position: { x: 300, y: 150 }, data: { id: '2', type: 'fuse', label: 'F1', state: { blown: false }, params: { tripCurrent: 15, tripTimeMs: 100 } } },
        { id: '3', type: 'switch_spst', position: { x: 500, y: 150 }, data: { id: '3', type: 'switch_spst', label: 'S1', state: { closed: false }, params: {} } },
        { id: '4', type: 'lamp', position: { x: 700, y: 200 }, data: { id: '4', type: 'lamp', label: 'HEADLIGHT', state: { on: false }, params: { resistance: 24 } } },
        { id: '5', type: 'ground', position: { x: 400, y: 400 }, data: { id: '5', type: 'ground', label: 'GND1', state: {}, params: {} } },
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e2', source: '2', sourceHandle: 'out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e3', source: '3', sourceHandle: 'out', target: '4', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e4', source: '4', sourceHandle: 'out', target: '5', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e5', source: '1', sourceHandle: 'negative', target: '5', targetHandle: 'gnd', data: { resistance: 0.001 } },
    ] as any[],
};

/** 2. Relay-Driven Work Lights */
const relayWorkLights: ExampleProject = {
    name: 'Relay Work Lights',
    description: 'Switch drives relay coil → relay contact powers the lamp',
    nodes: [
        { id: '1', type: 'battery', position: { x: 100, y: 250 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'fuse', position: { x: 300, y: 100 }, data: { id: '2', type: 'fuse', label: 'F1', state: { blown: false }, params: { tripCurrent: 10, tripTimeMs: 100 } } },
        { id: '3', type: 'switch_spst', position: { x: 500, y: 100 }, data: { id: '3', type: 'switch_spst', label: 'S1', state: { closed: false }, params: {} } },
        { id: '4', type: 'relay_spdt', position: { x: 700, y: 200 }, data: { id: '4', type: 'relay_spdt', label: 'K1', state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } } },
        { id: '5', type: 'lamp', position: { x: 900, y: 300 }, data: { id: '5', type: 'lamp', label: 'WORK_LIGHT', state: { on: false }, params: { resistance: 12 } } },
        { id: '6', type: 'ground', position: { x: 500, y: 450 }, data: { id: '6', type: 'ground', label: 'GND1', state: {}, params: {} } },
    ] as any[],
    edges: [
        // Switch path to coil
        { id: 'e1', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e2', source: '2', sourceHandle: 'out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e3', source: '3', sourceHandle: 'out', target: '4', targetHandle: 'coil_in', data: { resistance: 0.001 } },
        { id: 'e4', source: '4', sourceHandle: 'coil_out', target: '6', targetHandle: 'gnd', data: { resistance: 0.001 } },
        // Power through relay contact to lamp
        { id: 'e5', source: '1', sourceHandle: 'positive', target: '4', targetHandle: 'com', data: { resistance: 0.001 } },
        { id: 'e6', source: '4', sourceHandle: 'no', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e7', source: '5', sourceHandle: 'out', target: '6', targetHandle: 'gnd', data: { resistance: 0.001 } },
        // Battery negative to ground
        { id: 'e8', source: '1', sourceHandle: 'negative', target: '6', targetHandle: 'gnd', data: { resistance: 0.001 } },
    ] as any[],
};

/** 3. Starter Solenoid Control */
const starterSolenoid: ExampleProject = {
    name: 'Starter Solenoid Control',
    description: 'Key switch → relay → solenoid (high-current resistive load)',
    nodes: [
        { id: '1', type: 'battery', position: { x: 50, y: 250 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'fuse', position: { x: 250, y: 100 }, data: { id: '2', type: 'fuse', label: 'F1', state: { blown: false }, params: { tripCurrent: 5, tripTimeMs: 100 } } },
        { id: '3', type: 'switch_spst', position: { x: 450, y: 100 }, data: { id: '3', type: 'switch_spst', label: 'KEY_START', state: { closed: false }, params: {} } },
        { id: '4', type: 'relay_spdt', position: { x: 650, y: 200 }, data: { id: '4', type: 'relay_spdt', label: 'K_START', state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } } },
        { id: '5', type: 'resistor', position: { x: 900, y: 300 }, data: { id: '5', type: 'resistor', label: 'SOLENOID', state: {}, params: { resistance: 0.5 } } },
        { id: '6', type: 'fuse', position: { x: 700, y: 50 }, data: { id: '6', type: 'fuse', label: 'F_MAIN', state: { blown: false }, params: { tripCurrent: 80, tripTimeMs: 100 } } },
        { id: '7', type: 'ground', position: { x: 500, y: 450 }, data: { id: '7', type: 'ground', label: 'GND1', state: {}, params: {} } },
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e2', source: '2', sourceHandle: 'out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e3', source: '3', sourceHandle: 'out', target: '4', targetHandle: 'coil_in', data: { resistance: 0.001 } },
        { id: 'e4', source: '4', sourceHandle: 'coil_out', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e5', source: '1', sourceHandle: 'positive', target: '6', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e6', source: '6', sourceHandle: 'out', target: '4', targetHandle: 'com', data: { resistance: 0.001 } },
        { id: 'e7', source: '4', sourceHandle: 'no', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e8', source: '5', sourceHandle: 'out', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e9', source: '1', sourceHandle: 'negative', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } },
    ] as any[],
};

/** 4. Park Brake Alarm (Negative-Trigger Latch) */
const parkbrakeAlarmNeg: ExampleProject = {
    name: 'Park Brake Alarm (Neg Latch)',
    description: 'Relay latch circuit: Alarm triggers if door opens while park brake is NOT applied.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 80, y: 220 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'switch_spst', position: { x: 250, y: 220 }, data: { id: '2', type: 'switch_spst', label: 'Park Brake (OFF=+12V)', state: { closed: true }, params: {} } },
        { id: '3', type: 'switch_spst', position: { x: 430, y: 220 }, data: { id: '3', type: 'switch_spst', label: 'Door (OPEN=Earth)', state: { closed: false }, params: {} } },
        { id: '4', type: 'relay_spdt', position: { x: 430, y: 20 }, data: { id: '4', type: 'relay_spdt', label: 'Latch Relay', state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } } },
        { id: '5', type: 'lamp', position: { x: 760, y: 220 }, data: { id: '5', type: 'lamp', label: 'Alarm Buzzer', state: { on: false }, params: { resistance: 24 } } },
        { id: '6', type: 'ground', position: { x: 760, y: 420 }, data: { id: '6', type: 'ground', label: 'GND', state: {}, params: {} } },
        { id: '10', type: 'splice', position: { x: 560, y: 390 }, data: { id: '10', type: 'splice', label: 'GND Bus', state: {}, params: {} } },
        { id: '8', type: 'splice', position: { x: 350, y: 260 }, data: { id: '8', type: 'splice', label: 'Logic Node A', state: {}, params: {} } },
        { id: '9', type: 'splice', position: { x: 560, y: 260 }, data: { id: '9', type: 'splice', label: 'Latch Node B', state: {}, params: {} } }
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'negative', target: '10', targetHandle: 'b_out', data: { resistance: 0.001 } },
        { id: 'e2', source: '10', sourceHandle: 'r_out', target: '6', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e3', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e4', source: '2', sourceHandle: 'out', target: '8', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e5', source: '8', sourceHandle: 'r_out', target: '4', targetHandle: 'coil_in', data: { resistance: 0.001 } },
        { id: 'e6', source: '8', sourceHandle: 't_out', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e7', source: '4', sourceHandle: 'coil_out', target: '9', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e8', source: '5', sourceHandle: 'out', target: '9', targetHandle: 't_out', data: { resistance: 0.001 } },
        { id: 'e9', source: '9', sourceHandle: 'r_out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e10', source: '3', sourceHandle: 'out', target: '10', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e11', source: '9', sourceHandle: 'b_out', target: '4', targetHandle: 'com', data: { resistance: 0.001 } },
        { id: 'e12', source: '4', sourceHandle: 'no', target: '10', targetHandle: 't_out', data: { resistance: 0.001 } }
    ] as any[],
};

/** 5. Latch Circuit (Earth Start / Power Stop) */
const latchEarthStartPowerStop: ExampleProject = {
    name: 'Latch (Earth Start / Power Stop)',
    description: 'Relay latching logic triggered by Ground, stopped by Power interruption.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 80, y: 220 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'switch_spst', position: { x: 250, y: 220 }, data: { id: '2', type: 'switch_spst', label: 'Stop (Power)', state: { closed: true }, params: {} } },
        { id: '3', type: 'switch_spst', position: { x: 430, y: 220 }, data: { id: '3', type: 'switch_spst', label: 'Start (Earth)', state: { closed: false }, params: {} } },
        { id: '4', type: 'relay_spdt', position: { x: 430, y: 20 }, data: { id: '4', type: 'relay_spdt', label: 'Latch Relay', state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } } },
        { id: '5', type: 'lamp', position: { x: 760, y: 220 }, data: { id: '5', type: 'lamp', label: 'Alarm (D1/G1)', state: { on: false }, params: { resistance: 24 } } },
        { id: '6', type: 'ground', position: { x: 760, y: 420 }, data: { id: '6', type: 'ground', label: 'GND', state: {}, params: {} } },
        { id: '7', type: 'splice', position: { x: 200, y: 260 }, data: { id: '7', type: 'splice', label: '+12 Bus', state: {}, params: {} } },
        { id: '8', type: 'splice', position: { x: 350, y: 260 }, data: { id: '8', type: 'splice', label: 'SP_A', state: {}, params: {} } },
        { id: '9', type: 'splice', position: { x: 560, y: 260 }, data: { id: '9', type: 'splice', label: 'Latch Node', state: {}, params: {} } },
        { id: '10', type: 'splice', position: { x: 560, y: 390 }, data: { id: '10', type: 'splice', label: 'GND Bus', state: {}, params: {} } }
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'negative', target: '10', targetHandle: 'b_out', data: { resistance: 0.001 } },
        { id: 'e2', source: '10', sourceHandle: 'r_out', target: '6', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e3', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e4', source: '2', sourceHandle: 'out', target: '8', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e5', source: '8', sourceHandle: 'r_out', target: '4', targetHandle: 'coil_in', data: { resistance: 0.001 } },
        { id: 'e6', source: '8', sourceHandle: 't_out', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e7', source: '4', sourceHandle: 'coil_out', target: '9', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e8', source: '5', sourceHandle: 'out', target: '9', targetHandle: 't_out', data: { resistance: 0.001 } },
        { id: 'e9', source: '9', sourceHandle: 'r_out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e10', source: '3', sourceHandle: 'out', target: '10', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e11', source: '9', sourceHandle: 'b_out', target: '4', targetHandle: 'com', data: { resistance: 0.001 } },
        { id: 'e12', source: '4', sourceHandle: 'no', target: '10', targetHandle: 't_out', data: { resistance: 0.001 } }
    ] as any[],
};

/** 6. Latch Circuit (Power Start / Earth Stop) */
const latchPowerStartEarthStop: ExampleProject = {
    name: 'Latch (Power Start / Earth Stop)',
    description: 'Relay latching logic triggered by Power, stopped by Ground interruption.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 80, y: 220 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'switch_spst', position: { x: 250, y: 220 }, data: { id: '2', type: 'switch_spst', label: 'Stop (Earth)', state: { closed: true }, params: {} } },
        { id: '3', type: 'switch_spst', position: { x: 430, y: 220 }, data: { id: '3', type: 'switch_spst', label: 'Start (Power)', state: { closed: false }, params: {} } },
        { id: '4', type: 'relay_spdt', position: { x: 430, y: 20 }, data: { id: '4', type: 'relay_spdt', label: 'Latch Relay', state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } } },
        { id: '5', type: 'lamp', position: { x: 760, y: 220 }, data: { id: '5', type: 'lamp', label: 'Alarm (D1/G1)', state: { on: false }, params: { resistance: 24 } } },
        { id: '6', type: 'ground', position: { x: 760, y: 420 }, data: { id: '6', type: 'ground', label: 'GND', state: {}, params: {} } },
        { id: '7', type: 'splice', position: { x: 200, y: 260 }, data: { id: '7', type: 'splice', label: '+12 Bus', state: {}, params: {} } },
        { id: '8', type: 'splice', position: { x: 350, y: 260 }, data: { id: '8', type: 'splice', label: 'SP_A', state: {}, params: {} } },
        { id: '9', type: 'splice', position: { x: 560, y: 260 }, data: { id: '9', type: 'splice', label: 'Latch Node', state: {}, params: {} } },
        { id: '10', type: 'splice', position: { x: 560, y: 390 }, data: { id: '10', type: 'splice', label: 'GND Bus', state: {}, params: {} } }
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'negative', target: '10', targetHandle: 'b_out', data: { resistance: 0.001 } },
        { id: 'e2', source: '10', sourceHandle: 'r_out', target: '6', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e3', source: '1', sourceHandle: 'positive', target: '7', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e4', source: '7', sourceHandle: 'r_out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e5', source: '3', sourceHandle: 'out', target: '9', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e6', source: '7', sourceHandle: 't_out', target: '4', targetHandle: 'com', data: { resistance: 0.001 } },
        { id: 'e7', source: '4', sourceHandle: 'no', target: '9', targetHandle: 't_out', data: { resistance: 0.001 } },
        { id: 'e8', source: '9', sourceHandle: 'r_out', target: '4', targetHandle: 'coil_in', data: { resistance: 0.001 } },
        { id: 'e9', source: '9', sourceHandle: 'b_out', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e10', source: '4', sourceHandle: 'coil_out', target: '8', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e11', source: '5', sourceHandle: 'out', target: '8', targetHandle: 't_out', data: { resistance: 0.001 } },
        { id: 'e12', source: '8', sourceHandle: 'r_out', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e13', source: '2', sourceHandle: 'out', target: '10', targetHandle: 'r_out', data: { resistance: 0.001 } }
    ] as any[],
};

/** 7. Latch Circuit (Power Start / Power Stop) */
const latchPowerStartPowerStop: ExampleProject = {
    name: 'Latch (Power Start / Power Stop)',
    description: 'Relay latching logic triggered and stopped solely by Power-side interruptions.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 80, y: 220 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'switch_spst', position: { x: 250, y: 220 }, data: { id: '2', type: 'switch_spst', label: 'Stop (Power)', state: { closed: true }, params: {} } },
        { id: '3', type: 'switch_spst', position: { x: 430, y: 220 }, data: { id: '3', type: 'switch_spst', label: 'Start (Power)', state: { closed: false }, params: {} } },
        { id: '4', type: 'relay_spdt', position: { x: 430, y: 20 }, data: { id: '4', type: 'relay_spdt', label: 'Latch Relay', state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8 } } },
        { id: '5', type: 'lamp', position: { x: 760, y: 220 }, data: { id: '5', type: 'lamp', label: 'Alarm (D1/G1)', state: { on: false }, params: { resistance: 24 } } },
        { id: '6', type: 'ground', position: { x: 760, y: 420 }, data: { id: '6', type: 'ground', label: 'GND', state: {}, params: {} } },
        { id: '7', type: 'splice', position: { x: 200, y: 260 }, data: { id: '7', type: 'splice', label: '+12 Bus', state: {}, params: {} } },
        { id: '8', type: 'splice', position: { x: 350, y: 260 }, data: { id: '8', type: 'splice', label: 'SP_A', state: {}, params: {} } },
        { id: '9', type: 'splice', position: { x: 560, y: 260 }, data: { id: '9', type: 'splice', label: 'Latch Node', state: {}, params: {} } },
        { id: '10', type: 'splice', position: { x: 560, y: 390 }, data: { id: '10', type: 'splice', label: 'GND Bus', state: {}, params: {} } }
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'negative', target: '10', targetHandle: 'b_out', data: { resistance: 0.001 } },
        { id: 'e2', source: '10', sourceHandle: 'r_out', target: '6', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e3', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e4', source: '2', sourceHandle: 'out', target: '8', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e5', source: '8', sourceHandle: 'r_out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e6', source: '3', sourceHandle: 'out', target: '9', targetHandle: 'l_out', data: { resistance: 0.001 } },
        { id: 'e7', source: '8', sourceHandle: 't_out', target: '4', targetHandle: 'com', data: { resistance: 0.001 } },
        { id: 'e8', source: '4', sourceHandle: 'no', target: '9', targetHandle: 't_out', data: { resistance: 0.001 } },
        { id: 'e9', source: '9', sourceHandle: 'r_out', target: '4', targetHandle: 'coil_in', data: { resistance: 0.001 } },
        { id: 'e10', source: '9', sourceHandle: 'b_out', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e11', source: '4', sourceHandle: 'coil_out', target: '10', targetHandle: 't_out', data: { resistance: 0.001 } },
        { id: 'e12', source: '5', sourceHandle: 'out', target: '10', targetHandle: 'r_out', data: { resistance: 0.001 } }
    ] as any[],
};



/** 8. Engine Cooling Fan (ECU Managed) */
const coolingFanCircuit: ExampleProject = {
    name: 'Engine Cooling Fan (ECU)',
    description: 'ECU reads temperature (Potentiometer) and triggers a high-power fan relay.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 50, y: 300 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: '2', type: 'fuse', position: { x: 200, y: 100 }, data: { id: '2', type: 'fuse', label: 'F1 (10A)', state: { blown: false }, params: { tripCurrent: 10 } } },
        { id: '3', type: 'ecu', position: { x: 400, y: 150 }, data: { id: '3', type: 'ecu', label: 'ECU1', state: {}, params: { numInputs: 4, numOutputs: 4, rules: [{ inputPin: 'in1', condition: '<', threshold: 6, outputPin: 'out1' }] } } },
        { id: '4', type: 'potentiometer', position: { x: 150, y: 400 }, data: { id: '4', type: 'potentiometer', label: 'Temp Sensor', state: { position: 80 }, params: { resistance: 5000 } } },
        { id: '5', type: 'relay_spst', position: { x: 650, y: 100 }, data: { id: '5', type: 'relay_spst', label: 'Fan Relay', state: { energized: false }, params: { coilResistance: 80, pullInVoltage: 8, releaseVoltage: 3 } } },
        { id: '6', type: 'motor', position: { x: 850, y: 250 }, data: { id: '6', type: 'motor', label: 'Cooling Fan', state: { running: false }, params: { resistance: 2 } } },
        { id: '7', type: 'ground', position: { x: 500, y: 500 }, data: { id: '7', type: 'ground', label: 'GND', state: {}, params: {} } },
        { id: '8', type: 'fuse', position: { x: 650, y: 350 }, data: { id: '8', type: 'fuse', label: 'F2 (30A)', state: { blown: false }, params: { tripCurrent: 30 } } }
    ] as any[],
    edges: [
        // ECU Power/GND
        { id: 'e1', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e2', source: '2', sourceHandle: 'out', target: '3', targetHandle: 'vcc', data: { resistance: 0.001 } },
        { id: 'e3', source: '3', sourceHandle: 'gnd', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e4', source: '1', sourceHandle: 'negative', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } },
        // Temperature Sensing (Voltage Divider)
        { id: 'e5', source: '2', sourceHandle: 'out', target: '4', targetHandle: 'a', data: { resistance: 0.001 } },
        { id: 'e6', source: '4', sourceHandle: 'b', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e7', source: '4', sourceHandle: 'wiper', target: '3', targetHandle: 'in1', data: { resistance: 0.001 } },
        // ECU triggers Relay
        { id: 'e8', source: '3', sourceHandle: 'out1', target: '5', targetHandle: 'coil_in', data: { resistance: 0.001 } },
        { id: 'e9', source: '5', sourceHandle: 'coil_out', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } },
        // High Power Fan Circuit
        { id: 'e10', source: '1', sourceHandle: 'positive', target: '8', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e11', source: '8', sourceHandle: 'out', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e12', source: '5', sourceHandle: 'no', target: '6', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e13', source: '6', sourceHandle: 'out', target: '7', targetHandle: 'gnd', data: { resistance: 0.001 } }
    ] as any[],
};

/** 9. Hazard Flasher System */
const hazardSystem: ExampleProject = {
    name: 'Hazard Flasher System',
    description: 'B+ → Fuse → Hazard Switch → Flasher → Multiple Lamps via Splices.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 50, y: 250 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12 } } },
        { id: '2', type: 'fuse', position: { x: 200, y: 150 }, data: { id: '2', type: 'fuse', label: 'F1 (15A)', state: { blown: false }, params: { tripCurrent: 15 } } },
        { id: '3', type: 'switch_spst', position: { x: 350, y: 150 }, data: { id: '3', type: 'switch_spst', label: 'Hazard Switch', state: { closed: false }, params: {} } },
        { id: '4', type: 'flasher', position: { x: 500, y: 150 }, data: { id: '4', type: 'flasher', label: 'Flasher Unit', state: { outputOn: false }, params: { rateHz: 1.5 } } },
        { id: '5', type: 'splice', position: { x: 650, y: 180 }, data: { id: '5', type: 'splice', label: 'Lamp Junction', state: {}, params: {} } },
        { id: '6', type: 'lamp', position: { x: 750, y: 50 }, data: { id: '6', type: 'lamp', label: 'Front L', state: {}, params: { resistance: 12 } } },
        { id: '7', type: 'lamp', position: { x: 850, y: 150 }, data: { id: '7', type: 'lamp', label: 'Front R', state: {}, params: { resistance: 12 } } },
        { id: '8', type: 'lamp', position: { x: 750, y: 300 }, data: { id: '8', type: 'lamp', label: 'Rear L', state: {}, params: { resistance: 12 } } },
        { id: '9', type: 'lamp', position: { x: 850, y: 400 }, data: { id: '9', type: 'lamp', label: 'Rear R', state: {}, params: { resistance: 12 } } },
        { id: '10', type: 'ground', position: { x: 650, y: 500 }, data: { id: '10', type: 'ground', label: 'GND', state: {}, params: {} } }
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e2', source: '2', sourceHandle: 'out', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e3', source: '3', sourceHandle: 'out', target: '4', targetHandle: 'in', data: { resistance: 0.001 } },
        // Flasher to Splice
        { id: 'e4', source: '4', sourceHandle: 'out', target: '5', targetHandle: 'l', data: { resistance: 0.001 } },
        // Splice to 4 lamps
        { id: 'e5', source: '5', sourceHandle: 'r_out', target: '6', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e6', source: '5', sourceHandle: 'b_out', target: '7', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e7', source: '5', sourceHandle: 't_out', target: '8', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e8', source: '5', sourceHandle: 'l_out', target: '9', targetHandle: 'in', data: { resistance: 0.001 } },
        // Grounds
        { id: 'e9', source: '6', sourceHandle: 'out', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e10', source: '7', sourceHandle: 'out', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e11', source: '8', sourceHandle: 'out', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e12', source: '9', sourceHandle: 'out', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e13', source: '1', sourceHandle: 'negative', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } }
    ] as any[],
};

/** 10. Advanced ECU Output Modes */
const ecuAdvancedModes: ExampleProject = {
    name: 'Advanced ECU Driver Modes',
    description: 'Demonstrating HSD (Positive switching) vs LSD (Negative switching) on the same controller.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 50, y: 250 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12 } } },
        {
            id: '2', type: 'ecu', position: { x: 300, y: 150 }, data: {
                id: '2', type: 'ecu', label: 'ECU_DEMO', state: {}, params: {
                    numOutputs: 4,
                    outputDrives: { out1: 'high', out2: 'low', out3: 'push-pull' },
                    rules: [
                        { inputPin: 'in4', condition: '>', threshold: -1, outputPin: 'out1' },
                        { inputPin: 'in4', condition: '>', threshold: -1, outputPin: 'out2' },
                        { inputPin: 'in4', condition: '>', threshold: -1, outputPin: 'out3' }
                    ]
                }
            }
        },
        { id: '3', type: 'lamp', position: { x: 600, y: 50 }, data: { id: '3', type: 'lamp', label: 'HSD Load', state: {}, params: { resistance: 24 } } },
        { id: '4', type: 'lamp', position: { x: 600, y: 250 }, data: { id: '4', type: 'lamp', label: 'LSD Load', state: {}, params: { resistance: 24 } } },
        { id: '5', type: 'lamp', position: { x: 600, y: 450 }, data: { id: '5', type: 'lamp', label: 'Push-Pull Load', state: {}, params: { resistance: 48 } } },
        { id: '10', type: 'ground', position: { x: 800, y: 250 }, data: { id: '10', type: 'ground', label: 'GND', state: {}, params: {} } }
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'vcc', data: { resistance: 0.001 } },
        { id: 'e2', source: '2', sourceHandle: 'gnd', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e3', source: '1', sourceHandle: 'negative', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },

        // HSD: Output → Load → Ground
        { id: 'e4', source: '2', sourceHandle: 'out1', target: '3', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e5', source: '3', sourceHandle: 'out', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },

        // LSD: B+ → Load → Output
        { id: 'e6', source: '1', sourceHandle: 'positive', target: '4', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e7', source: '4', sourceHandle: 'out', target: '2', targetHandle: 'out2', data: { resistance: 0.001 } },

        // Push-Pull: Output → Load → Ground (or float)
        { id: 'e8', source: '2', sourceHandle: 'out3', target: '5', targetHandle: 'in', data: { resistance: 0.001 } },
        { id: 'e9', source: '5', sourceHandle: 'out', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } }
    ] as any[],
};

/** 11. Wiper System (Park Logic) */
const wiperSystem: ExampleProject = {
    name: 'Wiper System (Park Logic)',
    description: 'Demonstrates a Wiper Motor with self-parking circuit via an SPDT switch.',
    nodes: [
        { id: '1', type: 'battery', position: { x: 50, y: 300 }, data: { id: '1', type: 'battery', label: 'BAT1', state: {}, params: { voltage: 12 } } },
        { id: '2', type: 'fuse', position: { x: 200, y: 150 }, data: { id: '2', type: 'fuse', label: 'F1 (20A)', state: { blown: false }, params: { tripCurrent: 20 } } },
        { id: '3', type: 'switch_spdt', position: { x: 400, y: 150 }, data: { id: '3', type: 'switch_spdt', label: 'Wiper SW', state: { position: 'nc' }, params: {} } },
        { id: '4', type: 'wiper_motor', position: { x: 700, y: 200 }, data: { id: '4', type: 'wiper_motor', label: 'Wiper Motor', state: { running: false, parkClosed: true }, params: { resistance: 2 } } },
        { id: '10', type: 'ground', position: { x: 600, y: 500 }, data: { id: '10', type: 'ground', label: 'GND', state: {}, params: {} } }
    ] as any[],
    edges: [
        { id: 'e1', source: '1', sourceHandle: 'positive', target: '2', targetHandle: 'in', data: { resistance: 0.001 } },

        // Battery power straight to Switch COM
        { id: 'e2', source: '2', sourceHandle: 'out', target: '3', targetHandle: 'com', data: { resistance: 0.001 } },

        // Power to Motor IN when Switch is ON (NO)
        { id: 'e4', source: '3', sourceHandle: 'out_no', target: '4', targetHandle: 'in', data: { resistance: 0.001 } },

        // Park Logic: When Switch is OFF (NC), Motor Park pin routes to Switch NC, maintaining power
        { id: 'e5', source: '3', sourceHandle: 'out_nc', target: '4', targetHandle: 'park', data: { resistance: 0.001 } },

        // Motor Out to Ground
        { id: 'e6', source: '4', sourceHandle: 'out', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } },
        { id: 'e7', source: '1', sourceHandle: 'negative', target: '10', targetHandle: 'gnd', data: { resistance: 0.001 } }
    ] as any[],
};

export const EXAMPLE_PROJECTS: ExampleProject[] = [
    headlightCircuit,
    relayWorkLights,
    starterSolenoid,
    parkbrakeAlarmNeg,
    latchEarthStartPowerStop,
    latchPowerStartEarthStop,
    latchPowerStartPowerStop,
    coolingFanCircuit,
    hazardSystem,
    ecuAdvancedModes,
    wiperSystem,
];
