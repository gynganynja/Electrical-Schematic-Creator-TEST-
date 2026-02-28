import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * Net Label node — electrically connects all net labels with the same name.
 * Used for cleaner schematics instead of long wires.
 * Has both source and target handles so it can connect in either direction.
 */
export function NetLabelNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    const label = data?.label || 'NET';
    const color = data?.params?.color ?? '#38bdf8';

    return (            <div className={`relative transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.7)]' : ''}`}
            style={{ width: 80, height: 30}}>
            <svg width="80" height="30" viewBox="0 0 80 30" fill="none">
                <polygon points="0,15 10,0 80,0 80,30 10,30" fill="#0f172a" stroke={selected ? '#38bdf8' : color} strokeWidth="2" />
                <text x="45" y="19" fontSize="11" fontWeight="bold" fill={color} textAnchor="middle" fontFamily="monospace">{label}</text>
            </svg>

            {/* Left handle: target (accepts incoming) */}
            <MirroredHandle type="target" side={Position.Left} id="in"
                className="!w-3 !h-3 !border-2 !border-white" style={{ background: color }}  flipX={flipX} flipY={flipY} />
            {/* Right handle: source (connects outgoing to other targets like ECU inputs) */}
            <MirroredHandle type="source" side={Position.Right} id="out"
                className="!w-3 !h-3 !border-2 !border-white" style={{ background: color }}  flipX={flipX} flipY={flipY} />
        </div>
    );
}
