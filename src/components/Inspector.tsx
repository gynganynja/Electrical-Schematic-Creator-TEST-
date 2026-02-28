import React from 'react';
import useStore from '../store/useStore';
import { WIRE_COLORS } from './edges/WireEdge';
import { Edit3 } from 'lucide-react';

// AWG gauge options
const AWG_OPTIONS = ['', '22', '20', '18', '16', '14', '12', '10', '8', '6', '4', '2', '1', '1/0', '2/0', '4/0'];
const MM2_OPTIONS = ['', '0.5', '0.75', '1.0', '1.5', '2.5', '4.0', '6.0', '10', '16', '25', '35', '50', '70', '95'];

export function Inspector() {
    const { nodes, edges, updateNodeData, updateEdgeData, lastSelectedNodeId, lastSelectedEdgeId, setEditingECU } = useStore();
    const selectedNode = lastSelectedNodeId
        ? nodes.find((n) => n.id === lastSelectedNodeId && n.selected)
        : nodes.find((n) => n.selected);
    const selectedEdge = !selectedNode && lastSelectedEdgeId
        ? edges.find((e) => e.id === lastSelectedEdgeId && e.selected)
        : null;

    // --- Edge Inspector ---
    if (selectedEdge) {
        const eData = (selectedEdge.data || {}) as any;
        return (
            <div className="w-80 border-l border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col h-full shadow-xl">
                <div className="p-4 border-b border-white/10 font-semibold text-sm flex items-center justify-between text-slate-100 tracking-wide">
                    <span>Inspector</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 text-emerald-400 rounded-md font-mono border border-slate-700/50 shadow-inner">wire</span>
                </div>
                <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                    {/* Wire Color */}
                    <FieldGroup label="Wire Color">
                        <select
                            value={eData.wireColor || ''}
                            onChange={(e) => updateEdgeData(selectedEdge.id, { wireColor: e.target.value })}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        >
                            <option value="">Default</option>
                            {Object.keys(WIRE_COLORS).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        {eData.wireColor && (
                            <div className="mt-1.5 flex items-center gap-2">
                                <div className="w-8 h-4 rounded border border-white/20" style={{ backgroundColor: WIRE_COLORS[eData.wireColor] || eData.wireColor }} />
                                <span className="text-xs text-slate-400">{eData.wireColor}</span>
                            </div>
                        )}
                    </FieldGroup>

                    {/* Gauge AWG */}
                    <FieldGroup label="Gauge (AWG)">
                        <select
                            value={eData.gaugeAwg || ''}
                            onChange={(e) => updateEdgeData(selectedEdge.id, { gaugeAwg: e.target.value })}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        >
                            {AWG_OPTIONS.map(g => (
                                <option key={g} value={g}>{g || '—'}</option>
                            ))}
                        </select>
                    </FieldGroup>

                    {/* Gauge mm² */}
                    <FieldGroup label="Gauge (mm²)">
                        <select
                            value={eData.gaugeMm2 || ''}
                            onChange={(e) => updateEdgeData(selectedEdge.id, { gaugeMm2: e.target.value })}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        >
                            {MM2_OPTIONS.map(g => (
                                <option key={g} value={g}>{g || '—'}</option>
                            ))}
                        </select>
                    </FieldGroup>
                </div>
            </div>
        );
    }

    if (!selectedNode) {
        return (
            <div className="w-80 border-l border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col h-full shadow-xl">
                <div className="p-4 border-b border-white/10 font-semibold text-sm text-slate-100 tracking-wide">Inspector</div>
                <div className="p-6 flex-1 flex items-center justify-center">
                    <div className="text-sm text-slate-500 text-center">Select a component<br />or wire to inspect</div>
                </div>
            </div>
        );
    }

    const data = selectedNode.data as any;

    return (
        <div className="w-80 border-l border-white/10 bg-slate-900/60 backdrop-blur-md flex flex-col h-full shadow-xl">
            <div className="p-4 border-b border-white/10 font-semibold text-sm flex items-center justify-between text-slate-100 tracking-wide">
                <span>Inspector</span>
                <span className="text-xs px-2 py-0.5 bg-slate-800 text-blue-400 rounded-md font-mono border border-slate-700/50 shadow-inner">{data.type}</span>
            </div>
            <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-4">
                {/* Label */}
                <FieldGroup label="Label">
                    <input
                        type="text"
                        value={data.label || ''}
                        onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value } as any)}
                        className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                    />
                </FieldGroup>

                {/* Parameters */}
                {data.type === 'battery' && (
                    <>
                        <FieldGroup label="Voltage (V)">
                            <input
                                type="number"
                                value={data.params?.voltage ?? 12}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, voltage: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="Internal Resistance (Ω)">
                            <input
                                type="number"
                                step="0.01"
                                value={data.params?.internalResistance ?? 0.05}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, internalResistance: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                    </>
                )}

                {data.type === 'resistor' && (
                    <FieldGroup label="Resistance (Ω)">
                        <input
                            type="number"
                            value={data.params?.resistance ?? 100}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, resistance: Number(e.target.value) } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {data.type === 'lamp' && (
                    <FieldGroup label="Resistance (Ω)">
                        <input
                            type="number"
                            value={data.params?.resistance ?? 24}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, resistance: Number(e.target.value) } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {data.type === 'fuse' && (
                    <>
                        <FieldGroup label="Trip Current (A)">
                            <input
                                type="number"
                                value={data.params?.tripCurrent ?? 15}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, tripCurrent: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="Blown">
                            <span className={`text-sm font-bold ${data.state?.blown ? 'text-red-500' : 'text-green-500'}`}>
                                {data.state?.blown ? 'YES' : 'NO'}
                            </span>
                        </FieldGroup>
                    </>
                )}

                {['relay_spdt', 'relay_spst', 'relay_dual87', 'relay_latching', 'relay_delay_on', 'relay_delay_off'].includes(data.type) && (
                    <>
                        <FieldGroup label="Coil Resistance (Ω)">
                            <input
                                type="number"
                                value={data.params?.coilResistance ?? 80}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, coilResistance: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="Pull-In Voltage (V)">
                            <input
                                type="number"
                                value={data.params?.pullInVoltage ?? 8}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, pullInVoltage: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        {['relay_delay_on', 'relay_delay_off'].includes(data.type) && (
                            <FieldGroup label="Delay (ms)">
                                <input
                                    type="number"
                                    value={data.params?.delayMs ?? 2000}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, delayMs: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                                />
                            </FieldGroup>
                        )}
                        <FieldGroup label="Energized">
                            <span className={`text-sm font-bold ${data.state?.energized ? 'text-green-500' : 'text-slate-400'}`}>
                                {data.state?.energized ? 'YES' : 'NO'}
                            </span>
                        </FieldGroup>
                    </>
                )}

                {/* Breakers & Fusible Link */}
                {['breaker_manual', 'breaker_auto', 'fusible_link'].includes(data.type) && (
                    <>
                        <FieldGroup label="Trip Current (A)">
                            <input
                                type="number"
                                value={data.params?.tripCurrent ?? 20}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, tripCurrent: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="Status">
                            <span className={`text-sm font-bold ${(data.state?.tripped || data.state?.blown) ? 'text-red-500' : 'text-green-500'}`}>
                                {(data.state?.tripped || data.state?.blown) ? 'TRIPPED / BLOWN' : 'OK'}
                            </span>
                        </FieldGroup>
                        {data.type === 'breaker_manual' && data.state?.tripped && (
                            <button
                                onClick={() => updateNodeData(selectedNode.id, { state: { tripped: false } } as any)}
                                className="px-3 py-1.5 rounded-md text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30 transition-all"
                            >
                                RESET BREAKER
                            </button>
                        )}
                    </>
                )}

                {/* Resistive loads: motor, solenoid, heater, compressor, wiper */}
                {['motor', 'solenoid', 'heater', 'compressor_clutch', 'wiper_motor'].includes(data.type) && (
                    <FieldGroup label="Resistance (Ω)">
                        <input
                            type="number"
                            value={data.params?.resistance ?? 10}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, resistance: Number(e.target.value) } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {/* Cable Resistance */}
                {data.type === 'cable_resistance' && (
                    <>
                        <FieldGroup label="Resistance (Ω)">
                            <input
                                type="number" step="0.01"
                                value={data.params?.resistance ?? 0.1}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, resistance: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="Length (m)">
                            <input
                                type="number"
                                value={data.params?.length_m ?? 10}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, length_m: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="Gauge">
                            <input
                                type="text"
                                value={data.params?.gauge ?? '10 AWG'}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, gauge: e.target.value } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                    </>
                )}

                {/* TVS Clamp */}
                {data.type === 'tvs_clamp' && (
                    <FieldGroup label="Clamp Voltage (V)">
                        <input
                            type="number"
                            value={data.params?.clampVoltage ?? 36}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, clampVoltage: Number(e.target.value) } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {/* Potentiometer */}
                {data.type === 'potentiometer' && (
                    <>
                        <FieldGroup label="Total Resistance (Ω)">
                            <input
                                type="number"
                                value={data.params?.resistance ?? 10000}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, resistance: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label={`Position: ${data.state?.position ?? 50}%`}>
                            <input
                                type="range" min="0" max="100"
                                value={data.state?.position ?? 50}
                                onChange={(e) => updateNodeData(selectedNode.id, { state: { position: Number(e.target.value) } } as any)}
                                className="w-full accent-teal-400"
                            />
                        </FieldGroup>
                    </>
                )}

                {/* Temp Sensor */}
                {data.type === 'temp_sensor' && (
                    <>
                        <FieldGroup label={`Temperature: ${data.state?.temperature ?? 25}°C`}>
                            <input type="range" min={data.params?.minVal ?? -40} max={data.params?.maxVal ?? 150}
                                value={data.state?.temperature ?? 25}
                                onChange={(e) => updateNodeData(selectedNode.id, { state: { ...data.state, temperature: Number(e.target.value) } } as any)}
                                className="w-full accent-orange-500" />
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Min Temp (°C)">
                                <input type="number" value={data.params?.minVal ?? -40}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, minVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-orange-500" />
                            </FieldGroup>
                            <FieldGroup label="Max Temp (°C)">
                                <input type="number" value={data.params?.maxVal ?? 150}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-orange-500" />
                            </FieldGroup>
                            <FieldGroup label="V out min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-orange-500" />
                            </FieldGroup>
                            <FieldGroup label="V out max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 4.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-orange-500" />
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* Oil Pressure Sensor */}
                {data.type === 'oil_press_sensor' && (
                    <>
                        <FieldGroup label={`Pressure: ${data.state?.pressure ?? 40} PSI`}>
                            <input type="range" min="0" max={data.params?.maxVal ?? 100}
                                value={data.state?.pressure ?? 40}
                                onChange={(e) => updateNodeData(selectedNode.id, { state: { ...data.state, pressure: Number(e.target.value) } } as any)}
                                className="w-full accent-amber-500" />
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Max Press (PSI)">
                                <input type="number" value={data.params?.maxVal ?? 100}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
                            </FieldGroup>
                            <FieldGroup label="V out min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
                            </FieldGroup>
                            <FieldGroup label="V out max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 4.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* Air Pressure (MAP) Sensor */}
                {data.type === 'air_press_sensor' && (
                    <>
                        <FieldGroup label={`Pressure: ${data.state?.pressure ?? 101.3} kPa`}>
                            <input type="range" min="0" max={data.params?.maxVal ?? 250}
                                value={data.state?.pressure ?? 101.3}
                                step="0.1"
                                onChange={(e) => updateNodeData(selectedNode.id, { state: { ...data.state, pressure: Number(e.target.value) } } as any)}
                                className="w-full accent-sky-500" />
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Max Press (kPa)">
                                <input type="number" value={data.params?.maxVal ?? 250}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-sky-500" />
                            </FieldGroup>
                            <FieldGroup label="V out min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-sky-500" />
                            </FieldGroup>
                            <FieldGroup label="V out max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 4.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-sky-500" />
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* MAF Sensor */}
                {data.type === 'maf_sensor' && (
                    <>
                        <FieldGroup label={`Airflow: ${data.state?.flow ?? 0} g/s`}>
                            <input type="range" min="0" max={data.params?.maxVal ?? 100}
                                value={data.state?.flow ?? 0}
                                onChange={(e) => updateNodeData(selectedNode.id, { state: { ...data.state, flow: Number(e.target.value) } } as any)}
                                className="w-full accent-cyan-500" />
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Max Flow (g/s)">
                                <input type="number" value={data.params?.maxVal ?? 100}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-cyan-500" />
                            </FieldGroup>
                            <FieldGroup label="V out min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 1.0}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-cyan-500" />
                            </FieldGroup>
                            <FieldGroup label="V out max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 5.0}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-cyan-500" />
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* Wheel Speed Sensor */}
                {data.type === 'wss_sensor' && (
                    <>
                        <FieldGroup label={`Speed: ${data.state?.speed ?? 0} km/h`}>
                            <input type="range" min="0" max={data.params?.maxVal ?? 300}
                                value={data.state?.speed ?? 0}
                                onChange={(e) => updateNodeData(selectedNode.id, { state: { ...data.state, speed: Number(e.target.value) } } as any)}
                                className="w-full accent-violet-500" />
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Max Speed (km/h)">
                                <input type="number" value={data.params?.maxVal ?? 300}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-violet-500" />
                            </FieldGroup>
                            <FieldGroup label="V out min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-violet-500" />
                            </FieldGroup>
                            <FieldGroup label="V out max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 12}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-violet-500" />
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* RPM Sensor */}
                {data.type === 'rpm_sensor' && (
                    <>
                        <FieldGroup label={`RPM: ${data.state?.rpm ?? 0}`}>
                            <input type="range" min="0" max={data.params?.maxVal ?? 8000}
                                value={data.state?.rpm ?? 0}
                                onChange={(e) => updateNodeData(selectedNode.id, { state: { ...data.state, rpm: Number(e.target.value) } } as any)}
                                className="w-full accent-rose-500" />
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Max RPM">
                                <input type="number" value={data.params?.maxVal ?? 8000}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-rose-500" />
                            </FieldGroup>
                            <FieldGroup label="V out min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-rose-500" />
                            </FieldGroup>
                            <FieldGroup label="V out max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 4.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-rose-500" />
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* Speedometer Gauge */}
                {data.type === 'speedo_gauge' && (
                    <>
                        <FieldGroup label={`Speed: ${((Math.max(0, Math.min(1, ((data.state?.vcc ?? 0) - (data.params?.vMin ?? 0.5)) / ((data.params?.vMax ?? 4.5) - (data.params?.vMin ?? 0.5)))) * (data.params?.maxVal ?? 240))).toFixed(0)} km/h`}>
                            <div className="text-xs text-slate-400 font-mono">Signal: {(data.state?.vcc ?? 0).toFixed(2)}V</div>
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Max Speed (km/h)">
                                <input type="number" value={data.params?.maxVal ?? 240}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500" />
                            </FieldGroup>
                            <FieldGroup label="Warn above (km/h)">
                                <input type="number" value={data.params?.warnVal ?? Math.round((data.params?.maxVal ?? 240) * 0.85)}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, warnVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-red-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500" />
                            </FieldGroup>
                            <FieldGroup label="V in min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500" />
                            </FieldGroup>
                            <FieldGroup label="V in max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 4.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-blue-500" />
                            </FieldGroup>
                        </div>
                        <div className="text-[9px] text-slate-600 px-1">Connect sensor OUT → gauge IN, sensor GND → gauge GND. Match V in min/max to the sensor's V out min/max.</div>
                    </>
                )}

                {/* Tachometer Gauge */}
                {data.type === 'tacho_gauge' && (
                    <>
                        <FieldGroup label={`RPM: ${((Math.max(0, Math.min(1, ((data.state?.vcc ?? 0) - (data.params?.vMin ?? 0.5)) / ((data.params?.vMax ?? 4.5) - (data.params?.vMin ?? 0.5)))) * (data.params?.maxVal ?? 8000))).toFixed(0)}`}>
                            <div className="text-xs text-slate-400 font-mono">Signal: {(data.state?.vcc ?? 0).toFixed(2)}V</div>
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Max RPM">
                                <input type="number" value={data.params?.maxVal ?? 8000}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, maxVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
                            </FieldGroup>
                            <FieldGroup label="Redline (RPM)">
                                <input type="number" value={data.params?.warnVal ?? Math.round((data.params?.maxVal ?? 8000) * 0.75)}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, warnVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-red-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
                            </FieldGroup>
                            <FieldGroup label="V in min (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
                            </FieldGroup>
                            <FieldGroup label="V in max (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 4.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-amber-500" />
                            </FieldGroup>
                        </div>
                        <div className="text-[9px] text-slate-600 px-1">Connect RPM sensor OUT → tacho IN. Set V in min/max to match the RPM sensor's V out range.</div>
                    </>
                )}

                {/* Fuel Gauge */}
                {data.type === 'fuel_gauge' && (
                    <>
                        <FieldGroup label={`Fuel: ${((Math.max(0, Math.min(1, ((data.state?.vcc ?? 0) - (data.params?.vMin ?? 0.5)) / ((data.params?.vMax ?? 4.5) - (data.params?.vMin ?? 0.5)))) * 100)).toFixed(0)}%`}>
                            <div className="text-xs text-slate-400 font-mono">Signal: {(data.state?.vcc ?? 0).toFixed(2)}V</div>
                        </FieldGroup>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldGroup label="Low fuel warn (%)">
                                <input type="number" value={data.params?.warnVal ?? 15}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, warnVal: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-red-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-emerald-500" />
                            </FieldGroup>
                            <FieldGroup label="V empty (V)">
                                <input type="number" step="0.1" value={data.params?.vMin ?? 0.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMin: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-emerald-500" />
                            </FieldGroup>
                            <FieldGroup label="V full (V)">
                                <input type="number" step="0.1" value={data.params?.vMax ?? 4.5}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, vMax: Number(e.target.value) } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-amber-300 rounded px-2 py-1.5 text-sm font-mono focus:outline-none focus:border-emerald-500" />
                            </FieldGroup>
                        </div>
                        <div className="text-[9px] text-slate-600 px-1">Connect a sensor OUT → fuel gauge IN. V empty/full must match the sensor's output range.</div>
                    </>
                )}

                {/* Zener Diode */}
                {data.type === 'zener' && (
                    <FieldGroup label="Breakdown Voltage (V)">
                        <input
                            type="number" step="0.1"
                            value={data.params?.breakdownVoltage ?? 5.1}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, breakdownVoltage: Number(e.target.value) } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {/* Capacitor */}
                {data.type === 'capacitor' && (
                    <FieldGroup label="Capacitance">
                        <input
                            type="text"
                            value={data.params?.capacitance ?? '100µF'}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, capacitance: e.target.value } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {/* Inductor */}
                {data.type === 'inductor' && (
                    <>
                        <FieldGroup label="Inductance">
                            <input
                                type="text"
                                value={data.params?.inductance ?? '10mH'}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, inductance: e.target.value } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="DC Resistance (Ω)">
                            <input
                                type="number" step="0.1"
                                value={data.params?.resistance ?? 0.5}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, resistance: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                    </>
                )}

                {/* Connector pin count */}
                {data.type === 'connector' && (
                    <FieldGroup label="Pin Count">
                        <input
                            type="number" min="1" max="8"
                            value={data.params?.numPins ?? 4}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, numPins: Number(e.target.value) } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {/* Harness Entry/Exit */}
                {(data.type === 'harness_entry' || data.type === 'harness_exit') && (
                    <FieldGroup label="Wire Count">
                        <input
                            type="number" min="1" max="12"
                            value={data.params?.numPins ?? 6}
                            onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, numPins: Number(e.target.value) } } as any)}
                            className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                        />
                    </FieldGroup>
                )}

                {/* ECU Module */}
                {data.type === 'ecu' && (
                    <>
                        <FieldGroup label="Inputs">
                            <input
                                type="number" min="1" max="8"
                                value={data.params?.numInputs ?? 4}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, numInputs: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>
                        <FieldGroup label="Input Pull Resistors">
                            <div className="flex flex-col gap-1.5">
                                {Array.from({ length: Number(data.params?.numInputs ?? 4) }, (_, i) => {
                                    const pinId = `in${i + 1}`;
                                    const pull = data.params?.inputPulls?.[pinId] || 'none';
                                    const pullV = data.params?.inputPullVoltages?.[pinId] ?? 12;
                                    return (
                                        <div key={pinId} className="flex items-center gap-1.5 bg-slate-800/40 p-1.5 rounded border border-slate-700/50">
                                            <span className="text-[10px] font-mono text-emerald-400 w-7 shrink-0">IN{i + 1}</span>
                                            <select
                                                value={pull}
                                                onChange={(e) => {
                                                    const pulls = { ...(data.params?.inputPulls || {}) };
                                                    pulls[pinId] = e.target.value;
                                                    updateNodeData(selectedNode.id, { params: { ...data.params, inputPulls: pulls } } as any);
                                                }}
                                                className="flex-1 bg-slate-950/50 border border-slate-700 text-[9px] rounded px-1 py-0.5 text-slate-300 focus:outline-none"
                                            >
                                                <option value="none">None</option>
                                                <option value="pullup">Pull-Up</option>
                                                <option value="pulldown">Pull-Down</option>
                                            </select>
                                            {pull === 'pullup' && (
                                                <div className="flex items-center gap-0.5">
                                                    <input
                                                        type="number"
                                                        min="1" max="30" step="0.5"
                                                        value={pullV}
                                                        onChange={(e) => {
                                                            const pvs = { ...(data.params?.inputPullVoltages || {}) };
                                                            pvs[pinId] = Number(e.target.value);
                                                            updateNodeData(selectedNode.id, { params: { ...data.params, inputPullVoltages: pvs } } as any);
                                                        }}
                                                        className="w-10 bg-slate-950/50 border border-red-800/50 text-[9px] rounded px-1 py-0.5 text-red-300 focus:outline-none font-mono"
                                                    />
                                                    <span className="text-[8px] text-slate-500">V</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </FieldGroup>
                        <FieldGroup label="Outputs">
                            <input
                                type="number" min="1" max="8"
                                value={data.params?.numOutputs ?? 4}
                                onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, numOutputs: Number(e.target.value) } } as any)}
                                className="w-full border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono"
                            />
                        </FieldGroup>

                        {/* Output Drivers Configuration */}
                        <FieldGroup label="Output Drivers">
                            <div className="grid grid-cols-2 gap-1.5">
                                {Array.from({ length: Number(data.params?.numOutputs ?? 4) }, (_, i) => {
                                    const pinId = `out${i + 1}`;
                                    const drive = data.params?.outputDrives?.[pinId] || 'high';
                                    return (
                                        <div key={pinId} className="flex items-center justify-between gap-1 bg-slate-800/40 p-1.5 rounded border border-slate-700/50">
                                            <span className="text-[10px] font-mono text-amber-400">OUT{i + 1}</span>
                                            <select
                                                value={drive}
                                                onChange={(e) => {
                                                    const drives = { ...(data.params?.outputDrives || {}) };
                                                    drives[pinId] = e.target.value;
                                                    updateNodeData(selectedNode.id, { params: { ...data.params, outputDrives: drives } } as any);
                                                }}
                                                className="bg-slate-950/50 border border-slate-700 text-[9px] rounded px-1 py-0.5 text-slate-300 focus:outline-none"
                                            >
                                                <option value="high">HIGH (+)</option>
                                                <option value="low">LOW (-)</option>
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </FieldGroup>

                        {/* Rules Editor */}
                        <FieldGroup label="Rules">
                            <div className="flex flex-col gap-2">
                                {(data.params?.rules || []).map((rule: any, idx: number) => {
                                    if (!rule || typeof rule !== 'object') return null;
                                    const currentRules = [...(data.params?.rules || [])];
                                    const updateRule = (field: string, value: any) => {
                                        currentRules[idx] = { ...currentRules[idx], [field]: value };
                                        updateNodeData(selectedNode.id, { params: { ...data.params, rules: currentRules } } as any);
                                    };
                                    const removeRule = () => {
                                        currentRules.splice(idx, 1);
                                        updateNodeData(selectedNode.id, { params: { ...data.params, rules: currentRules } } as any);
                                    };
                                    const numIn = data.params?.numInputs ?? 4;
                                    const numOut = data.params?.numOutputs ?? 4;
                                    return (
                                        <div key={idx} className="bg-slate-800/60 border border-slate-700/50 rounded-md p-2 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                                                RULE {idx + 1}
                                                <button onClick={removeRule} className="ml-auto text-red-400 hover:text-red-300 text-xs">✕</button>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[9px] text-slate-500 w-5">IF</span>
                                                <select value={rule.inputPin || ''} onChange={(e) => updateRule('inputPin', e.target.value)}
                                                    className="flex-1 border border-slate-700 bg-slate-950/50 text-emerald-400 rounded px-1 py-0.5 text-[10px] font-mono focus:outline-none">
                                                    <option value="">—</option>
                                                    {Array.from({ length: numIn }, (_, i) => (
                                                        <option key={i} value={`in${i + 1}`}>IN{i + 1}</option>
                                                    ))}
                                                </select>
                                                <select value={rule.condition || '>'} onChange={(e) => updateRule('condition', e.target.value)}
                                                    className="w-10 border border-slate-700 bg-slate-950/50 text-slate-200 rounded px-1 py-0.5 text-[10px] font-mono text-center focus:outline-none">
                                                    <option value=">">&gt;</option>
                                                    <option value="<">&lt;</option>
                                                </select>
                                                <input
                                                    type="number"
                                                    value={rule.threshold ?? 5}
                                                    onChange={(e) => updateRule('threshold', Number(e.target.value))}
                                                    className="w-10 border border-slate-700 bg-slate-950/50 text-yellow-400 rounded px-1 py-0.5 text-[10px] font-mono text-center focus:outline-none"
                                                />
                                                <span className="text-[9px] text-slate-500">V</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="text-[9px] text-slate-500 w-5">SET</span>
                                                <select value={rule.outputPin || ''} onChange={(e) => updateRule('outputPin', e.target.value)}
                                                    className="flex-1 border border-slate-700 bg-slate-950/50 text-amber-400 rounded px-1 py-0.5 text-[10px] font-mono focus:outline-none">
                                                    <option value="">—</option>
                                                    {Array.from({ length: numOut }, (_, i) => (
                                                        <option key={i} value={`out${i + 1}`}>OUT{i + 1}</option>
                                                    ))}
                                                </select>
                                                <span className="text-[9px] text-emerald-400 font-bold">ON</span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <button
                                    onClick={() => {
                                        const currentRules = [...(data.params?.rules || [])];
                                        currentRules.push({ inputPin: 'in1', condition: '>', threshold: 6, outputPin: 'out1' });
                                        updateNodeData(selectedNode.id, { params: { ...data.params, rules: currentRules } } as any);
                                    }}
                                    className="px-2 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 hover:bg-indigo-500/30 transition-all"
                                >
                                    + Add Rule
                                </button>
                            </div>
                        </FieldGroup>

                        {/* Output States */}
                        {data.state?.outputs && (
                            <FieldGroup label="Output States">
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(data.state.outputs).map(([key, active]: [string, any]) => (
                                        <span key={key} className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${active ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-slate-800/60 text-slate-500 border-slate-700'}`}>
                                            {key.toUpperCase()} {active ? '●' : '○'}
                                        </span>
                                    ))}
                                </div>
                            </FieldGroup>
                        )}
                    </>
                )}

                {data.type === 'ecu_advanced' && (
                    <>
                        <FieldGroup label="Pin Management">
                            <div className="space-y-3 p-3 bg-slate-950/40 rounded-lg border border-white/5">
                                {/* Inputs */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Inputs</span>
                                        <button
                                            onClick={() => {
                                                const inputs = [...(data.params?.inputs || ['in1', 'in2'])];
                                                inputs.push(`in${inputs.length + 1}`);
                                                updateNodeData(selectedNode.id, { params: { ...data.params, inputs } } as any);
                                            }}
                                            className="text-[10px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded hover:bg-blue-500/20"
                                        >+ Add Input</button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {(data.params?.inputs || ['in1', 'in2']).map((pin: string, idx: number) => {
                                            const pull = data.params?.inputPulls?.[pin] || 'none';
                                            return (
                                                <div key={idx} className="flex gap-1 items-center">
                                                    <input
                                                        value={pin}
                                                        onChange={(e) => {
                                                            const inputs = [...(data.params?.inputs || ['in1', 'in2'])];
                                                            const oldPin = inputs[idx];
                                                            const newPin = e.target.value;
                                                            inputs[idx] = newPin;
                                                            const pulls = { ...(data.params?.inputPulls || {}) };
                                                            pulls[newPin] = pulls[oldPin] || 'none';
                                                            delete pulls[oldPin];
                                                            updateNodeData(selectedNode.id, { params: { ...data.params, inputs, inputPulls: pulls } } as any);
                                                            // Update edges that reference the old pin handle
                                                            const nodeId = selectedNode.id;
                                                            useStore.setState({
                                                                edges: edges.map(edge => {
                                                                    let changed = false;
                                                                    const e2 = { ...edge };
                                                                    if (edge.source === nodeId && (edge.sourceHandle === oldPin || edge.sourceHandle?.toLowerCase() === oldPin.toLowerCase())) {
                                                                        e2.sourceHandle = newPin;
                                                                        changed = true;
                                                                    }
                                                                    if (edge.target === nodeId && (edge.targetHandle === oldPin || edge.targetHandle?.toLowerCase() === oldPin.toLowerCase())) {
                                                                        e2.targetHandle = newPin;
                                                                        changed = true;
                                                                    }
                                                                    return changed ? e2 : edge;
                                                                })
                                                            });
                                                        }}
                                                        className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:border-blue-500 outline-none"
                                                    />
                                                    <select
                                                        value={pull}
                                                        onChange={(e) => {
                                                            const pulls = { ...(data.params?.inputPulls || {}) };
                                                            pulls[pin] = e.target.value;
                                                            updateNodeData(selectedNode.id, { params: { ...data.params, inputPulls: pulls } } as any);
                                                        }}
                                                        className="flex-1 bg-slate-950/50 border border-slate-700 text-[9px] rounded px-1 py-1 focus:outline-none"
                                                        style={{ color: pull === 'pullup' ? '#f87171' : pull === 'pulldown' ? '#60a5fa' : '#64748b' }}
                                                    >
                                                        <option value="none">No Pull</option>
                                                        <option value="pullup">Pull-Up</option>
                                                        <option value="pulldown">Pull-Down</option>
                                                    </select>
                                                    {pull === 'pullup' && (
                                                        <div className="flex items-center gap-0.5">
                                                            <input
                                                                type="number"
                                                                min="1" max="30" step="0.5"
                                                                value={data.params?.inputPullVoltages?.[pin] ?? 12}
                                                                onChange={(e) => {
                                                                    const pvs = { ...(data.params?.inputPullVoltages || {}) };
                                                                    pvs[pin] = Number(e.target.value);
                                                                    updateNodeData(selectedNode.id, { params: { ...data.params, inputPullVoltages: pvs } } as any);
                                                                }}
                                                                className="w-10 bg-slate-950/50 border border-red-800/50 text-[9px] rounded px-1 py-0.5 text-red-300 focus:outline-none font-mono"
                                                            />
                                                            <span className="text-[8px] text-slate-500">V</span>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            const inputs = (data.params?.inputs || ['in1', 'in2']).filter((_: any, i: number) => i !== idx);
                                                            updateNodeData(selectedNode.id, { params: { ...data.params, inputs } } as any);
                                                        }}
                                                        className="px-2 text-slate-500 hover:text-red-400"
                                                    >×</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Outputs */}
                                <div className="space-y-1.5 pt-2 border-t border-white/5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">Outputs</span>
                                        <button
                                            onClick={() => {
                                                const outputs = [...(data.params?.outputs || ['out1', 'out2'])];
                                                outputs.push(`out${outputs.length + 1}`);
                                                updateNodeData(selectedNode.id, { params: { ...data.params, outputs } } as any);
                                            }}
                                            className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded hover:bg-amber-500/20"
                                        >+ Add Output</button>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        {(data.params?.outputs || ['out1', 'out2']).map((pin: string, idx: number) => {
                                            const driveVal = data.params?.outputDrives?.[pin] || 'high';
                                            return (
                                                <div key={idx} className="flex gap-1 items-center">
                                                    <input
                                                        value={pin}
                                                        onChange={(e) => {
                                                            const outputs = [...(data.params?.outputs || ['out1', 'out2'])];
                                                            const oldPin = outputs[idx];
                                                            const newPin = e.target.value;
                                                            outputs[idx] = newPin;
                                                            const drives = { ...(data.params?.outputDrives || {}) };
                                                            drives[newPin] = drives[oldPin] || 'high';
                                                            delete drives[oldPin];
                                                            updateNodeData(selectedNode.id, { params: { ...data.params, outputs, outputDrives: drives } } as any);
                                                            // Update edges that reference the old pin handle
                                                            const nodeId = selectedNode.id;
                                                            useStore.setState({
                                                                edges: edges.map(edge => {
                                                                    let changed = false;
                                                                    const e2 = { ...edge };
                                                                    if (edge.source === nodeId && (edge.sourceHandle === oldPin || edge.sourceHandle?.toLowerCase() === oldPin.toLowerCase())) {
                                                                        e2.sourceHandle = newPin;
                                                                        changed = true;
                                                                    }
                                                                    if (edge.target === nodeId && (edge.targetHandle === oldPin || edge.targetHandle?.toLowerCase() === oldPin.toLowerCase())) {
                                                                        e2.targetHandle = newPin;
                                                                        changed = true;
                                                                    }
                                                                    return changed ? e2 : edge;
                                                                })
                                                            });
                                                        }}
                                                        className="w-16 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-[11px] text-amber-300 focus:border-amber-500 outline-none font-mono"
                                                    />
                                                    <select
                                                        value={driveVal}
                                                        onChange={(e) => {
                                                            const drives = { ...(data.params?.outputDrives || {}) };
                                                            drives[pin] = e.target.value;
                                                            updateNodeData(selectedNode.id, { params: { ...data.params, outputDrives: drives } } as any);
                                                        }}
                                                        className="flex-1 bg-slate-950/50 border border-slate-700 text-[10px] rounded px-1 py-1 focus:outline-none"
                                                        style={{ color: driveVal === 'high' ? '#f59e0b' : driveVal === 'low' ? '#60a5fa' : '#a78bfa' }}
                                                    >
                                                        <option value="high">HSD (+12V)</option>
                                                        <option value="low">LSD (GND)</option>
                                                        <option value="push-pull">Push-Pull</option>
                                                    </select>
                                                    <button
                                                        onClick={() => {
                                                            const outputs = (data.params?.outputs || ['out1', 'out2']).filter((_: any, i: number) => i !== idx);
                                                            updateNodeData(selectedNode.id, { params: { ...data.params, outputs } } as any);
                                                        }}
                                                        className="px-1.5 text-slate-500 hover:text-red-400 text-xs"
                                                    >×</button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </FieldGroup>

                        <FieldGroup label="Logic Rules">
                            <button
                                onClick={() => setEditingECU(selectedNode.id)}
                                className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 py-1.5 rounded flex items-center justify-center gap-2 transition-all group"
                            >
                                <Edit3 size={14} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">Open Rules Editor</span>
                            </button>
                        </FieldGroup>

                        {/* Network Config */}
                        <div className="grid grid-cols-2 gap-3">
                            <FieldGroup label="Source Addr">
                                <input
                                    type="text"
                                    value={`0x${(data.params?.sourceAddress ?? 1).toString(16).padStart(2, '0')}`}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value.replace('0x', ''), 16);
                                        if (!isNaN(val)) updateNodeData(selectedNode.id, { params: { ...data.params, sourceAddress: val } } as any);
                                    }}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-indigo-400 rounded px-3 py-1.5 text-sm font-mono focus:border-indigo-500 outline-none"
                                />
                            </FieldGroup>
                            <FieldGroup label="Protocol">
                                <select
                                    value={data.params?.canMode || 'J1939'}
                                    onChange={(e) => updateNodeData(selectedNode.id, { params: { ...data.params, canMode: e.target.value } } as any)}
                                    className="w-full border border-slate-700 bg-slate-950/50 text-indigo-400 rounded px-3 py-1.5 text-sm font-mono focus:border-indigo-500 outline-none"
                                >
                                    <option value="J1939">J1939</option>
                                    <option value="UDS">UDS/ISO</option>
                                    <option value="RAW">Raw CAN</option>
                                </select>
                            </FieldGroup>
                        </div>
                    </>
                )}

                {/* Switch State Control */}
                {(data.type === 'switch_spst' || data.type === 'switch_momentary' || data.type === 'switch_momentary_no' || data.type === 'switch_master') && (
                    <FieldGroup label="State">
                        <button
                            onClick={() => updateNodeData(selectedNode.id, { state: { closed: !data.state?.closed } } as any)}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all w-full border ${data.state?.closed ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-slate-300'}`}
                        >
                            {data.state?.closed ? 'CLOSED (ON)' : 'OPEN (OFF)'}
                        </button>
                    </FieldGroup>
                )}

                {data.type === 'switch_momentary_nc' && (
                    <FieldGroup label="State">
                        <button
                            onClick={() => updateNodeData(selectedNode.id, { state: { open: !data.state?.open } } as any)}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all w-full border ${data.state?.open ? 'bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30'}`}
                        >
                            {data.state?.open ? 'PRESSED (OPEN)' : 'CLOSED (NC)'}
                        </button>
                    </FieldGroup>
                )}

                {(data.type === 'switch_spdt' || data.type === 'switch_dpdt') && (
                    <FieldGroup label="Position">
                        <button
                            onClick={() => updateNodeData(selectedNode.id, { state: { position: data.state?.position === 'nc' ? 'no' : 'nc' } } as any)}
                            className={`px-3 py-1.5 rounded-md text-sm font-bold transition-all w-full border ${data.state?.position === 'no' ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'}`}
                        >
                            {data.state?.position === 'no' ? '→ NO' : '→ NC'}
                        </button>
                    </FieldGroup>
                )}

                {data.type === 'switch_ignition' && (
                    <FieldGroup label="Position">
                        {(['off', 'acc', 'on', 'start'] as const).map(pos => (
                            <button
                                key={pos}
                                onClick={() => updateNodeData(selectedNode.id, { state: { position: pos } } as any)}
                                className={`px-3 py-1 rounded-md text-xs font-bold transition-all w-full border mb-1 ${data.state?.position === pos ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-slate-800/60 text-slate-500 border-slate-700 hover:bg-slate-700 hover:text-slate-300'}`}
                            >
                                {pos.toUpperCase()}
                            </button>
                        ))}
                    </FieldGroup>
                )}
            </div>
        </div>
    );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">{label}</label>
            {children}
        </div>
    );
}
