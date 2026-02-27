import { Handle, Position } from '@xyflow/react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import useStore from '../../store/useStore';

/**
 * Momentary NC (Normally Closed) Push Button.
 * Momentary = returns to default when released.
 * NC = default is CLOSED (current flows).
 */
export function MomentaryNCNode({ id, data, selected }: any) {
    const updateNodeData = useStore(state => state.updateNodeData);
    const isOpen = data?.state?.open || false;
    const label = data?.label || 'MOM NC';

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateNodeData(id, { state: { open: !isOpen } });
    };

    return (
        <div className={`bg-slate-900 border-2 rounded-lg w-24 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`}>
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <button
                onClick={toggle}
                className="my-2 transition-colors focus:outline-none"
                title={isOpen ? "Release" : "Press"}
            >
                {isOpen
                    ? <ToggleLeft size={28} className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                    : <ToggleRight size={28} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
            </button>
            <div className={`text-[9px] font-mono mb-1.5 ${isOpen ? 'text-red-400' : 'text-emerald-400'}`}>
                {isOpen ? 'PRESSED' : 'CLOSED'}
            </div>

            <Handle type="target" position={Position.Left} id="in"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
            <Handle type="source" position={Position.Right} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white" />
        </div>
    );
}
