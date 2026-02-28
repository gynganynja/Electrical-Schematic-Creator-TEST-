/**
 * Example circuits
 */
import type { CircuitNode, CircuitEdge } from '../types/circuit';

export interface ExampleProject {
    name: string;
    description: string;
    nodes: CircuitNode[];
    edges: CircuitEdge[];
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// BCM / PCM Complex Network â€” Body Control Module + Powertrain Control Module
// with a full CAN bus, sensors, relays, switches and complex logic rules
// ────────────────────────────────────────────────────────────────────────────────
const bcmPcmNetwork: ExampleProject = {
    name: 'BCM / PCM Network',
    description: 'Body Control Module and Powertrain Control Module connected over CAN. BCM manages door/cabin logic; PCM manages engine cooling and diagnostics.',
    nodes: [
        // ── Power ──
        { id: 'bat',  type: 'battery',       position: { x: 100,  y: 600  }, data: { id: 'bat',  type: 'battery',       label: 'BAT (12V)',     state: {},                params: { voltage: 12.0, internalResistance: 0.02 } } },
        { id: 'gnd1', type: 'ground',        position: { x: 100,  y: 900  }, data: { id: 'gnd1', type: 'ground',        label: 'CHASSIS GND',  state: {},                params: {} } },
        { id: 'gnd2', type: 'ground',        position: { x: 1100, y: 2400 }, data: { id: 'gnd2', type: 'ground',        label: 'GND-B',        state: {},                params: {} } },
        { id: 'gnd3', type: 'ground',        position: { x: 2600, y: 2400 }, data: { id: 'gnd3', type: 'ground',        label: 'GND-C',        state: {},                params: {} } },

        // ── Main Protection ──
        { id: 'fl1',  type: 'fusible_link',  position: { x: 350,  y: 450  }, data: { id: 'fl1',  type: 'fusible_link',  label: 'FL1 (60A)',    state: { blown: false },  params: { tripCurrent: 60 } } },
        { id: 'sp1',  type: 'splice',        position: { x: 600,  y: 450  }, data: { id: 'sp1',  type: 'splice',        label: 'BAT-BUS',      state: {},                params: {} } },

        // ── Fuse Panel ──
        { id: 'f1',   type: 'fuse',          position: { x: 850,  y: 250  }, data: { id: 'f1',   type: 'fuse',          label: 'F1-BCM (15A)', state: { blown: false },  params: { tripCurrent: 15 } } },
        { id: 'f2',   type: 'fuse',          position: { x: 850,  y: 480  }, data: { id: 'f2',   type: 'fuse',          label: 'F2-PCM (15A)', state: { blown: false },  params: { tripCurrent: 15 } } },
        { id: 'f3',   type: 'fuse',          position: { x: 850,  y: 710  }, data: { id: 'f3',   type: 'fuse',          label: 'F3-RLY (20A)', state: { blown: false },  params: { tripCurrent: 20 } } },
        { id: 'f4',   type: 'fuse',          position: { x: 850,  y: 940  }, data: { id: 'f4',   type: 'fuse',          label: 'F4-ACC (10A)', state: { blown: false },  params: { tripCurrent: 10 } } },

        // ── Ignition Switch ──
        { id: 'ign',  type: 'switch_ignition', position: { x: 600, y: 850  }, data: { id: 'ign',  type: 'switch_ignition', label: 'IGNITION',  state: { position: 'off' }, params: {} } },
        { id: 'sp2',  type: 'splice',          position: { x: 850, y: 850  }, data: { id: 'sp2',  type: 'splice',          label: 'IGN-BUS',   state: {},                params: {} } },

        // ── BCM (Body Control Module) ──
        { id: 'bcm',  type: 'ecu_advanced',  position: { x: 1200, y: 100  }, data: { id: 'bcm',  type: 'ecu_advanced',  label: 'BCM',
            state: {}, params: {
                inputs:  ['ign', 'door_fl', 'door_fr', 'door_rl', 'door_rr', 'pbrake', 'hazard_btn', 'headlight_sw'],
                outputs: ['int_lamp', 'alarm_out', 'hazard_relay', 'headlights', 'pbrake_lamp', 'can_active'],
                inputPulls: { ign: 'none', door_fl: 'pullup', door_fr: 'pullup', door_rl: 'pullup', door_rr: 'pullup', pbrake: 'pullup', hazard_btn: 'pullup', headlight_sw: 'pullup' },
                outputDrives: { int_lamp: 'HIGH_SIDE', alarm_out: 'HIGH_SIDE', hazard_relay: 'HIGH_SIDE', headlights: 'HIGH_SIDE', pbrake_lamp: 'HIGH_SIDE', can_active: 'HIGH_SIDE' },
                canMode: 'J1939', sourceAddress: 40,
                rules: [
                    // Rule 1: Interior lamp â€” any door open (< 1V = grounded = open)
                    { id: 'bcm-r1', type: 'COMPARE', config: { input: 'door_fl', op: '<', compareSource: 'value', threshold: 1, output: 'int_lamp', driveType: 'HIGH_SIDE' } },
                    // Rule 2: Alarm buzzer â€” parkbrake on AND door open (both grounded)
                    { id: 'bcm-r2', type: 'COMPARE', config: { input: 'pbrake', op: '<', compareSource: 'value', threshold: 1, output: 'alarm_out', driveType: 'HIGH_SIDE',
                        andConditions: [ { input: 'door_fl', op: '<', compareSource: 'value', threshold: 1 } ] } },
                    // Rule 3: Parkbrake warning lamp â€” pbrake grounded AND ignition on
                    { id: 'bcm-r3', type: 'COMPARE', config: { input: 'pbrake', op: '<', compareSource: 'value', threshold: 1, output: 'pbrake_lamp', driveType: 'HIGH_SIDE',
                        andConditions: [ { input: 'ign', op: '>', compareSource: 'value', threshold: 8 } ] } },
                    // Rule 4: Headlights on when headlight_sw grounded AND ignition on
                    { id: 'bcm-r4', type: 'COMPARE', config: { input: 'headlight_sw', op: '<', compareSource: 'value', threshold: 1, output: 'headlights', driveType: 'HIGH_SIDE',
                        andConditions: [ { input: 'ign', op: '>', compareSource: 'value', threshold: 8 } ] } },
                    // Rule 5: Hazard relay â€” latch on/off via hazard button
                    { id: 'bcm-r5', type: 'LATCH', config: { setInput: 'hazard_btn', setThreshold: 8, resetInput: 'hazard_btn', resetThreshold: 8, output: 'hazard_relay', driveType: 'HIGH_SIDE', storeVar: 'hazard_on' } },
                    // Rule 6: Courtesy lamp stays on 5s after door closes (delay-off timer on door_fl)
                    { id: 'bcm-r6', type: 'TIMER', config: { input: 'int_lamp', mode: 'delay_off', delayMs: 5000, output: 'int_lamp', driveType: 'HIGH_SIDE' } },
                    // Rule 7: Broadcast door + pbrake status over CAN to PCM
                    { id: 'bcm-r7', type: 'CAN_TX', config: { conditionMode: 'always', pgn: 65300, priority: 6, interval: 100,
                        floatMap: [ { label: 'door_fl', source: 'door_fl' }, { label: 'pbrake', source: 'pbrake' }, { label: 'ign', source: 'ign' } ] } },
                ]
            }
        } },

        // â”€â”€ PCM (Powertrain Control Module) â”€â”€
        { id: 'pcm',  type: 'ecu_advanced',  position: { x: 1200, y: 1400 }, data: { id: 'pcm',  type: 'ecu_advanced',  label: 'PCM',
            state: {}, params: {
                inputs:  ['ect_in', 'maf_in', 'oil_in', 'rpm_in', 'vss_in'],
                outputs: ['fan_ctrl', 'fuel_pump', 'check_eng', 'boost_ctrl', 'oil_warn'],
                inputPulls: { ect_in: 'none', maf_in: 'none', oil_in: 'none', rpm_in: 'none', vss_in: 'none' },
                outputDrives: { fan_ctrl: 'HIGH_SIDE', fuel_pump: 'HIGH_SIDE', check_eng: 'HIGH_SIDE', boost_ctrl: 'HIGH_SIDE', oil_warn: 'HIGH_SIDE' },
                canMode: 'J1939', sourceAddress: 0,
                rules: [
                    // Rule 1: Re-range ECT sensor 0.5â€“4.5V â†’ 0â€“120Â°C equivalent voltage, store to var
                    { id: 'pcm-r1', type: 'MATH', config: { input: 'ect_in', mathMode: 'rerange', inMin: 0.5, inMax: 4.5, outMin: 0, outMax: 12, storeVar: 'ect_scaled', output: '' } },
                    // Rule 2: Cooling fan on when ECT > 8V (= ~80Â°C equivalent)
                    { id: 'pcm-r2', type: 'COMPARE', config: { input: 'ect_scaled', inputSource: 'var', op: '>', compareSource: 'value', threshold: 8, output: 'fan_ctrl', driveType: 'HIGH_SIDE' } },
                    // Rule 3: Check engine light â€” ECT too high (> 10.5V scaled = ~105Â°C) AND RPM active
                    { id: 'pcm-r3', type: 'COMPARE', config: { input: 'ect_scaled', inputSource: 'var', op: '>', compareSource: 'value', threshold: 10.5, output: 'check_eng', driveType: 'HIGH_SIDE',
                        andConditions: [ { input: 'rpm_in', op: '>', compareSource: 'value', threshold: 1.0 } ] } },
                    // Rule 4: Fuel pump on â€” ignition on (received from BCM via CAN)
                    { id: 'pcm-r4', type: 'CAN_RX', config: { pgn: 65300, timeoutMs: 500, output: '',
                        floatMap: [ { label: 'ign', varName: 'rx_ign' }, { label: 'door_fl', varName: 'rx_door' }, { label: 'pbrake', varName: 'rx_pbrake' } ] } },
                    // Rule 5: Fuel pump â€” ign signal from BCM > 8V
                    { id: 'pcm-r5', type: 'COMPARE', config: { input: 'rx_ign', inputSource: 'var', op: '>', compareSource: 'value', threshold: 8, output: 'fuel_pump', driveType: 'HIGH_SIDE' } },
                    // Rule 6: Oil pressure warning â€” oil_in < 0.8V (low pressure) AND rpm > 1V
                    { id: 'pcm-r6', type: 'COMPARE', config: { input: 'oil_in', op: '<', compareSource: 'value', threshold: 0.8, output: 'oil_warn', driveType: 'HIGH_SIDE',
                        andConditions: [ { input: 'rpm_in', op: '>', compareSource: 'value', threshold: 1.0 } ] } },
                    // Rule 7: Boost solenoid â€” MAF > 3.5V (high load) AND ECT < 10.5V (not overheating)
                    { id: 'pcm-r7', type: 'COMPARE', config: { input: 'maf_in', op: '>', compareSource: 'value', threshold: 3.5, output: 'boost_ctrl', driveType: 'HIGH_SIDE',
                        andConditions: [ { input: 'ect_scaled', inputSource: 'var', op: '<', compareSource: 'value', threshold: 10.5 } ] } },
                ]
            }
        } },

        // â”€â”€ CAN Bus Network â”€â”€
        { id: 'cbus',  type: 'can_bus',         position: { x: 1200, y: 2100 }, data: { id: 'cbus',  type: 'can_bus',        label: 'HS-CAN 500k',  state: {},  params: { bitrate: 500000, mode: 'HS-CAN' } } },
        { id: 'term1', type: 'can_terminator',   position: { x: 850,  y: 2150 }, data: { id: 'term1', type: 'can_terminator',  label: 'TERM1',        state: {},  params: {} } },
        { id: 'term2', type: 'can_terminator',   position: { x: 1600, y: 2150 }, data: { id: 'term2', type: 'can_terminator',  label: 'TERM2',        state: {},  params: {} } },
        { id: 'tc1',   type: 'can_transceiver',  position: { x: 1200, y: 900  },  data: { id: 'tc1',   type: 'can_transceiver', label: 'TRX-BCM',      state: {},  params: {} } },
        { id: 'tc2',   type: 'can_transceiver',  position: { x: 1200, y: 1800 }, data: { id: 'tc2',   type: 'can_transceiver', label: 'TRX-PCM',      state: {},  params: {} } },

        // â”€â”€ BCM Input Switches â”€â”€
        { id: 'sw_door_fl',  type: 'switch_spst', position: { x: 550,  y: 100  },  data: { id: 'sw_door_fl',  type: 'switch_spst', label: 'S-DOOR-FL',   state: { closed: false }, params: {} } },
        { id: 'sw_door_fr',  type: 'switch_spst', position: { x: 550,  y: 280  },  data: { id: 'sw_door_fr',  type: 'switch_spst', label: 'S-DOOR-FR',   state: { closed: false }, params: {} } },
        { id: 'sw_door_rl',  type: 'switch_spst', position: { x: 550,  y: 460  },  data: { id: 'sw_door_rl',  type: 'switch_spst', label: 'S-DOOR-RL',   state: { closed: false }, params: {} } },
        { id: 'sw_door_rr',  type: 'switch_spst', position: { x: 550,  y: 640  },  data: { id: 'sw_door_rr',  type: 'switch_spst', label: 'S-DOOR-RR',   state: { closed: false }, params: {} } },
        { id: 'sw_pbrake',   type: 'switch_spst', position: { x: 550,  y: 820  },  data: { id: 'sw_pbrake',   type: 'switch_spst', label: 'S-PBRAKE',    state: { closed: false }, params: {} } },
        { id: 'sw_hazard',   type: 'switch_momentary_no', position: { x: 550, y: 1000 }, data: { id: 'sw_hazard', type: 'switch_momentary_no', label: 'S-HAZARD', state: { closed: false }, params: {} } },
        { id: 'sw_headlight',type: 'switch_spst', position: { x: 550,  y: 1180 },  data: { id: 'sw_headlight',type: 'switch_spst', label: 'S-HEADLIGHT', state: { closed: false }, params: {} } },

        // â”€â”€ BCM Input Ground Labels (all switches ground to chassis) â”€â”€
        { id: 'ng1', type: 'net_label', position: { x: 350,  y: 100  }, data: { id: 'ng1', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng2', type: 'net_label', position: { x: 350,  y: 280  }, data: { id: 'ng2', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng3', type: 'net_label', position: { x: 350,  y: 460  }, data: { id: 'ng3', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng4', type: 'net_label', position: { x: 350,  y: 640  }, data: { id: 'ng4', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng5', type: 'net_label', position: { x: 350,  y: 820  }, data: { id: 'ng5', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng6', type: 'net_label', position: { x: 350,  y: 1000 }, data: { id: 'ng6', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng7', type: 'net_label', position: { x: 350,  y: 1180 }, data: { id: 'ng7', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng0', type: 'net_label', position: { x: 100,  y: 800  }, data: { id: 'ng0', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },

        // â”€â”€ PCM Sensors â”€â”€
        { id: 'ect',  type: 'temp_sensor',      position: { x: 2400, y: 1400 },  data: { id: 'ect',  type: 'temp_sensor',      label: 'ECT Sensor',     state: { temperature: 40 }, params: { minVal: -40, maxVal: 150, vMin: 0.5, vMax: 4.5 } } },
        { id: 'maf',  type: 'maf_sensor',        position: { x: 2400, y: 1640 }, data: { id: 'maf',  type: 'maf_sensor',        label: 'MAF Sensor',     state: { flow: 120 },        params: { maxVal: 500, vMin: 1.0, vMax: 5.0 } } },
        { id: 'oilp', type: 'oil_press_sensor',  position: { x: 2400, y: 1880 }, data: { id: 'oilp', type: 'oil_press_sensor',  label: 'Oil Pressure',   state: { pressure: 50 },    params: { maxVal: 100, vMin: 0.5, vMax: 4.5 } } },
        { id: 'rpm',  type: 'rpm_sensor',         position: { x: 2400, y: 2120 }, data: { id: 'rpm',  type: 'rpm_sensor',        label: 'RPM Sensor',     state: { rpm: 0 },           params: {} } },
        { id: 'vss',  type: 'wss_sensor',         position: { x: 2400, y: 2360 }, data: { id: 'vss',  type: 'wss_sensor',        label: 'VSS Sensor',     state: { speed: 0 },         params: {} } },
        { id: 'sp_sens', type: 'splice',          position: { x: 2700, y: 1450 },  data: { id: 'sp_sens', type: 'splice', label: 'SENS-PWR', state: {}, params: {} } },
        { id: 'f5',   type: 'fuse',               position: { x: 2700, y: 1280 },  data: { id: 'f5',   type: 'fuse', label: 'F5-SENS (5A)', state: { blown: false }, params: { tripCurrent: 5 } } },
        { id: 'ng_s1', type: 'net_label', position: { x: 2700, y: 1620 }, data: { id: 'ng_s1', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_s2', type: 'net_label', position: { x: 2700, y: 1860 }, data: { id: 'ng_s2', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },

        // â”€â”€ BCM Output Loads â”€â”€
        { id: 'int_lamp',    type: 'lamp',    position: { x: 2200, y: 100  },  data: { id: 'int_lamp',    type: 'lamp',    label: 'Interior Lamp',   state: {}, params: { resistance: 12 } } },
        { id: 'alarm_buz',   type: 'buzzer',  position: { x: 2200, y: 340  },  data: { id: 'alarm_buz',   type: 'buzzer',  label: 'Alarm Buzzer',    state: {}, params: { resistance: 8  } } },
        { id: 'headlamp',    type: 'lamp',    position: { x: 2200, y: 580  },  data: { id: 'headlamp',    type: 'lamp',    label: 'Headlights',      state: {}, params: { resistance: 4  } } },
        { id: 'pbrake_led',  type: 'led',     position: { x: 2200, y: 820  },  data: { id: 'pbrake_led',  type: 'led',     label: 'Parkbrake Lamp',  state: {}, params: { color: 'red'  } } },
        { id: 'r_pbrake_led',type: 'resistor',position: { x: 1980, y: 820  },  data: { id: 'r_pbrake_led',type: 'resistor',label: 'R1 (470Î©)',       state: {}, params: { resistance: 470 } } },
        { id: 'haz_relay',   type: 'relay_spdt', position: { x: 1980, y: 1060 }, data: { id: 'haz_relay', type: 'relay_spdt', label: 'HAZARD RELAY', state: { energized: false }, params: { coilResistance: 85 } } },
        { id: 'flasher',     type: 'flasher', position: { x: 2200, y: 1060 },  data: { id: 'flasher',     type: 'flasher', label: 'Flasher',         state: {}, params: { onTime: 500, offTime: 500 } } },
        { id: 'haz_lamp',    type: 'lamp',    position: { x: 2450, y: 1060 },  data: { id: 'haz_lamp',    type: 'lamp',    label: 'Hazard Lamps',    state: {}, params: { resistance: 6  } } },

        // â”€â”€ PCM Output Loads â”€â”€
        { id: 'fan_relay',   type: 'relay_spdt', position: { x: 1980, y: 1400 },  data: { id: 'fan_relay',  type: 'relay_spdt', label: 'FAN RELAY',   state: { energized: false }, params: { coilResistance: 85 } } },
        { id: 'fan_motor',   type: 'motor',       position: { x: 2200, y: 1400 },  data: { id: 'fan_motor',  type: 'motor',       label: 'Cooling Fan', state: {}, params: { resistance: 3  } } },
        { id: 'fuel_pump_m', type: 'motor',       position: { x: 2200, y: 1640 }, data: { id: 'fuel_pump_m',type: 'motor',       label: 'Fuel Pump',   state: {}, params: { resistance: 4  } } },
        { id: 'boost_sol',   type: 'solenoid',    position: { x: 2200, y: 1880 }, data: { id: 'boost_sol',  type: 'solenoid',    label: 'Boost Sol.',  state: {}, params: { resistance: 12 } } },
        { id: 'chkeng_led',  type: 'led',         position: { x: 2200, y: 2120 }, data: { id: 'chkeng_led', type: 'led',         label: 'Check Engine',state: {}, params: { color: 'amber' } } },
        { id: 'r_chkeng',    type: 'resistor',    position: { x: 1980, y: 2120 }, data: { id: 'r_chkeng',   type: 'resistor',    label: 'R2 (470Î©)',   state: {}, params: { resistance: 470 } } },
        { id: 'oil_led',     type: 'led',         position: { x: 2200, y: 2360 }, data: { id: 'oil_led',    type: 'led',         label: 'Oil Warn LED',state: {}, params: { color: 'red' } } },
        { id: 'r_oil',       type: 'resistor',    position: { x: 1980, y: 2360 }, data: { id: 'r_oil',      type: 'resistor',    label: 'R3 (470Î©)',   state: {}, params: { resistance: 470 } } },

        // Output ground net labels
        { id: 'ng_o1', type: 'net_label', position: { x: 2500, y: 100  }, data: { id: 'ng_o1', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_o2', type: 'net_label', position: { x: 2500, y: 340  }, data: { id: 'ng_o2', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_o3', type: 'net_label', position: { x: 2700, y: 1060 }, data: { id: 'ng_o3', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_o4', type: 'net_label', position: { x: 2500, y: 1440 }, data: { id: 'ng_o4', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_o5', type: 'net_label', position: { x: 2500, y: 1680 }, data: { id: 'ng_o5', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_o6', type: 'net_label', position: { x: 2500, y: 1920 }, data: { id: 'ng_o6', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_o7', type: 'net_label', position: { x: 2500, y: 2160 }, data: { id: 'ng_o7', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_o8', type: 'net_label', position: { x: 2500, y: 2400 }, data: { id: 'ng_o8', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'ng_main', type: 'net_label', position: { x: 100, y: 760  }, data: { id: 'ng_main', type: 'net_label', label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
    ] as any[],
    edges: [
        // â”€â”€ Battery â†’ fusible link â†’ BAT bus splice â”€â”€
        { id: 'e1',  source: 'bat',        sourceHandle: 'positive',  target: 'fl1',       targetHandle: 'in',      data: { wireColor: '#ef4444' } },
        { id: 'e2',  source: 'fl1',        sourceHandle: 'out',       target: 'sp1',       targetHandle: 'l',       data: { wireColor: '#ef4444' } },
        { id: 'e3',  source: 'bat',        sourceHandle: 'negative',  target: 'gnd1',      targetHandle: 'gnd',     data: { wireColor: '#1e293b' } },

        // â”€â”€ BAT bus â†’ fuses â”€â”€
        { id: 'e4',  source: 'sp1',        sourceHandle: 'r',         target: 'f1',        targetHandle: 'in',      data: {} },
        { id: 'e5',  source: 'sp1',        sourceHandle: 't',         target: 'f2',        targetHandle: 'in',      data: {} },
        { id: 'e6',  source: 'sp1',        sourceHandle: 'b',         target: 'f3',        targetHandle: 'in',      data: {} },

        // â”€â”€ Ignition switch supply â”€â”€
        { id: 'e7',  source: 'sp1',        sourceHandle: 't_out',     target: 'ign',       targetHandle: 'batt',    data: {} },
        { id: 'e8',  source: 'ign',        sourceHandle: 'ign',       target: 'sp2',       targetHandle: 'l',       data: {} },
        { id: 'e9',  source: 'sp2',        sourceHandle: 'r',         target: 'f4',        targetHandle: 'in',      data: {} },

        // â”€â”€ BCM VCC / GND â”€â”€
        { id: 'e10', source: 'f1',         sourceHandle: 'out',       target: 'bcm',       targetHandle: 'vcc',     data: { wireColor: '#ef4444' } },
        { id: 'e11', source: 'bcm',        sourceHandle: 'gnd',       target: 'gnd2',      targetHandle: 'gnd',     data: { wireColor: '#1e293b' } },

        // â”€â”€ PCM VCC / GND â”€â”€
        { id: 'e12', source: 'f2',         sourceHandle: 'out',       target: 'pcm',       targetHandle: 'vcc',     data: { wireColor: '#ef4444' } },
        { id: 'e13', source: 'pcm',        sourceHandle: 'gnd',       target: 'gnd2',      targetHandle: 'gnd',     data: { wireColor: '#1e293b' } },

        // â”€â”€ BCM Transceiver â”€â”€
        { id: 'e14', source: 'f1',         sourceHandle: 'out',       target: 'tc1',       targetHandle: 'vcc',     data: {} },
        { id: 'e15', source: 'tc1',        sourceHandle: 'gnd',       target: 'gnd2',      targetHandle: 'gnd',     data: { wireColor: '#1e293b' } },
        { id: 'e16', source: 'bcm',        sourceHandle: 'txd',       target: 'tc1',       targetHandle: 'txd',     data: {} },
        { id: 'e17', source: 'bcm',        sourceHandle: 'rxd',       target: 'tc1',       targetHandle: 'rxd',     data: {} },

        // â”€â”€ PCM Transceiver â”€â”€
        { id: 'e18', source: 'f2',         sourceHandle: 'out',       target: 'tc2',       targetHandle: 'vcc',     data: {} },
        { id: 'e19', source: 'tc2',        sourceHandle: 'gnd',       target: 'gnd2',      targetHandle: 'gnd',     data: { wireColor: '#1e293b' } },
        { id: 'e20', source: 'pcm',        sourceHandle: 'txd',       target: 'tc2',       targetHandle: 'txd',     data: {} },
        { id: 'e21', source: 'pcm',        sourceHandle: 'rxd',       target: 'tc2',       targetHandle: 'rxd',     data: {} },

        // â”€â”€ CAN Bus wiring â”€â”€
        { id: 'e22', source: 'tc1',        sourceHandle: 'can_h',     target: 'cbus',      targetHandle: 'can_h_l', data: {} },
        { id: 'e23', source: 'tc1',        sourceHandle: 'can_l',     target: 'cbus',      targetHandle: 'can_l_l', data: {} },
        { id: 'e24', source: 'tc2',        sourceHandle: 'can_h',     target: 'cbus',      targetHandle: 'can_h_r', data: {} },
        { id: 'e25', source: 'tc2',        sourceHandle: 'can_l',     target: 'cbus',      targetHandle: 'can_l_r', data: {} },
        { id: 'e26', source: 'term1',      sourceHandle: 'can_h',     target: 'cbus',      targetHandle: 'can_h_l', data: {} },
        { id: 'e27', source: 'term1',      sourceHandle: 'can_l',     target: 'cbus',      targetHandle: 'can_l_l', data: {} },
        { id: 'e28', source: 'term2',      sourceHandle: 'can_h',     target: 'cbus',      targetHandle: 'can_h_r', data: {} },
        { id: 'e29', source: 'term2',      sourceHandle: 'can_l',     target: 'cbus',      targetHandle: 'can_l_r', data: {} },

        // â”€â”€ BCM Input switches â†’ BCM input pins (switch out â†’ BCM pin; switch in â†’ ground net label) â”€â”€
        { id: 'e30', source: 'sw_door_fl', sourceHandle: 'out',       target: 'bcm',       targetHandle: 'door_fl',     data: {} },
        { id: 'e31', source: 'ng1',        sourceHandle: 'out',       target: 'sw_door_fl',targetHandle: 'in',           data: { wireColor: '#1e293b' } },
        { id: 'e32', source: 'sw_door_fr', sourceHandle: 'out',       target: 'bcm',       targetHandle: 'door_fr',     data: {} },
        { id: 'e33', source: 'ng2',        sourceHandle: 'out',       target: 'sw_door_fr',targetHandle: 'in',           data: { wireColor: '#1e293b' } },
        { id: 'e34', source: 'sw_door_rl', sourceHandle: 'out',       target: 'bcm',       targetHandle: 'door_rl',     data: {} },
        { id: 'e35', source: 'ng3',        sourceHandle: 'out',       target: 'sw_door_rl',targetHandle: 'in',           data: { wireColor: '#1e293b' } },
        { id: 'e36', source: 'sw_door_rr', sourceHandle: 'out',       target: 'bcm',       targetHandle: 'door_rr',     data: {} },
        { id: 'e37', source: 'ng4',        sourceHandle: 'out',       target: 'sw_door_rr',targetHandle: 'in',           data: { wireColor: '#1e293b' } },
        { id: 'e38', source: 'sw_pbrake',  sourceHandle: 'out',       target: 'bcm',       targetHandle: 'pbrake',      data: {} },
        { id: 'e39', source: 'ng5',        sourceHandle: 'out',       target: 'sw_pbrake', targetHandle: 'in',           data: { wireColor: '#1e293b' } },
        { id: 'e40', source: 'sw_hazard',  sourceHandle: 'out',       target: 'bcm',       targetHandle: 'hazard_btn',  data: {} },
        { id: 'e41', source: 'ng6',        sourceHandle: 'out',       target: 'sw_hazard', targetHandle: 'in',           data: { wireColor: '#1e293b' } },
        { id: 'e42', source: 'sw_headlight',sourceHandle: 'out',      target: 'bcm',       targetHandle: 'headlight_sw',data: {} },
        { id: 'e43', source: 'ng7',        sourceHandle: 'out',       target: 'sw_headlight',targetHandle: 'in',         data: { wireColor: '#1e293b' } },

        // â”€â”€ BCM ign pin from ignition splice â”€â”€
        { id: 'e44', source: 'sp2',        sourceHandle: 't',         target: 'bcm',       targetHandle: 'ign',         data: {} },

        // â”€â”€ BCM Outputs â†’ loads â”€â”€
        // int_lamp
        { id: 'e45', source: 'bcm',        sourceHandle: 'int_lamp',  target: 'int_lamp',  targetHandle: 'in',          data: {} },
        { id: 'e46', source: 'int_lamp',   sourceHandle: 'out',       target: 'ng_o1',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },
        // alarm_out â†’ buzzer
        { id: 'e47', source: 'bcm',        sourceHandle: 'alarm_out', target: 'alarm_buz', targetHandle: 'in',          data: {} },
        { id: 'e48', source: 'alarm_buz',  sourceHandle: 'out',       target: 'ng_o2',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },
        // headlights
        { id: 'e49', source: 'bcm',        sourceHandle: 'headlights',target: 'headlamp',  targetHandle: 'in',          data: {} },
        { id: 'e50', source: 'headlamp',   sourceHandle: 'out',       target: 'ng_o2',     targetHandle: 'out',         data: { wireColor: '#1e293b' } },
        // pbrake_lamp via resistor â†’ LED
        { id: 'e51', source: 'bcm',        sourceHandle: 'pbrake_lamp',target: 'r_pbrake_led',targetHandle: 'in',       data: {} },
        { id: 'e52', source: 'r_pbrake_led',sourceHandle: 'out',      target: 'pbrake_led',targetHandle: 'anode',       data: {} },
        { id: 'e53', source: 'pbrake_led', sourceHandle: 'cathode',   target: 'ng_o1',     targetHandle: 'out',         data: { wireColor: '#1e293b' } },
        // hazard_relay â†’ relay coil
        { id: 'e54', source: 'bcm',        sourceHandle: 'hazard_relay',target: 'haz_relay',targetHandle: 'coil_in',   data: {} },
        { id: 'e55', source: 'haz_relay',  sourceHandle: 'coil_out',  target: 'gnd2',      targetHandle: 'gnd',         data: { wireColor: '#1e293b' } },
        // hazard relay contact: f3 power â†’ relay com â†’ flasher â†’ hazard lamp
        { id: 'e56', source: 'f3',         sourceHandle: 'out',       target: 'haz_relay', targetHandle: 'com',         data: {} },
        { id: 'e57', source: 'haz_relay',  sourceHandle: 'no',        target: 'flasher',   targetHandle: 'in',          data: {} },
        { id: 'e58', source: 'flasher',    sourceHandle: 'out',       target: 'haz_lamp',  targetHandle: 'in',          data: {} },
        { id: 'e59', source: 'haz_lamp',   sourceHandle: 'out',       target: 'ng_o3',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },

        // â”€â”€ PCM Sensor power: f5 â†’ sens splice, gnd labels â”€â”€
        { id: 'e60', source: 'f2',         sourceHandle: 'out',       target: 'f5',        targetHandle: 'in',          data: {} },
        { id: 'e61', source: 'f5',         sourceHandle: 'out',       target: 'sp_sens',   targetHandle: 'l',           data: {} },
        { id: 'e62', source: 'sp_sens',    sourceHandle: 'r',         target: 'ect',       targetHandle: 'in',          data: {} },
        { id: 'e63', source: 'sp_sens',    sourceHandle: 't',         target: 'maf',       targetHandle: 'vcc',         data: {} },
        { id: 'e64', source: 'sp_sens',    sourceHandle: 'b',         target: 'oilp',      targetHandle: 'in',          data: {} },
        { id: 'e65', source: 'ng_s1',      sourceHandle: 'out',       target: 'ect',       targetHandle: 'out',         data: { wireColor: '#1e293b' } },
        { id: 'e66', source: 'ng_s1',      sourceHandle: 'in',        target: 'maf',       targetHandle: 'gnd',         data: { wireColor: '#1e293b' } },
        { id: 'e67', source: 'ng_s2',      sourceHandle: 'out',       target: 'oilp',      targetHandle: 'out',         data: { wireColor: '#1e293b' } },

        // â”€â”€ PCM Sensor signals â†’ PCM inputs â”€â”€
        { id: 'e68', source: 'ect',        sourceHandle: 'out',       target: 'pcm',       targetHandle: 'ect_in',      data: {} },
        { id: 'e69', source: 'maf',        sourceHandle: 'out',       target: 'pcm',       targetHandle: 'maf_in',      data: {} },
        { id: 'e70', source: 'oilp',       sourceHandle: 'out',       target: 'pcm',       targetHandle: 'oil_in',      data: {} },
        { id: 'e71', source: 'rpm',        sourceHandle: 'out',       target: 'pcm',       targetHandle: 'rpm_in',      data: {} },
        { id: 'e72', source: 'vss',        sourceHandle: 'out',       target: 'pcm',       targetHandle: 'vss_in',      data: {} },

        // RPM/VSS sensor power from fuse
        { id: 'e73', source: 'sp_sens',    sourceHandle: 't_out',     target: 'rpm',       targetHandle: 'in',          data: {} },
        { id: 'e74', source: 'sp_sens',    sourceHandle: 'b_out',     target: 'vss',       targetHandle: 'in',          data: {} },

        // â”€â”€ PCM Outputs â†’ loads â”€â”€
        // fan_ctrl â†’ relay coil â†’ fan motor
        { id: 'e75', source: 'pcm',        sourceHandle: 'fan_ctrl',  target: 'fan_relay', targetHandle: 'coil_in',     data: {} },
        { id: 'e76', source: 'fan_relay',  sourceHandle: 'coil_out',  target: 'gnd3',      targetHandle: 'gnd',         data: { wireColor: '#1e293b' } },
        { id: 'e77', source: 'f3',         sourceHandle: 'out',       target: 'fan_relay', targetHandle: 'com',         data: {} },
        { id: 'e78', source: 'fan_relay',  sourceHandle: 'no',        target: 'fan_motor', targetHandle: 'in',          data: {} },
        { id: 'e79', source: 'fan_motor',  sourceHandle: 'out',       target: 'ng_o4',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },
        // fuel_pump
        { id: 'e80', source: 'pcm',        sourceHandle: 'fuel_pump', target: 'fuel_pump_m',targetHandle: 'in',         data: {} },
        { id: 'e81', source: 'fuel_pump_m',sourceHandle: 'out',       target: 'ng_o5',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },
        // boost_ctrl â†’ solenoid
        { id: 'e82', source: 'pcm',        sourceHandle: 'boost_ctrl',target: 'boost_sol', targetHandle: 'in',          data: {} },
        { id: 'e83', source: 'boost_sol',  sourceHandle: 'out',       target: 'ng_o6',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },
        // check_eng via resistor â†’ LED
        { id: 'e84', source: 'pcm',        sourceHandle: 'check_eng', target: 'r_chkeng',  targetHandle: 'in',          data: {} },
        { id: 'e85', source: 'r_chkeng',   sourceHandle: 'out',       target: 'chkeng_led',targetHandle: 'anode',       data: {} },
        { id: 'e86', source: 'chkeng_led', sourceHandle: 'cathode',   target: 'ng_o7',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },
        // oil_warn via resistor â†’ LED
        { id: 'e87', source: 'pcm',        sourceHandle: 'oil_warn',  target: 'r_oil',     targetHandle: 'in',          data: {} },
        { id: 'e88', source: 'r_oil',      sourceHandle: 'out',       target: 'oil_led',   targetHandle: 'anode',       data: {} },
        { id: 'e89', source: 'oil_led',    sourceHandle: 'cathode',   target: 'ng_o8',     targetHandle: 'in',          data: { wireColor: '#1e293b' } },
    ] as any[],
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// -----------------------------------------------------------------------------
// 1. Basic Lamp Circuit
// -----------------------------------------------------------------------------
const basicLamp: ExampleProject = {
    name: 'Basic Lamp Circuit',
    description: 'A battery, switch, fuse and lamp — the simplest complete circuit.',
    nodes: [
        { id: 'bl_bat',  type: 'battery',     position: { x: 100, y: 200 }, data: { id: 'bl_bat',  type: 'battery',     label: 'BAT (12V)', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'bl_gnd',  type: 'ground',      position: { x: 100, y: 500 }, data: { id: 'bl_gnd',  type: 'ground',      label: 'GND',       state: {}, params: {} } },
        { id: 'bl_fuse', type: 'fuse',        position: { x: 320, y: 200 }, data: { id: 'bl_fuse', type: 'fuse',        label: 'F1 (10A)', state: { blown: false }, params: { tripCurrent: 10 } } },
        { id: 'bl_sw',   type: 'switch_spst', position: { x: 540, y: 200 }, data: { id: 'bl_sw',   type: 'switch_spst', label: 'SW1',       state: { closed: false }, params: {} } },
        { id: 'bl_lamp', type: 'lamp',        position: { x: 760, y: 200 }, data: { id: 'bl_lamp', type: 'lamp',        label: 'LAMP',      state: {}, params: { resistance: 12 } } },
    ] as any[],
    edges: [
        { id: 'bl_e1', source: 'bl_bat',  sourceHandle: 'positive', target: 'bl_fuse', targetHandle: 'in',  data: { wireColor: '#ef4444' } },
        { id: 'bl_e2', source: 'bl_fuse', sourceHandle: 'out',      target: 'bl_sw',   targetHandle: 'in',  data: { wireColor: '#ef4444' } },
        { id: 'bl_e3', source: 'bl_sw',   sourceHandle: 'out',      target: 'bl_lamp', targetHandle: 'in',  data: { wireColor: '#ef4444' } },
        { id: 'bl_e4', source: 'bl_lamp', sourceHandle: 'out',      target: 'bl_gnd',  targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
        { id: 'bl_e5', source: 'bl_bat',  sourceHandle: 'negative', target: 'bl_gnd',  targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 2. Relay-Switched Load
// -----------------------------------------------------------------------------
const relaySwitchedLoad: ExampleProject = {
    name: 'Relay-Switched Load',
    description: 'A momentary button energises a relay coil; the relay contacts power a high-current lamp.',
    nodes: [
        { id: 'rl_bat',   type: 'battery',             position: { x: 100, y: 300 }, data: { id: 'rl_bat',   type: 'battery',             label: 'BAT (12V)',  state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'rl_gnd',   type: 'ground',              position: { x: 100, y: 600 }, data: { id: 'rl_gnd',   type: 'ground',              label: 'GND',        state: {}, params: {} } },
        { id: 'rl_fuse',  type: 'fuse',                position: { x: 320, y: 200 }, data: { id: 'rl_fuse',  type: 'fuse',                label: 'F1 (20A)',   state: { blown: false }, params: { tripCurrent: 20 } } },
        { id: 'rl_btn',   type: 'switch_momentary_no', position: { x: 320, y: 420 }, data: { id: 'rl_btn',   type: 'switch_momentary_no', label: 'PUSH BTN',   state: { closed: false }, params: {} } },
        { id: 'rl_relay', type: 'relay_spst',          position: { x: 580, y: 300 }, data: { id: 'rl_relay', type: 'relay_spst',          label: 'K1',         state: { energized: false }, params: { coilResistance: 85, pullInVoltage: 8 } } },
        { id: 'rl_lamp',  type: 'lamp',                position: { x: 840, y: 200 }, data: { id: 'rl_lamp',  type: 'lamp',                label: 'WORK LAMP',  state: {}, params: { resistance: 4 } } },
    ] as any[],
    edges: [
        { id: 'rl_e1', source: 'rl_bat',   sourceHandle: 'positive', target: 'rl_fuse',  targetHandle: 'in',       data: { wireColor: '#ef4444' } },
        { id: 'rl_e2', source: 'rl_fuse',  sourceHandle: 'out',      target: 'rl_relay', targetHandle: 'com',      data: { wireColor: '#ef4444' } },
        { id: 'rl_e3', source: 'rl_relay', sourceHandle: 'no',       target: 'rl_lamp',  targetHandle: 'in',       data: {} },
        { id: 'rl_e4', source: 'rl_lamp',  sourceHandle: 'out',      target: 'rl_gnd',   targetHandle: 'gnd',      data: { wireColor: '#1e293b' } },
        { id: 'rl_e5', source: 'rl_bat',   sourceHandle: 'positive', target: 'rl_btn',   targetHandle: 'in',       data: {} },
        { id: 'rl_e6', source: 'rl_btn',   sourceHandle: 'out',      target: 'rl_relay', targetHandle: 'coil_in',  data: {} },
        { id: 'rl_e7', source: 'rl_relay', sourceHandle: 'coil_out', target: 'rl_gnd',   targetHandle: 'gnd',      data: { wireColor: '#1e293b' } },
        { id: 'rl_e8', source: 'rl_bat',   sourceHandle: 'negative', target: 'rl_gnd',   targetHandle: 'gnd',      data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 3. LED with Current-Limiting Resistor
// -----------------------------------------------------------------------------
const ledResistor: ExampleProject = {
    name: 'LED with Resistor',
    description: 'Classic LED circuit: a 470 ohm resistor limits current to the LED from a 12V supply.',
    nodes: [
        { id: 'lr_bat', type: 'battery',     position: { x: 100, y: 250 }, data: { id: 'lr_bat', type: 'battery',     label: 'BAT (12V)', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'lr_gnd', type: 'ground',      position: { x: 100, y: 550 }, data: { id: 'lr_gnd', type: 'ground',      label: 'GND',       state: {}, params: {} } },
        { id: 'lr_sw',  type: 'switch_spst', position: { x: 320, y: 250 }, data: { id: 'lr_sw',  type: 'switch_spst', label: 'SW1',       state: { closed: false }, params: {} } },
        { id: 'lr_r',   type: 'resistor',    position: { x: 540, y: 250 }, data: { id: 'lr_r',   type: 'resistor',    label: 'R1 (470R)', state: {}, params: { resistance: 470 } } },
        { id: 'lr_led', type: 'led',         position: { x: 760, y: 250 }, data: { id: 'lr_led', type: 'led',         label: 'LED1',      state: {}, params: { color: 'green' } } },
    ] as any[],
    edges: [
        { id: 'lr_e1', source: 'lr_bat', sourceHandle: 'positive', target: 'lr_sw',  targetHandle: 'in',     data: { wireColor: '#ef4444' } },
        { id: 'lr_e2', source: 'lr_sw',  sourceHandle: 'out',      target: 'lr_r',   targetHandle: 'in',     data: { wireColor: '#ef4444' } },
        { id: 'lr_e3', source: 'lr_r',   sourceHandle: 'out',      target: 'lr_led', targetHandle: 'anode',  data: {} },
        { id: 'lr_e4', source: 'lr_led', sourceHandle: 'cathode',  target: 'lr_gnd', targetHandle: 'gnd',    data: { wireColor: '#1e293b' } },
        { id: 'lr_e5', source: 'lr_bat', sourceHandle: 'negative', target: 'lr_gnd', targetHandle: 'gnd',    data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 4. Hazard Flasher
// -----------------------------------------------------------------------------
const hazardFlasher: ExampleProject = {
    name: 'Hazard Flasher',
    description: 'A flasher unit blinks a lamp at ~1 Hz when the hazard switch is closed.',
    nodes: [
        { id: 'hf_bat',     type: 'battery',     position: { x: 100, y: 250 }, data: { id: 'hf_bat',     type: 'battery',     label: 'BAT (12V)',   state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'hf_gnd',     type: 'ground',      position: { x: 100, y: 550 }, data: { id: 'hf_gnd',     type: 'ground',      label: 'GND',         state: {}, params: {} } },
        { id: 'hf_fuse',    type: 'fuse',        position: { x: 320, y: 250 }, data: { id: 'hf_fuse',    type: 'fuse',        label: 'F1 (10A)',    state: { blown: false }, params: { tripCurrent: 10 } } },
        { id: 'hf_sw',      type: 'switch_spst', position: { x: 540, y: 250 }, data: { id: 'hf_sw',      type: 'switch_spst', label: 'HAZARD SW',   state: { closed: false }, params: {} } },
        { id: 'hf_flasher', type: 'flasher',     position: { x: 760, y: 250 }, data: { id: 'hf_flasher', type: 'flasher',     label: 'FLASHER',     state: {}, params: { onTime: 500, offTime: 500 } } },
        { id: 'hf_lamp',    type: 'lamp',        position: { x: 980, y: 250 }, data: { id: 'hf_lamp',    type: 'lamp',        label: 'HAZARD LAMP', state: {}, params: { resistance: 6 } } },
    ] as any[],
    edges: [
        { id: 'hf_e1', source: 'hf_bat',     sourceHandle: 'positive', target: 'hf_fuse',    targetHandle: 'in',  data: { wireColor: '#ef4444' } },
        { id: 'hf_e2', source: 'hf_fuse',    sourceHandle: 'out',      target: 'hf_sw',      targetHandle: 'in',  data: {} },
        { id: 'hf_e3', source: 'hf_sw',      sourceHandle: 'out',      target: 'hf_flasher', targetHandle: 'in',  data: {} },
        { id: 'hf_e4', source: 'hf_flasher', sourceHandle: 'out',      target: 'hf_lamp',    targetHandle: 'in',  data: {} },
        { id: 'hf_e5', source: 'hf_lamp',    sourceHandle: 'out',      target: 'hf_gnd',     targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
        { id: 'hf_e6', source: 'hf_bat',     sourceHandle: 'negative', target: 'hf_gnd',     targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 5. Motor Direction Control (DPDT Switch)
// -----------------------------------------------------------------------------
const motorDpdt: ExampleProject = {
    name: 'Motor Direction Control',
    description: 'A DPDT switch reverses polarity across a DC motor to control forward/reverse.',
    nodes: [
        { id: 'md_bat',   type: 'battery',     position: { x: 100, y: 300 }, data: { id: 'md_bat',   type: 'battery',     label: 'BAT (12V)', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'md_gnd',   type: 'ground',      position: { x: 100, y: 600 }, data: { id: 'md_gnd',   type: 'ground',      label: 'GND',       state: {}, params: {} } },
        { id: 'md_fuse',  type: 'fuse',        position: { x: 320, y: 300 }, data: { id: 'md_fuse',  type: 'fuse',        label: 'F1 (15A)', state: { blown: false }, params: { tripCurrent: 15 } } },
        { id: 'md_dpdt',  type: 'switch_dpdt', position: { x: 560, y: 300 }, data: { id: 'md_dpdt',  type: 'switch_dpdt', label: 'DIR SW',    state: { position: 'nc' }, params: {} } },
        { id: 'md_motor', type: 'motor',       position: { x: 840, y: 300 }, data: { id: 'md_motor', type: 'motor',       label: 'DC MOTOR',  state: {}, params: { resistance: 3 } } },
    ] as any[],
    edges: [
        { id: 'md_e1', source: 'md_bat',   sourceHandle: 'positive', target: 'md_fuse',  targetHandle: 'in',   data: { wireColor: '#ef4444' } },
        { id: 'md_e2', source: 'md_fuse',  sourceHandle: 'out',      target: 'md_dpdt',  targetHandle: 'com1', data: {} },
        { id: 'md_e3', source: 'md_bat',   sourceHandle: 'negative', target: 'md_dpdt',  targetHandle: 'com2', data: { wireColor: '#1e293b' } },
        { id: 'md_e4', source: 'md_dpdt',  sourceHandle: 'nc1',      target: 'md_motor', targetHandle: 'in',   data: {} },
        { id: 'md_e5', source: 'md_dpdt',  sourceHandle: 'nc2',      target: 'md_motor', targetHandle: 'out',  data: {} },
        { id: 'md_e6', source: 'md_bat',   sourceHandle: 'negative', target: 'md_gnd',   targetHandle: 'gnd',  data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 6. Ignition-Switched Accessory Feed
// -----------------------------------------------------------------------------
const ignitionAccessory: ExampleProject = {
    name: 'Ignition Accessory Feed',
    description: 'Battery feeds through a fusible link and ignition switch; accessory lamp only live on ACC/IGN.',
    nodes: [
        { id: 'ia_bat',  type: 'battery',         position: { x: 100, y: 280 }, data: { id: 'ia_bat',  type: 'battery',         label: 'BAT (12V)', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'ia_gnd',  type: 'ground',          position: { x: 100, y: 560 }, data: { id: 'ia_gnd',  type: 'ground',          label: 'GND',       state: {}, params: {} } },
        { id: 'ia_fl',   type: 'fusible_link',    position: { x: 320, y: 280 }, data: { id: 'ia_fl',   type: 'fusible_link',    label: 'FL (40A)', state: { blown: false }, params: { tripCurrent: 40 } } },
        { id: 'ia_ign',  type: 'switch_ignition', position: { x: 540, y: 280 }, data: { id: 'ia_ign',  type: 'switch_ignition', label: 'IGNITION',  state: { position: 'off' }, params: {} } },
        { id: 'ia_fuse', type: 'fuse',            position: { x: 780, y: 280 }, data: { id: 'ia_fuse', type: 'fuse',            label: 'F1 (10A)', state: { blown: false }, params: { tripCurrent: 10 } } },
        { id: 'ia_lamp', type: 'lamp',            position: { x: 1000, y: 280 }, data: { id: 'ia_lamp', type: 'lamp',           label: 'ACC LAMP',  state: {}, params: { resistance: 12 } } },
    ] as any[],
    edges: [
        { id: 'ia_e1', source: 'ia_bat',  sourceHandle: 'positive', target: 'ia_fl',   targetHandle: 'in',   data: { wireColor: '#ef4444' } },
        { id: 'ia_e2', source: 'ia_fl',   sourceHandle: 'out',      target: 'ia_ign',  targetHandle: 'batt', data: { wireColor: '#ef4444' } },
        { id: 'ia_e3', source: 'ia_ign',  sourceHandle: 'acc',      target: 'ia_fuse', targetHandle: 'in',   data: {} },
        { id: 'ia_e4', source: 'ia_fuse', sourceHandle: 'out',      target: 'ia_lamp', targetHandle: 'in',   data: {} },
        { id: 'ia_e5', source: 'ia_lamp', sourceHandle: 'out',      target: 'ia_gnd',  targetHandle: 'gnd',  data: { wireColor: '#1e293b' } },
        { id: 'ia_e6', source: 'ia_bat',  sourceHandle: 'negative', target: 'ia_gnd',  targetHandle: 'gnd',  data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 7. Dual-Output Fuse Box
// -----------------------------------------------------------------------------
const dualFuseBox: ExampleProject = {
    name: 'Dual-Output Fuse Box',
    description: 'Battery feeds a power bus splice that supplies two independently fused loads: a lamp and a buzzer.',
    nodes: [
        { id: 'df_bat',  type: 'battery',     position: { x: 100, y: 350 }, data: { id: 'df_bat',  type: 'battery',     label: 'BAT (12V)', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'df_gnd',  type: 'ground',      position: { x: 100, y: 650 }, data: { id: 'df_gnd',  type: 'ground',      label: 'GND',       state: {}, params: {} } },
        { id: 'df_fl',   type: 'fusible_link',position: { x: 320, y: 350 }, data: { id: 'df_fl',   type: 'fusible_link',label: 'FL (30A)', state: { blown: false }, params: { tripCurrent: 30 } } },
        { id: 'df_bus',  type: 'splice',      position: { x: 540, y: 350 }, data: { id: 'df_bus',  type: 'splice',      label: 'PWR BUS',   state: {}, params: {} } },
        { id: 'df_f1',   type: 'fuse',        position: { x: 760, y: 200 }, data: { id: 'df_f1',   type: 'fuse',        label: 'F1 (10A)', state: { blown: false }, params: { tripCurrent: 10 } } },
        { id: 'df_f2',   type: 'fuse',        position: { x: 760, y: 500 }, data: { id: 'df_f2',   type: 'fuse',        label: 'F2 (5A)',  state: { blown: false }, params: { tripCurrent: 5 } } },
        { id: 'df_lamp', type: 'lamp',        position: { x: 980, y: 200 }, data: { id: 'df_lamp', type: 'lamp',        label: 'LAMP',      state: {}, params: { resistance: 12 } } },
        { id: 'df_buz',  type: 'buzzer',      position: { x: 980, y: 500 }, data: { id: 'df_buz',  type: 'buzzer',      label: 'BUZZER',    state: {}, params: { resistance: 8 } } },
    ] as any[],
    edges: [
        { id: 'df_e1', source: 'df_bat',  sourceHandle: 'positive', target: 'df_fl',   targetHandle: 'in',  data: { wireColor: '#ef4444' } },
        { id: 'df_e2', source: 'df_fl',   sourceHandle: 'out',      target: 'df_bus',  targetHandle: 'l',   data: { wireColor: '#ef4444' } },
        { id: 'df_e3', source: 'df_bus',  sourceHandle: 't',        target: 'df_f1',   targetHandle: 'in',  data: {} },
        { id: 'df_e4', source: 'df_bus',  sourceHandle: 'b',        target: 'df_f2',   targetHandle: 'in',  data: {} },
        { id: 'df_e5', source: 'df_f1',   sourceHandle: 'out',      target: 'df_lamp', targetHandle: 'in',  data: {} },
        { id: 'df_e6', source: 'df_f2',   sourceHandle: 'out',      target: 'df_buz',  targetHandle: 'in',  data: {} },
        { id: 'df_e7', source: 'df_lamp', sourceHandle: 'out',      target: 'df_gnd',  targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
        { id: 'df_e8', source: 'df_buz',  sourceHandle: 'out',      target: 'df_gnd',  targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
        { id: 'df_e9', source: 'df_bat',  sourceHandle: 'negative', target: 'df_gnd',  targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 8. SPDT Lamp Selector
// -----------------------------------------------------------------------------
const spdtSelect: ExampleProject = {
    name: 'SPDT Lamp Selector',
    description: 'An SPDT switch selects between two lamps — NC position powers Lamp A, NO powers Lamp B.',
    nodes: [
        { id: 'ss_bat',   type: 'battery',     position: { x: 100, y: 300 }, data: { id: 'ss_bat',   type: 'battery',     label: 'BAT (12V)', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'ss_gnd',   type: 'ground',      position: { x: 100, y: 600 }, data: { id: 'ss_gnd',   type: 'ground',      label: 'GND',       state: {}, params: {} } },
        { id: 'ss_fuse',  type: 'fuse',        position: { x: 320, y: 300 }, data: { id: 'ss_fuse',  type: 'fuse',        label: 'F1 (10A)', state: { blown: false }, params: { tripCurrent: 10 } } },
        { id: 'ss_spdt',  type: 'switch_spdt', position: { x: 560, y: 300 }, data: { id: 'ss_spdt',  type: 'switch_spdt', label: 'SELECT SW', state: { position: 'nc' }, params: {} } },
        { id: 'ss_lamp1', type: 'lamp',        position: { x: 800, y: 160 }, data: { id: 'ss_lamp1', type: 'lamp',        label: 'LAMP A',    state: {}, params: { resistance: 12 } } },
        { id: 'ss_lamp2', type: 'lamp',        position: { x: 800, y: 440 }, data: { id: 'ss_lamp2', type: 'lamp',        label: 'LAMP B',    state: {}, params: { resistance: 12 } } },
    ] as any[],
    edges: [
        { id: 'ss_e1', source: 'ss_bat',   sourceHandle: 'positive', target: 'ss_fuse',  targetHandle: 'in',  data: { wireColor: '#ef4444' } },
        { id: 'ss_e2', source: 'ss_fuse',  sourceHandle: 'out',      target: 'ss_spdt',  targetHandle: 'com', data: {} },
        { id: 'ss_e3', source: 'ss_spdt',  sourceHandle: 'nc',       target: 'ss_lamp1', targetHandle: 'in',  data: {} },
        { id: 'ss_e4', source: 'ss_spdt',  sourceHandle: 'no',       target: 'ss_lamp2', targetHandle: 'in',  data: {} },
        { id: 'ss_e5', source: 'ss_lamp1', sourceHandle: 'out',      target: 'ss_gnd',   targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
        { id: 'ss_e6', source: 'ss_lamp2', sourceHandle: 'out',      target: 'ss_gnd',   targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
        { id: 'ss_e7', source: 'ss_bat',   sourceHandle: 'negative', target: 'ss_gnd',   targetHandle: 'gnd', data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 9. Simple ECU Door Lamp
// -----------------------------------------------------------------------------
const simpleEcu: ExampleProject = {
    name: 'Simple ECU Door Lamp',
    description: 'An ECU monitors a door switch (pull-up input) and drives an interior lamp output when the door is open.',
    nodes: [
        { id: 'se_bat',  type: 'battery',      position: { x: 100, y: 300 }, data: { id: 'se_bat',  type: 'battery',      label: 'BAT (12V)',  state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'se_gnd',  type: 'ground',       position: { x: 100, y: 600 }, data: { id: 'se_gnd',  type: 'ground',       label: 'GND',        state: {}, params: {} } },
        { id: 'se_fuse', type: 'fuse',         position: { x: 320, y: 300 }, data: { id: 'se_fuse', type: 'fuse',         label: 'F1 (10A)',   state: { blown: false }, params: { tripCurrent: 10 } } },
        { id: 'se_ecu',  type: 'ecu_advanced', position: { x: 560, y: 180 }, data: { id: 'se_ecu',  type: 'ecu_advanced', label: 'DOOR ECU',
            state: {}, params: {
                inputs: ['door'],
                outputs: ['lamp_out'],
                inputPulls: { door: 'pullup' },
                outputDrives: { lamp_out: 'HIGH_SIDE' },
                rules: [
                    { id: 'se_r1', type: 'COMPARE', config: { input: 'door', op: '<', compareSource: 'value', threshold: 1, output: 'lamp_out', driveType: 'HIGH_SIDE' } },
                ],
            }
        } },
        { id: 'se_ng',   type: 'net_label',   position: { x: 180, y: 480 }, data: { id: 'se_ng',   type: 'net_label',   label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
        { id: 'se_door', type: 'switch_spst', position: { x: 360, y: 480 }, data: { id: 'se_door', type: 'switch_spst', label: 'DOOR SW', state: { closed: false }, params: {} } },
        { id: 'se_lamp', type: 'lamp',        position: { x: 900, y: 180 }, data: { id: 'se_lamp', type: 'lamp',        label: 'INT LAMP', state: {}, params: { resistance: 12 } } },
        { id: 'se_ngo',  type: 'net_label',   position: { x: 1120, y: 180 }, data: { id: 'se_ngo',  type: 'net_label',  label: 'N-GND', state: {}, params: { netName: 'N-GND' } } },
    ] as any[],
    edges: [
        { id: 'se_e1', source: 'se_bat',  sourceHandle: 'positive', target: 'se_fuse', targetHandle: 'in',       data: { wireColor: '#ef4444' } },
        { id: 'se_e2', source: 'se_fuse', sourceHandle: 'out',      target: 'se_ecu',  targetHandle: 'vcc',      data: { wireColor: '#ef4444' } },
        { id: 'se_e3', source: 'se_ecu',  sourceHandle: 'gnd',      target: 'se_gnd',  targetHandle: 'gnd',      data: { wireColor: '#1e293b' } },
        { id: 'se_e4', source: 'se_bat',  sourceHandle: 'negative', target: 'se_gnd',  targetHandle: 'gnd',      data: { wireColor: '#1e293b' } },
        { id: 'se_e5', source: 'se_ng',   sourceHandle: 'out',      target: 'se_door', targetHandle: 'in',       data: { wireColor: '#1e293b' } },
        { id: 'se_e6', source: 'se_door', sourceHandle: 'out',      target: 'se_ecu',  targetHandle: 'door',     data: {} },
        { id: 'se_e7', source: 'se_ecu',  sourceHandle: 'lamp_out', target: 'se_lamp', targetHandle: 'in',       data: {} },
        { id: 'se_e8', source: 'se_lamp', sourceHandle: 'out',      target: 'se_ngo',  targetHandle: 'in',       data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// 10. Latching Relay Circuit
// -----------------------------------------------------------------------------
const latchingRelay: ExampleProject = {
    name: 'Latching Relay Circuit',
    description: 'A latching relay holds a load on after a SET pulse; a RESET pulse releases it.',
    nodes: [
        { id: 'la_bat',   type: 'battery',             position: { x: 100, y: 350 }, data: { id: 'la_bat',   type: 'battery',             label: 'BAT (12V)', state: {}, params: { voltage: 12, internalResistance: 0.05 } } },
        { id: 'la_gnd',   type: 'ground',              position: { x: 100, y: 650 }, data: { id: 'la_gnd',   type: 'ground',              label: 'GND',       state: {}, params: {} } },
        { id: 'la_fuse',  type: 'fuse',                position: { x: 320, y: 250 }, data: { id: 'la_fuse',  type: 'fuse',                label: 'F1 (15A)', state: { blown: false }, params: { tripCurrent: 15 } } },
        { id: 'la_set',   type: 'switch_momentary_no', position: { x: 320, y: 420 }, data: { id: 'la_set',   type: 'switch_momentary_no', label: 'SET',       state: { closed: false }, params: {} } },
        { id: 'la_reset', type: 'switch_momentary_no', position: { x: 320, y: 560 }, data: { id: 'la_reset', type: 'switch_momentary_no', label: 'RESET',     state: { closed: false }, params: {} } },
        { id: 'la_relay', type: 'relay_latching',      position: { x: 600, y: 400 }, data: { id: 'la_relay', type: 'relay_latching',      label: 'K-LATCH',   state: { energized: false }, params: { coilResistance: 85, pullInVoltage: 8 } } },
        { id: 'la_lamp',  type: 'lamp',                position: { x: 880, y: 250 }, data: { id: 'la_lamp',  type: 'lamp',                label: 'LOAD LAMP', state: {}, params: { resistance: 12 } } },
    ] as any[],
    edges: [
        { id: 'la_e1',  source: 'la_bat',   sourceHandle: 'positive', target: 'la_fuse',  targetHandle: 'in',        data: { wireColor: '#ef4444' } },
        { id: 'la_e2',  source: 'la_fuse',  sourceHandle: 'out',      target: 'la_relay', targetHandle: 'com',       data: {} },
        { id: 'la_e3',  source: 'la_relay', sourceHandle: 'no',       target: 'la_lamp',  targetHandle: 'in',        data: {} },
        { id: 'la_e4',  source: 'la_lamp',  sourceHandle: 'out',      target: 'la_gnd',   targetHandle: 'gnd',       data: { wireColor: '#1e293b' } },
        { id: 'la_e5',  source: 'la_bat',   sourceHandle: 'positive', target: 'la_set',   targetHandle: 'in',        data: {} },
        { id: 'la_e6',  source: 'la_set',   sourceHandle: 'out',      target: 'la_relay', targetHandle: 'set_in',    data: {} },
        { id: 'la_e7',  source: 'la_relay', sourceHandle: 'set_out',  target: 'la_gnd',   targetHandle: 'gnd',       data: { wireColor: '#1e293b' } },
        { id: 'la_e8',  source: 'la_bat',   sourceHandle: 'positive', target: 'la_reset', targetHandle: 'in',        data: {} },
        { id: 'la_e9',  source: 'la_reset', sourceHandle: 'out',      target: 'la_relay', targetHandle: 'reset_in',  data: {} },
        { id: 'la_e10', source: 'la_relay', sourceHandle: 'reset_out',target: 'la_gnd',   targetHandle: 'gnd',       data: { wireColor: '#1e293b' } },
        { id: 'la_e11', source: 'la_bat',   sourceHandle: 'negative', target: 'la_gnd',   targetHandle: 'gnd',       data: { wireColor: '#1e293b' } },
    ] as any[],
};

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------
export const EXAMPLE_PROJECTS: ExampleProject[] = [
    basicLamp,
    relaySwitchedLoad,
    ledResistor,
    hazardFlasher,
    motorDpdt,
    ignitionAccessory,
    dualFuseBox,
    spdtSelect,
    simpleEcu,
    latchingRelay,
    bcmPcmNetwork,
];
