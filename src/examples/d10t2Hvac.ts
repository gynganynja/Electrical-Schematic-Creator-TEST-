/**
 * Caterpillar D10T2 Track-Type Tractor — HVAC blower & A/C circuit.
 *
 * Recreated from schematic UENR4176-07 (July 2023):
 *   Vol 1 (Cab Wiring)      — fuse panel (36), HVAC control panel (37), A/C switch (59),
 *                             blower motor (24), blower resistor (42), thermal fuse (14),
 *                             pressurizer motor (26), cab/louver/evap temp sensors,
 *                             water valve (104), Implement ECM (Control - Implement, J1/J2)
 *   Vol 2 (Chassis Wiring)  — A/C high/low pressure switches (161/162), fender condenser
 *                             relays (125/126) and fans (119/120)
 *   Vol 3 (Engine Wiring)   — compressor clutch solenoid (218)
 *
 * Wire labels are the schematic's circuit IDs, colours and gauges. Simplifications:
 *  - The 4 batteries (2 × 2 in series-parallel) are one 24 V source.
 *  - The HVAC control panel is a module: its knobs, speed relays and logic are drawn inside
 *    its frame (the real panel is a sealed unit with the same pinout).
 *  - The 3-position A/C switch (OFF / ON / AUTO) is two switches: close ON or AUTO, never both.
 *  - The cab temp sensors are 2-wire thermistors on the machine; here they are 3-wire
 *    sensors fed from the ECM's +5 V sensor supply, which gives the same signal voltage.
 *  - The Implement ECM's A/C logic is approximated with rules (see the ECM's rule list).
 */
import type { ExampleProject } from './circuits';

type Pos = { x: number; y: number };

const node = (id: string, type: string, pos: Pos, label: string, params: Record<string, any> = {}, state: Record<string, any> = {}, extra: Record<string, any> = {}) =>
    ({ id, type, position: pos, data: { id, type, label, params, state }, ...extra });

const frame = (id: string, pos: Pos, w: number, h: number, name: string, desc: string) =>
    node(id, 'schematic_frame', pos, name, { frameName: name, frameDescription: desc }, {}, { zIndex: -1, style: { width: w, height: h } });

// CAT colour codes → app wire colours
const COLOURS: Record<string, string> = {
    RD: 'Red', BK: 'Black', GN: 'Green', GY: 'Grey', WH: 'White', BU: 'Blue',
    PK: 'Pink', PU: 'Purple', OR: 'Orange', YL: 'Yellow', BR: 'Brown',
};

let seq = 0;
/** Wire from "node:handle" to "node:handle", e.g. wire('cb1:out', 'hvac:vcc', '124-P35 GN-14') */
const wire = (from: string, to: string, spec = '') => {
    const [source, sourceHandle] = from.split(':');
    const [target, targetHandle] = to.split(':');
    const m = spec.match(/^(\S+)\s+([A-Z]{2})-(\d+)$/);   // "124-P35 GN-14"
    const data: Record<string, any> = {};
    if (m) {
        data.circuit = m[1];
        data.wireColor = COLOURS[m[2]] ?? m[2];
        if (m[3] !== '00') data.gaugeAwg = String(Number(m[3]));
    } else if (spec) {
        data.circuit = spec;
    }
    return { id: `d10_e${seq++}`, source, sourceHandle, target, targetHandle, type: 'wire', data };
};

const RELAY_24V = { coilResistance: 320, pullInVoltage: 16, releaseVoltage: 7 };
const DRIVE_24V = { driveType: 'CUSTOM', driveVoltage: 24 };
const cmp = (input: string, op: string, threshold: number, more: Record<string, any> = {}) =>
    ({ input, inputSource: 'pin', op, compareSource: 'value', threshold, ...more });
const cmpVar = (input: string, op: string, threshold: number) =>
    ({ input, inputSource: 'var', op, compareSource: 'value', threshold });

