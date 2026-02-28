import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';


/**
 * SPDT (Single Pole Double Throw) Changeover Switch.
 * COM routes to either NC or NO position.
 */
export function SPDTSwitchNode({ id, data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const updateNodeData = useStore(state => state.updateNodeData);
    const position = data?.state?.position || 'nc'; // 'nc' or 'no'
    const label = data?.label || 'SPDT';

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateNodeData(id, { state: { position: position === 'nc' ? 'no' : 'nc' } });
    };

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>

            <div className="my-2 relative" style={{ width: 60, height: 40}}>
                <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                    {/* COM terminal dot */}
                    <circle cx="8" cy="20" r="4" fill={selected ? '#38bdf8' : '#94a3b8'} />
                    {/* NC terminal dot */}
                    <circle cx="52" cy="8" r="4" fill={position === 'nc' ? '#34d399' : '#475569'} />
                    {/* NO terminal dot */}
                    <circle cx="52" cy="32" r="4" fill={position === 'no' ? '#34d399' : '#475569'} />
                    {/* Wiper arm */}
                    <line
                        x1="12" y1="20"
                        x2="48" y2={position === 'nc' ? 10 : 30}
                        stroke={position === 'nc' ? '#34d399' : '#f59e0b'}
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="transition-all duration-200"
                    />
                    {/* Labels */}
                    <text x="52" y="5" fontSize="7" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">NC</text>
                    <text x="52" y="42" fontSize="7" fill="#94a3b8" textAnchor="middle" fontFamily="monospace">NO</text>
                </svg>
            </div>

            <button
                onClick={toggle}
                className="text-[9px] font-mono mb-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
            >
                {position === 'nc' ? '→ NC' : '→ NO'}
            </button>

            {/* COM = left input */}
            <MirroredHandle type="source" side={Position.Left} id="com"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            {/* NC = top-right output */}
            <MirroredHandle type="source" side={Position.Right} id="out_nc"
                className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white" style={{ top: '30%' }}  flipX={flipX} flipY={flipY} />
            {/* NO = bottom-right output */}
            <MirroredHandle type="source" side={Position.Right} id="out_no"
                className="!w-3 !h-3 !bg-sky-400 !border-2 !border-white" style={{ top: '70%' }}  flipX={flipX} flipY={flipY} />
        </div>
    );
}
