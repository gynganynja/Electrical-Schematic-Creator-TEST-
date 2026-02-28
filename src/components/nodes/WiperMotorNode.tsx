import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


export function WiperMotorNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const label = data?.label || 'WIPER';
    const isRunning = data?.state?.running || false;
    const parkClosed = data?.state?.parkClosed ?? true;
    const pos = data?.state?.pos ?? 0; // 0-359

    // Convert circular position to a swing angle (-45 to 45 degrees)
    // Using sine to make it look like a reciprocating linkage
    const swingAngle = Math.sin((pos * Math.PI) / 180) * 45;

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider font-mono uppercase">{label}</div>

            <div className="my-2 relative flex items-center justify-center" style={{ width: 80, height: 45 }}>
                <svg width="80" height="45" viewBox="0 0 80 45" fill="none" className="overflow-visible">
                    {/* Wiper Arm Base */}
                    <circle cx="40" cy="40" r="3" fill="#475569" />

                    {/* Wiper Arm (Swinging) */}
                    <g style={{ transform: `rotate(${swingAngle}deg)`, transformOrigin: '40px 40px' }} className="transition-transform duration-100 ease-linear">
                        <line x1="40" y1="40" x2="40" y2="10" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
                        <line x1="40" y1="10" x2="60" y2="5" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Motor circle */}
                    <circle cx="15" cy="30" r="10" fill="#0f172a" stroke={isRunning ? '#38bdf8' : '#475569'} strokeWidth="1.5" />
                    <text x="15" y="33" fontSize="8" fontWeight="bold" fill={isRunning ? '#38bdf8' : '#64748b'} textAnchor="middle" fontFamily="sans-serif">M</text>

                    {/* Rotating shaft indicator */}
                    <line
                        x1="15" y1="30"
                        x2={15 + Math.cos((pos * Math.PI) / 180) * 7}
                        y2={30 + Math.sin((pos * Math.PI) / 180) * 7}
                        stroke={isRunning ? '#38bdf8' : '#64748b'}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />

                    {/* Park switch indicator */}
                    <rect x="62" y="25" width="10" height="10" rx="2"
                        fill={parkClosed ? '#065f46' : '#1e293b'}
                        stroke={parkClosed ? '#059669' : '#475569'}
                        strokeWidth="1"
                    />
                    <text x="67" y="32" fontSize="6" fontWeight="bold" fill={parkClosed ? '#34d399' : '#64748b'} textAnchor="middle">P</text>
                </svg>
            </div>

            <div className={`text-[9px] font-mono mb-1.5 px-2 py-0.5 rounded ${isRunning ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                {isRunning ? 'RUNNING' : pos === 0 ? 'PARKED' : 'STOPPED'}
            </div>

            {/* Motor power */}
            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-sky-400 !border-2 !border-white" style={{ top: '40%' }}  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Left} id="out"
                className="!w-3 !h-3 !bg-sky-400 !border-2 !border-white" style={{ top: '60%' }}  flipX={flipX} flipY={flipY} />
            {/* Park switch */}
            <MirroredHandle type="target" side={Position.Right} id="park"
                className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
