import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import useStore from '../../store/useStore';


/**
 * DPDT (Double Pole Double Throw) Switch.
 * Two ganged changeovers — both flip together.
 * Used for polarity reversal (window motors), etc.
 */
export function DPDTSwitchNode({ id, data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const updateNodeData = useStore(state => state.updateNodeData);
    const position = data?.state?.position || 'nc'; // 'nc' or 'no'
    const label = data?.label || 'DPDT';

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateNodeData(id, { state: { position: position === 'nc' ? 'no' : 'nc' } });
    };

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-32 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>

            <div className="my-1.5 relative" style={{ width: 72, height: 55}}>
                <svg width="72" height="55" viewBox="0 0 72 55" fill="none">
                    {/* Pole A */}
                    <circle cx="8" cy="14" r="3.5" fill={selected ? '#38bdf8' : '#94a3b8'} />
                    <circle cx="64" cy="5" r="3" fill={position === 'nc' ? '#34d399' : '#475569'} />
                    <circle cx="64" cy="23" r="3" fill={position === 'no' ? '#34d399' : '#475569'} />
                    <line x1="12" y1="14" x2="60" y2={position === 'nc' ? 7 : 21}
                        stroke={position === 'nc' ? '#34d399' : '#f59e0b'} strokeWidth="2" strokeLinecap="round" className="transition-all duration-200" />

                    {/* Divider */}
                    <line x1="4" y1="28" x2="68" y2="28" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />

                    {/* Pole B */}
                    <circle cx="8" cy="41" r="3.5" fill={selected ? '#38bdf8' : '#94a3b8'} />
                    <circle cx="64" cy="32" r="3" fill={position === 'nc' ? '#34d399' : '#475569'} />
                    <circle cx="64" cy="50" r="3" fill={position === 'no' ? '#34d399' : '#475569'} />
                    <line x1="12" y1="41" x2="60" y2={position === 'nc' ? 34 : 48}
                        stroke={position === 'nc' ? '#34d399' : '#f59e0b'} strokeWidth="2" strokeLinecap="round" className="transition-all duration-200" />

                    {/* Ganged link */}
                    <line x1="36" y1="14" x2="36" y2="41" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
            </div>

            <button
                onClick={toggle}
                className="text-[9px] font-mono mb-1.5 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 transition-colors"
            >
                {position === 'nc' ? '→ NC' : '→ NO'}
            </button>

            {/* Pole A handles */}
            <MirroredHandle type="target" side={Position.Left} id="in_a"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" style={{ top: '25%' }}  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out_a_nc"
                className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white" style={{ top: '15%' }}  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out_a_no"
                className="!w-3 !h-3 !bg-sky-400 !border-2 !border-white" style={{ top: '35%' }}  flipX={flipX} flipY={flipY} />

            {/* Pole B handles */}
            <MirroredHandle type="target" side={Position.Left} id="in_b"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" style={{ top: '65%' }}  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out_b_nc"
                className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white" style={{ top: '55%' }}  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out_b_no"
                className="!w-3 !h-3 !bg-sky-400 !border-2 !border-white" style={{ top: '75%' }}  flipX={flipX} flipY={flipY} />
        </div>
    );
}
