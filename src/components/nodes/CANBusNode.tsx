import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';

import { Network } from 'lucide-react';

export function CANBusNode({ data, selected }: any) {
    const label = data?.label || 'CAN Bus';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const bitrate = data?.params?.bitrate ?? 500000;
    const mode = data?.params?.mode ?? 'HS-CAN';
    const isHealthy = data?.state?.isHealthy ?? false;

    return (            <div className={`bg-slate-900 border-2 rounded-lg p-3 w-48 shadow-xl transition-all ${selected ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'border-slate-800 hover:border-slate-700'}`} >
            <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-1">
                <Network size={16} className={isHealthy ? "text-indigo-400 animate-pulse" : "text-slate-600"} />
                <span className="text-xs font-bold text-slate-100 uppercase tracking-tighter">{label}</span>
                {isHealthy && <div className="ml-auto w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,1)]"></div>}
            </div>

            <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Mode:</span>
                    <span className="text-indigo-300 font-mono">{mode}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Bitrate:</span>
                    <span className="text-indigo-300 font-mono">{(bitrate / 1000).toFixed(0)}k</span>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-950 p-1 rounded border border-white/5">
                    <div className="text-[8px] text-slate-500 uppercase">CAN_H</div>
                </div>
                <div className="bg-slate-950 p-1 rounded border border-white/5">
                    <div className="text-[8px] text-slate-500 uppercase">CAN_L</div>
                </div>
            </div>

            {/* Physical bus attachment points (Left) */}
            <MirroredHandle type="target" side={Position.Left} id="can_h_l" style={{ top: '30%' }} className="!bg-indigo-500" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="target" side={Position.Left} id="can_l_l" style={{ top: '70%' }} className="!bg-indigo-700" flipX={flipX} flipY={flipY} />

            {/* Physical bus attachment points (Right) */}
            <MirroredHandle type="source" side={Position.Right} id="can_h_r" style={{ top: '30%' }} className="!bg-indigo-500" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="can_l_r" style={{ top: '70%' }} className="!bg-indigo-700" flipX={flipX} flipY={flipY} />
        </div>
    );
}
