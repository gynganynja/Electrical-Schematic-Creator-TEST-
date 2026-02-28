import { Position } from '@xyflow/react';
import { Cpu } from 'lucide-react';
import { NodeBody, PinRow } from './NodeBase';
import { mapSideByFlip } from '../../utils/rotation';

export function CANTransceiverNode({ data, selected }: any) {
    const label = data?.label || 'Transceiver';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const vcc = data?.state?.vcc ?? 0;
    const isPowered = vcc > 10;
    const isTransmitting = data?.state?.isTransmitting || false;

    // Determine visual sides for pin containers
    const leftVis = mapSideByFlip(Position.Left, flipX, flipY);
    const mcuSide = leftVis === Position.Left ? 'left-0' : 'right-0';
    const mcuAlign = leftVis === Position.Left ? '' : 'items-end';
    const busSide = leftVis === Position.Left ? 'right-0' : 'left-0';
    const busAlign = leftVis === Position.Left ? 'items-end' : '';

    return (
        <NodeBody flipX={flipX} flipY={flipY} selected={selected} width={180} height={140} className="flex flex-col items-center">
            {/* Pins Container */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute ${mcuSide} top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col ${mcuAlign} space-y-1 min-w-[70px]`}>
                    <PinRow id="vcc" type="target" label="VCC" side={Position.Left} flipX={flipX} flipY={flipY} labelClassName="text-red-500" handleClassName="!bg-red-500" />
                    <PinRow id="gnd" type="target" label="GND" side={Position.Left} flipX={flipX} flipY={flipY} labelClassName="text-green-500" handleClassName="!bg-green-500" />
                    <div className="h-1"></div>
                    <PinRow id="txd" type="target" label="TXD" side={Position.Left} flipX={flipX} flipY={flipY} labelClassName="text-amber-500" handleClassName="!bg-amber-500" />
                    <PinRow id="rxd" type="source" label="RXD" side={Position.Left} flipX={flipX} flipY={flipY} labelClassName="text-emerald-500" handleClassName="!bg-emerald-500" />
                </div>
                <div className={`absolute ${busSide} top-1/2 -translate-y-1/2 pointer-events-auto flex flex-col ${busAlign} space-y-2 min-w-[70px]`}>
                    <PinRow id="can_h" type="source" label="CAN_H" side={Position.Right} flipX={flipX} flipY={flipY} labelClassName="text-indigo-400" handleClassName="!bg-indigo-500" />
                    <PinRow id="can_l" type="source" label="CAN_L" side={Position.Right} flipX={flipX} flipY={flipY} labelClassName="text-indigo-400" handleClassName="!bg-indigo-700" />
                </div>
            </div>

            <div className="p-3 w-full flex flex-col flex-grow relative z-0">
                <div className="flex items-center gap-1.5 mb-2 border-b border-white/10 pb-1">
                    <div >
                        <Cpu size={14} className={isPowered ? "text-blue-400 animate-pulse" : "text-slate-600"} />
                    </div>
                    <div >
                        <span className="text-[10px] font-bold text-slate-200 uppercase whitespace-nowrap">{label}</span>
                    </div>
                    {isPowered && <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_5px_rgba(59,130,246,1)]"></div>}
                </div>

                <div
                    className="flex-grow flex flex-col justify-center items-center gap-2 mt-2"
                    
                >
                    <div className="text-[10px] text-slate-400 font-mono">
                        PWR: <span className={isPowered ? "text-blue-400" : "text-slate-600"}>{vcc.toFixed(1)}V</span>
                    </div>
                    <div className="flex gap-2">
                        <div className={`w-3 h-3 rounded-full ${isPowered ? 'bg-green-500/20 border border-green-500' : 'bg-slate-800'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${isTransmitting ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : (isPowered ? 'bg-amber-500/20 border border-amber-500/50' : 'bg-slate-800')}`}></div>
                    </div>
                </div>
            </div>
        </NodeBody>
    );
}
