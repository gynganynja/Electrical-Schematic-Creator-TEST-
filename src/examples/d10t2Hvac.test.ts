import { describe, it, expect } from 'vitest';
import { LogicRuntime } from '../simulation/ecu/LogicRuntime';
import { d10t2Hvac } from './d10t2Hvac';

const ecuRules = (id: string) => (d10t2Hvac.nodes.find(n => n.id === id)!.data as any).params.rules;

// Temp sensor scale: -40..150 °C → 0.5..4.5 V
const tempV = (c: number) => 0.5 + ((c + 40) / 190) * 4;

describe('D10T2 HVAC example logic', () => {
    const run = (id: string, inputs: Record<string, number>) =>
        new LogicRuntime().execute(inputs, ecuRules(id), 0, [], id).outputs;

    it('HVAC panel selects exactly one blower speed relay', () => {
        const speeds = ['blower_low', 'blower_med', 'blower_med_hi', 'blower_hi'];
        const active = (knobV: number) => speeds.filter(s => run('hvac', { fan_knob: knobV })[s] === 24);
        expect(active(0)).toEqual([]);
        expect(active(1)).toEqual(['blower_low']);
        expect(active(2)).toEqual(['blower_med']);
        expect(active(3.5)).toEqual(['blower_med_hi']);
        expect(active(4.8)).toEqual(['blower_hi']);
        expect(run('hvac', { fan_knob: 0 }).ac_sw_567).toBeNaN();
        expect(run('hvac', { fan_knob: 1 }).ac_sw_567).toBe(24);
    });

    const ecm = (over: Record<string, number>) => run('ecm', {
        ac_sw: 0, ac_auto: 0, ac_press: 0, cab_temp: tempV(30), louver_temp: tempV(12), evap_temp: tempV(5), temp_set: tempV(22), ...over,
    });

    it('engages the clutch and condenser relay when A/C is ON', () => {
        const out = ecm({ ac_sw: 24 });
        expect(out.ac_clutch).toBe(24);
        expect(out.cond_relay).toBe(0); // low-side driver pulling the relay coil to ground
    });

    it('in AUTO, runs A/C only when the cab is warmer than the setpoint', () => {
        expect(ecm({ ac_auto: 24 }).ac_clutch).toBe(24);
        expect(ecm({ ac_auto: 24, cab_temp: tempV(15) }).ac_clutch).toBeNaN();
    });

    it('drops the clutch on low/high refrigerant pressure or a freezing evaporator', () => {
        expect(ecm({ ac_sw: 24, ac_press: 24 }).ac_clutch).toBeNaN();
        expect(ecm({ ac_sw: 24, evap_temp: tempV(-2) }).ac_clutch).toBeNaN();
        expect(ecm({ ac_sw: 24, evap_temp: tempV(-2) }).cond_relay).toBeNaN();
    });

    it('opens the heater water valve when the cab is colder than the setpoint', () => {
        expect(ecm({ cab_temp: tempV(15) }).water_valve).toBe(24);
        expect(ecm({}).water_valve).toBeNaN();
    });
});
