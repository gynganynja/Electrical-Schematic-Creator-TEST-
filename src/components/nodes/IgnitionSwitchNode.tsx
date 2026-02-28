import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';
import { Key } from 'lucide-react';
import useStore from '../../store/useStore';


/**
 * Multi-position Ignition Switch.
 * Positions: OFF → ACC → ON → START
 * Each position connects BATT to different output combinations.
 */
export function IgnitionSwitchNode({ id, data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const updateNodeData = useStore(state => state.updateNodeData);
    const position = data?.state?.position || 'off'; // 'off' | 'acc' | 'on' | 'start'
    const label = data?.label || 'IGN SW';

    const positions = ['off', 'acc', 'on', 'start'] as const;
    const posIndex = positions.indexOf(position as any);

    const nextPos = (e: React.MouseEvent) => {
        e.stopPropagation();
        const next = positions[(posIndex + 1) % positions.length];
        updateNodeData(id, { state: { position: next } });
    };

    const posColors: Record<string, string> = {
        off: 'text-slate-500',
        acc: 'text-amber-400',
        on: 'text-emerald-400',
        start: 'text-red-400',
    };

    const posGlows: Record<string, string> = {
        off: '',
        acc: 'drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]',
        on: 'drop-shadow-[0_0_6px_rgba(52,211,153,0.6)]',
        start: 'drop-shadow-[0_0_6px_rgba(248,113,113,0.8)]',
    };

    return (            <div className={`bg-slate-900 border-2 rounded-lg w-28 flex flex-col items-center shadow-lg relative transition-all ${selected ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'border-slate-700 hover:border-slate-500'}`} >
            <div className="text-[10px] font-bold mt-1.5 text-slate-400 tracking-wider">{label}</div>

            <button
                onClick={nextPos}
                className="my-2 flex flex-col items-center gap-1 focus:outline-none"
                title="Click to rotate position"
            >
                <Key size={22} className={`${posColors[position]} ${posGlows[position]} transition-all`} />
                <span className={`text-xs font-bold font-mono ${posColors[position]}`}>
                    {position.toUpperCase()}
                </span>
            </button>

            {/* Position indicator dots */}
            <div className="flex gap-1.5 mb-2">
                {positions.map((p) => (
                    <div
                        key={p}
                        className={`w-2 h-2 rounded-full transition-all ${p === position
                            ? `${p === 'off' ? 'bg-slate-400' : p === 'acc' ? 'bg-amber-400' : p === 'on' ? 'bg-emerald-400' : 'bg-red-400'} shadow-[0_0_6px_currentColor]`
                            : 'bg-slate-700'}`}
                        title={p.toUpperCase()}
                    />
                ))}
            </div>

            {/* BATT input */}
            <MirroredHandle type="target" side={Position.Left} id="batt"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white" style={{ top: '50%' }}  flipX={flipX} flipY={flipY} />
            {/* ACC output */}
            <MirroredHandle type="source" side={Position.Right} id="acc"
                className="!w-3 !h-3 !bg-amber-400 !border-2 !border-white" style={{ top: '25%' }}  flipX={flipX} flipY={flipY} />
            {/* IGN output */}
            <MirroredHandle type="source" side={Position.Right} id="ign"
                className="!w-3 !h-3 !bg-emerald-400 !border-2 !border-white" style={{ top: '50%' }}  flipX={flipX} flipY={flipY} />
            {/* START output */}
            <MirroredHandle type="source" side={Position.Right} id="start"
                className="!w-3 !h-3 !bg-red-400 !border-2 !border-white" style={{ top: '75%' }}  flipX={flipX} flipY={flipY} />
        </div>
    );
}
