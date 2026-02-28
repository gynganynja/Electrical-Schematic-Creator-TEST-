import { PinRow, NodeBody } from './NodeBase';
import { Position } from '@xyflow/react';
import { Cpu, Network, Edit3, ShieldCheck } from 'lucide-react';
import useStore from '../../store/useStore';
import { mapSideByFlip } from '../../utils/rotation';

export function AdvancedECUNode({ id, data, selected }: any) {
    const { setEditingECU } = useStore();
    const label = data?.label || 'Adv ECU';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const canMode = data?.params?.canMode ?? 'J1939';
    const sourceAddress = data?.params?.sourceAddress ?? 0x00;

    const isPowered = (data?.state?.vcc ?? 0) > 10;
    const inputs = Array.isArray(data?.params?.inputs) ? data.params.inputs : ['in1', 'in2'];
    const outputs = Array.isArray(data?.params?.outputs) ? data.params.outputs : ['out1', 'out2'];

    // Define all pins with their LOGICAL (default) sides
    const pinDefs = [
        { id: 'vcc', type: 'target' as const, label: 'VCC', side: Position.Left, className: 'text-red-500', handleClass: '!bg-red-500' },
        { id: 'gnd', type: 'target' as const, label: 'GND', side: Position.Left, className: 'text-green-500', handleClass: '!bg-green-500' },
        { id: 'txd', type: 'source' as const, label: 'TXD', side: Position.Left, className: 'text-amber-500', handleClass: '!bg-amber-500' },
        { id: 'rxd', type: 'target' as const, label: 'RXD', side: Position.Left, className: 'text-emerald-500', handleClass: '!bg-emerald-500' },
        ...inputs.map((p: string) => ({ id: p, type: 'source' as const, label: p, side: Position.Right, className: 'text-blue-400', handleClass: '!bg-blue-400' })),
        ...outputs.map((p: string) => ({ id: p, type: 'source' as const, label: p, side: Position.Right, className: 'text-amber-300', handleClass: '!bg-amber-300' }))
    ];

    // Filter pins by their MAPPED PHYSICAL side
    const leftPins = pinDefs.filter(p => mapSideByFlip(p.side, flipX, flipY) === Position.Left);
    const rightPins = pinDefs.filter(p => mapSideByFlip(p.side, flipX, flipY) === Position.Right);

    return (
        <NodeBody flipX={flipX} flipY={flipY} selected={selected} width={280} height={340}>
            {/* Edge Pin Containers */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Visual Left Container */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col space-y-2 pointer-events-auto min-w-[80px]">
                    {leftPins.map(p => (
                        <PinRow
                            key={p.id} id={p.id} type={p.type} label={p.label} side={p.side}
                            flipX={flipX} flipY={flipY}
                            labelClassName={p.className} handleClassName={p.handleClass}
                        />
                    ))}
                </div>

                {/* Visual Right Container */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col space-y-2 pointer-events-auto items-end min-w-[80px]">
                    {rightPins.map(p => (
                        <PinRow
                            key={p.id} id={p.id} type={p.type} label={p.label} side={p.side}
                            flipX={flipX} flipY={flipY}
                            labelClassName={p.className} handleClassName={p.handleClass}
                        />
                    ))}
                </div>
            </div>

            {/* Padded Content (Center) */}
            <div className="p-5 h-full flex flex-col relative z-0">
                <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-3">
                    <Cpu size={20} className={isPowered ? "text-indigo-400" : "text-slate-600"} />
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-100 uppercase tracking-tight">{label}</span>
                        <span className="text-[8px] text-slate-500 uppercase font-mono">AD-ECU-REV4</span>
                    </div>
                </div>

                <div className="space-y-3 flex-grow">
                    <div className={`bg-slate-950/40 p-2.5 rounded-lg border border-white/5 space-y-1`}>
                        <div className="flex items-center gap-1.5 text-indigo-400/80">
                            <Network size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">{canMode}</span>
                            <span className="ml-auto text-[8px] font-mono text-slate-500">SA: 0x{sourceAddress.toString(16).toUpperCase().padStart(2, '0')}</span>
                        </div>
                    </div>

                    {/* Live I/O Voltage Panel */}
                    {isPowered && (
                        <div className="bg-slate-950/60 rounded-lg border border-white/5 overflow-hidden">
                            <div className="px-2 py-1 border-b border-white/5 flex items-center gap-1">
                                <ShieldCheck size={10} className="text-emerald-400" />
                                <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400/70">Live I/O</span>
                            </div>
                            <div className="grid grid-cols-2 gap-x-2 p-1.5">
                                {inputs.map((pin: string) => {
                                    const v = (data?.state?.inputVoltages ?? {})[pin];
                                    return (
                                        <div key={pin} className="flex items-center justify-between px-1 py-0.5 rounded hover:bg-white/5">
                                            <span className="text-[8px] font-mono text-blue-400">{pin.toUpperCase()}</span>
                                            <span className="text-[8px] font-mono text-slate-200 tabular-nums">
                                                {v !== undefined ? `${v.toFixed(2)}V` : '—'}
                                            </span>
                                        </div>
                                    );
                                })}
                                {outputs.map((pin: string) => {
                                    const v = (data?.state?.outputVoltages ?? {})[pin];
                                    return (
                                        <div key={pin} className="flex items-center justify-between px-1 py-0.5 rounded hover:bg-white/5">
                                            <span className="text-[8px] font-mono text-amber-300">{pin.toUpperCase()}</span>
                                            <span className="text-[8px] font-mono text-slate-200 tabular-nums">
                                                {v !== undefined ? `${v.toFixed(2)}V` : '—'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-auto pt-4 relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditingECU(id); }}
                        className="w-full bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 py-2 rounded-lg flex items-center justify-center gap-2 transition-all relative z-20 pointer-events-auto"
                    >
                        <Edit3 size={12} className="text-indigo-400" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-300">Open Rules</span>
                    </button>
                </div>
            </div>
        </NodeBody >
    );
}