const nodes = [
    // ── Frames ────────────────────────────────────────────────────────────────
    frame('fr_pwr', { x: -40, y: -60 }, 600, 760, 'Batteries & Main Power', 'Vol 3 J-13 / Vol 1 J-10 — 24 V batteries, disconnect switch, main relay'),
    frame('fr_fuse', { x: 600, y: -60 }, 480, 960, '(36) Fuse Panel 419-8890', 'Vol 1 J-11 — CB1 Blower, CB2 Condensers, F1/R1 Precleaner, F18 Implement ECM'),
    frame('fr_hvac', { x: 1120, y: -60 }, 820, 900, '(37) HVAC CTL Panel 267-5243', 'Vol 1 C-10 — fan speed knob, temp knob, internal speed relays'),
    frame('fr_blower', { x: 1980, y: -60 }, 760, 760, 'Blower', 'Vol 1 J-13/14 — blower resistor (42), thermal fuse (14), blower motor (24)'),
    frame('fr_ecm', { x: 600, y: 1000 }, 1340, 860, 'A/C Control — Implement ECM', 'Vol 1 F-16 — A/C switch (59), cab temp sensors, Vol 2 G-9 pressure switches'),
    frame('fr_cond', { x: 1980, y: 1340 }, 760, 520, 'Fender A/C Condenser (ATCH)', 'Vol 2 A-12/13 — condenser relays (125/126) and fans (119/120)'),

    // ── Batteries & main power ────────────────────────────────────────────────
    node('bat', 'battery', { x: 0, y: 80 }, 'BATTERIES 176-179 (24V)', { voltage: 24, internalResistance: 0.01 }),
    node('gnd_bat', 'ground', { x: 30, y: 300 }, 'FRAME GND'),
    node('disc', 'switch_master', { x: 230, y: 80 }, '(225) DISCONNECT SW 369-4098', {}, { closed: true }),
    node('unsw1', 'net_label', { x: 400, y: 40 }, 'UNSW PWR'),
    node('f29', 'fuse', { x: 40, y: 440 }, 'F29 KEYSWITCH 10A', { tripCurrent: 10 }, { blown: false }),
    node('unsw2', 'net_label', { x: 0, y: 380 }, 'UNSW PWR'),
    node('key', 'switch_spst', { x: 200, y: 440 }, 'KEYSWITCH (RUN)', {}, { closed: true }),
    node('k38', 'relay_spst', { x: 380, y: 300 }, '(38) MAIN RELAY 241-8368', RELAY_24V, { energized: false }),
    node('gnd_k38', 'ground', { x: 330, y: 560 }, 'GND'),
    node('unsw3', 'net_label', { x: 360, y: 200 }, 'UNSW PWR'),
    node('sw1', 'net_label', { x: 420, y: 620 }, 'SW PWR'),

    // ── Fuse panel ────────────────────────────────────────────────────────────
    node('sw2', 'net_label', { x: 620, y: 40 }, 'SW PWR'),
    node('cb1', 'breaker_auto', { x: 820, y: 30 }, 'CB1 BLOWER 15A', { tripCurrent: 15, resetDelayMs: 5000 }, { tripped: false }),
    node('sw3', 'net_label', { x: 620, y: 200 }, 'SW PWR'),
    node('cb2', 'breaker_auto', { x: 820, y: 190 }, 'CB2 CONDENSERS 15A', { tripCurrent: 15, resetDelayMs: 5000 }, { tripped: false }),
    node('l158a', 'net_label', { x: 960, y: 290 }, '158 CONDENSERS'),
    node('sw4', 'net_label', { x: 620, y: 380 }, 'SW PWR'),
    node('f1', 'fuse', { x: 780, y: 370 }, 'F1 PRECLEANER 10A', { tripCurrent: 10 }, { blown: false }),
    node('r1', 'relay_spst', { x: 900, y: 450 }, 'R1 PRECLEANER', RELAY_24V, { energized: false }),
    node('l567a', 'net_label', { x: 640, y: 560 }, '567 A/C SW'),
    node('gnd_r1', 'ground', { x: 1000, y: 680 }, 'GND'),
    node('unsw4', 'net_label', { x: 620, y: 830 }, 'UNSW PWR'),
    node('f18', 'fuse', { x: 820, y: 820 }, 'F18 IMPLEMENT ECM 15A', { tripCurrent: 15 }, { blown: false }),
    node('press', 'motor', { x: 680, y: 640 }, '(26) PRESSURIZER MOTOR 385-7511', { resistance: 12, ratedVoltage: 24 }, { running: false }),

    // ── HVAC control panel ────────────────────────────────────────────────────
    node('hvac', 'ecu_advanced', { x: 1380, y: 20 }, '(37) HVAC CTL PANEL', {
        canMode: 'none', sourceAddress: 0x00,
        inputs: ['fan_knob'],
        outputs: ['ref_5v', 'blower_low', 'blower_med', 'blower_med_hi', 'blower_hi', 'ac_sw_567'],
        rules: [
            { id: 'p_ref', type: 'ALWAYS_ON', config: { output: 'ref_5v', voltage: 5 } },
            { id: 'p_low', type: 'COMPARE', config: cmp('fan_knob', '>', 0.5, { output: 'blower_low', ...DRIVE_24V, andConditions: [cmp('fan_knob', '<=', 1.5)] }) },
            { id: 'p_med', type: 'COMPARE', config: cmp('fan_knob', '>', 1.5, { output: 'blower_med', ...DRIVE_24V, andConditions: [cmp('fan_knob', '<=', 2.75)] }) },
            { id: 'p_mhi', type: 'COMPARE', config: cmp('fan_knob', '>', 2.75, { output: 'blower_med_hi', ...DRIVE_24V, andConditions: [cmp('fan_knob', '<=', 4)] }) },
            { id: 'p_hi', type: 'COMPARE', config: cmp('fan_knob', '>', 4, { output: 'blower_hi', ...DRIVE_24V }) },
            // A/C switch feed (567) is live whenever the blower is on
            { id: 'p_ac', type: 'COMPARE', config: cmp('fan_knob', '>', 0.5, { output: 'ac_sw_567', ...DRIVE_24V }) },
        ],
    }, { vcc: 0 }),
    node('fan_knob', 'potentiometer', { x: 1150, y: 60 }, 'FAN SPEED (OFF/L/M/MH/H)', { resistance: 10000 }, { position: 70 }),
    node('temp_knob', 'potentiometer', { x: 1150, y: 560 }, 'TEMP KNOB (36% ≈ 22°C)', { resistance: 10000 }, { position: 36 }),
    node('gnd_hvac', 'ground', { x: 1240, y: 420 }, 'RLY COILS GND'),
    node('l124', 'net_label', { x: 1560, y: 760 }, '124 BLOWER PWR'),
    node('k_low', 'relay_spst', { x: 1780, y: -20 }, 'LOW RELAY', RELAY_24V, { energized: false }),
    node('k_med', 'relay_spst', { x: 1780, y: 170 }, 'MED RELAY', RELAY_24V, { energized: false }),
    node('k_mhi', 'relay_spst', { x: 1780, y: 360 }, 'MED HI RELAY', RELAY_24V, { energized: false }),
    node('k_hi', 'relay_spst', { x: 1780, y: 550 }, 'HI RELAY', RELAY_24V, { energized: false }),
    node('l124b', 'net_label', { x: 1660, y: 120 }, '124 BLOWER PWR'),
    node('l124c', 'net_label', { x: 1660, y: 310 }, '124 BLOWER PWR'),
    node('l124d', 'net_label', { x: 1660, y: 500 }, '124 BLOWER PWR'),
    node('l124e', 'net_label', { x: 1660, y: 690 }, '124 BLOWER PWR'),
    node('gnd_k', 'ground', { x: 1960, y: 760 }, 'RLY COILS GND'),
    node('l567b', 'net_label', { x: 1660, y: 800 }, '567 A/C SW'),
    node('l_tsig', 'net_label', { x: 1300, y: 760 }, 'A524 TEMP CTL SIG'),

    // ── Blower ────────────────────────────────────────────────────────────────
    node('res_low', 'resistor', { x: 2040, y: 40 }, '(42) BLOWER RES LOW→MED1', { resistance: 1.2 }),
    node('res_med', 'resistor', { x: 2040, y: 190 }, '(42) BLOWER RES MED1→MED2', { resistance: 0.6 }),
    node('res_mhi', 'resistor', { x: 2040, y: 340 }, '(42) BLOWER RES MED2→MOTOR', { resistance: 0.3 }),
    node('tfuse', 'fuse', { x: 2040, y: 500 }, '(14) THERMAL FUSE 133-9012', { tripCurrent: 20 }, { blown: false }),
    node('blower', 'motor', { x: 2420, y: 260 }, '(24) BLOWER MOTOR 268-8792', { resistance: 2.2, ratedVoltage: 24 }, { running: false }),
    node('gnd_blower', 'ground', { x: 2620, y: 420 }, '(18) LEFT REAR GND 1'),

    // ── Implement ECM & A/C inputs ────────────────────────────────────────────
    node('ecm', 'ecu_advanced', { x: 1340, y: 1060 }, 'IMPLEMENT ECM (J1/J2)', {
        canMode: 'none', sourceAddress: 0x00,
        inputs: ['ac_sw', 'ac_auto', 'ac_press', 'cab_temp', 'louver_temp', 'evap_temp', 'temp_set'],
        outputs: ['sensor_5v', 'ac_clutch', 'cond_relay', 'water_valve'],
        inputPulls: { ac_press: 'pullup' },
        rules: [
            { id: 'e_5v', type: 'ALWAYS_ON', config: { output: 'sensor_5v', voltage: 5 } },
            // A/C requested: switch ON, or AUTO with the cab warmer than the temp knob
            { id: 'e_on', type: 'COMPARE', config: cmp('ac_sw', '>', 12, { storeVar: 'req_on' }) },
            { id: 'e_auto', type: 'COMPARE', config: cmp('ac_auto', '>', 12, { storeVar: 'req_auto', andConditions: [{ input: 'cab_temp', inputSource: 'pin', op: '>', compareSource: 'pin', comparePin: 'temp_set' }] }) },
            { id: 'e_idle', type: 'COMPARE', config: { ...cmpVar('req_on', '<', 0.5), storeVar: 'ac_idle', andConditions: [cmpVar('req_auto', '<', 0.5)] } },
            // Clutch: requested AND pressure switches closed AND evaporator above freezing (1.38 V ≈ 2°C)
            { id: 'e_clutch', type: 'COMPARE', config: { ...cmpVar('ac_idle', '<', 0.5), output: 'ac_clutch', ...DRIVE_24V, storeVar: 'clutch_on', andConditions: [cmp('ac_press', '<', 2), cmp('evap_temp', '>', 1.38)] } },
            // Condenser fan relays follow the clutch (low-side driver, J2-9)
            { id: 'e_cond', type: 'COMPARE', config: { ...cmpVar('clutch_on', '>', 0.5), output: 'cond_relay', driveType: 'LOW_SIDE' } },
            // Heater water valve opens when the cab is colder than the temp knob
            { id: 'e_heat', type: 'COMPARE', config: { input: 'cab_temp', inputSource: 'pin', op: '<', compareSource: 'pin', comparePin: 'temp_set', output: 'water_valve', ...DRIVE_24V } },
        ],
    }, { vcc: 0 }),
    node('l567c', 'net_label', { x: 620, y: 1100 }, '567 A/C SW'),
    node('ac_on', 'switch_spst', { x: 820, y: 1060 }, '(59) A/C SW — ON', {}, { closed: false }),
    node('ac_auto', 'switch_spst', { x: 820, y: 1180 }, '(59) A/C SW — AUTO', {}, { closed: true }),
    node('cab_t', 'temp_sensor', { x: 1020, y: 1060 }, '(55) RECIRC FILTER TEMP (CAB)', {}, { temperature: 30 }),
    node('louver_t', 'temp_sensor', { x: 1020, y: 1260 }, '(54) LOUVER TEMP SENSOR', {}, { temperature: 12 }),
    node('evap_t', 'temp_sensor', { x: 1020, y: 1460 }, '(51) EVAP FREEZE PROBE', {}, { temperature: 5 }),
    node('l5v_a', 'net_label', { x: 860, y: 1330 }, '+5V SENSOR'),
    node('l5v_b', 'net_label', { x: 860, y: 1530 }, '+5V SENSOR'),
    node('l5v_c', 'net_label', { x: 860, y: 1730 }, '+5V SENSOR'),
    node('l5v_d', 'net_label', { x: 1660, y: 1700 }, '+5V SENSOR'),
    node('gnd_sens', 'ground', { x: 1060, y: 1740 }, 'SENSOR RTN (T993)'),
    node('hp_sw', 'switch_spst', { x: 640, y: 1420 }, '(162) A/C HIGH PRESS SW 149-6371', {}, { closed: true }),
    node('lp_sw', 'switch_spst', { x: 640, y: 1580 }, '(161) A/C LOW PRESS SW 355-3148', {}, { closed: true }),
    node('gnd_press', 'ground', { x: 660, y: 1760 }, 'GND (210)'),
    node('gnd_ecm', 'ground', { x: 1280, y: 1760 }, '- BATTERY (210)'),
    node('l_tsig2', 'net_label', { x: 1660, y: 1780 }, 'A524 TEMP CTL SIG'),

    // ── ECM loads ─────────────────────────────────────────────────────────────
    node('clutch', 'compressor_clutch', { x: 1760, y: 1060 }, '(218) COMPRESSOR CLUTCH SOL 324-9711', { resistance: 10 }, { activated: false }),
    node('wvalve', 'solenoid', { x: 1760, y: 1220 }, '(104) WATER VALVE 279-0850', { resistance: 48 }, { activated: false }),
    node('gnd_loads', 'ground', { x: 1900, y: 1320 }, 'GND'),

    // ── Fender condenser ──────────────────────────────────────────────────────
    node('l158b', 'net_label', { x: 2000, y: 1400 }, '158 CONDENSERS'),
    node('k125', 'relay_spst', { x: 2160, y: 1380 }, '(125) FENDER COND RELAY 1', RELAY_24V, { energized: false }),
    node('k126', 'relay_spst', { x: 2160, y: 1600 }, '(126) FENDER COND RELAY 2', RELAY_24V, { energized: false }),
    node('l158c', 'net_label', { x: 2000, y: 1620 }, '158 CONDENSERS'),
    node('fan1', 'motor', { x: 2480, y: 1400 }, '(119) FENDER COND FAN 1 399-4829', { resistance: 4.8, ratedVoltage: 24 }, { running: false }),
    node('fan2', 'motor', { x: 2480, y: 1620 }, '(120) FENDER COND FAN 2 399-4829', { resistance: 4.8, ratedVoltage: 24 }, { running: false }),
    node('gnd_fans', 'ground', { x: 2660, y: 1780 }, 'FENDER GND'),
];

