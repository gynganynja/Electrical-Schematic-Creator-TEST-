import { Handle, Position } from '@xyflow/react';
import { Plug } from 'lucide-react';

export function ConnectorNode({ data, selected }: any) {
    const label = data?.label || 'CONN';
    const numPins = data?.params?.numPins ?? 4;
    const pins = Math.min(numPins, 8);

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-24 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-600 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider flex items-center gap-1">
                <Plug size={12} /> {label}
            </div>
            <div className="my-1.5 flex flex-col items-center gap-0.5">
                {Array.from({ length: pins }, (_, i) => (
                    <div key={i} className="text-[8px] font-mono text-slate-500">Pin {i + 1}</div>
                ))}
            </div>

            {/* Inputs on left, outputs on right */}
            {Array.from({ length: pins }, (_, i) => (
                <Handle key={`in${i}`} type="target" position={Position.Left} id={`in${i + 1}`}
                    className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
                    style={{ top: `${(i + 1) / (pins + 1) * 100}%` }} />
            ))}
            {Array.from({ length: pins }, (_, i) => (
                <Handle key={`out${i}`} type="source" position={Position.Right} id={`out${i + 1}`}
                    className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-white"
                    style={{ top: `${(i + 1) / (pins + 1) * 100}%` }} />
            ))}
        </div>
    );
}
