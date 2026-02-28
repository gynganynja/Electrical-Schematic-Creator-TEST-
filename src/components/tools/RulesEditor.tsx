import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Settings, Zap, Clock, Save, AlertCircle, Radio, ToggleLeft, Calculator } from 'lucide-react';
import useStore from '../../store/useStore';
import type { LogicBlockType } from '../../simulation/ecu/LogicRuntime';

// ---- Shared tiny components ----
const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="text-[9px] text-slate-500 uppercase font-bold px-1">{children}</label>
);
const Sel = ({ value, onChange, children, className = '' }: any) => (
    <select value={value} onChange={onChange}
        className={`bg-slate-950 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:border-indigo-500 ${className}`}>
        {children}
    </select>
);
const Inp = ({ className = '', ...props }: any) => (
    <input {...props}
        className={`bg-slate-950 border border-white/10 rounded px-2 py-1 text-[11px] text-slate-100 focus:outline-none focus:border-indigo-500 ${className}`} />
);
const Hint = ({ children }: { children: React.ReactNode }) => (
    <span className="text-[9px] text-slate-600 self-center">{children}</span>
);

// Operator picker (shared between COMPARE and CAN_TX condition)
const OpSelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Sel value={value} onChange={(e: any) => onChange(e.target.value)} className="w-12">
        <option value=">">&gt;</option>
        <option value="<">&lt;</option>
        <option value=">=">&ge;</option>
        <option value="<=">&le;</option>
        <option value="==">==</option>
        <option value="!=">!=</option>
    </Sel>
);

// Pin select for inputs
const InputPinSelect = ({ value, onChange, inputs }: { value: string; onChange: (v: string) => void; inputs: string[] }) => (
    <Sel value={value} onChange={(e: any) => onChange(e.target.value)} className="flex-1">
        {inputs.map((pin: string) => <option key={pin} value={pin}>Pin {pin.toUpperCase()}</option>)}
    </Sel>
);

// Pin select for outputs
const OutputPinSelect = ({ value, onChange, outputs, label }: { value: string; onChange: (v: string) => void; outputs: string[]; label?: string }) => (
    <Sel value={value} onChange={(e: any) => onChange(e.target.value)} className="flex-1">
        {outputs.map((pin: string) => <option key={pin} value={pin}>{label || 'Drive'} {pin.toUpperCase()}</option>)}
    </Sel>
);

// Drive type select (HIGH_SIDE / LOW_SIDE / CUSTOM)
const DriveSelect = ({ config, onChange }: { config: any; onChange: (patch: any) => void }) => (
    <div className="flex gap-1">
        <Sel value={config.driveType || 'HIGH_SIDE'} onChange={(e: any) => onChange({ driveType: e.target.value })}
            className="bg-indigo-900/40 border-indigo-500/20 text-indigo-300">
            <option value="HIGH_SIDE">12V (+)</option>
            <option value="LOW_SIDE">GND (-)</option>
            <option value="CUSTOM">Custom V</option>
        </Sel>
        {config.driveType === 'CUSTOM' && (
            <Inp type="number" value={config.driveVoltage ?? 12} step="0.1"
                onChange={(e: any) => onChange({ driveVoltage: parseFloat(e.target.value) })}
                className="w-14 text-amber-300" />
        )}
    </div>
);

// Compare-against source picker (value / pin / variable)
const CompareSourcePicker = ({ config, onChange, inputs }: { config: any; onChange: (patch: any) => void; inputs: string[] }) => {
    const source = config.compareSource || 'value';
    return (
        <div className="flex gap-1">
            <Sel value={source} onChange={(e: any) => onChange({ compareSource: e.target.value })} className="w-16">
                <option value="value">Value</option>
                <option value="pin">Pin</option>
                <option value="var">Var</option>
            </Sel>
            {source === 'value' && (
                <Inp type="number" value={config.threshold ?? 5} step="0.1"
                    onChange={(e: any) => onChange({ threshold: parseFloat(e.target.value) })}
                    className="w-16" />
            )}
            {source === 'pin' && (
                <Sel value={config.comparePin || inputs[0]} onChange={(e: any) => onChange({ comparePin: e.target.value })} className="flex-1">
                    {inputs.map((pin: string) => <option key={pin} value={pin}>{pin.toUpperCase()}</option>)}
                </Sel>
            )}
            {source === 'var' && (
                <Inp type="text" value={config.compareVar || ''} placeholder="var_name"
                    onChange={(e: any) => onChange({ compareVar: e.target.value })}
                    className="flex-1 font-mono text-amber-300" />
            )}
        </div>
    );
};

