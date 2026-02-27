import { Handle, Position } from '@xyflow/react';

export function InductorNode({ data, selected }: any) {
    const inductance = data?.params?.inductance ?? '10mH';
    const label = data?.label || 'L';

    return (
        <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 65, height: 40 }}>
            <svg width="65" height="40" viewBox="0 0 65 40" fill="none">
                <line x1="0" y1="20" x2="10" y2="20" stroke="#475569" strokeWidth="2" />
                <path d="M10,20 C15,5 20,5 22,20 C24,5 29,5 32,20 C34,5 39,5 42,20 C44,5 49,5 52,20"
                    stroke={selected ? '#38bdf8' : '#a78bfa'} strokeWidth="2.5" fill="none" />
                <line x1="52" y1="20" x2="62" y2="20" stroke="#475569" strokeWidth="2" />
            </svg>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-semibold whitespace-nowrap bg-slate-800 text-violet-300 px-1.5 py-0.5 rounded border border-slate-600 shadow-sm">
                {label} {inductance}
            </div>

            <Handle type="target" position={Position.Left} id="in"
                className="!w-3 !h-3 !bg-violet-400 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="out"
                className="!w-3 !h-3 !bg-violet-400 !border-2 !border-white" />
        </div>
    );
}
