import { MirroredHandle } from './NodeBase';
import { Position } from '@xyflow/react';


/**
 * Wire Splice / Junction node.
 * A small dot where multiple wires can join together.
 * Has 4 handles (top, right, bottom, left) so wires can come from any direction.
 * Each direction has BOTH a source and target handle so wires can connect in either direction.
 */
export function SpliceNode({ data, selected }: any) {
    const flipX = data?.flipX || false;
    const flipY = data?.flipY || false;
    return (            <div
            className={`relative flex items-center justify-center transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : ''}`}
            style={{ width: 16, height: 16}}
        >
            {/* The splice dot */}
            <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${selected ? 'bg-blue-400' : 'bg-slate-400'}`} />

            {/* Top — both source and target */}
            <MirroredHandle type="target" side={Position.Top} id="t"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Top} id="t_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />

            {/* Right — both source and target */}
            <MirroredHandle type="target" side={Position.Right} id="r"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Right} id="r_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />

            {/* Bottom — both source and target */}
            <MirroredHandle type="target" side={Position.Bottom} id="b"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Bottom} id="b_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />

            {/* Left — both source and target */}
            <MirroredHandle type="target" side={Position.Left} id="l"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />
            <MirroredHandle type="source" side={Position.Left} id="l_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0"  flipX={flipX} flipY={flipY} />
        </div>
    );
}
