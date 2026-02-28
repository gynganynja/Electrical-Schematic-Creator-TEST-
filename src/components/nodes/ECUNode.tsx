import { PinRow, NodeBody } from './NodeBase';
import { Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';
import { mapSideByFlip } from '../../utils/rotation';

/**
 * ECU Module — Programmable controller with dynamic I/O count.
 */
export function ECUNode({ data, selected }: any) {
    const label = data?.label || 'ECU';
    const numInputs = Math.min(Math.max(data?.params?.numInputs ?? 4, 1), 8);
    const numOutputs = Math.min(Math.max(data?.params?.numOutputs ?? 4, 1), 8);
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    const maxPins = Math.max(numInputs, numOutputs);
    const pinSpacing = 28;
    const width = 180;
    const height = 60 + maxPins * pinSpacing;

    // Build logical pin definitions
    const pins = [
        { id: 'vcc', label: 'VCC', side: Position.Top, type: 'target' as const, color: 'text-red-500', handleColor: '!bg-red-500', yOffset: '30%' },
        { id: 'gnd', label: 'GND', side: Position.Top, type: 'target' as const, color: 'text-green-500', handleColor: '!bg-green-500', yOffset: '70%' },
        ...Array.from({ length: numInputs }, (_, i) => ({
            id: `in${i + 1}`, label: `IN${i + 1}`, side: Position.Left, type: 'source' as const, color: 'text-emerald-400', handleColor: '!bg-emerald-400',
            yOffset: `${(i + 0.5) * pinSpacing + 40}px`
        })),
        ...Array.from({ length: numOutputs }, (_, i) => ({
            id: `out${i + 1}`, label: `OUT${i + 1}`, side: Position.Right, type: 'source' as const, color: 'text-amber-400', handleColor: '!bg-amber-400',
            yOffset: `${(i + 0.5) * pinSpacing + 40}px`
        }))
    ];

    // Partition into visual bins
    const leftPins = pins.filter(p => mapSideByFlip(p.side, flipX, flipY) === Position.Left);
    const rightPins = pins.filter(p => mapSideByFlip(p.side, flipX, flipY) === Position.Right);
    const topPins = pins.filter(p => mapSideByFlip(p.side, flipX, flipY) === Position.Top);
    const bottomPins = pins.filter(p => mapSideByFlip(p.side, flipX, flipY) === Position.Bottom);

    return (
        <NodeBody selected={selected} width={width} height={height}>
            {/* Edge Containers */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Horizontal Sides */}
                <div className="absolute left-0 inset-y-0 w-full pointer-events-none">
                    {leftPins.map(p => (
                        <div key={p.id} className="absolute left-0 w-24" style={{ top: p.yOffset }}>
                            <PinRow id={p.id} type={p.type} label={p.label} side={p.side} flipX={flipX} flipY={flipY} labelClassName={p.color} handleClassName={p.handleColor} />
                        </div>
                    ))}
                    {rightPins.map(p => (
                        <div key={p.id} className="absolute right-0 w-24" style={{ top: p.yOffset }}>
                            <PinRow id={p.id} type={p.type} label={p.label} side={p.side} flipX={flipX} flipY={flipY} labelClassName={p.color} handleClassName={p.handleColor} />
                        </div>
                    ))}
                </div>

                {/* Top Bin */}
                <div className="absolute top-0 inset-x-0 h-8 flex justify-around pointer-events-auto">
                    {topPins.map(p => (
                        <PinRow key={p.id} id={p.id} type={p.type} label={p.label} side={p.side} flipX={flipX} flipY={flipY} labelClassName={p.color} handleClassName={p.handleColor} className="!w-12 !flex-col !px-0" />
                    ))}
                </div>

                {/* Bottom Bin */}
                <div className="absolute bottom-0 inset-x-0 h-8 flex justify-around pointer-events-auto">
                    {bottomPins.map(p => (
                        <PinRow key={p.id} id={p.id} type={p.type} label={p.label} side={p.side} flipX={flipX} flipY={flipY} labelClassName={p.color} handleClassName={p.handleColor} className="!w-12 !flex-col-reverse !px-0" />
                    ))}
                </div>
            </div>

            {/* Core Box */}
            <div className="flex flex-col items-center pt-8 pb-4 h-full">
                <div className="flex items-center gap-1.5 text-indigo-300 mb-2">
                    <Cpu size={16} />
                    <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
                </div>
                <div className="w-1/2 h-px bg-white/10 mb-4" />
                <div className="flex-grow flex items-center justify-center opacity-20">
                    <Cpu size={48} className="text-slate-700" />
                </div>
                <div className="text-[8px] font-mono text-slate-500 uppercase tracking-tighter">
                    {numInputs}I / {numOutputs}O
                </div>
            </div>
        </NodeBody>
    );
}
