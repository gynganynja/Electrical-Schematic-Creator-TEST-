/**
 * CAN & J1939 Data Models
 */

export type CANMode = 'CAN_2_0' | 'J1939';

export interface CANFrame {
    id: number;           // 11-bit or 29-bit
    ide: boolean;         // true = 29-bit
    dlc: number;          // 0-8 (or more for FD, but 8 for now)
    data: number[];
    timestamp: number;    // simulation tick
    sourceAddress?: number; // J1939 only
}

export interface J1939Signal {
    name: string;
    spn: number;
    startBit: number;
    length: number;
    resolution: number;
    offset: number;
    unit: string;
}

export interface J1939PGN {
    pgn: number;
    label: string;
    priority: number;
    cycleTime: number;
    signals: J1939Signal[];
}

/**
 * ECU Logic & Diagnostics
 */

export type FaultState = 'NONE' | 'DEBOUNCING' | 'ACTIVE' | 'LATCHED';

export interface DTC {
    code: string;         // e.g. "P0123"
    status: number;       // bitmask (active, confirmed, etc.)
    timestamp: number;
    count: number;
}

export interface DiagnosticConfig {
    faultThreshold: number; // ms or count
    clearThreshold: number;
    limpStrategy: 'NONE' | 'FIXED_VALUE' | 'DISABLE_OUTPUT';
    limpValue?: any;
}

/**
 * ECU Program Models
 */

export interface FunctionBlock {
    id: string;
    type: 'TIMER_ON' | 'TIMER_OFF' | 'HYSTERESIS' | 'LOW_PASS' | 'LATCH' | 'SCALING' | 'LOOKUP';
    params: Record<string, any>;
    inputs: string[];     // IDs of other blocks or hardware pins
}

export interface ECUState {
    dtcs: DTC[];
    activeFaults: Set<string>;
    programCounter: number;
    timers: Record<string, number>;
}
