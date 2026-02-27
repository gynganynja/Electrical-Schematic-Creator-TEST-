import Dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

/**
 * Auto-layout circuit nodes using Dagre (directed graph layout).
 * Arranges nodes top-to-bottom, minimizing edge crossings.
 * Returns new node positions without mutating the originals.
 */
export function autoLayout(
    nodes: Node[],
    edges: Edge[],
    direction: 'TB' | 'LR' = 'TB',
): Node[] {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

    g.setGraph({
        rankdir: direction,
        nodesep: 80,   // horizontal spacing between nodes
        ranksep: 100,  // vertical spacing between ranks
        marginx: 40,
        marginy: 40,
    });

    // Add nodes with their measured or estimated sizes
    for (const node of nodes) {
        const w = node.measured?.width ?? 120;
        const h = node.measured?.height ?? 80;
        g.setNode(node.id, { width: w, height: h });
    }

    // Add edges
    for (const edge of edges) {
        g.setEdge(edge.source, edge.target);
    }

    // Run the layout
    Dagre.layout(g);

    // Apply new positions
    return nodes.map((node) => {
        const layoutNode = g.node(node.id);
        const w = node.measured?.width ?? 120;
        const h = node.measured?.height ?? 80;

        return {
            ...node,
            position: {
                x: layoutNode.x - w / 2,
                y: layoutNode.y - h / 2,
            },
        };
    });
}
