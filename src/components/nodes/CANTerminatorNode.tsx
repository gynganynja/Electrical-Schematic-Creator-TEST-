import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


export function CANTerminatorNode({ data, selected }: any) {
    const label = data?.label || 'Terminator';
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;

    return (            <div className={`bg-slate-900 border-2 rounded-md p-2 w-16 h-24 flex flex-col items-center justify-center shadow-lg transition-all ${selected ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'border-slate-800 hover:border-slate-700'}`} >
            <div className="text-[8px] font-bold text-slate-500 mb-2 uppercase rotate-90">{label}</div>
            <div className="w-8 h-12 bg-slate-800 rounded border border-white/10 flex flex-col items-center justify-around py-1">
                <div className="w-4 h-0.5 bg-slate-600"></div>
                <div className="text-[7px] text-slate-400 font-mono">120Ω</div>
                <div className="w-4 h-0.5 bg-slate-600"></div>
            </div>

            <MirroredHandle type="target" side={Position.Top} id="can_h" className="!bg-indigo-500" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="target" side={Position.Bottom} id="can_l" className="!bg-indigo-700" flipX={flipX} flipY={flipY} />
        </div>
    );
}
