import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { BatteryMedium } from 'lucide-react';
import { getRotationPosition } from '../../utils/rotation';

export function BatteryNode({ data, selected }: any) {
    const voltage = data?.params?.voltage ?? 12;
    const rotation = data?.rotation ?? 0;

    const posTerm = getRotationPosition(Position.Top, rotation);
    const negTerm = getRotationPosition(Position.Bottom, rotation);

    return (
        <div className={`bg-slate-900 border-2 rounded-xl shadow-lg w-32 backdrop-blur-sm transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="bg-slate-950/80 text-slate-200 text-xs px-2 py-1.5 rounded-t-xl flex items-center justify-between border-b border-slate-800">
                <span className="font-bold flex items-center gap-1.5 tracking-wide"><BatteryMedium size={14} className="text-emerald-400" /> Battery</span>
            </div>
            <div className="flex flex-col items-center p-2 py-4 relative">
                <div className="text-xl font-bold mb-1 text-slate-100 tracking-wider drop-shadow-sm">{voltage}V</div>

                <Handle type="source" position={posTerm} id="positive"
                    className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" />

                <Handle type="source" position={negTerm} id="negative"
                    className="!w-3 !h-3 !bg-slate-900 !border-2 !border-white" />

                {/* Polarity markers that stay near the handles */}
                <div className="pointer-events-none absolute inset-0 text-[10px] font-bold">
                    {/* These labels would ideally be positioned relative to the handle, but for now simple conditional positioning works */}
                    {posTerm === Position.Top && <div className="absolute top-1 left-1/2 -translate-x-1/2 text-red-500">+</div>}
                    {posTerm === Position.Bottom && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-red-500">+</div>}
                    {posTerm === Position.Left && <div className="absolute left-1 top-1/2 -translate-y-1/2 text-red-500">+</div>}
                    {posTerm === Position.Right && <div className="absolute right-1 top-1/2 -translate-y-1/2 text-red-500">+</div>}

                    {negTerm === Position.Top && <div className="absolute top-1 left-1/2 -translate-x-1/2 text-slate-700">-</div>}
                    {negTerm === Position.Bottom && <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-slate-700">-</div>}
                    {negTerm === Position.Left && <div className="absolute left-1 top-1/2 -translate-y-1/2 text-slate-700">-</div>}
                    {negTerm === Position.Right && <div className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-700">-</div>}
                </div>
            </div>
        </div>
    );
}
