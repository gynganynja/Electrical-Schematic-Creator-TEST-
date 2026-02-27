import {
    BaseEdge,
    EdgeLabelRenderer,
    getSmoothStepPath,
    useStore as useReactFlowStore,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

// Standard automotive wire colors
const WIRE_COLORS: Record<string, string> = {
    'Red': '#ef4444',
    'Black': '#1e1e1e',
    'White': '#f1f5f9',
    'Blue': '#3b82f6',
    'Green': '#22c55e',
    'Yellow': '#eab308',
    'Orange': '#f97316',
    'Purple': '#a855f7',
    'Pink': '#ec4899',
    'Brown': '#92400e',
    'Grey': '#6b7280',
    'Light Blue': '#7dd3fc',
    'Light Green': '#86efac',
    'Tan': '#d2b48c',
};

/**
 * Custom wire edge with:
 * - Orthogonal (right-angle) step routing
 * - Wire color rendering
 * - Gauge label display
 * - Smart offset for parallel wires
 */
export function WireEdge(props: EdgeProps) {
    const {
        id,
        source,
        target,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        style,
        markerEnd,
        data,
        selected,
    } = props;

    // Get all edges to compute a unique offset for edges sharing nodes
    const edges = useReactFlowStore((s) => s.edges);

    let siblingIndex = 0;
    let siblingCount = 0;
    for (const e of edges) {
        const other = e as any;
        const sharesSrc = other.source === source;
        const sharesTgt = other.target === target;
        const sameRoute = sharesSrc && sharesTgt;
        const related = sharesSrc || sharesTgt;

        if (related) {
            siblingCount++;
            if (other.id === id) {
                siblingIndex = siblingCount - 1;
            }
        }
        if (sameRoute && other.id !== id) {
            siblingIndex += 2;
        }
    }

    const offset = 20 + siblingIndex * 15;

    const [edgePath, labelX, labelY] = getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
        offset,
    });

    const edgeData = data as any;
    const wireColor = edgeData?.wireColor
        ? (WIRE_COLORS[edgeData.wireColor] || edgeData.wireColor)
        : '#475569';
    const gaugeAwg = edgeData?.gaugeAwg || '';
    const gaugeMm2 = edgeData?.gaugeMm2 || '';
    const gaugeLabel = gaugeAwg ? `${gaugeAwg} AWG` : gaugeMm2 ? `${gaugeMm2}mm²` : '';

    return (
        <>
            <BaseEdge
                path={edgePath}
                markerEnd={markerEnd}
                style={{
                    strokeWidth: selected ? 3 : 2,
                    stroke: wireColor,
                    filter: selected ? 'drop-shadow(0 0 4px rgba(59,130,246,0.8))' : undefined,
                    cursor: 'pointer',
                    ...style,
                }}
            />
            {/* Gauge label or Voltage display on wire */}
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        alignItems: 'center',
                    }}
                >
                    {gaugeLabel && (
                        <div className="text-[8px] font-mono px-1 py-0.5 rounded bg-slate-900/80 border border-slate-700/50 text-slate-400">
                            {gaugeLabel}
                        </div>
                    )}
                    {edgeData?.voltage !== undefined && Math.abs(edgeData.voltage) > 0.01 && (
                        <div className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-blue-500/90 text-white shadow-sm ring-1 ring-blue-400/50">
                            {edgeData.voltage.toFixed(1)}V
                        </div>
                    )}
                </div>
            </EdgeLabelRenderer>
        </>
    );
}

export { WIRE_COLORS };
