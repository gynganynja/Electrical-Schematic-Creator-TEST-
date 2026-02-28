import type { Node, Edge } from '@xyflow/react';

// General component types
export type ComponentType =
    | 'battery'
    | 'ground'
    | 'resistor'
    | 'lamp'
    | 'switch_spst'
    | 'switch_spdt'
    | 'switch_dpdt'
    | 'switch_momentary'
    | 'switch_momentary_no'
    | 'switch_momentary_nc'
    | 'switch_ignition'
    | 'switch_master'
    | 'relay_spdt'
    | 'fuse'
    | 'splice'
    | 'motor'
    | 'led'
    | 'diode'
    | 'flasher'
    | 'buzzer'
    | 'solenoid'
    | 'breaker_manual'
    | 'breaker_auto'
    | 'fusible_link'
    | 'tvs_clamp'
    | 'cable_resistance'
    | 'relay_spst'
    | 'relay_dual87'
    | 'relay_latching'
    | 'relay_delay_on'
    | 'relay_delay_off'
    | 'heater'
    | 'compressor_clutch'
    | 'wiper_motor'
    | 'capacitor'
    | 'inductor'
    | 'zener'
    | 'potentiometer'
    | 'ecu'
    | 'connector'
    | 'net_label'
    | 'harness_entry'
    | 'harness_exit'
    | 'maf_sensor'
    | 'temp_sensor'
    | 'oil_press_sensor'
    | 'air_press_sensor'
    | 'wss_sensor'
    | 'rpm_sensor'
    | 'speedo_gauge'
    | 'tacho_gauge'
    | 'fuel_gauge'
    | 'can_bus'
    | 'can_transceiver'
    | 'can_terminator'
    | 'ecu_advanced'
    | 'schematic_frame';

// Terminal definitions by component type
export type TerminalId = string;

// Common parameter formats
export interface BaseComponentData {
    id: string;
    type: ComponentType;
    label: string;
    state: Record<string, any>;
    params: Record<string, any>;
    [key: string]: any;
}

export interface BatteryData extends BaseComponentData {
    type: 'battery';
    params: {
        voltage: number;
        internalResistance: number;
    };
}

export interface GroundData extends BaseComponentData {
    type: 'ground';
    params: {};
}

export interface ResistorData extends BaseComponentData {
    type: 'resistor';
    params: {
        resistance: number;
    };
}

export interface LampData extends BaseComponentData {
    type: 'lamp';
    params: {
        resistance: number;
    };
}

export interface SwitchSPSTData extends BaseComponentData {
    type: 'switch_spst' | 'switch_momentary';
    state: {
        closed: boolean;
    };
    params: {};
}

export interface SwitchSPDTData extends BaseComponentData {
    type: 'switch_spdt';
    state: {
        position: 'nc' | 'no';
    };
    params: {};
}

export interface RelaySPDTData extends BaseComponentData {
    type: 'relay_spdt';
    state: {
        energized: boolean;
    };
    params: {
        coilResistance: number;
        pullInVoltage: number;
    };
}

export interface FuseData extends BaseComponentData {
    type: 'fuse';
    state: {
        blown: boolean;
    };
    params: {
        tripCurrent: number;
        tripTimeMs: number;
    };
}

export type AnyComponentData =
    | BatteryData
    | GroundData
    | ResistorData
    | LampData
    | SwitchSPSTData
    | SwitchSPDTData
    | RelaySPDTData
    | FuseData;

export type CircuitNode = Node<AnyComponentData>;

export interface CircuitEdgeData {
    resistance: number;
    color?: string;
    wireColor?: string;
    gaugeAwg?: string;
    gaugeMm2?: string;
    [key: string]: any;
}

export type CircuitEdge = Edge<CircuitEdgeData>;
