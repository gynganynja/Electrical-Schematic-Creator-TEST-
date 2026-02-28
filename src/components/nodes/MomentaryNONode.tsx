import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import useStore from '../../store/useStore';


/**
 * Momentary NO (Normally Open) Push Button.
 * Momentary = returns to default when released.
 * NO = default is OPEN (no current flow).
 */
export function MomentaryNONode({ id, data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const updateNodeData = useStore(state => state.updateNodeData);
    const isClosed = data?.state?.closed || false;
    const label = data?.label || 'MOM NO';

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateNodeData(id, { state: { closed: !isClosed } });
    };

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-24 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`} >
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>
            <button
                onClick={toggle}
                className="my-2 transition-colors focus:outline-none"
                title={isClosed ? "Release" : "Press"}
            >
                {isClosed
                    ? <ToggleRight size={28} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    : <ToggleLeft size={28} className="text-slate-600" />}
            </button>
            <div className={`text-[9px] font-mono mb-1.5 ${isClosed ? 'text-emerald-400' : 'text-slate-500'}`}>
                {isClosed ? 'PRESSED' : 'OPEN'}
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !bg-slate-400 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
