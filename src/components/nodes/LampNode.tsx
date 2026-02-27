import { Handle, Position } from '@xyflow/react';
import { Lightbulb } from 'lucide-react';
import { getRotationPosition } from '../../utils/rotation';

export function LampNode({ data, selected }: any) {
    const isOn = data?.state?.on || false;
    const label = data?.label || 'Lamp';
    const rotation = data?.rotation ?? 0;

    return (
        <div className={`bg-slate-900 border-2 rounded-full w-16 h-16 flex items-center justify-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'} ${isOn ? 'bg-yellow-500/20 border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.6)]' : ''}`}>
            <Lightbulb size={28} className={`transition-colors ${isOn ? 'text-yellow-300 fill-yellow-200 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]' : 'text-slate-500'}`} />

            <div className="absolute -bottom-6 text-xs font-semibold whitespace-nowrap bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label}
            </div>

            <Handle type="target" position={getRotationPosition(Position.Left, rotation)} id="in"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
            <Handle type="source" position={getRotationPosition(Position.Right, rotation)} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
        </div>
    );
}
