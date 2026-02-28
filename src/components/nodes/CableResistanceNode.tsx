import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { Cable } from 'lucide-react';


/**
 * Cable Resistance element.
 * Pure resistor parameterized by length (m), gauge (AWG/mm²), and material.
 * Represents voltage drop over long cable runs on heavy equipment.
 */
export function CableResistanceNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const resistance = data?.params?.resistance ?? 0.1;
    const length_m = data?.params?.length_m ?? 10;
    const gauge = data?.params?.gauge ?? '10 AWG';
    const label = data?.label || 'CABLE';

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`} >
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <Cable size={18} className="mt-1 text-orange-400" />
            <div className="my-1 flex flex-col items-center gap-0.5">
                <span className="text-[10px] font-mono text-orange-300">{gauge}</span>
                <span className="text-[10px] font-mono text-slate-400">{length_m}m • {resistance}Ω</span>
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-orange-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