// Store-to-variable field (optional)
const StoreVarField = ({ config, onChange }: { config: any; onChange: (patch: any) => void }) => (
    <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-white/5 mt-1">
        <Hint>Store result to variable:</Hint>
        <Inp type="text" value={config.storeVar || ''} placeholder="(optional)"
            onChange={(e: any) => onChange({ storeVar: e.target.value || undefined })}
            className="flex-1 font-mono text-amber-300 text-[10px]" />
    </div>
);

export function RulesEditor() {
    const { nodes, editingECUId, setEditingECU, updateNodeData } = useStore();
    const editingECU = nodes.find(n => n.id === editingECUId);

    const [rules, setRules] = useState<any[]>([]);

    useEffect(() => {
        if (editingECU) {
            const data = editingECU.data as any;
            const rawRules = Array.isArray(data.params?.rules) ? data.params.rules : [];
            const pins: string[] = data.params?.inputs || ['in1', 'in2'];
            const outs: string[] = data.params?.outputs || ['out1', 'out2'];
            // Migrate stale pin names: if config.input/output no longer exist in the ECU's pin list, remap to first valid pin
            const migrated = rawRules.map((r: any) => {
                if (!r?.config) return r;
                const c = { ...r.config };
                if (c.input && !pins.includes(c.input) && c.inputSource !== 'var') c.input = pins[0] || c.input;
                if (c.output && !outs.includes(c.output)) c.output = outs[0] || c.output;
                if (c.setInput && !pins.includes(c.setInput)) c.setInput = pins[0] || c.setInput;
                if (c.resetInput && !pins.includes(c.resetInput)) c.resetInput = pins[1] || pins[0] || c.resetInput;
                return { ...r, config: c };
            });
            setRules(migrated);
        }
    }, [editingECUId]);

    if (!editingECUId || !editingECU) return null;

    const ecuData = editingECU.data as any;
    const inputPins: string[] = ecuData?.params?.inputs || ['in1', 'in2'];
    const outputPins: string[] = ecuData?.params?.outputs || ['out1', 'out2'];

    const handleSave = () => {
        updateNodeData(editingECUId, { params: { rules } });
        setEditingECU(null);
    };

    const addRule = (type: LogicBlockType) => {
        const p0 = inputPins[0] || 'in1';
        const p1 = inputPins[1] || inputPins[0] || 'in2';
        const o0 = outputPins[0] || 'out1';
        const defaults: Record<string, any> = {
            COMPARE: { input: p0, op: '>', compareSource: 'value', threshold: 5, output: o0, driveType: 'HIGH_SIDE' },
            TIMER: { input: p0, mode: 'delay_on', delayMs: 1000, output: o0, driveType: 'HIGH_SIDE' },
            LATCH: { setInput: p0, resetInput: p1, output: o0, driveType: 'HIGH_SIDE' },
            MATH: { input: p0, gain: 1.0, offset: 0, min: 0, max: 12, output: o0 },
            CAN_TX: { conditionMode: 'always', input: p0, pgn: 65262, priority: 6, interval: 100, data: [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF], dataMap: [{ byteIndex: 0, source: p0, scale: 255 / 12, offset: 0 }] },
            CAN_RX: { pgn: 65262, output: '', timeoutMs: 2000, driveType: 'HIGH_SIDE', extractMap: [{ byteIndex: 0, varName: 'rx_in1', scale: 12 / 255, offset: 0 }] },
        };
        setRules([...rules, {
            id: Math.random().toString(36).substring(2, 11),
            type,
            config: defaults[type] || {},
        }]);
    };

    const updateRule = (id: string, configPatch: any) => {
        setRules(rules.map(r => {
            if (!r || typeof r !== 'object') return r;
            return r.id === id ? { ...r, config: { ...(r.config || {}), ...configPatch } } : r;
        }));
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r && typeof r === 'object' && r.id !== id));
    };

    const blockIcons: Record<string, any> = {
        COMPARE: <Zap className="text-yellow-400" size={14} />,
        TIMER: <Clock className="text-blue-400" size={14} />,
        LATCH: <ToggleLeft className="text-purple-400" size={14} />,
        MATH: <Calculator className="text-orange-400" size={14} />,
        CAN_TX: <Radio className="text-indigo-400" size={14} />,
        CAN_RX: <Radio className="text-emerald-400 rotate-180" size={14} />,
    };

    const renderRuleBody = (rule: any) => {
        const cfg = rule.config;
        const upd = (patch: any) => updateRule(rule.id, patch);

        // Auto-migrate stale pin references: if stored pin name is no longer valid, fix it silently
        const validInput = (name: string) => inputPins.includes(name) ? name : (inputPins[0] || name);
        const validOutput = (name: string) => outputPins.includes(name) ? name : (outputPins[0] || name);

        switch (rule.type) {
            case 'COMPARE': {
                const inputSource = cfg.inputSource || 'pin';
                const andConditions: any[] = Array.isArray(cfg.andConditions) ? cfg.andConditions : [];

                const updAndCond = (idx: number, patch: any) => {
                    const next = andConditions.map((c, i) => i === idx ? { ...c, ...patch } : c);
                    upd({ andConditions: next });
                };
                const addAndCond = () => {
                    upd({ andConditions: [...andConditions, { input: '', inputSource: 'pin', op: '>', compareSource: 'value', threshold: 5 }] });
                };
                const removeAndCond = (idx: number) => {
                    upd({ andConditions: andConditions.filter((_, i) => i !== idx) });
                };

                return (
                    <>
                        <div className="space-y-1 col-span-2">
                            <Label>IF</Label>
                            <div className="flex gap-1">
                                <Sel value={inputSource} onChange={(e: any) => upd({ inputSource: e.target.value })} className="w-14">
                                    <option value="pin">Pin</option>
                                    <option value="var">Var</option>
                                </Sel>
                                {inputSource === 'pin' ? (
                                    <InputPinSelect value={validInput(cfg.input || inputPins[0])} onChange={v => upd({ input: v })} inputs={inputPins} />
                                ) : (
                                    <Inp type="text" value={cfg.input || ''} placeholder="var_name"
                                        onChange={(e: any) => upd({ input: e.target.value })}
                                        className="flex-1 font-mono text-amber-300" />
                                )}
                                <OpSelect value={cfg.op || '>'} onChange={v => upd({ op: v })} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Compare against</Label>
                            <CompareSourcePicker config={cfg} onChange={upd} inputs={inputPins} />
                        </div>

                        {/* AND conditions */}
                        {andConditions.map((cond, idx) => (
                            <div key={idx} className="col-span-2 bg-slate-900/60 border border-white/5 rounded-lg p-2 space-y-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">AND</span>
                                    <button onClick={() => removeAndCond(idx)}
                                        className="text-slate-600 hover:text-red-400 transition-colors">
                                        <Trash2 size={11} />
                                    </button>
                                </div>
                                <div className="flex gap-1">
                                    <Sel value={cond.inputSource || 'pin'} onChange={(e: any) => updAndCond(idx, { inputSource: e.target.value })} className="w-14">
                                        <option value="pin">Pin</option>
                                        <option value="var">Var</option>
                                    </Sel>
                                    {(cond.inputSource || 'pin') === 'pin' ? (
                                        <InputPinSelect value={validInput(cond.input || inputPins[0])} onChange={v => updAndCond(idx, { input: v })} inputs={inputPins} />
                                    ) : (
                                        <Inp type="text" value={cond.input || ''} placeholder="var_name"
                                            onChange={(e: any) => updAndCond(idx, { input: e.target.value })}
                                            className="flex-1 font-mono text-amber-300" />
                                    )}
                                    <OpSelect value={cond.op || '>'} onChange={v => updAndCond(idx, { op: v })} />
                                </div>
                                <CompareSourcePicker config={cond} onChange={patch => updAndCond(idx, patch)} inputs={inputPins} />
                            </div>
                        ))}

                        <div className="col-span-2">
                            <button onClick={addAndCond}
                                className="flex items-center gap-1 text-[10px] text-emerald-500 hover:text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 rounded px-2 py-1 transition-all">
                                <Plus size={11} /> Add AND condition
                            </button>
                        </div>

                        <div className="space-y-1">
                            <Label>THEN drive</Label>
                            <div className="flex gap-1">
                                <OutputPinSelect value={validOutput(cfg.output || outputPins[0])} onChange={v => upd({ output: v })} outputs={outputPins} />
                                <DriveSelect config={cfg} onChange={upd} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <StoreVarField config={cfg} onChange={upd} />
                        </div>
                    </>
                );
            }

            case 'TIMER':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Mode</Label>
                            <div className="flex gap-1">
                                <Sel value={cfg.mode || 'delay_on'} onChange={(e: any) => upd({ mode: e.target.value })}>
                                    <option value="delay_on">Delay ON</option>
                                    <option value="delay_off">Delay OFF</option>
                                </Sel>
                                <Inp type="number" value={cfg.delayMs || 1000}
                                    onChange={(e: any) => upd({ delayMs: parseInt(e.target.value) })}
                                    className="w-20" />
                                <Hint>ms</Hint>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Trigger input</Label>
                            <InputPinSelect value={validInput(cfg.input || inputPins[0])} onChange={v => upd({ input: v })} inputs={inputPins} />
                        </div>
                        <div className="space-y-1">
                            <Label>Drive output</Label>
                            <div className="flex gap-1">
                                <OutputPinSelect value={validOutput(cfg.output || outputPins[0])} onChange={v => upd({ output: v })} outputs={outputPins} />
                                <DriveSelect config={cfg} onChange={upd} />
                            </div>
                        </div>
                    </>
                );

            case 'LATCH':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>SET when</Label>
                            <div className="flex gap-1">
                                <InputPinSelect value={validInput(cfg.setInput || inputPins[0])} onChange={v => upd({ setInput: v })} inputs={inputPins} />
                                <Hint>&gt;</Hint>
                                <Inp type="number" value={cfg.setThreshold ?? 0.5} step="0.1"
                                    onChange={(e: any) => upd({ setThreshold: parseFloat(e.target.value) })}
                                    className="w-14" />
                                <Hint>V</Hint>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>RESET when</Label>
                            <div className="flex gap-1">
                                <InputPinSelect value={validInput(cfg.resetInput || inputPins[1] || inputPins[0])} onChange={v => upd({ resetInput: v })} inputs={inputPins} />
                                <Hint>&gt;</Hint>
                                <Inp type="number" value={cfg.resetThreshold ?? 0.5} step="0.1"
                                    onChange={(e: any) => upd({ resetThreshold: parseFloat(e.target.value) })}
                                    className="w-14" />
                                <Hint>V</Hint>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>Drive output</Label>
                            <div className="flex gap-1">
                                <OutputPinSelect value={validOutput(cfg.output || outputPins[0])} onChange={v => upd({ output: v })} outputs={outputPins} />
                                <DriveSelect config={cfg} onChange={upd} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <StoreVarField config={cfg} onChange={upd} />
                        </div>
                    </>
                );

            case 'MATH': {
                const mathMode = cfg.mathMode || 'formula';
                // Compute derived gain/offset for preview
                let previewGain: number, previewOffset: number, previewMin: number, previewMax: number;
                if (mathMode === 'rerange') {
                    const inMin = cfg.inMin ?? 0; const inMax = cfg.inMax ?? 12;
                    const outMin = cfg.outMin ?? 0; const outMax = cfg.outMax ?? 5;
                    const span = inMax - inMin;
                    previewGain = span !== 0 ? (outMax - outMin) / span : 1;
                    previewOffset = outMin - previewGain * inMin;
                    previewMin = Math.min(outMin, outMax);
                    previewMax = Math.max(outMin, outMax);
                } else {
                    previewGain = cfg.gain ?? 1; previewOffset = cfg.offset ?? 0;
                    previewMin = cfg.min ?? 0; previewMax = cfg.max ?? 12;
                }
                const previewMid = mathMode === 'rerange'
                    ? ((cfg.inMin ?? 0) + (cfg.inMax ?? 12)) / 2
                    : ((previewMax - previewMin) / 2);
                const previewResult = Math.max(previewMin, Math.min(previewMax, previewMid * previewGain + previewOffset));
                return (
                    <>
                        <div className="space-y-1 col-span-2">
                            <Label>Input source</Label>
                            <div className="flex gap-1">
                                <Sel value={cfg.inputSource || 'pin'} onChange={(e: any) => upd({ inputSource: e.target.value })} className="w-14">
                                    <option value="pin">Pin</option>
                                    <option value="var">Var</option>
                                </Sel>
                                {(cfg.inputSource || 'pin') === 'pin' ? (
                                    <InputPinSelect value={cfg.input || inputPins[0]} onChange={v => upd({ input: v })} inputs={inputPins} />
                                ) : (
                                    <Inp type="text" value={cfg.input || ''} placeholder="var_name"
                                        onChange={(e: any) => upd({ input: e.target.value })}
                                        className="flex-1 font-mono text-amber-300" />
                                )}
                                <Sel value={mathMode} onChange={(e: any) => upd({ mathMode: e.target.value })} className="flex-1">
                                    <option value="formula">Formula (gain + offset)</option>
                                    <option value="rerange">Re-range (map range)</option>
                                </Sel>
                            </div>
                        </div>

                        {mathMode === 'rerange' ? (
                            <>
                                <div className="space-y-1 col-span-2">
                                    <Label>Input range (V)</Label>
                                    <div className="flex gap-1 items-center">
                                        <Inp type="number" value={cfg.inMin ?? 0} step="0.1" placeholder="in min"
                                            onChange={(e: any) => upd({ inMin: parseFloat(e.target.value) })}
                                            className="w-16 text-sky-300" />
                                        <Hint>→</Hint>
                                        <Inp type="number" value={cfg.inMax ?? 12} step="0.1" placeholder="in max"
                                            onChange={(e: any) => upd({ inMax: parseFloat(e.target.value) })}
                                            className="w-16 text-sky-300" />
                                    </div>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Label>Output range (V)</Label>
                                    <div className="flex gap-1 items-center">
                                        <Inp type="number" value={cfg.outMin ?? 0} step="0.1" placeholder="out min"
                                            onChange={(e: any) => upd({ outMin: parseFloat(e.target.value) })}
                                            className="w-16 text-orange-300" />
                                        <Hint>→</Hint>
                                        <Inp type="number" value={cfg.outMax ?? 5} step="0.1" placeholder="out max"
                                            onChange={(e: any) => upd({ outMax: parseFloat(e.target.value) })}
                                            className="w-16 text-orange-300" />
                                    </div>
                                </div>
                                <div className="col-span-2 bg-slate-800/60 rounded px-2 py-1.5 text-[10px] font-mono text-slate-400 border border-slate-700/50">
                                    <span className="text-slate-500">= </span>
                                    <span className="text-orange-300">input × {previewGain.toFixed(4)}</span>
                                    <span className="text-slate-500"> + </span>
                                    <span className="text-orange-300">{previewOffset.toFixed(4)}</span>
                                    <span className="text-slate-500">  clamp [{previewMin}–{previewMax}V]</span>
                                    <div className="mt-0.5 text-slate-500">
                                        e.g. {previewMid.toFixed(1)}V in → <span className="text-green-400">{previewResult.toFixed(2)}V out</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-1">
                                    <Label>input &times; gain + offset</Label>
                                    <div className="flex gap-1 items-center">
                                        <Hint>&times;</Hint>
                                        <Inp type="number" value={cfg.gain ?? 1} step="0.01"
                                            onChange={(e: any) => upd({ gain: parseFloat(e.target.value) })}
                                            className="w-16 text-orange-300" />
                                        <Hint>+</Hint>
                                        <Inp type="number" value={cfg.offset ?? 0} step="0.01"
                                            onChange={(e: any) => upd({ offset: parseFloat(e.target.value) })}
                                            className="w-16 text-orange-300" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label>Clamp</Label>
                                    <div className="flex gap-1 items-center">
                                        <Inp type="number" value={cfg.min ?? 0} step="0.1"
                                            onChange={(e: any) => upd({ min: parseFloat(e.target.value) })}
                                            className="w-16" />
                                        <Hint>to</Hint>
                                        <Inp type="number" value={cfg.max ?? 12} step="0.1"
                                            onChange={(e: any) => upd({ max: parseFloat(e.target.value) })}
                                            className="w-16" />
                                    </div>
                                </div>
                                <div className="col-span-2 bg-slate-800/60 rounded px-2 py-1 text-[10px] font-mono text-slate-500 border border-slate-700/50">
                                    e.g. {previewMid.toFixed(1)}V in → <span className="text-green-400">{previewResult.toFixed(2)}V out</span>
                                </div>
                            </>
                        )}

                        <div className="space-y-1 col-span-2">
                            <Label>Output</Label>
                            <div className="flex gap-1">
                                <OutputPinSelect value={cfg.output || ''} onChange={v => upd({ output: v })} outputs={['', ...outputPins]}
                                    label="Drive" />
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Hint>Store to var:</Hint>
                                <Inp type="text" value={cfg.storeVar || ''} placeholder="var_name"
                                    onChange={(e: any) => upd({ storeVar: e.target.value || undefined })}
                                    className="flex-1 font-mono text-amber-300 text-[10px]" />
                            </div>
                        </div>
                    </>
                );
            }

            case 'CAN_TX':
                return (
                    <>
                        <div className="space-y-1 col-span-2">
                            <Label>Trigger condition</Label>
                            <div className="flex gap-1 flex-wrap">
                                <Sel value={cfg.conditionMode || 'always'} onChange={(e: any) => upd({ conditionMode: e.target.value })}>
                                    <option value="always">Always (periodic)</option>
                                    <option value="simple">Pin Active (&gt; 0.5V)</option>
                                    <option value="compare">Comparison</option>
                                </Sel>
                                {cfg.conditionMode === 'compare' ? (
                                    <>
                                        <InputPinSelect value={cfg.condInput || inputPins[0]} onChange={v => upd({ condInput: v })} inputs={inputPins} />
                                        <OpSelect value={cfg.condOp || '>'} onChange={v => upd({ condOp: v })} />
                                        <CompareSourcePicker
                                            config={{ compareSource: cfg.condCompareSource, threshold: cfg.condThreshold, comparePin: cfg.condComparePin, compareVar: cfg.condCompareVar }}
                                            onChange={patch => {
                                                const mapped: any = {};
                                                if ('compareSource' in patch) mapped.condCompareSource = patch.compareSource;
                                                if ('threshold' in patch) mapped.condThreshold = patch.threshold;
                                                if ('comparePin' in patch) mapped.condComparePin = patch.comparePin;
                                                if ('compareVar' in patch) mapped.condCompareVar = patch.compareVar;
                                                upd(mapped);
                                            }}
                                            inputs={inputPins} />
                                    </>
                                ) : cfg.conditionMode === 'simple' ? (
                                    <InputPinSelect value={cfg.input || inputPins[0]} onChange={v => upd({ input: v })} inputs={inputPins} />
                                ) : null}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label>J1939 PGN</Label>
                            <Inp type="number" value={cfg.pgn || 65262}
                                onChange={(e: any) => upd({ pgn: parseInt(e.target.value) })}
                                className="w-full text-indigo-300 font-mono" />
                        </div>
                        <div className="space-y-1">
                            <Label>Priority / Interval</Label>
                            <div className="flex gap-1">
                                <Inp type="number" value={cfg.priority ?? 6}
                                    onChange={(e: any) => upd({ priority: parseInt(e.target.value) })}
                                    className="w-12 text-slate-400" title="Priority 0-7" />
                                <Inp type="number" value={cfg.interval || 100}
                                    onChange={(e: any) => upd({ interval: parseInt(e.target.value) })}
                                    className="flex-1 text-slate-400" />
                                <Hint>ms</Hint>
                            </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <div className="flex items-center justify-between">
                                <Label>Signals to transmit</Label>
                                <button onClick={() => {
                                    const fm = cfg.floatMap || [];
                                    upd({ floatMap: [...fm, { label: `sig${fm.length + 1}`, source: inputPins[0] }] });
                                }} className="text-[9px] text-indigo-400 hover:text-indigo-300 px-2 py-0.5 border border-indigo-500/20 rounded">+ Add signal</button>
                            </div>
                            {(cfg.floatMap || []).length === 0 && (
                                <p className="text-[9px] text-slate-600 px-1">No signals — add a signal to transmit a pin or variable value to other ECUs.</p>
                            )}
                            {(cfg.floatMap || []).map((m: any, i: number) => (
                                <div key={i} className="flex gap-1 items-center bg-slate-950/60 border border-white/5 rounded px-2 py-1">
                                    <Sel value={m.source || inputPins[0]} onChange={(e: any) => {
                                        const fm = [...(cfg.floatMap || [])];
                                        fm[i] = { ...fm[i], source: e.target.value, varName: undefined };
                                        upd({ floatMap: fm });
                                    }} className="flex-1 text-amber-300 text-[10px]">
                                        {inputPins.map((p: string) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                        <option value="__var__">Variable...</option>
                                    </Sel>
                                    {m.source === '__var__' && (
                                        <Inp type="text" value={m.varName || ''} placeholder="var_name"
                                            onChange={(e: any) => {
                                                const fm = [...(cfg.floatMap || [])];
                                                fm[i] = { ...fm[i], varName: e.target.value };
                                                upd({ floatMap: fm });
                                            }}
                                            className="w-16 font-mono text-amber-300 text-[10px]" />
                                    )}
                                    <span className="text-[9px] text-slate-500">as</span>
                                    <Inp type="text" value={m.label || ''} placeholder="signal_name"
                                        onChange={(e: any) => {
                                            const fm = [...(cfg.floatMap || [])];
                                            fm[i] = { ...fm[i], label: e.target.value };
                                            upd({ floatMap: fm });
                                        }}
                                        className="w-20 font-mono text-emerald-300 text-[10px]" />
                                    <button onClick={() => {
                                        const fm = (cfg.floatMap || []).filter((_: any, j: number) => j !== i);
                                        upd({ floatMap: fm });
                                    }} className="text-slate-600 hover:text-red-400 text-xs ml-auto">&times;</button>
                                </div>
                            ))}
                        </div>
                    </>
                );

            case 'CAN_RX':
                return (
                    <>
                        <div className="space-y-1">
                            <Label>Listen for PGN</Label>
                            <Inp type="number" value={cfg.pgn || 65262}
                                onChange={(e: any) => upd({ pgn: parseInt(e.target.value) })}
                                className="w-full text-emerald-300 font-mono" />
                        </div>
                        <div className="space-y-1">
                            <Label>Timeout / Source filter</Label>
                            <div className="flex gap-1">
                                <Inp type="number" value={cfg.timeoutMs || 2000}
                                    onChange={(e: any) => upd({ timeoutMs: parseInt(e.target.value) })}
                                    title="Timeout ms" className="flex-1 text-slate-400" />
                                <Hint>ms</Hint>
                                <Inp type="text" value={cfg.sourceAddress ?? ''} placeholder="SA (any)"
                                    onChange={(e: any) => {
                                        const v = e.target.value.trim();
                                        upd({ sourceAddress: v === '' ? undefined : parseInt(v) });
                                    }}
                                    className="w-20 text-slate-400 font-mono" title="Source Address filter (blank = any)" />
                            </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <Label>Drive output while receiving (optional)</Label>
                            <div className="flex gap-1">
                                <OutputPinSelect value={cfg.output || ''} onChange={v => upd({ output: v })} outputs={['', ...outputPins]}
                                    label="Drive" />
                                {cfg.output ? <DriveSelect config={cfg} onChange={upd} /> : null}
                            </div>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <div className="flex items-center justify-between">
                                <Label>Receive signals → variables</Label>
                                <button onClick={() => {
                                    const fm = cfg.floatMap || [];
                                    upd({ floatMap: [...fm, { label: `sig${fm.length + 1}`, varName: `rx_sig${fm.length + 1}` }] });
                                }} className="text-[9px] text-emerald-400 hover:text-emerald-300 px-2 py-0.5 border border-emerald-500/20 rounded">+ Add signal</button>
                            </div>
                            {(cfg.floatMap || []).length === 0 && (
                                <p className="text-[9px] text-slate-600 px-1">Add a signal to receive a value transmitted by another ECU's CAN_TX rule.</p>
                            )}
                            {(cfg.floatMap || []).map((m: any, i: number) => (
                                <div key={i} className="flex gap-1 items-center bg-slate-950/60 border border-white/5 rounded px-2 py-1">
                                    <Inp type="text" value={m.label || ''} placeholder="signal_name"
                                        onChange={(e: any) => {
                                            const fm = [...(cfg.floatMap || [])];
                                            fm[i] = { ...fm[i], label: e.target.value };
                                            upd({ floatMap: fm });
                                        }}
                                        className="flex-1 font-mono text-emerald-300 text-[10px]" />
                                    <span className="text-[9px] text-slate-500">&rarr;</span>
                                    <Inp type="text" value={m.varName || ''} placeholder="var_name"
                                        onChange={(e: any) => {
                                            const fm = [...(cfg.floatMap || [])];
                                            fm[i] = { ...fm[i], varName: e.target.value };
                                            upd({ floatMap: fm });
                                        }}
                                        className="flex-1 font-mono text-amber-300 text-[10px]" />
                                    <button onClick={() => {
                                        const fm = (cfg.floatMap || []).filter((_: any, j: number) => j !== i);
                                        upd({ floatMap: fm });
                                    }} className="text-slate-600 hover:text-red-400 text-xs ml-auto">&times;</button>
                                </div>
                            ))}
                        </div>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[700px] animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/50">
                    <div className="flex items-center gap-3 text-indigo-400">
                        <div className="p-2 bg-indigo-500/20 rounded-lg"><Settings size={20} /></div>
                        <div>
                            <h2 className="text-sm font-bold uppercase tracking-widest text-white">ECU Logic Editor</h2>
                            <p className="text-[10px] text-slate-500 font-mono">{ecuData.label} (ID: {editingECUId})</p>
                        </div>
                    </div>
                    <button onClick={() => setEditingECU(null)} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded">
                        <X size={20} />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-3 bg-slate-950 border-b border-white/5 flex gap-2 flex-wrap">
                    <button onClick={() => addRule('COMPARE')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg active:scale-95">
                        <Plus size={12} /> Compare
                    </button>
                    <button onClick={() => addRule('TIMER')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all active:scale-95">
                        <Clock size={12} /> Timer
                    </button>
                    <button onClick={() => addRule('LATCH')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 rounded-lg text-xs font-bold transition-all active:scale-95">
                        <ToggleLeft size={12} /> Latch
                    </button>
                    <button onClick={() => addRule('MATH')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-900/40 hover:bg-orange-900/60 text-orange-300 border border-orange-500/20 rounded-lg text-xs font-bold transition-all active:scale-95">
                        <Calculator size={12} /> Math
                    </button>
                    <button onClick={() => addRule('CAN_TX')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-900/40 hover:bg-blue-900/60 text-blue-300 border border-blue-500/20 rounded-lg text-xs font-bold transition-all active:scale-95">
                        <Radio size={12} /> CAN TX
                    </button>
                    <button onClick={() => addRule('CAN_RX')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-900/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all active:scale-95">
                        <Radio size={12} className="rotate-180" /> CAN RX
                    </button>
                </div>

                {/* Rules List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                    {rules.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-3 border-2 border-dashed border-white/5 rounded-xl">
                            <AlertCircle size={32} />
                            <p className="text-xs uppercase tracking-widest">No Active Rules</p>
                        </div>
                    )}
                    {rules.map((rawRule: any) => {
                        if (!rawRule || typeof rawRule !== 'object') return null;

                        // Migration Layer
                        let rule = rawRule;
                        if (!rule.type && rule.inputPin) {
                            rule = {
                                id: `migrated-${Math.random()}`,
                                type: 'COMPARE',
                                config: {
                                    input: rule.inputPin,
                                    op: rule.condition || '>',
                                    compareSource: 'value',
                                    threshold: rule.threshold ?? 6,
                                    output: rule.outputPin || 'out1',
                                    driveType: 'HIGH_SIDE'
                                }
                            };
                        }
                        if (!rule.config) return null;

                        return (
                            <div key={rule.id} className="group relative bg-slate-800/40 border border-white/5 rounded-xl p-4 hover:border-indigo-500/30 transition-all hover:bg-slate-800/60 shadow-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {blockIcons[rule.type] || <Zap size={14} />}
                                        <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{rule.type} BLOCK</span>
                                    </div>
                                    <button onClick={() => removeRule(rule.id)}
                                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded transition-all opacity-0 group-hover:opacity-100">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {renderRuleBody(rule)}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-slate-900 flex justify-end gap-3">
                    <button onClick={() => setEditingECU(null)}
                        className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
                        <Save size={14} /> Flash ECU
                    </button>
                </div>
            </div>
        </div>
    );
}
