import { describe, it, expect } from 'vitest';
import { solveCircuit } from './solver';
import type { SolveResult } from './solver';
import { EXAMPLE_PROJECTS } from '../examples/circuits';

type N = { id: string; type: string; position: { x: number; y: number }; data: any };
type E = { id: string; source: string; sourceHandle: string; target: string; targetHandle: string; data?: any };

const node = (id: string, type: string, params: any = {}, state: any = {}): N => ({
    id, type, position: { x: 0, y: 0 }, data: { id, type, label: id, params, state },
});

let edgeSeq = 0;
const wire = (a: string, b: string): E => {
    const [source, sourceHandle] = a.split(':');
    const [target, targetHandle] = b.split(':');
    return { id: `e${edgeSeq++}`, source, sourceHandle, target, targetHandle, data: {} };
};

/** Apply solver node updates back onto the node list, like App.runOnce does. */
function apply(nodes: N[], result: SolveResult): N[] {
    const map = new Map(result.nodeUpdates.map(u => [u.id, u.data as any]));
    return nodes.map(n => {
        const u = map.get(n.id);
        if (!u) return n;
        return { ...n, data: { ...n.data, ...u, state: { ...n.data.state, ...(u.state || {}) } } };
    });
}

/** Run `ticks` solver ticks starting at time `t0`, `dt` ms apart. */
function run(nodes: N[], edges: E[], ticks = 1, t0 = 0, dt = 200) {
    let result!: SolveResult;
    for (let i = 0; i < ticks; i++) {
        result = solveCircuit(nodes as any, edges as any, t0 + i * dt);
        nodes = apply(nodes, result);
    }
    return { nodes, result };
}

const v = (r: SolveResult, key: string) => r.nodeVoltages[r.netMap[key]] ?? 0;
const state = (nodes: N[], id: string) => nodes.find(n => n.id === id)!.data.state;

