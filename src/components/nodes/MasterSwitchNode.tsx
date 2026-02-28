import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { Power } from 'lucide-react';
import useStore from '../../store/useStore';


/**
 * Master / Battery Isolator Switch.
 * Big prominent SPST — disconnects entire battery bus.
 */
export function MasterSwitchNode({ id, data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const updateNodeData = useStore(state => state.updateNodeData);
    const isClosed = data?.state?.closed || false;
    const label = data?.label || 'MASTER';

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        updateNodeData(id, { state: { closed: !isClosed } });
    };

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected
            ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
            : isClosed
                ? 'border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
            }`} >
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>

            <button
                onClick={toggle}
                className="my-2 focus:outline-none transition-all"
                title={isClosed ? "Click to DISCONNECT" : "Click to CONNECT"}
            >
                <Power
                    size={32}
                    className={`transition-all ${isClosed
                        ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.8)]'
                        : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]'
                        }`}
                />
            </button>
            <div className={`text-[9px] font-mono font-bold mb-1.5 ${isClosed ? 'text-emerald-400' : 'text-red-400'}`}>
                {isClosed ? 'CONNECTED' : 'ISOLATED'}
            </div>

            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3.5 !h-3.5 !bg-red-500 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3.5 !h-3.5 !bg-red-500 !border-2 !border-white"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
