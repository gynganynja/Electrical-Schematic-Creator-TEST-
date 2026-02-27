import { Handle, Position } from '@xyflow/react';

/**
 * Wire Splice / Junction node.
 * A small dot where multiple wires can join together.
 * Has 4 handles (top, right, bottom, left) so wires can come from any direction.
 * Each direction has BOTH a source and target handle so wires can connect in either direction.
 */
export function SpliceNode({ selected }: any) {
    return (
        <div
            className={`relative flex items-center justify-center transition-all ${selected ? 'drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]' : ''}`}
            style={{ width: 16, height: 16 }}
        >
            {/* The splice dot */}
            <div className={`w-3.5 h-3.5 rounded-full shadow-inner ${selected ? 'bg-blue-400' : 'bg-slate-400'}`} />

            {/* Top — both source and target */}
            <Handle type="target" position={Position.Top} id="t"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />
            <Handle type="source" position={Position.Top} id="t_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />

            {/* Right — both source and target */}
            <Handle type="target" position={Position.Right} id="r"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />
            <Handle type="source" position={Position.Right} id="r_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />

            {/* Bottom — both source and target */}
            <Handle type="target" position={Position.Bottom} id="b"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />
            <Handle type="source" position={Position.Bottom} id="b_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />

            {/* Left — both source and target */}
            <Handle type="target" position={Position.Left} id="l"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />
            <Handle type="source" position={Position.Left} id="l_out"
                className="!w-3 !h-3 !bg-transparent !border-0 !min-w-0 !min-h-0" />
        </div>
    );
}