describe('solveCircuit', () => {
    it('lights a lamp through a closed switch', () => {
        const nodes = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('s', 'switch_spst', {}, { closed: true }),
            node('l', 'lamp', { resistance: 24 }),
            node('g', 'ground'),
        ];
        const edges = [wire('b:positive', 's:in'), wire('s:out', 'l:in'), wire('l:out', 'g:gnd'), wire('b:negative', 'g:gnd')];
        const { nodes: out, result } = run(nodes, edges);
        expect(v(result, 'l:in')).toBeCloseTo(12, 2);
        expect(state(out, 'l').on).toBe(true);
    });

    it('persists a tripped breaker and auto-resets after its delay', () => {
        const nodes = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('cb', 'breaker_auto', { tripCurrent: 20, resetDelayMs: 1000 }, { tripped: false }),
            node('r', 'resistor', { resistance: 0.1 }), // 120 A short
            node('g', 'ground'),
        ];
        const edges = [wire('b:positive', 'cb:in'), wire('cb:out', 'r:in'), wire('r:out', 'g:gnd'), wire('b:negative', 'g:gnd')];

        let { nodes: out, result } = run(nodes, edges, 1, 0);
        expect(state(out, 'cb').tripped).toBe(true);
        expect(result.events.filter(e => e.message.includes('TRIPPED'))).toHaveLength(1);

        // Still tripped (and not re-logged) before the reset delay
        ({ nodes: out, result } = run(out, edges, 1, 500));
        expect(state(out, 'cb').tripped).toBe(true);
        expect(result.events.some(e => e.message.includes('TRIPPED'))).toBe(false);

        // After the delay it resets — and immediately re-trips on the persisting short
        ({ nodes: out, result } = run(out, edges, 1, 1200));
        expect(result.events.some(e => e.message.includes('auto-reset'))).toBe(true);
        expect(state(out, 'cb').tripped).toBe(true);
    });

    it('delays contact closure on an on-delay relay', () => {
        const nodes = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('k', 'relay_delay_on', { coilResistance: 80, pullInVoltage: 8, delayMs: 1000 }, { energized: false }),
            node('g', 'ground'),
        ];
        const edges = [wire('b:positive', 'k:coil_in'), wire('k:coil_out', 'g:gnd'), wire('b:negative', 'g:gnd')];

        let { nodes: out } = run(nodes, edges, 1, 0);
        expect(state(out, 'k').coilOn).toBe(true);
        expect(state(out, 'k').energized).toBe(false);
        ({ nodes: out } = run(out, edges, 1, 600));
        expect(state(out, 'k').energized).toBe(false);
        ({ nodes: out } = run(out, edges, 1, 1000));
        expect(state(out, 'k').energized).toBe(true);
    });

    it('holds contacts after coil drop on an off-delay relay', () => {
        const nodes = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('s', 'switch_spst', {}, { closed: true }),
            node('k', 'relay_delay_off', { coilResistance: 80, pullInVoltage: 8, delayMs: 1000 }, { energized: false }),
            node('g', 'ground'),
        ];
        const edges = [wire('b:positive', 's:in'), wire('s:out', 'k:coil_in'), wire('k:coil_out', 'g:gnd'), wire('b:negative', 'g:gnd')];

        let { nodes: out } = run(nodes, edges, 1, 0);
        expect(state(out, 'k').energized).toBe(true);

        out = out.map(n => n.id === 's' ? { ...n, data: { ...n.data, state: { closed: false } } } : n);
        ({ nodes: out } = run(out, edges, 1, 2000));
        expect(state(out, 'k').energized).toBe(true);
        ({ nodes: out } = run(out, edges, 1, 2800));
        expect(state(out, 'k').energized).toBe(true);
        ({ nodes: out } = run(out, edges, 1, 3000));
        expect(state(out, 'k').energized).toBe(false);
    });

    it('drops forward voltage across a diode and blocks reverse current', () => {
        const fwd = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('d', 'diode', { forwardDrop: 0.7 }),
            node('r', 'resistor', { resistance: 1000 }),
            node('g', 'ground'),
        ];
        const edges = [wire('b:positive', 'd:anode'), wire('d:cathode', 'r:in'), wire('r:out', 'g:gnd'), wire('b:negative', 'g:gnd')];
        const { result } = run(fwd, edges);
        expect(v(result, 'r:in')).toBeCloseTo(11.3, 1);

        const revEdges = [wire('b:positive', 'd:cathode'), wire('d:anode', 'r:in'), wire('r:out', 'g:gnd'), wire('b:negative', 'g:gnd')];
        const { result: rev } = run(fwd, revEdges);
        expect(Math.abs(v(rev, 'r:in'))).toBeLessThan(0.01);
    });

    it('lights an LED only when forward biased', () => {
        const nodes = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('r', 'resistor', { resistance: 470 }),
            node('led', 'led', { color: '#ef4444' }),
            node('g', 'ground'),
        ];
        const fwd = [wire('b:positive', 'r:in'), wire('r:out', 'led:anode'), wire('led:cathode', 'g:gnd'), wire('b:negative', 'g:gnd')];
        expect(state(run(nodes, fwd).nodes, 'led').on).toBe(true);
        const rev = [wire('b:positive', 'r:in'), wire('r:out', 'led:cathode'), wire('led:anode', 'g:gnd'), wire('b:negative', 'g:gnd')];
        expect(state(run(nodes, rev).nodes, 'led').on).toBe(false);
    });

    it('clamps at the zener breakdown voltage', () => {
        const nodes = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('r', 'resistor', { resistance: 1000 }),
            node('z', 'zener', { breakdownVoltage: 5.1 }),
            node('g', 'ground'),
        ];
        const edges = [wire('b:positive', 'r:in'), wire('r:out', 'z:cathode'), wire('z:anode', 'g:gnd'), wire('b:negative', 'g:gnd')];
        const { result } = run(nodes, edges);
        expect(v(result, 'z:cathode')).toBeCloseTo(5.1, 1);
    });

    it('outputs no sensor signal without a reference supply', () => {
        const nodes = [
            node('t', 'tps_sensor', { vMin: 0.5, vMax: 4.5 }, { position: 100 }),
            node('r', 'resistor', { resistance: 1e6 }),
            node('g', 'ground'),
            node('ref', 'battery', { voltage: 5, internalResistance: 0 }),
        ];
        const base = [wire('t:gnd', 'g:gnd'), wire('t:out', 'r:in'), wire('r:out', 'g:gnd'), wire('ref:negative', 'g:gnd')];
        expect(Math.abs(v(run(nodes, base).result, 't:out'))).toBeLessThan(0.01);
        const powered = [...base, wire('ref:positive', 't:in')];
        expect(v(run(nodes, powered).result, 't:out')).toBeCloseTo(4.5, 1);
    });

    it('persists ECU outputs between ticks', () => {
        const nodes = [
            node('b', 'battery', { voltage: 12, internalResistance: 0 }),
            node('ecu', 'ecu', { numInputs: 1, numOutputs: 1, rules: [{ inputPin: 'in1', outputPin: 'out1', condition: '>', threshold: 6 }] }),
            node('l', 'lamp', { resistance: 24 }),
            node('g', 'ground'),
        ];
        const edges = [
            wire('b:positive', 'ecu:vcc'), wire('b:positive', 'ecu:in1'), wire('ecu:gnd', 'g:gnd'),
            wire('ecu:out1', 'l:in'), wire('l:out', 'g:gnd'), wire('b:negative', 'g:gnd'),
        ];
        const first = run(nodes, edges, 1, 0);
        expect(state(first.nodes, 'ecu').outputs.out1).toBe(true);
        expect(first.result.events.filter(e => e.message.includes('outputs updated'))).toHaveLength(1);
        const { result } = run(first.nodes, edges, 1, 200);
        expect(result.events.some(e => e.message.includes('outputs updated'))).toBe(false);
        expect(v(result, 'l:in')).toBeGreaterThan(11);
    });

    it.each(EXAMPLE_PROJECTS.map(p => [p.name, p] as const))('solves example "%s" to finite voltages', (_name, project) => {
        const { result } = run(project.nodes as any, project.edges as any, 5);
        for (const [net, volts] of Object.entries(result.nodeVoltages)) {
            expect(Number.isFinite(volts), `net ${net}`).toBe(true);
        }
    });
});
