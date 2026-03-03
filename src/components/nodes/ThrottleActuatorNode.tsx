import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { Wind } from 'lucide-react';

export function ThrottleActuatorNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const resistance = data?.params?.resistance ?? 2.5;
    const label = data?.label || 'THROTTLE';
    const isActivated = data?.state?.activated || false;
    const position = data?.state?.position ?? 0; // 0-100%

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]' : isActivated ? 'border-sky-700' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-sky-400 tracking-wider">{label}</div>

            {/* Throttle body visual */}
            <div className="my-1.5 flex flex-col items-center gap-0.5 relative">
                <Wind size={16} className={isActivated ? 'text-sky-300 drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]' : 'text-slate-500'} />
                <svg width="40" height="20" viewBox="0 0 40 20">
                    {/* Bore outline */}
                    <ellipse cx="20" cy="10" rx="18" ry="8" fill="none" stroke="#475569" strokeWidth="1.5" />
                    {/* Throttle plate rotates with position */}
                    <line
                        x1={20 - 16 * Math.cos((position / 100) * Math.PI / 2)}
                        y1={10 - 7 * Math.sin((position / 100) * Math.PI / 2)}
                        x2={20 + 16 * Math.cos((position / 100) * Math.PI / 2)}
                        y2={10 + 7 * Math.sin((position / 100) * Math.PI / 2)}
                        stroke={isActivated ? '#38bdf8' : '#64748b'} strokeWidth="2" strokeLinecap="round"
                    />
                </svg>
            </div>

            <div className={`text-[9px] font-mono mb-1.5 ${isActivated ? 'text-sky-400' : 'text-slate-500'}`}>
                {isActivated ? `${position.toFixed(0)}% open` : `${resistance}Ω`}
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-sky-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" flipX={flipX} flipY={flipY} />
        </div>
    );
}