const edges = [
    // Batteries & main power
    wire('bat:positive', 'disc:in', 'CBL-VA1 RD-2'),
    wire('disc:out', 'unsw1:in', 'CBL-VA1 RD-2'),
    wire('bat:negative', 'gnd_bat:gnd', 'CBL-FF1 BK-00'),
    wire('unsw2:out', 'f29:in'),
    wire('f29:out', 'key:in', '198-P154 RD-16'),
    wire('key:out', 'k38:coil_in', '308-P324 YL-18'),
    wire('k38:coil_out', 'gnd_k38:gnd', 'F761-P191 BR-18'),
    wire('unsw3:out', 'k38:in', 'CBL-VC1 RD-4'),
    wire('k38:no', 'sw1:in', 'CBL-VE1 PU-4'),

    // Fuse panel
    wire('sw2:out', 'cb1:in'),
    wire('sw3:out', 'cb2:in'),
    wire('cb2:out', 'l158a:in', '158-P385 BR-14'),
    wire('sw4:out', 'f1:in'),
    wire('f1:out', 'r1:in'),
    wire('l567a:out', 'r1:coil_in', '567-P292 WH-14'),
    wire('r1:coil_out', 'gnd_r1:gnd', '200-P143 BK-18'),
    wire('r1:no', 'press:in', 'A557-P350 WH-16'),
    wire('press:out', 'gnd_r1:gnd', '200-PR13 BK-14'),
    wire('unsw4:out', 'f18:in'),
    wire('f18:out', 'ecm:vcc', '197-P138 RD-14'),

    // HVAC control panel
    wire('cb1:out', 'hvac:vcc', '124-P35 GN-14'),
    wire('cb1:out', 'l124:in', '124-C80 GN-14'),
    wire('hvac:gnd', 'gnd_hvac:gnd', '200-C26 BK-18'),
    wire('hvac:ref_5v', 'fan_knob:a'),
    wire('fan_knob:b', 'gnd_hvac:gnd'),
    wire('fan_knob:wiper', 'hvac:fan_knob'),
    wire('temp_knob:wiper', 'l_tsig:in', 'A524-C90 BR-18'),
    wire('temp_knob:b', 'gnd_hvac:gnd', 'T993-C13 BR-18'),
    wire('hvac:blower_low', 'k_low:coil_in'),
    wire('hvac:blower_med', 'k_med:coil_in'),
    wire('hvac:blower_med_hi', 'k_mhi:coil_in'),
    wire('hvac:blower_hi', 'k_hi:coil_in'),
    wire('hvac:ac_sw_567', 'l567b:in', '567-C97 WH-14'),
    wire('k_low:coil_out', 'gnd_k:gnd'),
    wire('k_med:coil_out', 'gnd_k:gnd'),
    wire('k_mhi:coil_out', 'gnd_k:gnd'),
    wire('k_hi:coil_out', 'gnd_k:gnd'),
    wire('l124b:out', 'k_low:in'),
    wire('l124c:out', 'k_med:in'),
    wire('l124d:out', 'k_mhi:in'),
    wire('l124e:out', 'k_hi:in'),

    // Speed wires panel → blower resistor (via CONN 6)
    wire('k_low:no', 'res_low:in', '517-PR12 BU-14'),
    wire('k_med:no', 'res_low:out', '516-PR10 GN-14'),
    wire('res_low:out', 'res_med:in'),
    wire('k_mhi:no', 'res_med:out', 'C568-PR3 WH-14'),
    wire('res_med:out', 'res_mhi:in'),
    wire('k_hi:no', 'tfuse:in', '515-PR18 GY-14'),
    wire('res_mhi:out', 'blower:in', 'C555-PR4 BR-14'),
    wire('tfuse:out', 'blower:in', 'C555-PR4 BR-14'),
    wire('blower:out', 'gnd_blower:gnd', '200-PR15 BK-14'),

    // A/C switch, temp knob and sensors into the Implement ECM
    wire('l567c:out', 'ac_on:in', '567-C98 WH-14'),
    wire('l567c:out', 'ac_auto:in', '567-C98 WH-14'),
    wire('ac_on:out', 'ecm:ac_sw', 'C539-P286 YL-14'),
    wire('ac_auto:out', 'ecm:ac_auto', 'C540-P299 GY-14'),
    wire('l_tsig2:out', 'ecm:temp_set', 'A524-P462 BR-18'),
    wire('ecm:sensor_5v', 'l5v_d:in', 'T997-P435 OR-18'),
    wire('l5v_a:out', 'cab_t:in'),
    wire('l5v_b:out', 'louver_t:in'),
    wire('l5v_c:out', 'evap_t:in'),
    wire('l5v_c:out', 'temp_knob:a'),
    wire('cab_t:out', 'ecm:cab_temp', 'C552-P479 WH-18'),
    wire('louver_t:out', 'ecm:louver_temp', 'E558-P480 YL-18'),
    wire('evap_t:out', 'ecm:evap_temp', 'C554-P481 PK-18'),
    wire('cab_t:gnd', 'gnd_sens:gnd', 'T993-P478 BR-18'),
    wire('louver_t:gnd', 'gnd_sens:gnd', 'T993-P64 BR-18'),
    wire('evap_t:gnd', 'gnd_sens:gnd', 'T993-P472 BR-18'),
    wire('gnd_press:gnd', 'hp_sw:in', '210-LF2 BK-18'),
    wire('hp_sw:out', 'lp_sw:in', '519-LF3 PK-16'),
    wire('lp_sw:out', 'ecm:ac_press', '513-LF1 OR-18'),
    wire('ecm:gnd', 'gnd_ecm:gnd', '210-P1 BK-14'),

    // ECM outputs
    wire('ecm:ac_clutch', 'clutch:in', 'E554-P395 PK-16'),
    wire('clutch:out', 'gnd_loads:gnd', 'C443-EP15 BU-16'),
    wire('ecm:water_valve', 'wvalve:in', 'A526-P471 PK-18'),
    wire('wvalve:out', 'gnd_loads:gnd', '200-PR14 BK-16'),

    // Fender condenser
    wire('l158b:out', 'k125:in', '158-A9 RD-14'),
    wire('l158b:out', 'k125:coil_in', '158-A10 RD-18'),
    wire('l158c:out', 'k126:in', '183-A11 RD-14'),
    wire('l158c:out', 'k126:coil_in', '183-A12 RD-18'),
    wire('k125:coil_out', 'ecm:cond_relay', 'R987-A6 PU-18'),
    wire('k126:coil_out', 'ecm:cond_relay', 'R987-A5 PU-18'),
    wire('k125:no', 'fan1:in', 'C556-A8 BU-14'),
    wire('k126:no', 'fan2:in', 'C557-A7 OR-14'),
    wire('fan1:out', 'gnd_fans:gnd', '200-A1 BK-14'),
    wire('fan2:out', 'gnd_fans:gnd', '200-A2 BK-14'),
];

export const d10t2Hvac: ExampleProject = {
    name: 'CAT D10T2 — HVAC Blower & A/C',
    description: '24V blower (4 speeds), pressurizer, Implement-ECM A/C clutch, condenser fans and heater valve, from schematic UENR4176-07.',
    nodes: nodes as any[],
    edges: edges as any[],
};
